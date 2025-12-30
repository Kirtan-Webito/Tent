'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Contact {
    id: string;
    title: string;
    name: string;
    phone: string;
    order: number;
}

interface SOP {
    id: string;
    rule: string;
    order: number;
}

export default function HelpManagementClient({
    initialContacts,
    initialSOPs
}: {
    initialContacts: Contact[];
    initialSOPs: SOP[];
}) {
    const router = useRouter();
    const [contacts, setContacts] = useState(initialContacts);
    const [sops, setSOPs] = useState(initialSOPs);
    const [isAddingContact, setIsAddingContact] = useState(false);
    const [isAddingSOP, setIsAddingSOP] = useState(false);
    const [newContact, setNewContact] = useState({ title: '', name: '', phone: '' });
    const [newSOP, setNewSOP] = useState('');

    const addContact = async () => {
        if (!newContact.title || !newContact.name || !newContact.phone) return;

        const res = await fetch('/api/help/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContact)
        });

        if (res.ok) {
            setNewContact({ title: '', name: '', phone: '' });
            setIsAddingContact(false);
            router.refresh();
        }
    };

    const deleteContact = async (id: string) => {
        const res = await fetch(`/api/help/contacts?id=${id}`, { method: 'DELETE' });
        if (res.ok) router.refresh();
    };

    const addSOP = async () => {
        if (!newSOP.trim()) return;

        const res = await fetch('/api/help/sops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rule: newSOP })
        });

        if (res.ok) {
            setNewSOP('');
            setIsAddingSOP(false);
            router.refresh();
        }
    };

    const deleteSOP = async (id: string) => {
        const res = await fetch(`/api/help/sops?id=${id}`, { method: 'DELETE' });
        if (res.ok) router.refresh();
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                    Help & Support Management
                </h1>
                <p className="text-gray-400">Manage emergency contacts and SOPs for your desk team</p>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">🚨 Emergency Contacts</h2>
                    <button
                        onClick={() => setIsAddingContact(!isAddingContact)}
                        className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition"
                    >
                        + Add Contact
                    </button>
                </div>

                {isAddingContact && (
                    <div className="mb-4 p-4 bg-black/20 rounded-lg space-y-3">
                        <input
                            className="input-primary w-full"
                            placeholder="Title (e.g., Security Head)"
                            value={newContact.title}
                            onChange={e => setNewContact({ ...newContact, title: e.target.value })}
                        />
                        <input
                            className="input-primary w-full"
                            placeholder="Name (e.g., Mr. John Wick)"
                            value={newContact.name}
                            onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                        />
                        <input
                            className="input-primary w-full"
                            placeholder="Phone Number"
                            value={newContact.phone}
                            onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={addContact}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsAddingContact(false)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid gap-3">
                    {contacts.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No emergency contacts added yet</p>
                    ) : (
                        contacts.map(contact => (
                            <div key={contact.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                                <div>
                                    <div className="font-bold text-white">{contact.title}</div>
                                    <div className="text-sm text-gray-400">{contact.name}</div>
                                    <div className="text-sm text-emerald-400">{contact.phone}</div>
                                </div>
                                <button
                                    onClick={() => deleteContact(contact.id)}
                                    className="px-3 py-1 text-red-400 hover:bg-red-500/20 rounded transition"
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* SOPs */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">📋 Standard Operating Procedures</h2>
                    <button
                        onClick={() => setIsAddingSOP(!isAddingSOP)}
                        className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition"
                    >
                        + Add Rule
                    </button>
                </div>

                {isAddingSOP && (
                    <div className="mb-4 p-4 bg-black/20 rounded-lg space-y-3">
                        <textarea
                            className="input-primary w-full resize-none"
                            placeholder="Enter SOP rule..."
                            rows={3}
                            value={newSOP}
                            onChange={e => setNewSOP(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={addSOP}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsAddingSOP(false)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {sops.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No SOPs added yet</p>
                    ) : (
                        sops.map((sop, idx) => (
                            <div key={sop.id} className="flex items-start gap-3 p-4 bg-black/20 rounded-lg">
                                <div className="flex-none w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 text-gray-300">{sop.rule}</div>
                                <button
                                    onClick={() => deleteSOP(sop.id)}
                                    className="flex-none px-3 py-1 text-red-400 hover:bg-red-500/20 rounded transition text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
