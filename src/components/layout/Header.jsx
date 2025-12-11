
import React from 'react';
import { Package, HelpCircle, Play } from '../common/Icons';

const Header = ({ step, onBack, onOpenInfo, onOptimize, isOptimizeDisabled }) => {
    return (
        <header className="bg-slate-900 text-white p-4 shadow-lg z-50 sticky top-0">
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* Logo Section - Legacy Exact Match */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
                    {/* Fallback logo icon directly since we don't have logo.jpg */}
                    <div className="bg-cyan-500 text-white p-2 rounded-lg">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">
                            <span className="text-cyan-400">P</span>ack<span className="text-cyan-400">F</span>low
                        </h1>
                        <p className="text-xs text-slate-400 hidden sm:block">Load Calculator</p>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Step 1: Optimize Button (Desktop Only) */}
                    {step === 1 && (
                        <button
                            onClick={onOptimize}
                            disabled={isOptimizeDisabled}
                            className="hidden md:flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white rounded-full font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:grayscale shadow-lg shadow-cyan-900/50"
                        >
                            <Play size={18} fill="currentColor" /> Optimize Load
                        </button>
                    )}

                    {step === 2 && (
                        <button
                            onClick={onBack}
                            className="text-sm font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                        >
                            ← Edit Items
                        </button>
                    )}
                    <button
                        onClick={onOpenInfo}
                        className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors text-cyan-400 border border-slate-700"
                    >
                        <HelpCircle size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
