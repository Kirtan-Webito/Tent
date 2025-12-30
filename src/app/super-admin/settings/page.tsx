export default function SettingsPage() {
    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                    System Settings
                </h1>
                <p className="text-gray-400">Global configurations for the Tent Management platform</p>
            </div>

            <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
                    <h2 className="font-bold text-lg border-b border-white/10 pb-2">General</h2>
                    <div className="flex items-center justify-between">
                        <span>Platform Name</span>
                        <input type="text" value="Tent Manager Pro" className="bg-black/40 border border-white/20 rounded px-3 py-1 text-sm w-48" readOnly />
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Maintenance Mode</span>
                        <input type="checkbox" className="toggle" />
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
                    <h2 className="font-bold text-lg border-b border-white/10 pb-2">Security</h2>
                    <div className="flex items-center justify-between">
                        <span>Enforce 2FA for Admins</span>
                        <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Session Timeout (mins)</span>
                        <input type="number" value="60" className="bg-black/40 border border-white/20 rounded px-3 py-1 text-sm w-20" readOnly />
                    </div>
                </div>
            </div>
        </div>
    );
}
