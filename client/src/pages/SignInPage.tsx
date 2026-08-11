import { SignIn } from "@clerk/clerk-react";

export function SignInPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-base px-4 py-12">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-accent-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-info/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-tint-accent p-2 shadow-sm">
            <img
              src="/light-transparent-logo.png"
              alt="Atmik Logo"
              className="size-8 object-contain"
            />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-primary">
            Atmik Bharat
          </h1>
          <p className="mt-1 text-sm text-secondary">Inventory Console</p>
        </div>

        <SignIn
          afterSignInUrl="/"
          afterSignUpUrl="/"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "rounded-2xl border border-line bg-surface shadow-raised",
              headerTitle: "font-display font-bold text-primary",
              headerSubtitle: "text-secondary",
              formButtonPrimary: "bg-accent-600 hover:bg-accent-700 rounded-xl",
              formFieldLabel: "text-secondary",
              formFieldInput:
                "rounded-lg border border-line bg-surface text-primary focus:border-accent-500",
              footerActionLink: "text-accent-600",
            },
          }}
        />
      </div>
    </div>
  );
}
