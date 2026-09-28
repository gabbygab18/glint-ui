import type { Meta } from "../../types";

export default {
  name: "Signup Form",
  category: "components",
  description: "A sign-up card with a live, animated password-strength meter and rule checklist, terms consent, inline validation and a celebratory success state.",
  isNew: true,
  dependencies: ["motion", "lucide-react"],
  props: [
    { name: "title", type: "string", default: "Create your account", description: "Card heading." },
    { name: "description", type: "string", default: "Start your 14-day trial. No credit card needed.", description: "Text under the heading." },
    { name: "submitLabel", type: "string", default: "Create account", description: "Submit button label." },
    { name: "minStrength", type: "number", min: 1, max: 4, step: 1, default: 2, description: "Strength (1 weak .. 4 strong) the password must reach." },
    { name: "showRules", type: "boolean", default: true, description: "Show the password rule checklist." },
    { name: "terms", type: "node", description: "Terms checkbox label (links allowed)." },
    { name: "onSubmit", type: "node", description: "`({ name, email, password }) => void | Promise<void>`. Throw an Error to show a form error." },
    { name: "footer", type: "node", description: "Content under the form, e.g. a sign-in link." },
  ],
  usage: `<SignupForm
  minStrength={3}
  onSubmit={async (values) => {
    const res = await createAccount(values);
    if (!res.ok) throw new Error("That email is already registered.");
  }}
/>`,
} satisfies Meta;
