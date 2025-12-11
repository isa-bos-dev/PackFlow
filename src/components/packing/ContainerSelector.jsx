
import React from 'react';
import { Truck, Check, Sun, Layout } from '../common/Icons';

const ContainerSelector = ({ containers, selectedIds, onToggle }) => {
    return (
        <section>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Truck className="text-cyan-500" /> 1. Choose your Transport(s)
                </h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Select multiple for auto-optimization</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {containers.map(c => (
                    <div
                        key={c.id}
                        onClick={() => onToggle(c.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 relative ${selectedIds.includes(c.id) ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                    >
                        {selectedIds.includes(c.id) && (
                            <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-sm">
                                <Check size={16} strokeWidth={3} className="text-cyan-500" />
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-1 gap-2 pr-5">
                            <div className="flex flex-col">
                                <span className="font-bold text-xs leading-tight">{c.name}</span>
                                {c.type === "OT" && (
                                    <span className="text-[9px] text-purple-500 font-bold mt-0.5 flex items-center gap-1">
                                        <Sun size={8} /> SPECIAL EQUIP
                                    </span>
                                )}
                                {c.type === "FR" && (
                                    <span className="text-[9px] text-rose-700 font-bold mt-0.5 flex items-center gap-1">
                                        <Layout size={8} /> SPECIAL EQUIP
                                    </span>
                                )}
                            </div>
                            <div className="text-[10px] text-right text-slate-500 leading-tight shrink-0">
                                <p className="font-medium">Max: {(c.max_weight / 1000).toFixed(1)}t</p>
                                <p className="opacity-80">{(c.inner_dims.l).toFixed(2)}x{(c.inner_dims.w).toFixed(2)}x{(c.inner_dims.h).toFixed(2)}m</p>
                            </div>
                        </div>
                        <div className="mt-1 h-1 w-full rounded-full" style={{ backgroundColor: c.color }}></div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ContainerSelector;
