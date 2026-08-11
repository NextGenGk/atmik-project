export const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;

export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");
