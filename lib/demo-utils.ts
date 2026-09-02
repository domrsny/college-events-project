type CookieReader = {
  get(name: string): { value: string } | undefined;
};

export function isDemoMode(cookieStore: CookieReader) {
  const isOff = cookieStore.get('demo-mode-off')?.value === 'true';
  const globalDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  return globalDemo && !isOff;
}
