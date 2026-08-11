import { useEffect, type ReactNode } from "react";
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { setTokenGetter } from "../lib/api";
import { clerkEnabled, clerkPublishableKey } from "../lib/auth";
import { Providers } from "./Providers";

function AuthBridge() {
  const { getToken } = useAuth();
  useEffect(() => {
    setTokenGetter(async () => {
      try {
        return (await getToken()) ?? null;
      } catch {
        return null;
      }
    });
  }, [getToken]);
  return null;
}

export function AppProviders({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  if (!clerkEnabled) {
    return <Providers>{children}</Providers>;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey ?? ""}>
      <Providers>
        <AuthBridge />
        <SignedIn>{children}</SignedIn>
        <SignedOut>
          {fallback ?? (
            <div className="flex h-dvh w-full items-center justify-center bg-base p-4">
              <RedirectToSignIn />
            </div>
          )}
        </SignedOut>
      </Providers>
    </ClerkProvider>
  );
}
