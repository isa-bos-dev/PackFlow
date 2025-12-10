
import React from 'react';
import { Info } from './Icons';

const Toast = ({ message }) => {
    if (!message) return null;
    return (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl animate-fade-in flex items-center gap-3 z-50">
            <Info size={20} className="text-cyan-400" />
            {message}
        </div>
    );
};

export default Toast;
