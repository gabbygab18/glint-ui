import type { Meta } from "../../types";

export default {
  name: "Login Form",
  category: "components",
  description: "A polished sign-in card with social buttons, password reveal, remember me, animated inline validation, a shake on error and a loading-to-success flow.",
  isNew: true,
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "title", type: "string", default: "Welcome back", description: "Card heading." },
    { name: "description", type: "string", default: "Sign in to continue to your workspace.", description: "Text under the heading." },
    { name: "submitLabel", type: "string", default: "Sign in", description: "Submit button label." },
    { name: "showSocial", type: "boolean", default: true, description: "Show the GitHub / Google buttons." },
    { name: "showRemember", type: "boolean", default: true, description: "Show the Remember me checkbox." },
    { name: "minPasswordLength", type: "number", min: 4, max: 16, step: 1, default: 8, description: "Minimum password length for validation." },
    { name: "onSubmit", type: "node", description: "`(values) => void | Promise<void>`. Throw an Error to show its message as a form error." },
    { name: "onSocial", type: "node", description: "`(provider: \"github\" | \"google\") => void | Promise<void>`." },
    { name: "footer", type: "node", description: "Content under the form, e.g. a sign-up link." },
  ],
  usage: `<LoginForm
  onSubmit={async ({ email, password, remember }) => {
    const res = await signIn(email, password, remember);
    if (!res.ok) throw new Error("Incorrect email or password.");
  }}
  footer={<>No account? <a href="/signup">Sign up</a></>}
/>`,
} satisfies Meta;
