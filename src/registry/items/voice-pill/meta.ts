import type { Meta } from "../../types";

export default {
  name: "Voice Pill",
  category: "micro-interactions",
  description: "A voice-note recorder pill that springs open into live waveform bars and a timer, then collapses the take into a playable, sendable waveform. Input is simulated.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "bars", type: "number", min: 12, max: 48, step: 1, default: 28, description: "Waveform bar count." },
    { name: "color", type: "color", default: "#ef4444", description: "Recording accent." },
    { name: "maxSeconds", type: "number", min: 5, max: 300, step: 5, default: 60, description: "Auto-stop after this many seconds." },
    { name: "onStart", type: "node", description: "Recording started." },
    { name: "onStop", type: "node", description: "Recording stopped, receives seconds." },
    { name: "onSend", type: "node", description: "Send pressed, receives seconds." },
    { name: "onDiscard", type: "node", description: "Trash pressed." },
  ],
  usage: `<VoicePill onStart={startMic} onStop={stopMic} onSend={(s) => upload(s)} />`,
} satisfies Meta;
