// Client-safe demo-mode check. Mirrors lib/demo-utils.ts, which reads the
// cookie store on the server and can't be imported from client components.
export function isDemoModeClient(): boolean {
  if (typeof document === 'undefined') return false;

  const isOff =
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('demo-mode-off='))
      ?.split('=')[1] === 'true';

  const globalDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  return globalDemo && !isOff;
}
