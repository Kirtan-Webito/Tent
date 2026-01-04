'use client';

import { useState } from 'react';
import { ExclamationTriangleIcon, ClipboardIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                    Help & Support Management
                </h1>
                <p className="text-muted-foreground">Manage emergency contacts and SOPs for your desk team</p>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                        <h2 className="text-xl font-bold text-foreground">Emergency Contacts</h2>
                    </div>
                    <button
                        onClick={() => setIsAddingContact(!isAddingContact)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-lg transition border border-emerald-200 shadow-sm"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Contact</span>
                    </button>
                </div>

                {isAddingContact && (
                    <div className="mb-4 p-4 bg-secondary/50 border border-border rounded-lg space-y-3">
                        <input
                            className="input-primary w-full bg-white"
                            placeholder="Title (e.g., Security Head)"
                            value={newContact.title}
                            onChange={e => setNewContact({ ...newContact, title: e.target.value })}
                        />
                        <input
                            className="input-primary w-full bg-white"
                            placeholder="Name (e.g., Mr. John Wick)"
                            value={newContact.name}
                            onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                        />
                        <input
                            className="input-primary w-full bg-white"
                            placeholder="Phone Number"
                            value={newContact.phone}
                            onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={addContact}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm font-bold"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsAddingContact(false)}
                                className="px-4 py-2 bg-white border border-border hover:bg-secondary text-muted-foreground rounded-lg transition shadow-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid gap-3">
                    {contacts.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No emergency contacts added yet</p>
                    ) : (
                        contacts.map(contact => (
                            <div key={contact.id} className="flex items-center justify-between p-4 bg-white border border-border rounded-lg shadow-sm hover:shadow-md transition-all">
                                <div>
                                    <div className="font-bold text-foreground">{contact.title}</div>
                                    <div className="text-sm text-muted-foreground">{contact.name}</div>
                                    <div className="text-sm text-emerald-600 font-medium">{contact.phone}</div>
                                </div>
                                <button
                                    onClick={() => deleteContact(contact.id)}
                                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition font-medium border border-transparent hover:border-red-200"
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* SOPs */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <ClipboardIcon className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold text-foreground">Standard Operating Procedures</h2>
                    </div>
                    <button
                        onClick={() => setIsAddingSOP(!isAddingSOP)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-lg transition border border-emerald-200 shadow-sm"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Rule</span>
                    </button>
                </div>

                {isAddingSOP && (
                    <div className="mb-4 p-4 bg-secondary/50 border border-border rounded-lg space-y-3">
                        <textarea
                            className="input-primary w-full resize-none bg-white"
                            placeholder="Enter SOP rule..."
                            rows={3}
                            value={newSOP}
                            onChange={e => setNewSOP(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={addSOP}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm font-bold"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsAddingSOP(false)}
                                className="px-4 py-2 bg-white border border-border hover:bg-secondary text-muted-foreground rounded-lg transition shadow-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {sops.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No SOPs added yet</p>
                    ) : (
                        sops.map((sop, idx) => (
                            <div key={sop.id} className="flex items-start gap-3 p-4 bg-white border border-border rounded-lg shadow-sm">
                                <div className="flex-none w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 text-foreground">{sop.rule}</div>
                                <button
                                    onClick={() => deleteSOP(sop.id)}
                                    className="flex-none px-3 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm font-medium border border-transparent hover:border-red-200"
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
