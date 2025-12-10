
/**
 * PACKING ALGORITHM UTILITIES
 * ---------------------------
 * This file contains the core logic for the 3D packing algorithm.
 * It handles the "First Fit Decreasing" strategy with rotation and stacking checks.
 * 
 * Key Functions:
 * - packOneContainer: Tries to pack list of items into a single container definition.
 * - calculateFleet: Orchestrates the multi-container packing, using multiple passes 
 *   to find the best container mix for the given cargo.
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

    // EFFECTIVE DIMENSIONS
    const physL = container.inner_dims.l;
    let effL = physL;
    if (container.type === 'FR') {
        if (container.id.includes('40')) effL = 16.0;
        else effL = 7.0;
    }
    const effW = container.open_side ? 50.0 : container.inner_dims.w;
    const effH = container.open_top ? 50.0 : container.inner_dims.h;

    const checkCollision = (newItem, packedItems) => {
        const EPS = 0.001;
        for (let p of packedItems) {
            const pl = p.rotated ? p.w : p.l; const pw = p.rotated ? p.l : p.w; const ph = p.h;
            const nl = newItem.rotated ? newItem.w : newItem.l; const nw = newItem.rotated ? newItem.l : newItem.w; const nh = newItem.h;
            if (newItem.x < p.x + pl - EPS && newItem.x + nl > p.x + EPS &&
                newItem.y < p.y + ph - EPS && newItem.y + nh > p.y + EPS &&
                newItem.z < p.z + pw - EPS && newItem.z + nw > p.z + EPS) return true;
        }
        return false;
    };

    const checkStacking = (newItem, packedItems) => {
        const nl = newItem.rotated ? newItem.w : newItem.l; const nw = newItem.rotated ? newItem.l : newItem.w;
        // --- CRITICAL FIX FOR FLOATING ITEMS ---
        // Rule: Start Position (x,z) must be within PHYSICAL floor bounds
        if (newItem.y === 0) {
            // Check if anchor point is within physical limits
            if (newItem.x >= physL || newItem.z >= container.inner_dims.w) return false;
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
                if (anchor.x >= physL - EPS || anchor.z >= container.inner_dims.w - EPS) continue;
            }

            const itemL = item.l; const itemW = item.w; const itemH = item.h;

            if (anchor.x + itemL <= effL + EPS &&
                anchor.y + itemH <= effH + EPS &&
                anchor.z + itemW <= effW + EPS) {
                const candidate = { ...item, x: anchor.x, y: anchor.y, z: anchor.z, rotated: false };
                if (!checkCollision(candidate, packed) && checkStacking(candidate, packed)) { bestAnchor = i; isRotated = false; break; }
            }

            if (item.rotatable) {
                const rotL = item.w; const rotW = item.l;
                if (anchor.x + rotL <= effL + EPS &&
                    anchor.y + itemH <= effH + EPS &&
                    anchor.z + rotW <= effW + EPS) {
                    const candidate = { ...item, x: anchor.x, y: anchor.y, z: anchor.z, rotated: true };
                    if (!checkCollision(candidate, packed) && checkStacking(candidate, packed)) { bestAnchor = i; isRotated = true; break; }
                }
            }
        }

        if (bestAnchor !== null) {
            const anchor = anchors[bestAnchor];
            const usedL = isRotated ? item.w : item.l; const usedW = isRotated ? item.l : item.w; const usedH = item.h;
            packed.push({ ...item, x: anchor.x, y: anchor.y, z: anchor.z, rotated: isRotated });
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

    // "WHY" ANALYSIS LOGIC
    const getOverflowReason = (item, allowedContainers) => {
        let maxL = 0; let hasOT = false; let hasFR = false; let has40FR = false;
        allowedContainers.forEach(c => {
            if (c.inner_dims.l > maxL) maxL = c.inner_dims.l;
            if (c.open_top) hasOT = true;
            if (c.type === 'FR') {
                hasFR = true;
                if (c.inner_dims.l > 10) has40FR = true;
            }
        });
        if (allowedContainers.length === 0) return "No Container Selected";
        if (item.l > 12.03) {
            if (!has40FR) return `Too Long for 20' (Needs 40' Flat Rack)`;
            if (item.l > 16.0) return `Too Long (Even for 40' FR)`;
        } else if (item.l > 5.9 && item.l <= 12.0) {
            if (maxL < 6.0 && !hasFR) return `Too Long for 20' (Needs 40' or FR)`;
        }
        if (item.h > 2.69 && !hasOT && !hasFR) return `Too Tall (Needs Open Top)`;
        if (item.w > 2.35 && !hasFR) return `Too Wide (Needs Flat Rack)`;
        return "No space left / Layout";
    };

    let impossible = [];
    let possible = [];
    const EPS = 0.001;

    remainingItems.forEach(item => {
        let fitsInAny = false;
        for (let c of allowedContainerTypes) {
            let effL = c.inner_dims.l;
            if (c.type === 'FR') {
                if (c.id.includes('40')) effL = 16.0;
                else effL = 7.0;
            }
            const effW = c.open_side ? 50.0 : c.inner_dims.w;
            const effH = c.open_top ? 50.0 : c.inner_dims.h;

            const fitNormal = item.l <= effL + EPS && item.w <= effW + EPS && item.h <= effH + EPS;
            const fitRotated = item.rotatable && item.w <= effL + EPS && item.l <= effW + EPS && item.h <= effH + EPS;

            if (fitNormal || fitRotated) { fitsInAny = true; break; }
        }
        if (fitsInAny) {
            possible.push(item);
        } else {
            item.overflowReason = getOverflowReason(item, allowedContainerTypes);
            impossible.push(item);
        }
    });
    remainingItems = possible;

    const sortedContainers = [...allowedContainerTypes].sort((a, b) => {
        const volA = a.inner_dims.l * a.inner_dims.w * a.inner_dims.h;
        const volB = b.inner_dims.l * b.inner_dims.w * b.inner_dims.h;
        return volB - volA;
    });

    let containers = [];
    let containerCount = 1;

    while (remainingItems.length > 0) {
        let bestContainer = sortedContainers[0];
        let bestResult = packOneContainer(bestContainer, remainingItems);

        if (bestResult.packed.length > 0) {
            for (let i = 1; i < sortedContainers.length; i++) {
                const candidate = sortedContainers[i];
                const candidateResult = packOneContainer(candidate, bestResult.packed);
                if (candidateResult.unpacked.length === 0) {
                    bestContainer = candidate;
                    bestResult = candidateResult;
                }
            }
        }

        if (bestResult.packed.length === 0 && bestResult.unpacked.length === remainingItems.length) {
            remainingItems.forEach(i => i.overflowReason = "No space left / Layout Error");
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
