
import React from 'react';
import { Truck, CheckCircle, Sun, Layout } from '../common/Icons';

const ContainerSelector = ({ containers, selectedIds, onToggle }) => {
    return (
        <section>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Truck className="text-cyan-500" /> 1. Choose your Transport(s)
                </h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Select multiple for auto-optimization</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {containers.map(c => (
                    <div
                        key={c.id}
                        onClick={() => onToggle(c.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 relative ${selectedIds.includes(c.id) ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                    >
                        {selectedIds.includes(c.id) && (
                            <div className="absolute top-2 right-2 text-cyan-500">
                                <CheckCircle size={16} fill="currentColor" className="text-white" />
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-1 pr-6">
                            <span className="font-bold text-xs leading-tight">{c.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 space-y-0.5 leading-tight">
                            {c.type === "OT" && (
                                <span className="block text-purple-500 font-bold mb-1 flex items-center gap-1">
                                    <Sun size={10} /> OPEN TOP
                                </span>
                            )}
                            {c.type === "FR" && (
                                <span className="block text-slate-600 font-bold mb-1 flex items-center gap-1">
                                    <Layout size={10} /> FLAT RACK
                                </span>
                            )}
                            <p>Max: {(c.max_weight / 1000).toFixed(1)}t</p>
                            <p>{(c.inner_dims.l).toFixed(2)}x{(c.inner_dims.w).toFixed(2)}x{(c.inner_dims.h).toFixed(2)}m</p>
                        </div>
                        <div className="mt-2 h-1 w-full rounded-full" style={{ backgroundColor: c.color }}></div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ContainerSelector;
