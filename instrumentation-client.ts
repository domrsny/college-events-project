import posthog from 'posthog-js';
import { isDemoModeClient } from '@/lib/demo-utils-client';

function getCookie(name: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift()?.trim();
  return undefined;
}

const isDemo = isDemoModeClient();

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: isDemo ? '/ingest' : 'https://us.posthog.com',
  ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  // Include the defaults option as required by PostHog
  defaults: '2025-05-24',
  // Enables capturing unhandled exceptions via Error Tracking
  capture_exceptions: true,
  // Turn on debug in development mode
  debug: process.env.NODE_ENV === 'development',
  bootstrap: {
    distinctID: getCookie('demo-session-id'),
  },
});

//IMPORTANT: Never combine this approach with other client-side PostHog initialization approaches, especially components like a PostHogProvider. instrumentation-client.ts is the correct solution for initializating client-side PostHog in Next.js 15.3+ apps.
