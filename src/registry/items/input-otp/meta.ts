import type { Meta } from "../../types";

export default {
  name: "Input OTP",
  category: "primitives",
  description: "One-time-code field: slots that pop each digit in, a blinking caret, paste and SMS autofill, a wave on completion and a shake on error.",
  isNew: true,
  props: [
    { name: "length", type: "number", min: 4, max: 8, step: 1, default: 6, description: "Number of slots." },
    { name: "groupSize", type: "number", min: 0, max: 4, step: 1, default: 3, description: "Separator after every N slots (0 = none)." },
    { name: "allow", type: "select", options: ["numeric", "alphanumeric"], default: "numeric", description: "Accepted characters; others are dropped, including from pasted text." },
    { name: "invalid", type: "boolean", default: false, description: "Error look with a shake." },
    { name: "disabled", type: "boolean", default: false, description: "Disable the field." },
    { name: "value", type: "node", description: "Controlled value (with onChange)." },
    { name: "onComplete", type: "node", description: "Called with the code once every slot is filled." },
  ],
  usage: `<InputOTP length={6} onComplete={(code) => verify(code)} />`,
} satisfies Meta;
