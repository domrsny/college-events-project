import { describe, it, expect, afterEach } from 'vitest';
import { isDemoMode } from './demo-utils';

function fakeCookies(values: Record<string, string>) {
  return {
    get: (name: string) => (name in values ? { value: values[name] } : undefined),
  };
}

describe('isDemoMode', () => {
  const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
  });

  it('is false when the global flag is off, regardless of the cookie', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
    expect(isDemoMode(fakeCookies({}))).toBe(false);
  });

  it('is true when the global flag is on and no opt-out cookie is set', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    expect(isDemoMode(fakeCookies({}))).toBe(true);
  });

  it('is false when the global flag is on but the visitor opted out', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    expect(isDemoMode(fakeCookies({ 'demo-mode-off': 'true' }))).toBe(false);
  });
});
