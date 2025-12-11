
import React, { useState } from 'react';
import Header from './components/layout/Header';
import ContainerSelector from './components/packing/ContainerSelector';
import ItemManager from './components/packing/ItemManager';
import SmartImport from './components/packing/SmartImport';
import ResultsMainPanel from './components/results/ResultsMainPanel';
import ResultsSidebar from './components/results/ResultsSidebar';
import Toast from './components/common/Toast';
import { InfoModal, ShareModal } from './components/common/Modals';
import { Play } from './components/common/Icons'; // Need Play icon for the big button
import { CONTAINERS } from './data/containers';
import { calculateFleet, groupItems } from './utils/packingAlgorithm';

/**
 * MAIN APPLICATION COMPONENT
 * --------------------------
 * Orchestrates the 2-step flow:
 * Step 1: Configuration (Container selection + Cargo entry)
 * Step 2: Results (3D Visualization + Manifest)
 * 
 * Manages global state: items, fleet result, selection step.
 */
function App() {
    const [step, setStep] = useState(1);

    // --- STATE MATCHING LEGACY ---
    const [selectedContainerIds, setSelectedContainerIds] = useState([CONTAINERS[0].id]);
    const [items, setItems] = useState([
        // { id: 1, name: 'Box (Orange)', l: 15.0, w: 2.0, h: 3.0, weight: 1500, qty: 2, color: '#f97316', stackable: false, rotatable: false },
        // { id: 2, name: 'Pipes', l: 15.0, w: 0.5, h: 0.5, weight: 500, qty: 2, color: '#94a3b8', stackable: true, rotatable: false }
    ]);
    const [fleet, setFleet] = useState([]);
    const [overflowData, setOverflowData] = useState([]);
    const [currentContainerIdx, setCurrentContainerIdx] = useState(0);

    // UI State
    const [toast, setToast] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [showShare, setShowShare] = useState(false);

    // State for managing item editing (lifted up to coordinate with ItemManager)
    const [editingId, setEditingId] = useState(null);

    // --- HANDLERS ---
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const toggleContainerSelect = (id) => {
        setSelectedContainerIds(prev => {
            if (prev.includes(id)) {
                if (prev.length === 1) return prev; // Keep at least one
                return prev.filter(cId => cId !== id);
            } else { return [...prev, id]; }
        });
    };

    const handleCalculate = () => {
        showToast("Calculating fleet...");
        setTimeout(() => {
            const selectedContainers = CONTAINERS.filter(c => selectedContainerIds.includes(c.id));
            const { containers, overflow } = calculateFleet(selectedContainers, items);
            setFleet(containers);
            setOverflowData(overflow);
            setCurrentContainerIdx(0);
            setStep(2);
        }, 500);
    };

    // Item Management Handlers
    const handleAddItem = (newItem) => {
        if (editingId) {
            setItems(items.map(i => i.id === editingId ? { ...newItem, id: editingId, color: i.color } : i));
            setEditingId(null);
            showToast("Item updated!");
        } else {
            // New item ID logic from legacy: Date.now() + random color
            const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
            setItems([...items, { ...newItem, id: Date.now(), color }]);
            showToast("Item added!");
        }
    };

    const handleDeleteClick = (id) => {
        setItems(items.filter(i => i.id !== id));
        if (editingId === id) setEditingId(null);
    };

    const handleSmartImport = (text) => {
        const rows = text.trim().split('\n');
        const newItems = rows.map((row, index) => {
            // Determine separator: prefer tab (Excel) over comma
            const separator = row.includes('\t') ? '\t' : ',';
            const cols = row.split(separator);

            if (cols.length < 3) return null;

            // Helper to parse numbers with comma support (e.g. "0,8" -> 0.8)
            const parseNum = (val) => {
                if (!val) return 0;
                return parseFloat(val.toString().replace(',', '.'));
            };

            const w = parseNum(cols[4]);
            if (!w || w <= 0) return null;

            return {
                id: Date.now() + index,
                name: cols[0] || `Item ${index}`,
                l: parseNum(cols[1]) || 0.5,
                w: parseNum(cols[2]) || 0.5,
                h: parseNum(cols[3]) || 0.5,
                weight: w,
                qty: parseInt(cols[5]) || 1,
                stackable: parseInt(cols[6]) === 1,
                rotatable: parseInt(cols[7]) === 1,
                gap_length: parseNum(cols[8]) || 0, // Gap Length
                gap_width: parseNum(cols[9]) || 0,  // Gap Width
                color: '#' + Math.floor(Math.random() * 16777215).toString(16)
            };
        }).filter(i => i !== null);

        if (newItems.length > 0) { setItems([...items, ...newItems]); showToast("Imported successfully!"); } else { showToast("Invalid data format."); }
    };

    // Derived State for Step 2
    const groupedOverflow = groupItems(overflowData);
    const currentContainer = fleet[currentContainerIdx];
    const currentContainerDef = currentContainer ? currentContainer.containerDef : CONTAINERS[0];

    return (
        <div className="h-screen flex flex-col text-slate-700 bg-slate-50 font-sans overflow-hidden">
            {/* Header with Desktop Optimize Button */}
            <Header
                step={step}
                onBack={() => setStep(1)}
                onOpenInfo={() => setShowInfo(true)}
                onOptimize={handleCalculate}
                isOptimizeDisabled={items.length === 0}
            />

            <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full overflow-hidden flex flex-col">
                {step === 1 && (
                    <div className="animate-fade-in flex flex-col h-full gap-4">
                        {/* Section 1: Top - Container Selector (Fixed height/Auto) */}
                        <div className="shrink-0">
                            <ContainerSelector
                                containers={CONTAINERS}
                                selectedIds={selectedContainerIds}
                                onToggle={toggleContainerSelect}
                            />
                        </div>

                        {/* Section 2: Middle - Item Manager & Import (Fill remaining space) */}
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                            <div className="h-full min-h-0">
                                <ItemManager
                                    items={items}
                                    onAdd={handleAddItem}
                                    onDelete={handleDeleteClick}
                                    onEdit={(item) => setEditingId(item.id)}
                                    editingId={editingId}
                                    showToast={showToast}
                                />
                            </div>
                            <div className="h-full min-h-0 hidden md:block">
                                <SmartImport onImport={handleSmartImport} />
                            </div>
                            {/* Mobile: SmartImport might be pushed down or hidden if not prioritizing. 
                                For now, I'll keep it simple or maybe scroll on mobile? 
                                User asked for "Desktop... no scroll". Mobile can scroll.
                            */}
                            <div className="md:hidden">
                                <SmartImport onImport={handleSmartImport} />
                            </div>
                        </section>

                        {/* Section 3: Bottom - Mobile Optimize Button */}
                        <div className="flex justify-center pt-2 md:hidden shrink-0 pb-safe">
                            <button
                                onClick={handleCalculate}
                                disabled={items.length === 0}
                                className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-10 py-5 rounded-full text-xl font-bold shadow-xl shadow-cyan-200 disabled:opacity-50"
                            >
                                <Play fill="white" /> Optimize Load
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-4 min-h-0">
                        <div className="lg:col-span-2 flex flex-col gap-4 h-full min-h-0">
                            <ResultsMainPanel
                                fleet={fleet}
                                currentContainerIdx={currentContainerIdx}
                                setCurrentContainerIdx={setCurrentContainerIdx}
                                currentContainerDef={currentContainerDef}
                                overflowData={overflowData}
                                groupedOverflow={groupedOverflow}
                                onOpenShare={() => setShowShare(true)}
                            />
                        </div>
                        <div className="flex flex-col gap-4 h-full min-h-0 overflow-y-auto">
                            <ResultsSidebar
                                container={currentContainer}
                                containerDef={currentContainerDef}
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* Modals & Toast */}
            {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
            {showShare && <ShareModal fleet={fleet} onClose={() => setShowShare(false)} />}
            {toast && <Toast message={toast} />}
        </div>
    );
}

export default App;
