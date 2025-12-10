
import React, { useState } from 'react';
import { Box, Edit, X } from '../common/Icons';

const ItemManager = ({ items, onAdd, onDelete, onEdit, editingId, showToast }) => {
    // Local state for form, managed exactly like legacy
    const [formData, setFormData] = useState({ name: '', l: '', w: '', h: '', weight: '', qty: '', stackable: true, rotatable: true });

    // Sync form data when editingId changes is tricky in a pure component if controlled from above.
    // In legacy, everything was in one file. Here, we can accept 'initialData' or better, keep the logic here but let parent handle the list.
    // Actually, in legacy: `handleEditClick` sets `setFormData` with item values.
    // So we need to expose the ability to set form data from outside OR handle edit logic locally.
    // Let's keep it simple: WE need to handle the form state here, but `editingId` comes effectively from parent to know visual state?
    // Wait, the parent `App` in restoration plan shouldn't manage form state if it was local in legacy.
    // Wait, in legacy `items` and `editingId` were in `App` scope, but `formData` also was.
    // I will try to encapsulate form logic here to be cleaner, but need to respect the "Edit" flow.

    // Better approach: Pass `editingItem` prop if editing. 
    React.useEffect(() => {
        if (editingId) {
            const item = items.find(i => i.id === editingId);
            if (item) {
                setFormData({
                    name: item.name, l: item.l, w: item.w, h: item.h,
                    weight: item.weight, qty: item.qty, stackable: item.stackable, rotatable: item.rotatable
                });
            }
        } else {
            setFormData({ name: '', l: '', w: '', h: '', weight: '', qty: '', stackable: true, rotatable: true });
        }
    }, [editingId, items]);

    const submit = () => {
        const l = parseFloat(formData.l);
        const w = parseFloat(formData.w);
        const h = parseFloat(formData.h);
        const weight = parseFloat(formData.weight);
        const qty = parseInt(formData.qty);
        const name = formData.name || 'Box';

        if (!l || !w || !h || !qty || !weight || weight <= 0) {
            showToast("Please fill in all dimensions, qty and valid weight.");
            return;
        }

        const newItem = {
            // ID generation logic matches legacy
            // But we don't have access to generating ID here easily if we want to match legacy logic 100% inside App.
            // Let's pass the payload to `onAdd` and let parent handle ID generation/Editing.
            name, l, w, h, weight, qty, stackable: formData.stackable, rotatable: formData.rotatable
        };

        onAdd(newItem); // Parent handles update vs create based on editingId state
        if (!editingId) {
            setFormData({ name: '', l: '', w: '', h: '', weight: '', qty: '', stackable: true, rotatable: true });
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Box className="text-cyan-500" /> 2. Your Items
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4 flex-grow custom-scrollbar">
                {items.map((item) => (
                    <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${editingId === item.id ? 'bg-cyan-50 border-cyan-200' : 'bg-slate-50 border-transparent'}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                            <div className="min-w-0">
                                <div className="font-bold text-sm truncate">{item.name}</div>
                                <div className="text-xs text-slate-400 flex gap-2">
                                    <span>{item.l}x{item.w}x{item.h}m</span>
                                    {!item.stackable && <span className="text-red-400 font-bold">NoStack</span>}
                                    {item.rotatable && <span className="text-cyan-400">Rot</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded text-xs shadow-sm">x{item.qty}</span>
                            <button onClick={() => onEdit(item)} className="text-slate-400 hover:text-cyan-600 p-1"><Edit size={16} /></button>
                            <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-red-500 p-1"><X size={16} /></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <p className="text-center text-slate-400 italic py-4">No items yet.</p>}
            </div>

            <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase">{editingId ? 'Edit Item' : 'Add New Item'}</p>
                <div className="grid grid-cols-12 gap-2 mb-2">
                    <input type="text" placeholder="Name" className="col-span-12 md:col-span-4 p-2 bg-slate-50 rounded-lg text-sm focus:ring-2 focus:ring-cyan-200 border-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <input type="number" placeholder="L (m)" className="col-span-4 md:col-span-2 p-2 bg-slate-50 rounded-lg text-sm border-none" value={formData.l} onChange={e => setFormData({ ...formData, l: e.target.value })} />
                    <input type="number" placeholder="W (m)" className="col-span-4 md:col-span-2 p-2 bg-slate-50 rounded-lg text-sm border-none" value={formData.w} onChange={e => setFormData({ ...formData, w: e.target.value })} />
                    <input type="number" placeholder="H (m)" className="col-span-4 md:col-span-2 p-2 bg-slate-50 rounded-lg text-sm border-none" value={formData.h} onChange={e => setFormData({ ...formData, h: e.target.value })} />
                </div>
                <div className="grid grid-cols-12 gap-2 mb-2">
                    <input type="number" placeholder="Weight (kg)" className="col-span-4 p-2 bg-slate-50 rounded-lg text-sm border-none" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                    <input type="number" placeholder="Qty" className="col-span-4 p-2 bg-slate-50 rounded-lg text-sm border-none" value={formData.qty} onChange={e => setFormData({ ...formData, qty: e.target.value })} />
                    <div className="col-span-4 flex items-center justify-around text-xs text-slate-600">
                        <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={formData.stackable} onChange={e => setFormData({ ...formData, stackable: e.target.checked })} className="rounded text-cyan-600" /> Stackable</label>
                        <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={formData.rotatable} onChange={e => setFormData({ ...formData, rotatable: e.target.checked })} className="rounded text-cyan-600" /> Rotate</label>
                    </div>
                </div>
                <button onClick={submit} className={`w-full rounded-lg font-bold text-sm py-2 transition-colors ${editingId ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200'}`}>
                    {editingId ? 'Update Item' : '+ Add Item'}
                </button>
            </div>
        </div>
    );
};

export default ItemManager;
