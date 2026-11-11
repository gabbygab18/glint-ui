import type { Meta } from "../../types";

export default {
  name: "File Drop",
  category: "components",
  description: "An upload zone that wakes up under a dragged file: the dashed edge marches, the icon lifts, and dropped files slide into a list with their own progress bars that finish with a check.",
  dependencies: ["motion", "lucide-react"],
  isNew: true,
  props: [
    { name: "title", type: "string", default: "Drop files here", description: "Main line in the zone." },
    { name: "hint", type: "string", default: "or click to browse", description: "Second line in the zone." },
    { name: "multiple", type: "boolean", default: true, description: "Allow more than one file." },
    { name: "accept", type: "node", description: 'File types for the picker, e.g. "image/*,.pdf".' },
    { name: "upload", type: "node", description: "(file, onProgress) => Promise<void>. Report progress 0 to 1." },
    { name: "onFiles", type: "node", description: "(files) => void, called with the files added." },
  ],
  usage: `<FileDrop
  accept="image/*"
  upload={(file, onProgress) => uploadToStorage(file, onProgress)}
/>`,
} satisfies Meta;
