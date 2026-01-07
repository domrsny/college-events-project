'use server';

import { cookies } from 'next/headers';

export async function toggleDemoMode(code: string) {
    const accessCode = process.env.DEMO_ACCESS_CODE;
    const cookieStore = await cookies();

    if (code === accessCode) {
        const isCurrentlyOff = cookieStore.get('demo-mode-off')?.value === 'true';
        
        if (isCurrentlyOff) {
            cookieStore.delete('demo-mode-off');
            return { success: true, mode: 'demo' };
        } else {
            cookieStore.set('demo-mode-off', 'true', {
                httpOnly: false, // Allow client-side access
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });
            return { success: true, mode: 'normal' };
        }
    }

    return { success: false, message: 'Invalid code' };
}

export async function getDemoModeStatus() {
    const cookieStore = await cookies();
    const isOff = cookieStore.get('demo-mode-off')?.value === 'true';
    const globalDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    
    return {
        isDemoMode: globalDemo && !isOff,
        globalDemo
    };
}
