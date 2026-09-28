"use client";

import { SignupForm, type SignupValues } from "./signup-form";

const link = "font-medium text-foreground underline-offset-4 hover:underline";

// Demo backend: taken@example.com is already registered, to show the server-error state.
const fakeSignUp = async ({ email }: SignupValues) => {
  await new Promise((r) => setTimeout(r, 1400));
  if (email.toLowerCase() === "taken@example.com") throw new Error("That email is already registered. Try signing in.");
};

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-full justify-center px-4 py-6">
      <SignupForm
        onSubmit={fakeSignUp}
        terms={
          <>
            I agree to the{" "}
            <a href="#" onClick={(e) => e.preventDefault()} className={link}>
              Terms
            </a>{" "}
            and{" "}
            <a href="#" onClick={(e) => e.preventDefault()} className={link}>
              Privacy Policy
            </a>
          </>
        }
        footer={
          <>
            Already have an account?{" "}
            <a href="#" onClick={(e) => e.preventDefault()} className={link}>
              Sign in
            </a>
          </>
        }
        {...p}
      />
    </div>
  );
}
