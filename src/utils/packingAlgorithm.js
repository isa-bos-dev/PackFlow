
const EPS = 0.001;

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
 *
 * COORDINATE SYSTEM:
 * X = Length (Longitudinal)
 * Y = Height (Vertical)
 * Z = Width (Lateral)
 */

const getType = (c) => c.type || 'Standard';

export const packOneContainer = (container, itemsToPack) => {
    // Priority: Stackable -> Volume -> Max Dimension
    itemsToPack.sort((a, b) => {
        // 1. Stackable (true first)
        if (a.stackable && !b.stackable) return -1;
        if (!a.stackable && b.stackable) return 1;

        // 2. Volume (Larger to smaller)
        const volA = a.l * a.w * a.h;
        const volB = b.l * b.w * b.h;
        if (Math.abs(volA - volB) > EPS) return volB - volA;

        // 3. Tie-breaker: Max Dimension (Long/Wide items first)
        const maxDimA = Math.max(a.l, a.w, a.h);
        const maxDimB = Math.max(b.l, b.w, b.h);
        return maxDimB - maxDimA;
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
    if (getType(container) === 'FR') {
        effL = container.id.includes('40') || container.inner_dims.l > 10 ? 16.0 : 7.0; // Allow Overhang Length
    }
    const effW = (container.open_side || getType(container) === 'FR') ? 50.0 : physW; // Allow Overhang Width
    const effH = (container.open_top || getType(container) === 'FR' || getType(container) === 'OT') ? 50.0 : physH; // Allow Overhang Height

    const checkProtrusionConflict = (newItem, packedItems) => {
        // Special Rules for Flat Rack / Open Top Protrusions
        if (getType(container) !== 'FR' && getType(container) !== 'OT') return false;

        // Effective Dimensions for Protrusion Logic (Include Gaps?)
        // If "Gap" is space, it blocks the lane, so YES.
        const nGapL = newItem.rotated ? (newItem.gap_width || 0) : (newItem.gap_length || 0);
        const nGapW = newItem.rotated ? (newItem.gap_length || 0) : (newItem.gap_width || 0);

        const nl = (newItem.rotated ? newItem.w : newItem.l) + nGapL;
        const nw = (newItem.rotated ? newItem.l : newItem.w) + nGapW;

        const nProtrudesL = nl > physL; // Note: This checks if effective size protrudes. Conservative.
        const nProtrudesW = nw > physW;

        for (let p of packedItems) {
            const pGapL = p.rotated ? (p.gap_width || 0) : (p.gap_length || 0);
            const pGapW = p.rotated ? (p.gap_length || 0) : (p.gap_width || 0);

            const pl = (p.rotated ? p.w : p.l) + pGapL;
            const pw = (p.rotated ? p.l : p.w) + pGapW;

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

                if (overlapZ > EPS && overlapY > EPS) return true;
            }
        }
        return false;
    };

    const checkCollision = (newItem, packedItems) => {
        // Effective Dims for New Item
        const nGapL = newItem.rotated ? (newItem.gap_width || 0) : (newItem.gap_length || 0);
        const nGapW = newItem.rotated ? (newItem.gap_length || 0) : (newItem.gap_width || 0);
        const nl = (newItem.rotated ? newItem.w : newItem.l) + nGapL;
        const nw = (newItem.rotated ? newItem.l : newItem.w) + nGapW;
        const nh = newItem.h;

        // 1. Standard Geometric Collision
        for (let p of packedItems) {
            // Effective Dims for Packed Item
            const pGapL = p.rotated ? (p.gap_width || 0) : (p.gap_length || 0);
            const pGapW = p.rotated ? (p.gap_length || 0) : (p.gap_width || 0);
            const pl = (p.rotated ? p.w : p.l) + pGapL;
            const pw = (p.rotated ? p.l : p.w) + pGapW;
            const ph = p.h;

            if (newItem.x < p.x + pl - EPS && newItem.x + nl > p.x + EPS &&
                newItem.y < p.y + ph - EPS && newItem.y + nh > p.y + EPS &&
                newItem.z < p.z + pw - EPS && newItem.z + nw > p.z + EPS) return true;
        }

        // 2. Special Protrusion Rules
        if (checkProtrusionConflict(newItem, packedItems)) return true;

        return false;
    };

    const checkStacking = (newItem, packedItems) => {
        // Rule: Open Top / Protruding Height MUST be on floor check
        // Check if item protrudes strict physical height, then it must be on Y=0
        if (newItem.h > physH) {
            if (newItem.y > EPS) return false;
        }

        // 1. BASE CASE: GROUND
        if (newItem.y < EPS) {
            // A. Basic Validation: Negative Coordinates
            // Rule 1: X (Length) Checking
            if (getType(container).includes('FR')) {
                // If Flat Rack, allow negative X (Overhang logic similar to Z)
                // We rely on support area validation below.
            } else {
                // Standard/OpenTop: X cannot be negative (Front Wall)
                if (newItem.x < -EPS) return false;
            }

            // Rule 2: Z (Width) Checking
            if (getType(container).includes('FR')) {
                // If Flat Rack, allow negative Z (Overhang logic)
                // We rely on support area validation below.
            } else {
                // Standard/OpenTop: Z cannot be negative (Side Wall)
                if (newItem.z < -EPS) return false;
            }

            const nl = newItem.rotated ? newItem.w : newItem.l;
            const nw = newItem.rotated ? newItem.l : newItem.w;

            // B. Standard Closed Containers Check
            if (!getType(container).includes('FR') && !getType(container).includes('OT')) {
                if (newItem.x + nl > physL + EPS) return false;
                if (newItem.z + nw > physW + EPS) return false;
                return true;
            }

            // C. Flat Rack "Anti-Floating" Logic
            // Calculate how much of the item is touching real physical metal
            const overlapX = Math.max(0, Math.min(newItem.x + nl, physL) - Math.max(newItem.x, 0));
            const overlapZ = Math.max(0, Math.min(newItem.z + nw, physW) - Math.max(newItem.z, 0));

            const supportedArea = overlapX * overlapZ;
            const itemBaseArea = nl * nw;

            // Rule: At least 50% of the base must touch metal
            // AND the geometric center of the box must be within physical bounds
            const centerX = newItem.x + nl / 2;
            const centerZ = newItem.z + nw / 2;

            const centerIsSafe = (centerX >= 0 && centerX <= physL) && (centerZ >= 0 && centerZ <= physW);
            const hasEnoughSupport = (supportedArea / itemBaseArea) >= 0.50;

            if (!centerIsSafe || !hasEnoughSupport) return false;

            return true;
        }

        let supportedArea = 0;
        // Calculate new item base area
        const nl = newItem.rotated ? newItem.w : newItem.l;
        const nw = newItem.rotated ? newItem.l : newItem.w;
        const baseArea = nl * nw;

        const nX1 = newItem.x;
        const nX2 = newItem.x + nl;
        const nZ1 = newItem.z;
        const nZ2 = newItem.z + nw;

        for (let p of packedItems) {
            // 2. VERTICAL FILTER: Is 'p' immediately below 'newItem'?
            // (p.y + p.h) must be ~ newItem.y
            if (Math.abs((p.y + p.h) - newItem.y) > EPS) continue;

            const pl = p.rotated ? p.w : p.l;
            const pw = p.rotated ? p.l : p.w;

            const pX1 = p.x;
            const pX2 = p.x + pl;
            const pZ1 = p.z;
            const pZ2 = p.z + pw;

            // 3. CALCULATE INTERSECTION logic
            const overlapX = Math.max(0, Math.min(nX2, pX2) - Math.max(nX1, pX1));
            const overlapZ = Math.max(0, Math.min(nZ2, pZ2) - Math.max(nZ1, pZ1));
            const intersection = overlapX * overlapZ;

            if (intersection > EPS) {
                // 4. SAFETY CHECK: Does the item below allow stacking?
                if (p.stackable === false) return false; // Immediate Veto

                supportedArea += intersection;
            }
        }

        // 5. 70% SUPPORT RULE
        return (supportedArea / baseArea) >= 0.70;
    };

    for (let item of itemsToPack) {
        // WEIGHT CHECK
        if (currentWeight + item.weight > maxWeight) {
            unpacked.push(item);
            continue;
        }

        let bestAnchor = null; let isRotated = false;

        // Optimised Anchor Sorting: Layers (Y) -> Depth (Z) -> Rows (X)
        anchors.sort((a, b) => {
            if (Math.abs(a.y - b.y) > EPS) return a.y - b.y; // Layer by Layer (Bottom Up)
            if (Math.abs(a.z - b.z) > EPS) return a.z - b.z; // Search Depth (Back to Front)
            return a.x - b.x; // Search Row (Left to Right)
        });

        for (let i = 0; i < anchors.length; i++) {
            const anchor = anchors[i];

            // PRE-CHECK: Don't even try if anchor is outside physical floor (unless FR with support)
            // Note: Cat 3 had Strict Negative Check here, Cat 4 relaxes Z for FR. 
            // We rely on checkStacking/Collision to validate final position.
            // But basic bound check optimization:
            if (anchor.y === 0) {
                // Optimization: if X is clearly out, skip
                if (anchor.x >= physL - EPS) continue;
                // Optimization: if Z is way out (but FR allows overhang, so be careful).
                // Safe to skip Z if > effW
                if (anchor.z >= effW - EPS) continue;
            }

            const itemL = item.l; const itemW = item.w; const itemH = item.h;
            const gapL = item.gap_length || 0; const gapW = item.gap_width || 0; // Gaps

            // TRY STANDARD ORIENTATION
            // Effective Dimensions (include Gaps)
            const effItemL = itemL + gapL;
            const effItemW = itemW + gapW;

            if (anchor.x + effItemL <= effL + EPS &&
                anchor.y + itemH <= effH + EPS &&
                anchor.z + effItemW <= effW + EPS) {

                let finalZ = anchor.z;
                let finalX = anchor.x;

                // FLAT RACK CENTERING LOGIC
                if (getType(container).includes('FR')) {
                    // CASE A: Item Wider than Physical Width -> Center Z
                    if (itemW > physW) {
                        finalZ = (physW - itemW) / 2;
                    }
                    // CASE B: Item Longer than Physical Length -> Center X
                    if (itemL > physL) {
                        finalX = (physL - itemL) / 2;
                    }
                }

                const candidate = { ...item, x: finalX, y: anchor.y, z: finalZ, rotated: false };

                // Extra Validations for Protrusions
                if (!checkCollision(candidate, packed) && checkStacking(candidate, packed)) {
                    bestAnchor = i; isRotated = false; break;
                }
            }

            // TRY ROTATED ORIENTATION
            if (item.rotatable) {
                const rotL = item.w; const rotW = item.l; // Swapped L/W
                const rotGapL = gapW; const rotGapW = gapL; // Swapped Gaps

                const effRotL = rotL + rotGapL;
                const effRotW = rotW + rotGapW;

                if (anchor.x + effRotL <= effL + EPS &&
                    anchor.y + itemH <= effH + EPS &&
                    anchor.z + effRotW <= effW + EPS) {

                    let finalZ = anchor.z;
                    let finalX = anchor.x;

                    // FLAT RACK CENTERING LOGIC
                    if (getType(container).includes('FR')) {
                        // Rotated: Used Width is rotW (item.l), Used Length is rotL (item.w)
                        if (rotW > physW) {
                            finalZ = (physW - rotW) / 2;
                        }
                        if (rotL > physL) {
                            finalX = (physL - rotL) / 2;
                        }
                    }

                    const candidate = { ...item, x: finalX, y: anchor.y, z: finalZ, rotated: true };
                    if (!checkCollision(candidate, packed) && checkStacking(candidate, packed)) {
                        bestAnchor = i; isRotated = true; break;
                    }
                }
            }
        }

        if (bestAnchor !== null) {
            const anchor = anchors[bestAnchor];
            // Recalculate dimensions for the chosen orientation
            const usedL = isRotated ? item.w : item.l;
            const usedW = isRotated ? item.l : item.w;
            const usedH = item.h;
            const usedGapL = isRotated ? (item.gap_width || 0) : (item.gap_length || 0);
            const usedGapW = isRotated ? (item.gap_length || 0) : (item.gap_width || 0);

            const effUsedL = usedL + usedGapL;
            const effUsedW = usedW + usedGapW;

            // Re-Calculate Final Z (Need to reconstruct logic or access variable? simpler to redo)
            // Actually bestAnchor index points to OLD anchor. We need to apply centering logic again?
            // Yes, because anchors[] stores raw coords.
            // Wait, we can't extract 'finalZ' easily from just 'bestAnchor' index unless stored.
            // Correction: The 'candidate' object was transient. We need to re-apply the shift on insertion.

            let finalZ = anchor.z;
            let finalX = anchor.x;

            if (getType(container).includes('FR')) {
                // Use PHYSICAL Dimensions for Centering Logic?
                // Centering should be based on the physical item, BUT we must respect the gap space?
                // If we centered the physical block, but the gap blocked something, collision check would fail.
                // Here we just want placement.
                // Let's use PHYSICAL for centering calculation to keep mass centered.
                if (usedW > physW) finalZ = (physW - usedW) / 2;
                if (usedL > physL) finalX = (physL - usedL) / 2;
            }

            packed.push({ ...item, x: finalX, y: anchor.y, z: finalZ, rotated: isRotated });
            currentWeight += item.weight; // UPDATE WEIGHT

            // Update Anchors based on Position
            // IMPORTANT: Anchors should be created using EFFECTIVE size (Start + Physical + Gap)
            // So new items are tried AFTER the gap.

            anchors.push({ x: anchor.x + effUsedL, y: anchor.y, z: finalZ }); // Right (Next in X)
            anchors.push({ x: anchor.x, y: anchor.y + usedH, z: finalZ }); // Top (Next in Y - No Gap Y?)
            // Vertical gap? User Gap Y is "Largo", Gap X is "Ancho". No Gap H defined.
            // So stacking is on top of PHYSICAL height.

            anchors.push({ x: anchor.x, y: anchor.y, z: finalZ + effUsedW }); // Front (Next in Z)

            anchors.splice(bestAnchor, 1);
            anchors = anchors.filter(a => {
                // Must filter anchors that are INSIDE the effective area of the new item
                // Effective region: [anchor.x, anchor.x + effUsedL] x [y, y+H] x [finalZ, finalZ+effUsedW]
                // Note: finalZ might be different from anchor.z due to centering. 
                // Using finalZ is correct for covering the space where the item IS.
                // But anchors are points.

                const inside = a.x >= finalX && a.x < finalX + effUsedL &&
                    a.y >= anchor.y && a.y < anchor.y + usedH &&
                    a.z >= finalZ && a.z < finalZ + effUsedW;
                return !inside;
            });
        } else {
            unpacked.push(item);
        }
    }

    // --- POST-PROCESS: LONGITUDINAL CENTERING ---
    // Only if container is partially empty to improve balance

    // 1. Find Furthest X Point
    let maxExtentX = 0;
    packed.forEach(p => {
        const pEnd = p.x + (p.rotated ? p.w : p.l);
        if (pEnd > maxExtentX) maxExtentX = pEnd;
    });

    // 2. Calculate free space
    const freeSpace = physL - maxExtentX;

    // 3. Apply offset if significant (e.g. > 1.0m)
    if (freeSpace > 1.0) {
        const offsetX = freeSpace / 2;

        // Move all boxes
        packed.forEach(p => {
            p.x += offsetX;
        });
    }


    // --- POST-PROCESS: LATERAL CENTERING (Z-AXIS) ---
    // Center load laterally if there is significant free width

    // 1. Calculate total width occupied by current load
    let minZ = Infinity;
    let maxZ = -Infinity;

    packed.forEach(p => {
        const pStart = p.z;
        const pEnd = p.z + (p.rotated ? p.l : p.w);
        if (pStart < minZ) minZ = pStart;
        if (pEnd > maxZ) maxZ = pEnd;
    });

    // Validate if items found
    if (minZ !== Infinity) {
        // Only apply if NOT a special Flat Rack case (negative Z)
        // (If minZ is negative, it means we already applied Category 4 Wide Load logic, so do not touch)
        if (minZ >= 0) {

            const loadWidth = maxZ - minZ;
            const containerW = container.inner_dims.w;
            const freeWidth = containerW - loadWidth;

            // If significant free space (> 10cm)
            if (freeWidth > 0.10) {
                const offsetZ = freeWidth / 2;

                // Move all boxes to lateral center
                packed.forEach(p => {
                    p.z += offsetZ;
                });
            }
        }
    }

    // --- CENTER OF GRAVITY (CoG) CHECK ---
    let warnings = [];
    if (currentWeight > 0) {
        let totalMomentX = 0;
        packed.forEach(p => {
            const itemCenterX = p.x + (p.rotated ? p.w : p.l) / 2;
            totalMomentX += (p.weight * itemCenterX);
        });

        const cogX = totalMomentX / currentWeight;
        const containerCenter = container.inner_dims.l / 2;
        const deviation = Math.abs(cogX - containerCenter) / container.inner_dims.l;

        // If CoG deviates more than 10% from center
        if (deviation > 0.10) {
            warnings.push("Unbalanced Load (CoG deviation > 10%)");
        }
    }

    return { packed, unpacked, warnings };
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

            // Weight check included 
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
    // const EPS = 0.001; // Defined globally now

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
        let bestPackedVol = -1;

        // Try to find the container that packs the MOST items (or Best Volume?)
        for (let candidate of sortedContainers) {
            // Revert changes in memory to original state per iteration? 
            // packOneContainer does not modify items outside. okay.

            const res = packOneContainer(candidate, remainingItems);

            const isSpecial = candidate.type === 'FR' || candidate.type === 'OT';

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

                // Calculate PACKED Volume (Optimisation Metric)
                const currentPackedVol = res.packed.reduce((acc, item) => acc + (item.l * item.w * item.h), 0);

                // Heuristic: If this container packs ALL remaining items, take it immediately!
                if (res.unpacked.length === 0) {
                    bestContainer = candidate;
                    bestResult = res;
                    break;
                }

                // Greedy Selection: Choose the container that packs the MOST VOLUME.
                if (!bestContainer || currentPackedVol > bestPackedVol) {
                    bestContainer = candidate;
                    bestResult = res;
                    bestPackedVol = currentPackedVol;
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
            items: bestResult.packed,
            warnings: bestResult.warnings // Add warnings to final container object
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
