
import React from 'react';
import { CheckCircle, AlertTriangle, RotateCw, Layers } from '../common/Icons';

const ResultsSidebar = ({ container, containerDef }) => {
    // Calculate metrics based on the passed container, defaulting to empty if null
    const items = container ? (container.items || []) : [];

    const currentWeight = items.reduce((acc, i) => acc + i.weight, 0);
    const maxWeight = containerDef ? containerDef.max_weight : 1;

    const currentVolume = items.reduce((acc, i) => {
        const l = i.rotated ? i.w : i.l;
        const w = i.rotated ? i.l : i.w;
        return acc + (l * w * i.h);
    }, 0);
    const maxVol = containerDef ? (containerDef.inner_dims.l * containerDef.inner_dims.w * containerDef.inner_dims.h) : 1;

    const weightPercent = (currentWeight / maxWeight) * 100;
    const volPercent = (currentVolume / maxVol) * 100;

    // Stability
    const cogX = (items.length > 0 && currentWeight > 0)
        ? items.reduce((acc, i) => {
            const l = i.rotated ? i.w : i.l;
            return acc + (i.x + l / 2) * i.weight;
        }, 0) / currentWeight
        : 0;
    const containerL = containerDef ? containerDef.inner_dims.l : 1;
    const cogPercent = (cogX / containerL) * 100;
    const isStable = items.length > 0 && cogPercent >= 40 && cogPercent <= 60;

    // Render ALWAYS, even if empty
    return (
        <div className="flex flex-col gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-800">
                    Container #{container ? container.id : 1} Metrics
                </h3>

                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-slate-600">Weight</span>
                        <span>{(currentWeight / 1000).toFixed(2)}/{(maxWeight / 1000).toFixed(1)}t</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-1000 ${weightPercent > 100 ? 'bg-red-500' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(weightPercent, 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-slate-600">Volume</span>
                        <span>{currentVolume.toFixed(2)}/{maxVol.toFixed(2)}m³</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                            className="h-3 rounded-full bg-cyan-400 transition-all duration-1000"
                            style={{ width: `${Math.min(volPercent, 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div className={`p-4 rounded-xl border-l-4 ${isStable ? 'bg-emerald-50 border-emerald-400' : 'bg-amber-50 border-amber-400'} flex gap-3 items-start`}>
                    {isStable ? <CheckCircle className="text-emerald-500 shrink-0" /> : <AlertTriangle className="text-amber-500 shrink-0" />}
                    <div>
                        <p className={`font-bold text-sm ${isStable ? 'text-emerald-800' : 'text-amber-800'}`}>
                            {isStable ? 'Stable' : 'Unbalanced'}
                        </p>
                        <p className="text-xs opacity-80 mt-1">CoG: {cogPercent.toFixed(0)}% (Target: 40-60%)</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-grow overflow-hidden flex flex-col h-64 lg:h-auto">
                <h3 className="font-bold text-slate-800 mb-4">Packing List</h3>
                <div className="overflow-y-auto pr-2 space-y-2 flex-grow custom-scrollbar">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-sm border-b border-slate-50 last:border-0">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                            <div className="truncate flex-grow">
                                <span className="block font-medium">{item.name}</span>
                                <span className="text-xs text-slate-400">{item.rotated ? `Rotated (${item.w.toFixed(2)}x${item.l.toFixed(2)})` : `${item.l.toFixed(2)}x${item.w.toFixed(2)}`} • {item.y > 0 ? `On Stack (Y=${item.y.toFixed(2)})` : 'Floor'}</span>
                            </div>
                            <div className="text-slate-500 font-mono text-xs text-right">{item.rotated && <RotateCw size={12} className="inline mr-1" />}{item.stackable === false && <Layers size={12} className="inline text-red-400" />}</div>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-center text-slate-400 italic py-4">No items packed.</p>}
                </div>
            </div>
        </div>
    );
};

export default ResultsSidebar;
