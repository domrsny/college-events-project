import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export function isDemoMode(cookieStore: ReadonlyRequestCookies | any) {
    const isOff = cookieStore.get('demo-mode-off')?.value === 'true';
    const globalDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    return globalDemo && !isOff;
}
