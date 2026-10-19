'use client';

import { useState, useEffect } from 'react';
import { toggleDemoMode } from '@/lib/actions/demo.actions';

export default function DemoToggle() {
    const [isOpen, setIsOpen] = useState(false);
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'demo' | 'normal' | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const isOff = document.cookie.split('; ').find(row => row.startsWith('demo-mode-off='))?.split('=')[1] === 'true';
        setStatus(isOff ? 'normal' : 'demo');
    }, []);

    const handleToggle = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await toggleDemoMode(code);
        
        if (result.success) {
            setStatus(result.mode as 'demo' | 'normal');
            setCode('');
            setIsOpen(false);
            window.location.reload(); // Reload to apply changes across the app
        } else {
            setError(result.message || 'Error');
        }
        setLoading(false);
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs opacity-50 hover:opacity-100 transition-opacity"
            >
                {status === 'demo' ? 'Demo Mode' : 'Normal Mode'}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 p-4 bg-dark-200 border border-white/10 rounded-lg shadow-xl z-50 w-64">
                    <form onSubmit={handleToggle} className="flex flex-col gap-2">
                        <label className="text-xs text-white/70">Enter Access Code</label>
                        <input 
                            type="password" 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="bg-dark-300 border border-white/10 rounded px-2 py-1 text-sm text-white"
                            placeholder="Code"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-[10px]">{error}</p>}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-white text-black text-xs font-bold py-1.5 rounded hover:bg-white/90 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Toggle Mode'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
