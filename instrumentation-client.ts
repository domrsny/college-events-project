import posthog from "posthog-js"

const isGlobalDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const isDemoOff = typeof window !== 'undefined' && document.cookie.split('; ').find(row => row.startsWith('demo-mode-off='))?.split('=')[1] === 'true';
const isDemo = isGlobalDemo && !isDemoOff;

if (!isDemo) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://us.posthog.com',
  });
}

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  // Include the defaults option as required by PostHog
  defaults: '2025-05-24',
  // Enables capturing unhandled exceptions via Error Tracking
  capture_exceptions: true,
  // Turn on debug in development mode
  debug: process.env.NODE_ENV === "development",
  bootstrap: {
    distinctID: typeof window !== 'undefined' ? 
      (document.cookie.split('; ').find(row => row.startsWith('demo-session-id='))?.split('=')[1] || undefined) : 
      undefined,
  }
});

//IMPORTANT: Never combine this approach with other client-side PostHog initialization approaches, especially components like a PostHogProvider. instrumentation-client.ts is the correct solution for initializating client-side PostHog in Next.js 15.3+ apps.
