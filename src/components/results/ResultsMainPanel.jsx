
import React, { useState } from 'react';
import Visualizer3D from '../Visualizer3D';
import { ContainerIcon, RotateCw, Share2, AlertTriangle } from '../common/Icons';

const ResultsMainPanel = ({
    fleet,
    currentContainerIdx,
    setCurrentContainerIdx,
    currentContainerDef,
    overflowData,
    groupedOverflow,
    onOpenShare
}) => {
    const [isAutoRotating, setIsAutoRotating] = useState(false);

    const currentContainer = fleet[currentContainerIdx];
    // currentContainerDef is now passed from parent with proper fallback
    const items = currentContainer ? currentContainer.items : [];

    // Calcs for Top Bar
    const currentWeight = items.reduce((acc, i) => acc + i.weight, 0);
    const maxWeight = currentContainerDef.max_weight;

    const currentVolume = items.reduce((acc, i) => {
        const l = i.rotated ? i.w : i.l;
        const w = i.rotated ? i.l : i.w;
        return acc + (l * w * i.h);
    }, 0);
    const maxVol = (currentContainerDef.inner_dims.l * currentContainerDef.inner_dims.w * currentContainerDef.inner_dims.h);

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-2 shrink-0">
                <div className="flex gap-2 overflow-x-auto pb-2 max-w-full">
                    {fleet.map((c, i) => (
                        <button key={c.id} onClick={() => setCurrentContainerIdx(i)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${currentContainerIdx === i ? 'bg-cyan-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}><ContainerIcon size={16} /> {c.name}</button>
                    ))}
                </div>

                {/* Stats Pill - Always Visible */}
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs flex gap-3 shadow-sm whitespace-nowrap">
                    <div><span className="font-bold text-slate-500 mr-1">Weight:</span><span>{(currentWeight / 1000).toFixed(2)} / {(maxWeight / 1000).toFixed(1)}t</span></div>
                    <div className="w-px bg-slate-200"></div>
                    <div><span className="font-bold text-slate-500 mr-1">Vol:</span><span>{currentVolume.toFixed(2)} / {maxVol.toFixed(2)}m³</span></div>
                </div>
            </div>

            {/* Visualizer - Logic: Only show if we actually have a container in the fleet (Legacy behavior) */}
            <div className="flex-grow min-h-0 relative">
                {currentContainer && (
                    <Visualizer3D container={currentContainerDef} items={items} autoRotate={isAutoRotating} />
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <button onClick={() => setIsAutoRotating(!isAutoRotating)} className={`p-3 rounded-xl transition-colors ${isAutoRotating ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`} title={isAutoRotating ? "Stop Rotation" : "Auto Rotate"}><RotateCw size={20} className={isAutoRotating ? "animate-spin" : ""} /></button>
                    <div className="text-sm"><span className="block font-bold text-slate-700">{currentContainer ? currentContainer.type : 'Empty'}</span><span className="text-xs text-slate-500">Visualization Controls</span></div>
                </div>
                <div className="bg-cyan-600 p-3 rounded-2xl shadow-lg shadow-cyan-200 flex items-center justify-between gap-4 sm:w-auto">
                    <div className="text-white pl-2"><span className="block font-bold text-sm">Export Data</span><span className="text-[10px] text-cyan-200 uppercase tracking-wider">Full Fleet</span></div>
                    <button onClick={onOpenShare} className="flex items-center gap-2 px-4 py-2 bg-white text-cyan-600 rounded-xl hover:bg-cyan-50 font-bold text-sm whitespace-nowrap transition-colors"><Share2 size={18} /> Open List</button>
                </div>
            </div>

            {groupedOverflow.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shrink-0 overflow-y-auto max-h-32">
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle className="text-red-600" /><h3 className="font-bold text-red-700">Items Not Fit (Requires Special Eq.)</h3></div>
                    <div className="flex flex-col gap-2">{groupedOverflow.map((group, i) => (<div key={i} className="flex justify-between items-center bg-white p-2 rounded border border-red-200"><span className="text-xs font-bold text-slate-700">{group.count}x {group.name}</span><span className="text-[10px] font-mono text-red-500 bg-red-50 px-2 py-1 rounded">{group.reason}</span></div>))}</div>
                </div>
            )}
        </div>
    );
};

export default ResultsMainPanel;
