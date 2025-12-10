
import React, { useState } from 'react';
import { Archive } from '../common/Icons';

const SmartImport = ({ onImport }) => {
    const [smartPasteText, setSmartPasteText] = useState("");

    const handleSmartPaste = () => {
        onImport(smartPasteText);
        setSmartPasteText(""); // Clear after handling
    };

    return (
        <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-100 flex flex-col h-full">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-cyan-900">
                <Archive className="text-cyan-500" /> Smart Paste
            </h2>
            <div className="text-xs text-cyan-800 mb-3 opacity-90 bg-cyan-100 p-2 rounded-lg border border-cyan-200 leading-relaxed">
                <p className="font-bold mb-1">Paste Excel data (No Headers):</p>
                <code className="block bg-cyan-50 p-1 rounded border border-cyan-200 text-[10px] text-cyan-600 font-mono">
                    Name | L(m) | W(m) | H(m) | W(kg) | Qty | Stack(0/1) | Rot(0/1)
                </code>
            </div>
            <textarea
                value={smartPasteText}
                onChange={(e) => setSmartPasteText(e.target.value)}
                placeholder="Paste Excel cells here..."
                className="w-full flex-grow p-3 rounded-xl border-none text-sm font-mono text-slate-600 bg-white/80 min-h-[150px]"
            ></textarea>
            <button
                onClick={handleSmartPaste}
                disabled={!smartPasteText}
                className="mt-3 w-full py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-200"
            >
                Import Data
            </button>
        </div>
    );
};

export default SmartImport;
