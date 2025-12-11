
/**
 * PACKING ALGORITHM UTILITIES
 * ---------------------------
 * This file contains the core logic for the 3D packing algorithm.
 * It handles the "First Fit Decreasing" strategy with rotation and stacking checks.
 *
 * Key Functions:
 * - packOneContainer: Tries to pack list of items into a single container definition.
 * - calculateFleet: Orchestrates the multi-container packing.
 * - groupItems: Helper to group identical overflow items for clean UI display.
 */

export const packOneContainer = (container, itemsToPack) => {
    // Priority 1: Stackable? (True first - build base)
    // Priority 2: Volume Descending (Big First)
    itemsToPack.sort((a, b) => {
        if (a.stackable && !b.stackable) return -1;
        if (!a.stackable && b.stackable) return 1;
        const volA = a.l * a.w * a.h;
        const volB = b.l * b.w * b.h;
        return volB - volA;
    });

    let packed = [];
    let unpacked = [];
    let anchors = [{ x: 0, y: 0, z: 0 }];
    let currentWeight = 0;
    const maxWeight = container.max_weight || Infinity;

    // PHYSICAL DIMENSIONS (Strict Bounds)
    const physL = container.inner_dims.l;
    const physW = container.inner_dims.w;
    const physH = container.inner_dims.h;

    // EFFECTIVE DIMENSIONS (For Special Equipment Allowance)
    let effL = physL;
    if (container.type === 'FR') {
        effL = container.id.includes('40') || container.inner_dims.l > 10 ? 16.0 : 7.0; // Allow Overhang Length
    }
    const effW = (container.open_side || container.type === 'FR') ? 50.0 : physW; // Allow Overhang Width
    const effH = (container.open_top || container.type === 'FR' || container.type === 'OT') ? 50.0 : physH; // Allow Overhang Height

    const checkProtrusionConflict = (newItem, packedItems) => {
        // Special Rules for Flat Rack / Open Top Protrusions
        if (container.type !== 'FR' && container.type !== 'OT') return false;

        const nl = newItem.rotated ? newItem.w : newItem.l;
        const nw = newItem.rotated ? newItem.l : newItem.w;

        const nProtrudesL = nl > physL;
        const nProtrudesW = nw > physW;

        for (let p of packedItems) {
            const pl = p.rotated ? p.w : p.l;
            const pw = p.rotated ? p.l : p.w;

            const pProtrudesL = pl > physL;
            const pProtrudesW = pw > physW;

            // Rule 1: Width Protrusion (Flat Rack) - "Cannot have a box to the side"
            // If either item protrudes width, they cannot overlap in X/Y (effectively consumes full Z row)
            if (nProtrudesW || pProtrudesW) {
                // Check Overlap in X
                const overlapX = Math.max(0, Math.min(newItem.x + nl, p.x + pl) - Math.max(newItem.x, p.x));
                // Check Overlap in Y (Vertical)
                const nh = newItem.h; const ph = p.h;
                const overlapY = Math.max(0, Math.min(newItem.y + nh, p.y + ph) - Math.max(newItem.y, p.y));

                // If they share X and Y range (are side-by-side or inside each other), it's a conflict
                const EPS = 0.001;
                if (overlapX > EPS && overlapY > EPS) return true;
            }

            // Rule 2: Length Protrusion (Flat Rack) - "No piece in long axis"
            // If either item protrudes length, they cannot overlap in Z/Y (effectively consumes full X lane)
            if (nProtrudesL || pProtrudesL) {
                // Check Overlap in Z
                const overlapZ = Math.max(0, Math.min(newItem.z + nw, p.z + pw) - Math.max(newItem.z, p.z));
                // Check Overlap in Y
                const nh = newItem.h; const ph = p.h;
                const overlapY = Math.max(0, Math.min(newItem.y + nh, p.y + ph) - Math.max(newItem.y, p.y));

                const EPS = 0.001;
                if (overlapZ > EPS && overlapY > EPS) return true;
            }
        }
        return false;
    };

    const checkCollision = (newItem, packedItems) => {
        const EPS = 0.001;
        // 1. Standard Geometric Collision
        for (let p of packedItems) {
            const pl = p.rotated ? p.w : p.l; const pw = p.rotated ? p.l : p.w; const ph = p.h;
            const nl = newItem.rotated ? newItem.w : newItem.l; const nw = newItem.rotated ? newItem.l : newItem.w; const nh = newItem.h;
            if (newItem.x < p.x + pl - EPS && newItem.x + nl > p.x + EPS &&
                newItem.y < p.y + ph - EPS && newItem.y + nh > p.y + EPS &&
                newItem.z < p.z + pw - EPS && newItem.z + nw > p.z + EPS) return true;
        }

        // 2. Special Protrusion Rules
        if (checkProtrusionConflict(newItem, packedItems)) return true;

        return false;
    };

    const checkStacking = (newItem, packedItems) => {
        const nl = newItem.rotated ? newItem.w : newItem.l;
        const nw = newItem.rotated ? newItem.l : newItem.w;
        const nh = newItem.h;

        // Rule: Open Top / Protruding Height MUST be on floor
        if (nh > physH) {
            if (newItem.y > 0.001) return false; // Cannot stack a protruding item on top of others
        }

        // Rule: Start Position (x,z) must be within PHYSICAL floor bounds
        // (Even if it protrudes, the base must be solid)
        if (newItem.y === 0) {
            if (newItem.x >= physL || newItem.z >= physW) return false;
            return true;
        }

        let supported = false;
        const EPS = 0.001;
        for (let p of packedItems) {
            const pl = p.rotated ? p.w : p.l; const pw = p.rotated ? p.l : p.w; const ph = p.h;
            if (Math.abs((p.y + ph) - newItem.y) < EPS) {
                const overlapX = Math.max(0, Math.min(newItem.x + nl, p.x + pl) - Math.max(newItem.x, p.x));
                const overlapZ = Math.max(0, Math.min(newItem.z + nw, p.z + pw) - Math.max(newItem.z, p.z));

                if (overlapX > EPS && overlapZ > EPS) {
                    if (p.stackable === false) return false;
                    supported = true;
                }
            }
        }
        return supported;
    };

    for (let item of itemsToPack) {
        // WEIGHT CHECK
        if (currentWeight + item.weight > maxWeight) {
            unpacked.push(item);
            continue;
        }

        let bestAnchor = null; let isRotated = false;
        anchors.sort((a, b) => {
            if (Math.abs(a.y - b.y) > 0.001) return a.y - b.y;
            if (Math.abs(a.z - b.z) > 0.001) return a.z - b.z;
            return a.x - b.x;
        });

        const EPS = 0.001;

        for (let i = 0; i < anchors.length; i++) {
            const anchor = anchors[i];

            // PRE-CHECK: Don't even try if anchor is outside PHYSICAL floor for ground items
            if (anchor.y === 0) {
                if (anchor.x >= physL - EPS || anchor.z >= physW - EPS) continue;
            }

            const itemL = item.l; const itemW = item.w; const itemH = item.h;

            // TRY STANDARD ORIENTATION
            // Check bounds against EFFECTIVE dimensions (to allow protrusion)
            if (anchor.x + itemL <= effL + EPS &&
                anchor.y + itemH <= effH + EPS &&
                anchor.z + itemW <= effW + EPS) {

                const candidate = { ...item, x: anchor.x, y: anchor.y, z: anchor.z, rotated: false };

                // Extra Validations for Protrusions
                if (!checkCollision(candidate, packed) && checkStacking(candidate, packed)) {
                    bestAnchor = i; isRotated = false; break;
                }
            }

            // TRY ROTATED ORIENTATION
            if (item.rotatable) {
                const rotL = item.w; const rotW = item.l; // Swapped L/W

                if (anchor.x + rotL <= effL + EPS &&
                    anchor.y + itemH <= effH + EPS &&
                    anchor.z + rotW <= effW + EPS) {
                    const candidate = { ...item, x: anchor.x, y: anchor.y, z: anchor.z, rotated: true };
                    if (!checkCollision(candidate, packed) && checkStacking(candidate, packed)) {
                        bestAnchor = i; isRotated = true; break;
                    }
                }
            }
        }

        if (bestAnchor !== null) {
            const anchor = anchors[bestAnchor];
            const usedL = isRotated ? item.w : item.l; const usedW = isRotated ? item.l : item.w; const usedH = item.h;
            packed.push({ ...item, x: anchor.x, y: anchor.y, z: anchor.z, rotated: isRotated });
            currentWeight += item.weight; // UPDATE WEIGHT

            anchors.push({ x: anchor.x + usedL, y: anchor.y, z: anchor.z });
            anchors.push({ x: anchor.x, y: anchor.y + usedH, z: anchor.z });
            anchors.push({ x: anchor.x, y: anchor.y, z: anchor.z + usedW });
            anchors.splice(bestAnchor, 1);
            anchors = anchors.filter(a => {
                const inside = a.x >= anchor.x && a.x < anchor.x + usedL && a.y >= anchor.y && a.y < anchor.y + usedH && a.z >= anchor.z && a.z < anchor.z + usedW;
                return !inside;
            });
        } else {
            unpacked.push(item);
        }
    }
    return { packed, unpacked };
}

