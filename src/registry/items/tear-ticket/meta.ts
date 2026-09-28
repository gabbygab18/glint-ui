import type { Meta } from "../../types";

export default {
  name: "Tear Ticket",
  category: "micro-interactions",
  description: "An event ticket whose perforated stub you pull against rubber-band tension until it rips free and tumbles away, stamping a confirmation onto the ticket.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "title", type: "string", default: "Neon Nights", description: "Event name." },
    { name: "subtitle", type: "string", default: "Warehouse 9 · Live set", description: "Venue line." },
    { name: "date", type: "string", default: "Sat 14 Jun", description: "Date field." },
    { name: "time", type: "string", default: "21:00", description: "Doors field." },
    { name: "seat", type: "string", default: "GA 042", description: "Seat, also printed on the stub." },
    { name: "confirmation", type: "string", default: "You're in!", description: "Stamp shown after tearing." },
    { name: "accent", type: "color", default: "#fbbf24", description: "Stub and stamp color." },
    { name: "threshold", type: "number", min: 40, max: 200, step: 5, default: 90, description: "Px of pull needed before release tears the stub." },
    { name: "onTear", type: "node", description: "Called once when the stub is torn off." },
  ],
  usage: `<TearTicket title="Neon Nights" seat="GA 042" onTear={() => checkIn(ticketId)} />`,
} satisfies Meta;
