import React from 'react';
import { HelpCircle, X, Move, RefreshCw, Archive, Sun, AlertTriangle, CheckCircle, Download, Share2, Layers } from './Icons';

export const InfoModal = ({ onClose }) => (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[100] p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-0 animate-slide-up relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-700">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-3"><HelpCircle size={24} className="text-cyan-400" /> Documentation</h2>
                    <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-wider">User Manual</p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50 text-slate-700 flex flex-col text-sm">

                {/* 1. Coordinate System & Rotation */}
                <div className="p-6 border-b border-slate-200 bg-white grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-cyan-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <Move size={18} /> 1. Coordinates (POS)
                        </h3>
                        <p className="mb-3 text-slate-600">The Position (POS) column indicates the exact placement of each item in <strong>Meters</strong> (X, Y, Z).</p>
                        <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                            <div className="bg-red-50 p-2 rounded border border-red-100 text-center"><span className="text-red-600 font-bold block text-lg">X</span> Length</div>
                            <div className="bg-green-50 p-2 rounded border border-green-100 text-center"><span className="text-green-600 font-bold block text-lg">Y</span> Height</div>
                            <div className="bg-blue-50 p-2 rounded border border-blue-100 text-center"><span className="text-blue-600 font-bold block text-lg">Z</span> Width</div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-cyan-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <RefreshCw size={18} /> 2. What means "Rotatable"?
                        </h3>
                        <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 space-y-2">
                            <div className="flex items-start gap-2">
                                <div className="bg-green-100 text-green-700 p-1 rounded font-bold text-xs">YES</div>
                                <p className="text-xs text-slate-600"><strong>Planar Rotation (Floor):</strong> The item can rotate 90° on the floor (Swapping Length & Width).</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="bg-red-100 text-red-700 p-1 rounded font-bold text-xs">NO</div>
                                <p className="text-xs text-slate-600"><strong>3D Flip (Tipping):</strong> Items are <span className="underline">never</span> flipped upside down or on their sides. The Height (Y) always remains vertical.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Data Protocols */}
                <div className="p-6 border-b border-slate-200 bg-white">
                    <h3 className="font-bold text-cyan-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Archive size={18} /> 3. Excel Import Format
                    </h3>
                    <p className="mb-3 text-slate-600">
                        Copy data directly from Excel without headers. <strong>All dimensions must be in METERS.</strong>
                    </p>

                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-xs text-left bg-white">
                            <thead className="bg-slate-100 text-slate-500 font-bold">
                                <tr>
                                    <th className="p-3 border-b">Item Name</th>
                                    <th className="p-3 border-b">Length (m)</th>
                                    <th className="p-3 border-b">Width (m)</th>
                                    <th className="p-3 border-b">Height (m)</th>
                                    <th className="p-3 border-b">Weight (kg)</th>
                                    <th className="p-3 border-b">Qty</th>
                                    <th className="p-3 border-b">Stockable (0/1)</th>
                                    <th className="p-3 border-b">Rotatable (0/1)</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono text-slate-600">
                                <tr>
                                    <td className="p-3 border-b">"Big Machine"</td>
                                    <td className="p-3 border-b">1.2</td>
                                    <td className="p-3 border-b">0.8</td>
                                    <td className="p-3 border-b">1.1</td>
                                    <td className="p-3 border-b">450</td>
                                    <td className="p-3 border-b">2</td>
                                    <td className="p-3 border-b">0 (No)</td>
                                    <td className="p-3 border-b">1 (Yes)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-xs text-slate-500 italic">
                            * Weight must be greater than 0. Stockable/Rotatable: 1 = Yes, 0 = No.
                        </div>
                        <a
                            href="/packflow_template.xlsx"
                            download="PackFlow_Template.xlsx"
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-bold text-xs transition-colors border border-emerald-200"
                        >
                            <Download size={16} /> Excel Template
                        </a>
                    </div>
                </div>

                {/* 4. Packing List Icons Guide (Moved Here) */}
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-cyan-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Archive size={18} /> 4. Packing List Indicators
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div className="flex items-center gap-3 bg-white p-3 rounded border border-slate-200">
                            <div className="p-2 bg-slate-100 rounded-full"><RefreshCw size={16} className="text-cyan-600" /></div>
                            <div>
                                <strong className="block text-slate-800">Rotated</strong>
                                <span className="text-slate-500">Item was rotated 90° to fit better.</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded border border-slate-200">
                            <div className="p-2 bg-slate-100 rounded-full"><div className="text-rose-400 font-bold"><Layers size={16} /></div></div>
                            <div>
                                <strong className="block text-slate-800">Not Stackable</strong>
                                <span className="text-slate-500">Nothing can be placed on top of this (Y axis).</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Special Containers & CoG */}
                <div className="p-6 bg-white border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-cyan-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Sun size={18} /> 5. Special Equipment
                        </h3>
                        <div className="space-y-3 text-sm text-slate-600">
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                <strong className="text-purple-800">Open Top (OT)</strong>
                                <p className="text-xs mt-1">Containers without a rigid roof. Used for <strong>Over-Height (OH)</strong> cargo that is too tall for a standard box (&gt;2.69m).</p>
                            </div>
                            <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                                <strong className="text-slate-800">Flat Rack (FR)</strong>
                                <p className="text-xs mt-1">Containers with no side walls or roof. Used for <strong>Over-Width (OW)</strong> or extremely large/heavy cargo.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-cyan-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <AlertTriangle size={18} /> 6. Center of Gravity
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-3 p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                                <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                                <div>
                                    <strong className="text-emerald-700 block text-xs uppercase">Stable (Green)</strong>
                                    <span className="text-xs text-emerald-600">CoG 40-60%. Safe to drive.</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                                <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                                <div>
                                    <strong className="text-amber-700 block text-xs uppercase">Unbalanced (Amber)</strong>
                                    <span className="text-xs text-amber-600">Weight too far forward/back.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
                <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors text-sm">Close Manual</button>
            </div>
        </div>
    </div>
);