// --- FLEET CALCULATION ---
export const calculateFleet = (allowedContainerTypes, allItems) => {
    let remainingItems = [];
    allItems.forEach(item => {
        for (let i = 0; i < item.qty; i++) { remainingItems.push({ ...item, id: `${item.id}_${i}`, rotated: false }); }
    });

    const standardContainers = allowedContainerTypes.filter(c => c.type !== 'FR' && c.type !== 'OT');

    // Check if an item requires special equipment (cannot fit in any Standard container)
    const isSpecialRequired = (item) => {
        if (standardContainers.length === 0) return true; // Only special containers available, so must use them

        // Check if item fits in ANY standard container (considering rotation)
        for (let c of standardContainers) {
            const fitNormal = item.l <= c.inner_dims.l && item.w <= c.inner_dims.w && item.h <= c.inner_dims.h;
            const fitRotated = item.rotatable && item.w <= c.inner_dims.l && item.l <= c.inner_dims.w && item.h <= c.inner_dims.h;

            // Weight check included as special containers often have higher capacity
            if ((fitNormal || fitRotated) && item.weight <= (c.max_weight || Infinity)) return false;
        }
        return true;
    };


    // "WHY" ANALYSIS LOGIC
    const getOverflowReason = (item, allowedContainers) => {
        let maxL = 0; let hasOT = false; let hasFR = false; let has40FR = false;
        let maxWeight = 0;

        allowedContainers.forEach(c => {
            if (c.inner_dims.l > maxL) maxL = c.inner_dims.l;
            if (c.open_top || c.type === 'OT' || c.type === 'FR') hasOT = true;
            if (c.type === 'FR') {
                hasFR = true;
                if (c.inner_dims.l > 10) has40FR = true;
            }
            if (c.max_weight > maxWeight) maxWeight = c.max_weight;
        });
        if (allowedContainers.length === 0) return "No Container Selected";

        // Detailed feedback
        if (item.l > 12.03) {
            if (!has40FR) return `Too Long for Available Containers`;
        }
        if (item.h > 2.69 && !hasOT) return `Too Tall (Needs Open Top/Flat Rack)`;
        if (item.w > 2.35 && !hasFR) return `Too Wide (Needs Flat Rack)`;
        if (item.weight > maxWeight) return `Too Heavy for any Container`;

        return "No space left / Layout";
    };

    let impossible = [];
    let possible = [];
    const EPS = 0.001;

    // Filter Items that strictly cannot fit in ANY checked container
    remainingItems.forEach(item => {
        let fitsInAny = false;
        for (let c of allowedContainerTypes) {
            let effL = c.inner_dims.l;
            if (c.type === 'FR') {
                effL = (c.id.includes('40') || c.inner_dims.l > 10) ? 16.0 : 7.0;
            }
            const effW = (c.open_side || c.type === 'FR') ? 50.0 : c.inner_dims.w;
            const effH = (c.open_top || c.type === 'FR' || c.type === 'OT') ? 50.0 : c.inner_dims.h;

            // WEIGHT Check in Fleet Filter
            const fitWeight = item.weight <= (c.max_weight || Infinity);

            const fitNormal = item.l <= effL + EPS && item.w <= effW + EPS && item.h <= effH + EPS;
            const fitRotated = item.rotatable && item.w <= effL + EPS && item.l <= effW + EPS && item.h <= effH + EPS;

            if (fitWeight && (fitNormal || fitRotated)) { fitsInAny = true; break; }
        }
        if (fitsInAny) {
            possible.push(item);
        } else {
            item.overflowReason = getOverflowReason(item, allowedContainerTypes);
            impossible.push(item);
        }
    });
    remainingItems = possible;

    // SORT CONTAINERS
    // Priority: Standard Containers FIRST, High Volume FIRST
    const sortedContainers = [...allowedContainerTypes].sort((a, b) => {
        const isSpecialA = a.type === 'FR' || a.type === 'OT';
        const isSpecialB = b.type === 'FR' || b.type === 'OT';

        if (isSpecialA && !isSpecialB) return 1; // Put Special LAST
        if (!isSpecialA && isSpecialB) return -1; // Put Standard FIRST

        // Then Volume Descending
        const volA = a.inner_dims.l * a.inner_dims.w * a.inner_dims.h;
        const volB = b.inner_dims.l * b.inner_dims.w * b.inner_dims.h;
        return volB - volA;
    });

    let containers = [];
    let containerCount = 1;

    while (remainingItems.length > 0) {
        let bestContainer = null;
        let bestResult = null;

        // Try to find the container that packs the MOST items (or Best Volume?)
        for (let candidate of sortedContainers) {
            const isSpecial = candidate.type === 'FR' || candidate.type === 'OT';

            const res = packOneContainer(candidate, remainingItems);

            if (res.packed.length > 0) {
                if (isSpecial) {
                    // Check if AT LEAST ONE packed item strictly requires special handling.
                    const hasSpecialItem = res.packed.some(p => isSpecialRequired(p));

                    if (!hasSpecialItem) {
                        // This pack only contains standard items. 
                        // Reject using a special container for them.
                        continue;
                    }
                }

                // If this container packs ALL remaining items, take it immediately.
                if (res.unpacked.length === 0) {
                    bestContainer = candidate;
                    bestResult = res;
                    break;
                }

                if (!bestContainer || res.packed.length > bestResult.packed.length) {
                    bestContainer = candidate;
                    bestResult = res;
                }
            }
        }

        // If no container could pack anything
        if (!bestContainer || bestResult.packed.length === 0) {
            remainingItems.forEach(i => i.overflowReason = "No space left / Layout Error (or Standard Items blocked from Special)");
            impossible = [...impossible, ...remainingItems];
            break;
        }

        containers.push({
            id: containerCount,
            name: `Container #${containerCount}`,
            type: bestContainer.name,
            containerDef: bestContainer,
            items: bestResult.packed
        });

        const packedIds = new Set(bestResult.packed.map(p => p.id));
        remainingItems = remainingItems.filter(i => !packedIds.has(i.id));

        containerCount++;
        if (containerCount > 500) {
            remainingItems.forEach(i => i.overflowReason = "Overflow (Fleet Limit)");
            impossible = [...impossible, ...remainingItems];
            break;
        }
    }

    return { containers, overflow: impossible };
};


export const groupItems = (itemList) => {
    const groups = {};
    itemList.forEach(item => {
        const reason = item.overflowReason || "Unknown";
        const key = `${item.name}-${item.l}-${item.w}-${item.h}-${reason}`;
        if (!groups[key]) groups[key] = { ...item, count: 0, reason };
        groups[key].count++;
    });
    return Object.values(groups);
};
