"use client";

import { LoginForm, type LoginValues } from "./login-form";

// Demo backend: "password" is the one wrong password, so the server-error state is easy to try.
const fakeSignIn = async ({ password }: LoginValues) => {
  await new Promise((r) => setTimeout(r, 1300));
  if (password === "password") throw new Error("Incorrect email or password. Try another password.");
};

export default function Demo(p: Record<string, unknown>) {
  return (
    <div className="flex w-full justify-center px-4 py-6">
      <LoginForm
        onSubmit={fakeSignIn}
        footer={
          <>
            Don&apos;t have an account?{" "}
            <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign up
            </a>
          </>
        }
        {...p}
      />
    </div>
  );
}
