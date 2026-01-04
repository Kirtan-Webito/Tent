export default function SettingsPage() {
    return (
        <div className="max-w-2xl space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                    System Settings
                </h1>
                <p className="text-muted-foreground">Global configurations for the Tent Management platform</p>
            </div>

            <div className="space-y-6">
                <div className="bg-card border border-border p-6 rounded-xl space-y-4 shadow-sm">
                    <h2 className="font-bold text-lg border-b border-border pb-2 text-foreground">General</h2>
                    <div className="flex items-center justify-between">
                        <span className="text-foreground">Platform Name</span>
                        <input type="text" value="Tent Manager Pro" className="bg-secondary border border-input rounded px-3 py-1 text-sm w-48 text-foreground" readOnly />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-foreground">Maintenance Mode</span>
                        <input type="checkbox" className="toggle" />
                    </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl space-y-4 shadow-sm">
                    <h2 className="font-bold text-lg border-b border-border pb-2 text-foreground">Security</h2>
                    <div className="flex items-center justify-between">
                        <span className="text-foreground">Enforce 2FA for Admins</span>
                        <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-foreground">Session Timeout (mins)</span>
                        <input type="number" value="60" className="bg-secondary border border-input rounded px-3 py-1 text-sm w-20 text-foreground" readOnly />
                    </div>
                </div>
            </div>
        </div>
    );
}