export const ShareModal = ({ fleet, onClose }) => {
    const downloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Container ID,Container Type,Item Name,Dimensions (LxWxH m),Weight (kg),Position (X Y Z)\n";
        fleet.forEach(c => {
            c.items.forEach(i => {
                const row = [`${c.id}`, `${c.type}`, `${i.name}`, `${i.l}x${i.w}x${i.h}`, `${i.weight}`, `${i.x} ${i.y} ${i.z}`].join(",");
                csvContent += row + "\n";
            });
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "packflow_manifest.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[100] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 animate-slide-up relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                <div className="flex items-center gap-3 mb-4 text-cyan-600"><Share2 size={28} /><h2 className="text-xl font-bold">Full Load Manifest</h2></div>
                <div className="overflow-auto flex-grow border rounded-xl mb-4">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0"><tr><th className="px-4 py-3">Cont #</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Item</th><th className="px-4 py-3">Dims (m)</th><th className="px-4 py-3">Weight</th><th className="px-4 py-3">Pos (X, Y, Z)</th></tr></thead>
                        <tbody>
                            {fleet.map(c => (
                                <React.Fragment key={c.id}>
                                    <tr className="bg-cyan-50 border-b border-cyan-100"><td colSpan="6" className="px-4 py-2 font-bold text-cyan-800">Container #{c.id} - {c.type}</td></tr>
                                    {c.items.map((item, idx) => (
                                        <tr key={idx} className="border-b hover:bg-slate-50"><td className="px-4 py-2">{c.id}</td><td className="px-4 py-2 text-xs">{c.type}</td><td className="px-4 py-2 font-medium">{item.name}</td><td className="px-4 py-2">{item.l}x{item.w}x{item.h}</td><td className="px-4 py-2">{item.weight} kg</td><td className="px-4 py-2 font-mono text-xs">{item.x.toFixed(2)}, {item.y.toFixed(2)}, {item.z.toFixed(2)}</td></tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end gap-3"><button onClick={onClose} className="px-6 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-bold">Close</button><button onClick={downloadCSV} className="px-6 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 font-bold flex items-center gap-2"><Download size={18} /> Export to Excel</button></div>
            </div>
        </div>
    );
};
