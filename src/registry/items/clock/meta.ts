import type { Meta } from "../../types";

export default {
  name: "Clock",
  category: "widgets",
  description: "An elegant analog clock with a smooth sweeping (or bouncy ticking) second hand, minute ticks, a digital readout and any IANA time zone.",
  isNew: true,
  props: [
    { name: "timeZone", type: "select", options: ["", "Europe/London", "America/New_York", "Asia/Tokyo", "Australia/Sydney", "Asia/Manila"], default: "", description: "IANA time zone. Empty = viewer's local time." },
    { name: "label", type: "string", description: "Caption on the face. Defaults to the zone's city." },
    { name: "size", type: "number", min: 120, max: 420, step: 10, default: 280, description: "Diameter in px." },
    { name: "sweep", type: "boolean", default: true, description: "Smooth sweep; off ticks with a small bounce." },
    { name: "showSeconds", type: "boolean", default: true, description: "Show the second hand." },
    { name: "showDigital", type: "boolean", default: true, description: "Digital readout on the face." },
    { name: "hour12", type: "boolean", default: false, description: "12-hour readout with AM/PM." },
    { name: "showNumbers", type: "boolean", default: true, description: "Draw 12 / 3 / 6 / 9." },
    { name: "accent", type: "color", default: "#ff5a36", description: "Second hand color." },
  ],
  usage: `<Clock timeZone="Asia/Tokyo" />
<Clock size={160} sweep={false} showDigital={false} />`,
} satisfies Meta;
