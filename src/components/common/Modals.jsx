
import React from 'react';
import { X, CheckCircle, Package, Truck, Archive, Download } from './Icons';

export const InfoModal = ({ onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full transition-colors"><X size={20} /></button>

            <div className="mb-6 flex items-center gap-3">
                <div className="bg-cyan-50 p-3 rounded-2xl text-cyan-600"><Package size={28} /></div>
                <div><h2 className="text-2xl font-bold text-slate-800">How to Use</h2><p className="text-slate-500 text-sm">PackFlow v1.0 Guide</p></div>
            </div>

            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="mt-1"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span></div>
                    <div><h3 className="font-bold text-slate-800">Select Containers</h3><p className="text-sm text-slate-500 leading-relaxed">Choose one or multiple container types from the fleet list.</p></div>
                </div>
                <div className="flex gap-4">
                    <div className="mt-1"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">2</span></div>
                    <div><h3 className="font-bold text-slate-800">Add Cargo</h3><p className="text-sm text-slate-500 leading-relaxed">Input your items manually or paste from Excel/Sheets. Don't forget stackability!</p></div>
                </div>
                <div className="flex gap-4">
                    <div className="mt-1"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">3</span></div>
                    <div><h3 className="font-bold text-slate-800">Optimize & Visualize</h3><p className="text-sm text-slate-500 leading-relaxed">The algorithm will pack your items. Rotate the 3D view to inspect.</p></div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button onClick={onClose} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-slate-200">Got it!</button>
            </div>
        </div>
    </div>
);

export const ShareModal = ({ fleet, onClose }) => {
    const handleDownload = () => {
        let csv = "Container ID,Container Type,Item Name,L,W,H,Weight,Position (X,Y,Z),Rotation\n";
        fleet.forEach(c => {
            c.items.forEach(i => {
                csv += `${c.id},${c.type},${i.name},${i.l},${i.w},${i.h},${i.weight},"${i.x.toFixed(2)},${i.y.toFixed(2)},${i.z.toFixed(2)}",${i.rotated ? 'Yes' : 'No'}\n`;
            });
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `packflow_manifest_${Date.now()}.csv`;
        a.click();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 animate-bounce"><CheckCircle size={32} /></div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Calculation Ready!</h2>
                <p className="text-slate-500 mb-8">Your load has been optimized across {fleet.length} containers.</p>

                <div className="space-y-3">
                    <button onClick={handleDownload} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-3"><Download size={20} /> Download CSV Manifest</button>
                    <button onClick={onClose} className="w-full bg-white text-slate-500 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors border border-slate-200">Close Preview</button>
                </div>
            </div>
        </div>
    );
};
