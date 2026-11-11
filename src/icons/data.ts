import { circle as c, dot, gear, poly, rect, sparkle, star } from "./geometry";

/**
 * Each icon is three layers on a 24×24 grid:
 * - `s` shapes: closed outlines. Stroked in Line, tinted in Duo, filled in Solid.
 * - `l` lines: open strokes, drawn the same in every style.
 * - `k` details: strokes that sit inside a shape. Drawn in Line/Duo, cut out of the fill in Solid.
 */
export interface IconDef {
  name: string;
  category: Category;
  tags: string[];
  s?: string[];
  l?: string[];
  k?: string[];
}

export const CATEGORIES = [
  "Interface",
  "Arrows",
  "Alerts",
  "Communication",
  "Media",
  "Files",
  "Devices",
  "Development",
  "Editor",
  "Commerce",
  "Charts",
  "Weather",
  "Places",
  "Travel",
  "Food",
  "Health",
  "People",
  "Objects",
] as const;
export type Category = (typeof CATEGORIES)[number];

type Layers = Pick<IconDef, "s" | "l" | "k">;
const icon = (name: string, category: Category, tags: string, layers: Layers): IconDef => ({ name, category, tags: tags ? tags.split(" ") : [], ...layers });

// Reused outlines.
const CLOUD = "M7 19a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 17.8 9a4.5 4.5 0 0 1-.3 10Z";
const CLOUD_HIGH = "M7 15a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 6.5 4 4 0 0 1 17 15Z";
const LENS = c(11, 11, 6.5);
const RING = c(12, 12, 9);
const SPEAKER = "M3.5 9.5A1.5 1.5 0 0 1 5 8h2.5l4.2-3.4a.5.5 0 0 1 .8.4v14a.5.5 0 0 1-.8.4L7.5 16H5a1.5 1.5 0 0 1-1.5-1.5Z";
const FILE = "M6.5 3H13l5.5 5.5V19a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z";
const FOLD = "M13 3.5V7a1.5 1.5 0 0 0 1.5 1.5H18";
const SHIELD = "M12 3 19.5 6v5.5c0 4.6-3.1 8.2-7.5 9.5-4.4-1.3-7.5-4.9-7.5-9.5V6Z";
const USER_HEAD = c(12, 8, 4);
const USER_BODY = "M4.5 20.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6Z";
const BUBBLE = "M20 14.5a2.5 2.5 0 0 1-2.5 2.5H9.5L5 20.5v-14A2.5 2.5 0 0 1 7.5 4h10A2.5 2.5 0 0 1 20 6.5Z";
const BLOB = rect(3.5, 4.5, 17, 15.5, 7);

export const ICONS: IconDef[] = [
  // Interface
  icon("home", "Interface", "house start main", { s: ["M3.5 10.2 12 3.5l8.5 6.7V19a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"], k: ["M9.5 21v-4.5a2.5 2.5 0 0 1 5 0V21"] }),
  icon("search", "Interface", "find magnifier lookup", { s: [LENS], l: ["m16 16 4.5 4.5"], k: ["M8.3 9.6a3 3 0 0 1 2.2-2"] }),
  icon("zoom-in", "Interface", "magnify enlarge plus", { s: [LENS], l: ["m16 16 4.5 4.5"], k: ["M11 8.5v5", "M8.5 11h5"] }),
  icon("zoom-out", "Interface", "magnify shrink minus", { s: [LENS], l: ["m16 16 4.5 4.5"], k: ["M8.5 11h5"] }),
  icon("settings", "Interface", "gear cog preferences options", { s: [gear(12, 12, 9.5, 7, 8)], k: [c(12, 12, 3)] }),
  icon("sliders", "Interface", "adjust controls filters tune", { s: [c(16, 7, 2.5), c(9, 17, 2.5)], l: ["M4 7h9.5", "M18.5 7H20", "M4 17h2.5", "M11.5 17H20"] }),
  icon("menu", "Interface", "hamburger navigation lines", { l: ["M4 7h16", "M4 12h16", "M4 17h10"] }),
  icon("grid", "Interface", "apps tiles layout dashboard", { s: [rect(4, 4, 6.5, 6.5, 2), rect(13.5, 4, 6.5, 6.5, 2), rect(4, 13.5, 6.5, 6.5, 2), rect(13.5, 13.5, 6.5, 6.5, 2)] }),
  icon("list", "Interface", "items rows bullets", { s: [c(4.5, 6, 1), c(4.5, 12, 1), c(4.5, 18, 1)], l: ["M9 6h11", "M9 12h11", "M9 18h11"] }),
  icon("layout", "Interface", "sidebar panel window", { s: [rect(3, 4, 18, 16, 3)], k: ["M9.5 5v14"] }),
  icon("filter", "Interface", "funnel sort narrow", { s: ["M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v.9a2 2 0 0 1-.6 1.4L14 13v6.2a1 1 0 0 1-1.5.9l-2-1.2a1 1 0 0 1-.5-.9V13L4.6 7.8A2 2 0 0 1 4 6.4Z"] }),
  icon("plus", "Interface", "add new create", { l: ["M12 5v14", "M5 12h14"] }),
  icon("minus", "Interface", "remove subtract", { l: ["M5 12h14"] }),
  icon("check", "Interface", "done tick confirm ok", { l: ["m5 12.5 4.5 4.5L19 7"] }),
  icon("close", "Interface", "x cancel dismiss remove", { l: ["m6 6 12 12", "M18 6 6 18"] }),
  icon("more-horizontal", "Interface", "dots ellipsis options", { s: [c(5, 12, 1), c(12, 12, 1), c(19, 12, 1)] }),
  icon("more-vertical", "Interface", "dots ellipsis kebab options", { s: [c(12, 5, 1), c(12, 12, 1), c(12, 19, 1)] }),
  icon("heart", "Interface", "love like favorite", { s: ["M12 20.5C7 17.5 3.5 14.2 3.5 9.8A4.3 4.3 0 0 1 7.8 5.5c1.7 0 3.2.9 4.2 2.4 1-1.5 2.5-2.4 4.2-2.4a4.3 4.3 0 0 1 4.3 4.3c0 4.4-3.5 7.7-8.5 10.7Z"], k: ["M6.8 9.6a1.8 1.8 0 0 1 1.4-1.4"] }),
  icon("star", "Interface", "favorite rate bookmark", { s: [star(12, 12.6, 9.3, 4.3, 5, 1.2)] }),
  icon("bookmark", "Interface", "save ribbon later", { s: ["M6 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v15.2a.6.6 0 0 1-.95.5L12 17l-5.05 3.7A.6.6 0 0 1 6 20.2Z"] }),
  icon("bell", "Interface", "notification alarm alert", { s: ["M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15Z"], l: ["M10 21h4", "M12 3v2"] }),
  icon("lock", "Interface", "secure private password", { s: [rect(4.5, 10.5, 15, 10.5, 3)], l: ["M8 10.5V8a4 4 0 0 1 8 0v2.5"], k: ["M12 14.5V17"] }),
  icon("unlock", "Interface", "open public unsecure", { s: [rect(4.5, 10.5, 15, 10.5, 3)], l: ["M8 10.5V8a4 4 0 0 1 7.6-1.8"], k: ["M12 14.5V17"] }),
  icon("eye", "Interface", "view show visible watch", { s: ["M2.5 12C4.5 8 8 5.5 12 5.5S19.5 8 21.5 12C19.5 16 16 18.5 12 18.5S4.5 16 2.5 12Z"], k: [c(12, 12, 3)] }),
  icon("eye-off", "Interface", "hide hidden invisible", { s: ["M2.5 12C4.5 8 8 5.5 12 5.5S19.5 8 21.5 12C19.5 16 16 18.5 12 18.5S4.5 16 2.5 12Z"], l: ["m4 3.5 16 17"], k: [c(12, 12, 3)] }),
  icon("calendar", "Interface", "date schedule event day", { s: [rect(3.5, 5, 17, 15.5, 3)], l: ["M8 3v4", "M16 3v4", "M3.5 10h17"], k: [dot(8, 14), dot(12, 14), dot(16, 14), dot(8, 17), dot(12, 17)] }),
  icon("clock", "Interface", "time hour watch", { s: [RING], k: ["M12 7v5l3 2"] }),
  icon("history", "Interface", "recent past undo time", { l: ["M3.5 12a8.5 8.5 0 1 0 2.5-6", "M3.5 4v4.5H8", "M12 8v4l3 2"] }),
  icon("link", "Interface", "url chain hyperlink", { l: ["M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1", "M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"] }),
  icon("external-link", "Interface", "open new tab", { l: ["M14 4h6v6", "M20 4l-8.5 8.5", "M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"] }),
  icon("share", "Interface", "send network social", { s: [c(18, 5.5, 2.5), c(6, 12, 2.5), c(18, 18.5, 2.5)], l: ["m8.2 10.8 7.6-4.1", "m8.2 13.2 7.6 4.1"] }),
  icon("download", "Interface", "save export get", { l: ["M12 4v11", "m7.5 10.5 4.5 4.5 4.5-4.5", "M4.5 20h15"] }),
  icon("upload", "Interface", "import send put", { l: ["M12 15V4", "m7.5 8.5 4.5-4.5 4.5 4.5", "M4.5 20h15"] }),
  icon("copy", "Interface", "duplicate clone clipboard", { s: [rect(8.5, 8.5, 12, 12, 2.5)], l: ["M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"] }),
  icon("trash", "Interface", "delete remove bin garbage", { s: ["M5.5 7h13l-1 12.2a2 2 0 0 1-2 1.8h-7a2 2 0 0 1-2-1.8Z"], l: ["M3.5 7h17", "M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"], k: ["M10 11v6", "M14 11v6"] }),
  icon("refresh", "Interface", "reload sync update", { l: ["M20 11a8 8 0 0 0-14.3-4.9L4 8", "M4 4v4h4", "M4 13a8 8 0 0 0 14.3 4.9L20 16", "M20 20v-4h-4"] }),
  icon("power", "Interface", "on off shutdown", { l: ["M12 3v8", "M7 5.8a8 8 0 1 0 10 0"] }),
  icon("maximize", "Interface", "fullscreen expand enlarge", { l: ["M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9", "M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9", "M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15", "M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"] }),
  icon("toggle", "Interface", "switch on enable", { s: [rect(2.5, 6.5, 19, 11, 5.5)], k: [c(16, 12, 2.8)] }),
  icon("log-in", "Interface", "sign in enter", { l: ["M14 4h3.5A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5H14", "M3.5 12h11", "m11 8 4 4-4 4"] }),
  icon("log-out", "Interface", "sign out exit leave", { l: ["M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10", "M9 12h11.5", "m16.5 8 4 4-4 4"] }),
  icon("loader", "Interface", "spinner loading progress wait", { l: ["M12 3a9 9 0 1 0 9 9"] }),

  // Arrows
  icon("arrow-right", "Arrows", "next forward direction", { l: ["M4 12h16", "m14 6 6 6-6 6"] }),
  icon("arrow-left", "Arrows", "back previous direction", { l: ["M20 12H4", "m10 6-6 6 6 6"] }),
  icon("arrow-up", "Arrows", "top direction rise", { l: ["M12 20V4", "m6 10 6-6 6 6"] }),
  icon("arrow-down", "Arrows", "bottom direction fall", { l: ["M12 4v16", "m6 14 6 6 6-6"] }),
  icon("arrow-up-right", "Arrows", "diagonal outward", { l: ["M7 17 17 7", "M8 7h9v9"] }),
  icon("arrow-down-left", "Arrows", "diagonal inward", { l: ["M17 7 7 17", "M16 17H7V8"] }),
  icon("chevron-right", "Arrows", "next caret", { l: ["m9 6 6 6-6 6"] }),
  icon("chevron-left", "Arrows", "back caret", { l: ["m15 6-6 6 6 6"] }),
  icon("chevron-up", "Arrows", "collapse caret", { l: ["m6 15 6-6 6 6"] }),
  icon("chevron-down", "Arrows", "expand caret dropdown", { l: ["m6 9 6 6 6-6"] }),
  icon("chevrons-right", "Arrows", "fast forward double skip", { l: ["m6 6 6 6-6 6", "m13 6 6 6-6 6"] }),
  icon("arrow-circle-right", "Arrows", "next go proceed", { s: [RING], k: ["M8 12h8", "m12.5 8.5 3.5 3.5-3.5 3.5"] }),
  icon("arrow-circle-up", "Arrows", "top upload rise", { s: [RING], k: ["M12 16V8", "m8.5 11.5 3.5-3.5 3.5 3.5"] }),
  icon("undo", "Arrows", "back revert", { l: ["M9 14 4 9l5-5", "M4 9h10.5a5.5 5.5 0 0 1 0 11H11"] }),
  icon("redo", "Arrows", "forward again", { l: ["m15 14 5-5-5-5", "M20 9H9.5a5.5 5.5 0 0 0 0 11H13"] }),
  icon("swap", "Arrows", "exchange switch transfer", { l: ["M4 8h15", "m15.5 4.5 3.5 3.5-3.5 3.5", "M20 16H5", "m8.5 12.5-3.5 3.5 3.5 3.5"] }),
  icon("sort", "Arrows", "order up down arrange", { l: ["M7.5 20V4", "m4 7.5 3.5-3.5L11 7.5", "M16.5 4v16", "m13 16.5 3.5 3.5 3.5-3.5"] }),
  icon("repeat", "Arrows", "loop cycle again", { l: ["M4 11V9.5A3.5 3.5 0 0 1 7.5 6H19", "m16 3 3 3-3 3", "M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H5", "m8 21-3-3 3-3"] }),
  icon("move", "Arrows", "drag pan arrows", { l: ["M12 3v18", "M3 12h18", "m9.5 5.5 2.5-2.5 2.5 2.5", "m9.5 18.5 2.5 2.5 2.5-2.5", "m5.5 9.5-2.5 2.5 2.5 2.5", "m18.5 9.5 2.5 2.5-2.5 2.5"] }),

  // Alerts
  icon("info", "Alerts", "information about help", { s: [RING], k: ["M12 11v5.5", dot(12, 7.8)] }),
  icon("alert-circle", "Alerts", "error warning danger", { s: [RING], k: ["M12 7.5v5", dot(12, 16.2)] }),
  icon("check-circle", "Alerts", "success done verified", { s: [RING], k: ["m8 12.3 2.7 2.7L16 9.5"] }),
  icon("x-circle", "Alerts", "error cancel failed", { s: [RING], k: ["m9 9 6 6", "m15 9-6 6"] }),
  icon("warning", "Alerts", "triangle caution danger alert", { s: [poly([[12, 3.5], [21.5, 20], [2.5, 20]], 2.4)], k: ["M12 9.5v4", dot(12, 16.6)] }),
  icon("help", "Alerts", "question support faq", { s: [RING], k: ["M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.3", dot(12, 16.8)] }),
  icon("shield", "Alerts", "security protect guard", { s: [SHIELD] }),
  icon("shield-check", "Alerts", "secure verified safe", { s: [SHIELD], k: ["m9 12 2.2 2.2L15.5 10"] }),

  // Communication
  icon("mail", "Communication", "email envelope inbox message", { s: [rect(3, 5, 18, 14, 3)], k: ["m7 9.5 5 3.5 5-3.5"] }),
  icon("send", "Communication", "paper plane submit message", { s: [poly([[21, 3], [14.5, 21], [11, 13], [3, 9.5]], 1.4)], k: ["m11 13 4-4"] }),
  icon("chat", "Communication", "message comment talk bubble", { s: [BUBBLE], k: [dot(9, 10.5), dot(12.5, 10.5), dot(16, 10.5)] }),
  icon("chat-round", "Communication", "message conversation bubble", { s: ["M12 3.5a8.5 8.5 0 1 1-4.1 16L3.5 20.5l1-4.2A8.5 8.5 0 0 1 12 3.5Z"], k: ["M8.5 10.5h7", "M8.5 14h4"] }),
  icon("phone", "Communication", "call dial contact", { s: ["M5.5 3.5h3l1.5 4.5-2.2 1.4a11 11 0 0 0 6.8 6.8l1.4-2.2 4.5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z"] }),
  icon("at-sign", "Communication", "email mention handle", { l: [c(12, 12, 3.5), "M15.5 8.5v5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.4 6.8"] }),
  icon("megaphone", "Communication", "announce broadcast marketing", { s: ["M4 10a1.5 1.5 0 0 1 1.5-1.5H9L17.2 4.3a.5.5 0 0 1 .8.4v14.6a.5.5 0 0 1-.8.4L9 15.5H5.5A1.5 1.5 0 0 1 4 14Z"], l: ["M7 15.5 8.2 20", "M20.5 10v4"] }),
  icon("inbox", "Communication", "tray mail messages", { s: [rect(3.5, 4, 17, 16, 3)], k: ["M4 13h4l1.5 2.5h5L16 13h4"] }),

  // Media
  icon("play", "Media", "start video audio", { s: [poly([[7, 4.5], [19.5, 12], [7, 19.5]], 2)] }),
  icon("pause", "Media", "hold stop video", { s: [rect(6, 4.5, 4, 15, 1.5), rect(14, 4.5, 4, 15, 1.5)] }),
  icon("stop", "Media", "end square", { s: [rect(5, 5, 14, 14, 3)] }),
  icon("skip-forward", "Media", "next track", { s: [poly([[5, 5.5], [15, 12], [5, 18.5]], 1.5)], l: ["M19 5.5v13"] }),
  icon("skip-back", "Media", "previous track", { s: [poly([[19, 5.5], [9, 12], [19, 18.5]], 1.5)], l: ["M5 5.5v13"] }),
  icon("volume", "Media", "sound speaker audio loud", { s: [SPEAKER], l: ["M16 9a4 4 0 0 1 0 6", "M18.5 6.5a7.5 7.5 0 0 1 0 11"] }),
  icon("volume-off", "Media", "mute silent sound", { s: [SPEAKER], l: ["m16 9.5 5 5", "m21 9.5-5 5"] }),
  icon("mic", "Media", "microphone record voice", { s: [rect(9, 3, 6, 11, 3)], l: ["M5.5 11a6.5 6.5 0 0 0 13 0", "M12 17.5V21", "M9 21h6"] }),
  icon("music", "Media", "note song audio", { s: [c(6.5, 18, 2.5), c(17.5, 16, 2.5)], l: ["M9 18V5.5l11-2V16"] }),
  icon("headphones", "Media", "audio listen music", { s: [rect(3, 14, 4.5, 6.5, 2), rect(16.5, 14, 4.5, 6.5, 2)], l: ["M4 15v-3a8 8 0 0 1 16 0v3"] }),
  icon("image", "Media", "photo picture gallery", { s: [rect(3, 4, 18, 16, 3)], k: [c(8.5, 9.5, 1.3), "m5.5 17 4-3.5 3.5 3 3-2.5 2.5 2"] }),
  icon("camera", "Media", "photo picture shoot", { s: ["M3 9a2.5 2.5 0 0 1 2.5-2.5h2L9 4h6l1.5 2.5h2A2.5 2.5 0 0 1 21 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z"], k: [c(12, 13, 3.5)] }),
  icon("video", "Media", "camera film record", { s: [rect(2.5, 6, 13, 12, 3), "m15.5 10.5 4.6-2.8a.6.6 0 0 1 .9.5v7.6a.6.6 0 0 1-.9.5l-4.6-2.8Z"] }),
  icon("film", "Media", "movie cinema reel", { s: [rect(3.5, 3.5, 17, 17, 3)], k: ["M8 4v16", "M16 4v16", "M4 12h4", "M16 12h4", "M4 8h4", "M4 16h4", "M16 8h4", "M16 16h4"] }),

  // Files
  icon("file", "Files", "document page paper", { s: [FILE], k: [FOLD] }),
  icon("file-text", "Files", "document page notes", { s: [FILE], k: [FOLD, "M8.5 13h7", "M8.5 16.5h5"] }),
  icon("file-plus", "Files", "new document add", { s: [FILE], k: [FOLD, "M12 12v5", "M9.5 14.5h5"] }),
  icon("folder", "Files", "directory collection", { s: ["M3 7a2.5 2.5 0 0 1 2.5-2.5h3.6a2 2 0 0 1 1.6.8l1.1 1.4a2 2 0 0 0 1.6.8h5.1A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z"] }),
  icon("folder-plus", "Files", "new directory add", { s: ["M3 7a2.5 2.5 0 0 1 2.5-2.5h3.6a2 2 0 0 1 1.6.8l1.1 1.4a2 2 0 0 0 1.6.8h5.1A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z"], k: ["M12 11v5", "M9.5 13.5h5"] }),
  icon("archive", "Files", "box storage backup", { s: [rect(3, 4, 18, 5, 1.5), "M4.5 9h15v9a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2Z"], k: ["M10 13h4"] }),
  icon("cloud-upload", "Files", "backup sync save", { s: [CLOUD], k: ["M12 16.5v-6", "m9.5 13 2.5-2.5 2.5 2.5"] }),
  icon("cloud-download", "Files", "sync fetch restore", { s: [CLOUD], k: ["M12 10.5v6", "m9.5 14 2.5 2.5 2.5-2.5"] }),
  icon("paperclip", "Files", "attachment attach", { l: ["M20 11.5 12 19.5a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.2a1.6 1.6 0 0 1-2.3-2.3L15 7.3"] }),
  icon("clipboard", "Files", "paste board notes", { s: [rect(4.5, 5, 15, 16, 2.5)], l: [rect(8.5, 3, 7, 4, 1.5)], k: ["M8.5 12h7", "M8.5 15.5h4.5"] }),

  // Devices
  icon("laptop", "Devices", "computer notebook macbook", { s: [rect(4.5, 4.5, 15, 11, 2)], l: ["M2.5 19h19"] }),
  icon("monitor", "Devices", "desktop screen display", { s: [rect(2.5, 3.5, 19, 13, 2.5)], l: ["M12 16.5v4", "M8 20.5h8"] }),
  icon("smartphone", "Devices", "mobile phone cell", { s: [rect(6, 2.5, 12, 19, 3)], k: ["M10.5 18.5h3"] }),
  icon("watch", "Devices", "smartwatch time wearable", { s: [rect(6.5, 6.5, 11, 11, 3)], l: ["M9 6.5 9.5 3h5l.5 3.5", "m9 17.5.5 3.5h5l.5-3.5"], k: ["M12 9.5V12l1.5 1"] }),
  icon("keyboard", "Devices", "type input keys", { s: [rect(2.5, 6, 19, 12, 2.5)], k: [dot(6.5, 10), dot(10, 10), dot(14, 10), dot(17.5, 10), "M8 14.5h8"] }),
  icon("mouse", "Devices", "pointer click scroll", { s: [rect(6.5, 3, 11, 18, 5.5)], k: ["M12 7v3"] }),
  icon("printer", "Devices", "print paper output", { s: [rect(3, 9, 18, 8.5, 2.5)], l: ["M7 9V3.5h10V9", "M7 17.5V21h10v-3.5"], k: [dot(16.5, 12.5), "M7.5 14.5h9"] }),
  icon("wifi", "Devices", "wireless internet network signal", { l: ["M2.5 9a14 14 0 0 1 19 0", "M5.5 12.5a9.5 9.5 0 0 1 13 0", "M8.7 15.8a4.5 4.5 0 0 1 6.6 0", dot(12, 19.5)] }),
  icon("bluetooth", "Devices", "wireless connect pair", { l: ["m7 7.5 10 9-5 4.5V3l5 4.5-10 9"] }),
  icon("battery", "Devices", "power charge energy", { s: [rect(2.5, 7, 16, 10, 2.5)], l: ["M21 10.5v3", "M6 10.5v3", "M9.5 10.5v3"] }),
  icon("cpu", "Devices", "chip processor hardware", { s: [rect(6, 6, 12, 12, 2.5)], l: ["M9.5 3v3", "M14.5 3v3", "M9.5 18v3", "M14.5 18v3", "M3 9.5h3", "M3 14.5h3", "M18 9.5h3", "M18 14.5h3"], k: [rect(9.5, 9.5, 5, 5, 1)] }),

  // Development
  icon("code", "Development", "brackets html programming", { l: ["m8 7-5 5 5 5", "m16 7 5 5-5 5", "m13.5 5-3 14"] }),
  icon("terminal", "Development", "console shell command prompt", { s: [rect(2.5, 4, 19, 16, 3)], k: ["m7 9.5 3 2.5-3 2.5", "M12.5 15H17"] }),
  icon("bug", "Development", "debug issue error insect", { s: [rect(7, 6.5, 10, 14, 5)], l: ["M7 10.5H4", "M17 10.5h3", "M7 15H4", "M17 15h3", "M9.5 6.8 8 4", "m14.5 6.8 1.5-2.8"], k: ["M12 10v8"] }),
  icon("database", "Development", "storage sql data server", { s: ["M4.5 6c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3v12c0 1.7-3.4 3-7.5 3s-7.5-1.3-7.5-3Z"], k: ["M5 6.5c1 1.4 3.9 2.5 7 2.5s6-1.1 7-2.5", "M5 12.5c1 1.4 3.9 2.5 7 2.5s6-1.1 7-2.5"] }),
  icon("server", "Development", "hosting rack backend", { s: [rect(3.5, 3.5, 17, 7, 2.5), rect(3.5, 13.5, 17, 7, 2.5)], k: [dot(7.5, 7), dot(7.5, 17), "M11 7h5.5", "M11 17h5.5"] }),
  icon("git-branch", "Development", "version control fork", { s: [c(6, 5.5, 2.5), c(6, 18.5, 2.5), c(18, 7.5, 2.5)], l: ["M6 8v8", "M18 10a7 7 0 0 1-7 7H8.5"] }),
  icon("layers", "Development", "stack levels arrange", { s: [poly([[12, 3], [21, 8], [12, 13], [3, 8]], 1.5)], l: ["m3.5 12 8.5 4.8 8.5-4.8", "m3.5 16 8.5 4.8 8.5-4.8"] }),
  icon("package", "Development", "box module npm shipping", { s: [poly([[12, 2.8], [20, 7], [20, 17], [12, 21.2], [4, 17], [4, 7]], 1.6)], k: ["m5 7.5 7 3.8 7-3.8", "M12 11.3V20"] }),
  icon("key", "Development", "password access auth", { s: [c(7.5, 14.5, 4.5)], l: ["m10.8 11.2 9-9", "m16.5 5.5 2.5 2.5", "m14 8 2 2"], k: [c(7, 15, 1)] }),

  // Editor
  icon("edit", "Editor", "pencil write modify", { s: ["M15.5 4.5a2.1 2.1 0 0 1 3 0l1 1a2.1 2.1 0 0 1 0 3L9 19l-5 1 1-5Z"], k: ["m13.5 6.5 4 4"] }),
  icon("bold", "Editor", "text format strong", { l: ["M7 12h7a3.5 3.5 0 0 1 0 7H7V5h6a3.5 3.5 0 0 1 0 7"] }),
  icon("italic", "Editor", "text format slant", { l: ["M10 5h8", "M6 19h8", "M14 5l-4 14"] }),
  icon("type", "Editor", "text font letter", { l: ["M5 7V5h14v2", "M12 5v14", "M9 19h6"] }),
  icon("align-left", "Editor", "text paragraph justify", { l: ["M4 6h16", "M4 10h10", "M4 14h16", "M4 18h10"] }),
  icon("quote", "Editor", "blockquote citation", { s: [rect(4, 10, 6, 6.5, 1.5), rect(13.5, 10, 6, 6.5, 1.5)], l: ["M4 12.5c0-4 1.5-6 4.5-7", "M13.5 12.5c0-4 1.5-6 4.5-7"] }),
  icon("hash", "Editor", "number tag channel", { l: ["M9.5 4 8 20", "M16 4l-1.5 16", "M4.5 9h15", "M4 15h15"] }),
  icon("palette", "Editor", "color paint design theme", { s: ["M12 3a9 9 0 0 0 0 18c1.2 0 1.8-.8 1.8-1.8 0-1.4-1.3-1.8-1.3-3 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.3 17 3 12 3Z"], k: [dot(7.5, 11.5), dot(9.5, 7.5), dot(14, 7), dot(17, 10)] }),
  icon("magic-wand", "Editor", "ai generate effect sparkle", { s: [sparkle(16.5, 7.5, 4), sparkle(7, 5.5, 2.3)], l: ["M4 20l8-8", "M19.5 14v3", "M18 15.5h3"] }),
  icon("crop", "Editor", "cut resize image", { l: ["M6.5 3v12.5A2 2 0 0 0 8.5 17.5H21", "M3 6.5h12.5a2 2 0 0 1 2 2V21"] }),
  icon("scissors", "Editor", "cut snip clip", { s: [c(6.5, 6.5, 2.5), c(6.5, 17.5, 2.5)], l: ["M8.6 8 20 17.5", "M8.6 16 20 6.5"] }),

  // Commerce
  icon("cart", "Commerce", "shopping basket buy checkout", { s: ["M6 7h14.5l-1.8 7.4a1.5 1.5 0 0 1-1.5 1.1H8.6a1.5 1.5 0 0 1-1.5-1.2Z", c(9, 20, 1.5), c(17, 20, 1.5)], l: ["M2.5 3.5h2.2L6 7"] }),
  icon("bag", "Commerce", "shopping purchase store", { s: ["M5 8h14l-1 11.2a2 2 0 0 1-2 1.8H8a2 2 0 0 1-2-1.8Z"], l: ["M9 8V6.5a3 3 0 0 1 6 0V8"], k: ["M9.5 12a2.5 2.5 0 0 0 5 0"] }),
  icon("credit-card", "Commerce", "payment bank debit", { s: [rect(2.5, 5, 19, 14, 3)], k: ["M3 10h18", "M6.5 15h3"] }),
  icon("wallet", "Commerce", "money payment purse", { s: ["M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3h1a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 20H6.5A2.5 2.5 0 0 1 4 17.5Z"], k: [c(16.5, 14, 1)] }),
  icon("coin", "Commerce", "dollar money currency price", { s: [RING], k: ["M14.8 9.2c-.5-.9-1.6-1.4-2.8-1.4-1.6 0-2.8.8-2.8 2.1 0 2.9 5.8 1.4 5.8 4.3 0 1.3-1.3 2.1-3 2.1-1.3 0-2.4-.6-2.9-1.5", "M12 6v1.8", "M12 16.3V18"] }),
  icon("receipt", "Commerce", "invoice bill order", { s: ["M5.5 3.5h13v17l-2.2-1.5-2.1 1.5-2.2-1.5-2.2 1.5-2.1-1.5-2.2 1.5Z"], k: ["M9 8h6", "M9 11.5h6", "M9 15h3"] }),
  icon("tag", "Commerce", "price label sale", { s: ["M3.5 5.5v5.3a2 2 0 0 0 .6 1.4l8.2 8.2a2 2 0 0 0 2.8 0l5.3-5.3a2 2 0 0 0 0-2.8L12.2 4.1a2 2 0 0 0-1.4-.6H5.5a2 2 0 0 0-2 2Z"], k: [c(8, 8, 1.3)] }),
  icon("percent", "Commerce", "discount sale offer", { s: [c(7, 7, 2.5), c(17, 17, 2.5)], l: ["M18 6 6 18"] }),
  icon("store", "Commerce", "shop market business", { s: ["M3.5 8.5 5 4h14l1.5 4.5a2.5 2.5 0 0 1-4.3 1.8 2.6 2.6 0 0 1-4.2 0 2.6 2.6 0 0 1-4.2 0A2.5 2.5 0 0 1 3.5 8.5Z"], l: ["M5 12v6.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V12", "M10 20.5v-4a2 2 0 0 1 4 0v4"] }),
  icon("truck", "Commerce", "delivery shipping transport", { s: [rect(2.5, 5.5, 11.5, 10.5, 2), "M14 9h3.5l3 3.5V16H14Z", c(7, 18, 2), c(17, 18, 2)] }),
  icon("gift", "Commerce", "present reward surprise", { s: [rect(4, 8, 16, 4, 1.5), "M5.5 12h13v6.5a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2Z"], l: ["M12 8C10.5 4 7 4 7.5 6.5 8 8 12 8 12 8", "M12 8c1.5-4 5-4 4.5-1.5C16 8 12 8 12 8"], k: ["M12 8.5v11.5"] }),

  // Charts
  icon("bar-chart", "Charts", "graph stats analytics", { s: [rect(4, 12, 4, 8, 1.2), rect(10, 4, 4, 16, 1.2), rect(16, 9, 4, 11, 1.2)] }),
  icon("pie-chart", "Charts", "graph share analytics", { s: ["M11 4.5a8 8 0 1 0 8.5 8.5H11Z", "M14 2.5a7.5 7.5 0 0 1 7.5 7.5H14Z"] }),
  icon("activity", "Charts", "pulse heartbeat health monitor", { l: ["M3 12h3.5l2.5-6.5 5 13 2.5-6.5H21"] }),
  icon("trending-up", "Charts", "growth increase profit", { l: ["m3 17 6-6 4 4 8-8", "M15 7h6v6"] }),
  icon("trending-down", "Charts", "decrease loss drop", { l: ["m3 7 6 6 4-4 8 8", "M15 17h6v-6"] }),
  icon("gauge", "Charts", "dashboard speed meter performance", { s: ["M3 15a9 9 0 0 1 18 0v2.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z"], k: ["m12 15 3.5-4.5", dot(7, 15), dot(8.5, 10.5)] }),
  icon("target", "Charts", "goal aim focus", { s: [RING], l: [dot(12, 12)], k: [c(12, 12, 5)] }),

  // Weather
  icon("sun", "Weather", "light day bright", { s: [c(12, 12, 4)], l: ["M12 2.5v2", "M12 19.5v2", "M2.5 12h2", "M19.5 12h2", "m5.3 5.3 1.4 1.4", "m17.3 17.3 1.4 1.4", "m5.3 18.7 1.4-1.4", "m17.3 6.7 1.4-1.4"] }),
  icon("moon", "Weather", "night dark sleep", { s: ["M20 14.6A8.5 8.5 0 1 1 9.4 4a7.6 7.6 0 0 0 10.6 10.6Z"], k: [sparkle(16, 7, 1.6)] }),
  icon("cloud", "Weather", "sky overcast storage", { s: [CLOUD] }),
  icon("rain", "Weather", "shower drizzle storm", { s: [CLOUD_HIGH], l: ["m8 18.5-1 2", "m12.5 18.5-1 2", "m17 18.5-1 2"] }),
  icon("lightning", "Weather", "zap bolt power flash", { s: [poly([[13.5, 2.5], [5, 13.5], [11.5, 13.5], [10.5, 21.5], [19, 10.5], [12.5, 10.5]], 1.2)] }),
  icon("snow", "Weather", "winter cold flake", { l: ["M12 3v18", "m4.2 7.5 15.6 9", "m4.2 16.5 15.6-9", "m9.5 4.5 2.5 2 2.5-2", "m9.5 19.5 2.5-2 2.5 2"] }),
  icon("umbrella", "Weather", "rain protect insurance", { s: ["M3 12a9 9 0 0 1 18 0Z"], l: ["M12 12v6.5a2 2 0 0 1-4 0", "M12 2.5V3"] }),
  icon("wind", "Weather", "air breeze blow", { l: ["M3 8.5h11a2.5 2.5 0 1 0-2.5-2.5", "M3 12.5h15a2.5 2.5 0 1 1-2.5 2.5", "M3 16.5h7"] }),
  icon("droplet", "Weather", "water liquid humidity", { s: ["M12 3.5s6.5 6.6 6.5 11a6.5 6.5 0 0 1-13 0c0-4.4 6.5-11 6.5-11Z"], k: ["M9 14.5a3 3 0 0 0 2 2.7"] }),
  icon("flame", "Weather", "fire hot trending burn", { s: ["M12 21.5a6.5 6.5 0 0 0 6.5-6.5c0-4-3-6.5-4.5-10-1.5 2.5-2.5 4-2.5 6-1.2-.8-2-2-2.2-3.3C7.3 9.5 5.5 12 5.5 15a6.5 6.5 0 0 0 6.5 6.5Z"], k: ["M9.8 18.6c0-1.5 1-2.4 2.2-3.8 1.2 1.4 2.2 2.3 2.2 3.8"] }),
  icon("leaf", "Weather", "nature eco plant green", { s: ["M5 19C4 11 8.5 4.5 19.5 4.5 19.5 15 13 20 5 19Z"], l: ["M3.5 20.5 5 19"], k: ["m8 16 5.5-5.5"] }),
  icon("tree", "Weather", "nature forest park", { s: [poly([[12, 2.5], [18.5, 11], [16, 11], [19.5, 16.5], [4.5, 16.5], [8, 11], [5.5, 11]], 1)], l: ["M12 16.5v5"] }),
  icon("mountain", "Weather", "landscape hike peak", { s: [poly([[2.5, 19.5], [9, 6.5], [13, 13], [15.5, 9.5], [21.5, 19.5]], 1.2)] }),

  // Places
  icon("map-pin", "Places", "location marker place gps", { s: ["M12 21.5s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"], k: [c(12, 9.5, 2.5)] }),
  icon("map", "Places", "navigation route travel", { s: ["M3.5 6.5 9 4l6 2.5L20.5 4v13.5L15 20l-6-2.5-5.5 2.5Z"], k: ["M9 4.5v12.5", "M15 7v12.5"] }),
  icon("globe", "Places", "world earth web internet", { s: [RING], k: ["M3.5 12h17", "M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5", "M12 3.5C9.6 5.9 8.4 8.7 8.4 12s1.2 6.1 3.6 8.5"] }),
  icon("compass", "Places", "explore navigation direction", { s: [RING], k: ["m15.5 8.5-2 5-5 2 2-5Z"] }),
  icon("flag", "Places", "report mark country", { s: ["M5 4.5c4-2 6 1.5 9.5 0 1.3-.6 3-.6 4.5 0v9c-1.5-.6-3.2-.6-4.5 0-3.5 1.5-5.5-2-9.5 0Z"], l: ["M5 4.5v17"] }),
  icon("building", "Places", "office company city", { s: [rect(4.5, 3, 11, 18, 2)], l: ["M15.5 9H18a1.5 1.5 0 0 1 1.5 1.5V21", "M3 21h18"], k: [dot(8.5, 7.5), dot(11.5, 7.5), dot(8.5, 11), dot(11.5, 11), dot(8.5, 14.5), dot(11.5, 14.5)] }),
  icon("rocket", "Places", "launch startup space ship", { s: ["M12 2.8c3 2 4.5 5.5 4.5 9.5V16h-9v-3.7C7.5 8.3 9 4.8 12 2.8Z"], l: ["M7.5 12.5 5 15v3h2.5", "M16.5 12.5 19 15v3h-2.5", "M10.5 19v2", "M13.5 19v2"], k: [c(12, 9.5, 1.8)] }),

  // People
  icon("user", "People", "person profile account", { s: [USER_HEAD, USER_BODY] }),
  icon("users", "People", "group team people", { s: [c(9, 8, 3.5), "M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5Z"], l: ["M15.5 4.6a3.5 3.5 0 0 1 0 6.8", "M18 14.8c2 .7 3.5 2.4 3.5 5.2"] }),
  icon("user-plus", "People", "add invite person", { s: [c(10, 8, 4), "M3 20.5c0-3.6 3.1-6 7-6s7 2.4 7 6Z"], l: ["M19 8v6", "M16 11h6"] }),
  icon("smile", "People", "emoji happy face", { s: [RING], k: ["M8.5 14.5a4 4 0 0 0 7 0", dot(9, 9.5), dot(15, 9.5)] }),
  icon("thumbs-up", "People", "like approve good", { s: [rect(3, 10, 4, 10.5, 1.5), "M7 10.5 10.7 4a1.8 1.8 0 0 1 3.3 1.3L13 9.5h5.3a2 2 0 0 1 2 2.4l-1.4 6.8a2.2 2.2 0 0 1-2.2 1.8H7Z"] }),
  icon("blink", "People", "mascot face character bot", { s: [BLOB], k: ["M9 10.5v3", "M15 10.5v3"] }),
  icon("wink", "People", "mascot face playful character", { s: [BLOB], k: ["M9 10.5v3", "m13.5 12.5 1.5-1.5 1.5 1.5"] }),
  icon("ghost", "People", "spooky halloween boo", { s: ["M5 11a7 7 0 0 1 14 0v9.2a.5.5 0 0 1-.8.4L16.5 19l-1.7 1.6a.6.6 0 0 1-.8 0L12 19l-2 1.6a.6.6 0 0 1-.8 0L7.5 19l-1.7 1.6a.5.5 0 0 1-.8-.4Z"], k: ["M9.5 10v1.5", "M14.5 10v1.5"] }),

  // Objects
  icon("sparkles", "Objects", "ai magic new shine", { s: [sparkle(10, 10, 7), sparkle(18, 17.5, 3.5)] }),
  icon("trophy", "Objects", "award winner prize cup", { s: ["M7 4h10v5a5 5 0 0 1-10 0Z", rect(8, 18, 8, 3, 1)], l: ["M7 6H4.5v1a3.5 3.5 0 0 0 3 3.5", "M17 6h2.5v1a3.5 3.5 0 0 1-3 3.5", "M12 14v4"] }),
  icon("crown", "Objects", "king premium vip pro", { s: [poly([[3.5, 7.5], [8.5, 12], [12, 5], [15.5, 12], [20.5, 7.5], [18.5, 18.5], [5.5, 18.5]], 1.2)] }),
  icon("lightbulb", "Objects", "idea tip hint", { s: ["M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2V17h5v-1c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z"], l: ["M9.5 20h5"], k: ["M9.8 8.5a2.5 2.5 0 0 1 2-2"] }),
  icon("coffee", "Objects", "cup drink break cafe", { s: ["M4.5 9h11v6.5a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4Z"], l: ["M15.5 11H17a2.5 2.5 0 0 1 0 5h-1.6", "M8 3.5c-.6.8-.6 1.7 0 2.5", "M11.5 3.5c-.6.8-.6 1.7 0 2.5"] }),
  icon("book-open", "Objects", "read docs library", { s: ["M12 6.5C10 5 7.5 4.5 3.5 4.7v13.6c4-.2 6.5.3 8.5 1.7Z", "M12 6.5c2-1.5 4.5-2 8.5-1.8v13.6c-4-.2-6.5.3-8.5 1.7Z"], k: ["M12 7v12.5"] }),
  icon("puzzle", "Objects", "plugin extension piece", { s: ["M5 7.5A1.5 1.5 0 0 1 6.5 6H10a2 2 0 1 1 4 0h3.5A1.5 1.5 0 0 1 19 7.5V11a2 2 0 1 1 0 4v3.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5Z"] }),
  icon("anchor", "Objects", "port marine dock", { s: [c(12, 5.5, 2.5)], l: ["M12 8v13", "M4 13a8 8 0 0 0 16 0", "M8.5 11.5h7"] }),
  icon("pin", "Objects", "pushpin attach stick", { s: ["M9 3.5h6l-.6 5.6 3.1 3a1 1 0 0 1-.7 1.7H7.2a1 1 0 0 1-.7-1.7l3.1-3Z"], l: ["M12 14v6.5"] }),
  icon("diamond", "Objects", "gem jewel premium", { s: [poly([[7, 4], [17, 4], [21, 9], [12, 20.5], [3, 9]], 1.3)], k: ["M3.5 9h17", "m9 4.5-1 4.5L12 20", "m15 4.5 1 4.5L12 20"] }),
  icon("paw", "Objects", "pet animal dog cat", { s: ["M12 12c-3 0-6 3.5-6 6a2.5 2.5 0 0 0 3.2 2.4c1-.3 1.8-.4 2.8-.4s1.8.1 2.8.4A2.5 2.5 0 0 0 18 18c0-2.5-3-6-6-6Z", c(5, 10, 2), c(9, 5.5, 2), c(15, 5.5, 2), c(19, 10, 2)] }),

  // ---------- Batch 2 ----------

  // Interface
  icon("bell-off", "Interface", "mute silent notifications", { s: ["M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15Z"], l: ["M10 21h4", "M12 3v2", "m3.5 3.5 17 17"] }),
  icon("bell-ring", "Interface", "alarm ringing notification", { s: ["M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15Z"], l: ["M10 21h4", "M12 3v2", "M2.5 8.5a9 9 0 0 1 2.3-4.5", "M21.5 8.5a9 9 0 0 0-2.3-4.5"] }),
  icon("bookmark-plus", "Interface", "save add later", { s: ["M6 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v15.2a.6.6 0 0 1-.95.5L12 17l-5.05 3.7A.6.6 0 0 1 6 20.2Z"], k: ["M12 7v5", "M9.5 9.5h5"] }),
  icon("check-double", "Interface", "read seen done", { l: ["m2.5 12.5 4.5 4.5L16 8", "m12 16 1 1 8.5-9"] }),
  icon("plus-circle", "Interface", "add new create", { s: [RING], k: ["M12 8v8", "M8 12h8"] }),
  icon("minus-circle", "Interface", "remove subtract", { s: [RING], k: ["M8 12h8"] }),
  icon("checkbox", "Interface", "check square select task", { s: [rect(3.5, 3.5, 17, 17, 4)], k: ["m8 12.3 2.7 2.7L16 9.5"] }),
  icon("radio-button", "Interface", "option select choice", { s: [RING], k: [c(12, 12, 3.5)] }),
  icon("columns", "Interface", "split layout panes", { s: [rect(3, 4, 18, 16, 3)], k: ["M12 5v14"] }),
  icon("minimize", "Interface", "exit fullscreen shrink", { l: ["M9 4v3.5A1.5 1.5 0 0 1 7.5 9H4", "M15 4v3.5A1.5 1.5 0 0 0 16.5 9H20", "M20 15h-3.5a1.5 1.5 0 0 0-1.5 1.5V20", "M4 15h3.5A1.5 1.5 0 0 1 9 16.5V20"] }),
  icon("grip-vertical", "Interface", "drag handle reorder", { s: [c(9, 6, 1), c(15, 6, 1), c(9, 12, 1), c(15, 12, 1), c(9, 18, 1), c(15, 18, 1)] }),
  icon("command", "Interface", "cmd shortcut keyboard mac", { l: ["M15 6.5a2.5 2.5 0 1 1 2.5 2.5H6.5A2.5 2.5 0 1 1 9 6.5v11A2.5 2.5 0 1 1 6.5 15h11a2.5 2.5 0 1 1-2.5 2.5Z"] }),
  icon("infinity", "Interface", "loop forever unlimited", { l: ["M12 12c-2-2.7-3.5-4-5.5-4a4 4 0 0 0 0 8c2 0 3.5-1.3 5.5-4s3.5-4 5.5-4a4 4 0 0 1 0 8c-2 0-3.5-1.3-5.5-4Z"] }),
  icon("qr-code", "Interface", "scan code barcode", { s: [rect(3.5, 3.5, 7, 7, 1.5), rect(13.5, 3.5, 7, 7, 1.5), rect(3.5, 13.5, 7, 7, 1.5)], l: [dot(14, 14), dot(20, 14), dot(17, 17), dot(14, 20), dot(20, 20)], k: [dot(7, 7), dot(17, 7), dot(7, 17)] }),
  icon("scan", "Interface", "camera capture focus", { l: ["M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9", "M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9", "M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15", "M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15", "M7.5 12h9"] }),
  icon("cursor", "Interface", "pointer click mouse select", { s: [poly([[4.5, 4], [19.5, 10.5], [12.5, 12.5], [10.5, 19.5]], 1.2)] }),

  // Arrows
  icon("arrow-down-right", "Arrows", "diagonal outward", { l: ["M7 7l10 10", "M17 8v9H8"] }),
  icon("arrow-up-left", "Arrows", "diagonal back", { l: ["M17 17 7 7", "M7 16V7h9"] }),
  icon("chevrons-left", "Arrows", "rewind double back", { l: ["m18 6-6 6 6 6", "m11 6-6 6 6 6"] }),
  icon("chevrons-up-down", "Arrows", "select sort expand", { l: ["m7 9 5-5 5 5", "m7 15 5 5 5-5"] }),
  icon("arrow-circle-left", "Arrows", "back previous", { s: [RING], k: ["M16 12H8", "m11.5 8.5-3.5 3.5 3.5 3.5"] }),
  icon("arrow-circle-down", "Arrows", "download bottom", { s: [RING], k: ["M12 8v8", "m8.5 12.5 3.5 3.5 3.5-3.5"] }),
  icon("corner-down-right", "Arrows", "reply forward turn", { l: ["M5 4v7a3 3 0 0 0 3 3h11", "m15 10 4 4-4 4"] }),
  icon("corner-up-left", "Arrows", "reply back turn", { l: ["M19 20v-7a3 3 0 0 0-3-3H5", "m9 14-4-4 4-4"] }),
  icon("expand", "Arrows", "enlarge grow diagonal", { l: ["M14 4h6v6", "m20 4-6.5 6.5", "M10 20H4v-6", "m4 20 6.5-6.5"] }),
  icon("shrink", "Arrows", "collapse reduce diagonal", { l: ["m20 4-6.5 6.5", "M13.5 5.5v5h5", "m4 20 6.5-6.5", "M10.5 18.5v-5h-5"] }),
  icon("rotate-cw", "Arrows", "clockwise redo turn", { l: ["M20 12a8 8 0 1 1-2.6-5.9", "M20 4v4.5h-4.5"] }),
  icon("rotate-ccw", "Arrows", "counterclockwise undo turn", { l: ["M4 12a8 8 0 1 0 2.6-5.9", "M4 4v4.5h4.5"] }),
  icon("shuffle", "Arrows", "random mix", { l: ["M3 7h3.5c2.5 0 4 1.2 5.5 5s3 5 5.5 5H20", "m17.5 14.5 2.5 2.5-2.5 2.5", "M3 17h3.5c1.4 0 2.5-.4 3.4-1.4", "M14.1 8.4c.9-1 2-1.4 3.4-1.4H20", "m17.5 4.5 2.5 2.5-2.5 2.5"] }),
  icon("arrow-big-up", "Arrows", "upvote top bold", { s: [poly([[12, 3], [20.5, 11.5], [15.5, 11.5], [15.5, 20.5], [8.5, 20.5], [8.5, 11.5], [3.5, 11.5]], 1.5)] }),
  icon("navigation", "Arrows", "direction gps location", { s: [poly([[12, 3], [19.5, 20.5], [12, 16.5], [4.5, 20.5]], 1.4)] }),

  // Alerts
  icon("alert-octagon", "Alerts", "stop error danger", { s: [poly([[8.48, 3.5], [15.52, 3.5], [20.5, 8.48], [20.5, 15.52], [15.52, 20.5], [8.48, 20.5], [3.5, 15.52], [3.5, 8.48]], 1.5)], k: ["M12 7.5v5", dot(12, 16.2)] }),
  icon("shield-alert", "Alerts", "security warning risk", { s: [SHIELD], k: ["M12 8v4", dot(12, 15.5)] }),
  icon("badge-check", "Alerts", "verified approved certified", { s: [star(12, 12, 9.5, 7.8, 8, 1.2)], k: ["m8.5 12.2 2.5 2.5 4.5-4.8"] }),
  icon("ban", "Alerts", "block forbidden prohibited", { l: [RING, "m5.6 5.6 12.8 12.8"] }),
  icon("siren", "Alerts", "emergency alarm police", { s: ["M6 18v-6a6 6 0 0 1 12 0v6Z", rect(3.5, 18, 17, 3, 1)], l: ["M12 2.5v1", "m4.5 5 .8.8", "m19.5 5-.8.8"], k: ["M9.5 12a2.5 2.5 0 0 1 2.5-2.5"] }),
  icon("lifebuoy", "Alerts", "support help rescue", { s: [RING], k: [c(12, 12, 4), "m5.6 5.6 3.6 3.6", "m14.8 14.8 3.6 3.6", "m18.4 5.6-3.6 3.6", "m9.2 14.8-3.6 3.6"] }),
  icon("fingerprint", "Alerts", "biometric identity touch security", { l: ["M12 11v3a8 8 0 0 1-1.5 4.7", "M8.5 9a4 4 0 0 1 7.5 2v2.5", "M16 17.5c-.2.8-.5 1.6-.9 2.3", "M5.5 15.5c.3-1.2.5-2.3.5-3.5a6 6 0 0 1 9-5.2", "M18 9.5c.3.8.5 1.6.5 2.5v1", "M4 9a8.5 8.5 0 0 1 13.4-4"] }),

  // Communication
  icon("mail-open", "Communication", "email read envelope", { s: ["M3 10.5 12 4l9 6.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"], k: ["m3.5 11 8.5 5.5 8.5-5.5"] }),
  icon("phone-call", "Communication", "calling ring contact", { s: ["M5.5 3.5h3l1.5 4.5-2.2 1.4a11 11 0 0 0 6.8 6.8l1.4-2.2 4.5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z"], l: ["M14.5 3a6.5 6.5 0 0 1 6.5 6.5", "M14.5 6.5a3 3 0 0 1 3 3"] }),
  icon("contacts", "Communication", "address book people", { s: [rect(4.5, 3, 15, 18, 2.5)], l: ["M2.5 8h3", "M2.5 12h3", "M2.5 16h3"], k: [c(12, 10, 2.3), "M8.5 16.5c.6-1.6 1.9-2.5 3.5-2.5s2.9.9 3.5 2.5"] }),
  icon("chat-plus", "Communication", "new message comment add", { s: [BUBBLE], k: ["M12.5 8v5", "M10 10.5h5"] }),
  icon("chat-question", "Communication", "faq support ask", { s: ["M12 3.5a8.5 8.5 0 1 1-4.1 16L3.5 20.5l1-4.2A8.5 8.5 0 0 1 12 3.5Z"], k: ["M9.8 9.8a2.3 2.3 0 1 1 3.2 2.1c-.6.3-1 .8-1 1.4", dot(12, 16)] }),
  icon("voicemail", "Communication", "message audio tape", { l: [c(6.5, 12, 3.5), c(17.5, 12, 3.5), "M6.5 15.5h11"] }),
  icon("rss", "Communication", "feed blog subscribe", { s: [c(6, 18, 1.3)], l: ["M5 11a8 8 0 0 1 8 8", "M5 4.5A14.5 14.5 0 0 1 19.5 19"] }),

  // Media
  icon("fast-forward", "Media", "skip speed next", { s: [poly([[3, 6], [11.5, 12], [3, 18]], 1.3), poly([[12, 6], [20.5, 12], [12, 18]], 1.3)] }),
  icon("rewind", "Media", "back speed previous", { s: [poly([[21, 6], [12.5, 12], [21, 18]], 1.3), poly([[12, 6], [3.5, 12], [12, 18]], 1.3)] }),
  icon("mic-off", "Media", "mute microphone silent", { s: [rect(9, 3, 6, 11, 3)], l: ["M5.5 11a6.5 6.5 0 0 0 13 0", "M12 17.5V21", "M9 21h6", "m4 3.5 16 17"] }),
  icon("radio", "Media", "fm music broadcast", { s: [rect(3, 8, 18, 12.5, 2.5)], l: ["M7 8l10-4.5"], k: [c(15.5, 14, 2.5), "M6.5 12h3", "M6.5 15.5h3"] }),
  icon("tv", "Media", "television screen watch", { s: [rect(2.5, 6, 19, 13.5, 2.5)], l: ["m8 2.5 4 3.5 4-3.5"] }),
  icon("disc", "Media", "cd vinyl album record", { s: [RING], k: [c(12, 12, 2.5), "M7 10.5a5 5 0 0 1 3.5-3.5"] }),
  icon("gamepad", "Media", "game controller play console", { s: ["M7 7h10a5 5 0 0 1 4.8 6.4l-1 3.4a2.5 2.5 0 0 1-4.1 1.1L14 15.5h-4l-2.7 2.4a2.5 2.5 0 0 1-4.1-1.1l-1-3.4A5 5 0 0 1 7 7Z"], k: ["M7.5 10.5v3", "M6 12h3", dot(15.5, 11), dot(17.5, 13)] }),
  icon("playlist", "Media", "queue tracks list", { s: [poly([[14, 13.5], [20, 17], [14, 20.5]], 1.2)], l: ["M3.5 6h12", "M3.5 11h12", "M3.5 16h6"] }),
  icon("images", "Media", "gallery photos album", { s: [rect(6.5, 3, 14.5, 14.5, 2.5)], l: ["M17.5 21h-12A2.5 2.5 0 0 1 3 18.5v-12"], k: ["m9 14.5 3-3 2.5 2.5 2-2 2 2", c(11, 7.5, 1)] }),

  // Files
  icon("file-code", "Files", "source script document", { s: [FILE], k: [FOLD, "m9.5 12.5-2 2 2 2", "m13.5 12.5 2 2-2 2"] }),
  icon("file-image", "Files", "picture document photo", { s: [FILE], k: [FOLD, c(9.5, 12.5, 1.2), "m7.5 18 3-3 2 2 1.5-1.5 2 2"] }),
  icon("file-check", "Files", "approved document done", { s: [FILE], k: [FOLD, "m8.5 14.5 2.2 2.2 4.3-4.2"] }),
  icon("folder-open", "Files", "directory browse open", { s: [poly([[5.5, 10], [22, 10], [19, 20], [3, 20]], 1.3)], l: ["M3.5 17V7a2.5 2.5 0 0 1 2.5-2.5h3.2a2 2 0 0 1 1.6.8l1 1.4a2 2 0 0 0 1.6.8h4.1a2.5 2.5 0 0 1 2.5 2.5v.5"] }),
  icon("save", "Files", "floppy disk store", { s: ["M4 6.5A2.5 2.5 0 0 1 6.5 4h9.5l4 4v9.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5Z"], k: ["M8 4.5V8h7V4.5", "M8 20v-5.5h8V20"] }),
  icon("sticky-note", "Files", "memo post-it note", { s: ["M5 3.5h14A1.5 1.5 0 0 1 20.5 5v9.5l-6 6H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Z"], k: ["M20 14.5h-4a1.5 1.5 0 0 0-1.5 1.5v4", "M7.5 8h9", "M7.5 11.5h6"] }),
  icon("files", "Files", "documents copies stack", { s: [rect(7, 2.5, 13, 16, 2.5)], l: ["M17 21.5H6A2.5 2.5 0 0 1 3.5 19V7"], k: ["M10.5 8h6", "M10.5 11.5h6"] }),
  icon("cloud-check", "Files", "synced backup saved", { s: [CLOUD], k: ["m9.3 13.8 2 2 3.7-3.8"] }),

  // Devices
  icon("tablet", "Devices", "ipad screen device", { s: [rect(4.5, 2.5, 15, 19, 2.5)], k: ["M11 18.5h2"] }),
  icon("speaker", "Devices", "audio sound woofer", { s: [rect(5.5, 2.5, 13, 19, 3)], k: [c(12, 14.5, 3), dot(12, 7)] }),
  icon("plug", "Devices", "power electric socket", { s: ["M6.5 7h11v4a5.5 5.5 0 0 1-11 0Z"], l: ["M9 3v4", "M15 3v4", "M12 16.5V21"] }),
  icon("hard-drive", "Devices", "disk storage hdd", { s: [rect(2.5, 13, 19, 7, 2.5)], l: ["M4.5 13 7 5.5A2 2 0 0 1 8.9 4h6.2a2 2 0 0 1 1.9 1.5L19.5 13"], k: [dot(17, 16.5), dot(14, 16.5)] }),
  icon("router", "Devices", "modem internet network", { s: [rect(2.5, 13.5, 19, 7, 2.5)], l: ["M17 13.5V10", "M14.5 7.5a3.5 3.5 0 0 1 5 0", "M12.5 5a6.5 6.5 0 0 1 9 0"], k: [dot(6.5, 17), dot(10, 17)] }),
  icon("signal", "Devices", "bars cellular reception", { l: ["M4 20v-3", "M9 20v-7", "M14 20V9", "M19 20V4"] }),
  icon("battery-charging", "Devices", "power charge energy bolt", { s: [rect(2.5, 7, 16, 10, 2.5)], l: ["M21 10.5v3"], k: ["m11 9-2 3h3l-2 3"] }),

  // Development
  icon("git-commit", "Development", "version history node", { s: [c(12, 12, 3.5)], l: ["M3 12h5.5", "M15.5 12H21"] }),
  icon("git-merge", "Development", "version join branch", { s: [c(6, 5.5, 2.5), c(6, 18.5, 2.5), c(18, 15, 2.5)], l: ["M6 8v8", "M6 8c0 4 3.5 7 9.5 7"] }),
  icon("git-pull-request", "Development", "pr review merge", { s: [c(6, 5.5, 2.5), c(6, 18.5, 2.5), c(18, 18.5, 2.5)], l: ["M6 8v8", "M18 16V9.5A2.5 2.5 0 0 0 15.5 7H11", "m13.5 4.5-2.5 2.5 2.5 2.5"] }),
  icon("braces", "Development", "json object curly code", { l: ["M8 4H7a2 2 0 0 0-2 2v3.5a2.5 2.5 0 0 1-2 2.5 2.5 2.5 0 0 1 2 2.5V18a2 2 0 0 0 2 2h1", "M16 4h1a2 2 0 0 1 2 2v3.5a2.5 2.5 0 0 0 2 2.5 2.5 2.5 0 0 0-2 2.5V18a2 2 0 0 1-2 2h-1"] }),
  icon("workflow", "Development", "flow automation pipeline", { s: [rect(3, 3.5, 7, 7, 2), rect(14, 13.5, 7, 7, 2)], l: ["M6.5 10.5v3A2.5 2.5 0 0 0 9 16h5"] }),
  icon("robot", "Development", "bot ai assistant machine", { s: [rect(4, 7, 16, 12.5, 4)], l: ["M12 7V3.5", "M2 12.5v2", "M22 12.5v2"], k: ["M9 12v1.5", "M15 12v1.5", "M10 16.5h4"] }),
  icon("flask", "Development", "experiment lab science test", { s: ["M10 4h4v5l5 9.3a1.5 1.5 0 0 1-1.3 2.2H6.3A1.5 1.5 0 0 1 5 18.3L10 9Z"], l: ["M8.5 4h7"], k: ["M8 15h8"] }),

  // Editor
  icon("underline", "Editor", "text format", { l: ["M7 4v6a5 5 0 0 0 10 0V4", "M5 20h14"] }),
  icon("strikethrough", "Editor", "text format delete", { l: ["M4 12h16", "M16.5 7.5c-.5-1.8-2.3-3-4.5-3-2.6 0-4.5 1.4-4.5 3.3 0 1.2.6 2 1.7 2.7", "M7.5 16.5c.6 1.9 2.3 3 4.7 3 2.6 0 4.5-1.4 4.5-3.4 0-.7-.2-1.3-.6-1.8"] }),
  icon("align-center", "Editor", "text paragraph middle", { l: ["M4 6h16", "M7 10h10", "M4 14h16", "M7 18h10"] }),
  icon("align-right", "Editor", "text paragraph end", { l: ["M4 6h16", "M10 10h10", "M4 14h16", "M10 18h10"] }),
  icon("list-ordered", "Editor", "numbered steps", { l: ["M10 6h10", "M10 12h10", "M10 18h10", "M4.5 5 6 4v5", "M4 15.5a1.5 1.5 0 0 1 3 0c0 1.4-3 2-3 3.5h3"] }),
  icon("heading", "Editor", "title h1 text", { l: ["M6 4v16", "M18 4v16", "M6 12h12"] }),
  icon("table", "Editor", "grid spreadsheet data", { s: [rect(3, 4, 18, 16, 3)], k: ["M3.5 9.5h17", "M9.5 10v9.5"] }),
  icon("brush", "Editor", "paint art draw", { s: ["M7.5 13.5a3 3 0 0 1 3 3c0 2.5-2.5 4-7 4 1-1 1-2.5 1-4a3 3 0 0 1 3-3Z"], l: ["m10 14 9.5-9.5a1.4 1.4 0 0 0-2-2L8 12"] }),
  icon("eraser", "Editor", "remove clear rubber", { s: ["M14.2 4.1a2 2 0 0 1 2.8 0l3.9 3.9a2 2 0 0 1 0 2.8L12 19.5H7.5l-3.4-3.4a2 2 0 0 1 0-2.8Z"], l: ["M12 20h8"], k: ["m9 9 6.5 6.5"] }),
  icon("ruler", "Editor", "measure length scale", { s: [poly([[3.5, 16], [16, 3.5], [20.5, 8], [8, 20.5]], 1.5)], k: ["m6.5 13 1.8 1.8", "m9.5 10 2.8 2.8", "m12.5 7 1.8 1.8"] }),
  icon("pipette", "Editor", "eyedropper color picker sample", { s: ["M15.3 3.7a2.4 2.4 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4L18 11l-5-5Z"], l: ["m11.5 5.5 7 7", "m14 8-8.3 8.3a1.5 1.5 0 0 0-.4.8L5 19l1.9-.3c.3 0 .6-.2.8-.4L16 10"] }),
  icon("frame", "Editor", "artboard canvas design", { l: ["M7 3v18", "M17 3v18", "M3 7h18", "M3 17h18"] }),
  icon("contrast", "Editor", "theme half dark light", { s: ["M12 3a9 9 0 0 1 0 18Z"], l: [RING] }),

  // Commerce
  icon("barcode", "Commerce", "scan product sku", { l: ["M4 6v12", "M7.5 6v12", "M11 6v8", "M14 6v12", "M17.5 6v8", "M20 6v12", "M11 17.5v.5", "M17.5 17.5v.5"] }),
  icon("basket", "Commerce", "shopping groceries buy", { s: ["M3 10h18l-1.8 8.4a2 2 0 0 1-2 1.6H6.8a2 2 0 0 1-2-1.6Z"], l: ["m7.5 10 3-6", "m16.5 10-3-6"], k: ["M9 13.5v3", "M12 13.5v3", "M15 13.5v3"] }),
  icon("banknote", "Commerce", "cash money bill payment", { s: [rect(2.5, 6, 19, 12, 2.5)], k: [c(12, 12, 2.5), dot(6, 12), dot(18, 12)] }),
  icon("piggy-bank", "Commerce", "savings money budget", { s: ["M5 11.5C5 8.5 8 6.5 12 6.5c1.6 0 3 .3 4.2.9L18.5 6v3a5 5 0 0 1 1.3 2.5H21v3h-1.5a6 6 0 0 1-2 2.2V20h-3v-1.6c-.8.1-1.6.1-2.5.1s-1.7 0-2.5-.1V20h-3v-2.6C5.6 16.1 5 13.9 5 11.5Z"], k: [dot(15.5, 10.5), "M9.5 9.5h3"] }),
  icon("ticket", "Commerce", "event pass admission coupon", { s: ["M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5V14a2 2 0 0 0 0-4Z"], k: ["M14.5 6.5V8", "M14.5 11v2", "M14.5 16v1.5"] }),
  icon("badge-percent", "Commerce", "discount deal promo", { s: [star(12, 12, 9.5, 7.8, 8, 1.2)], k: ["m9 15 6-6", dot(9.5, 9.5), dot(14.5, 14.5)] }),
  icon("cart-plus", "Commerce", "add to cart buy", { s: ["M6 7h14.5l-1.8 7.4a1.5 1.5 0 0 1-1.5 1.1H8.6a1.5 1.5 0 0 1-1.5-1.2Z", c(9, 20, 1.5), c(17, 20, 1.5)], l: ["M2.5 3.5h2.2L6 7"], k: ["M13.3 9v4", "M11.3 11h4"] }),

  // Charts
  icon("line-chart", "Charts", "graph trend analytics", { l: ["M4 4v14.5A1.5 1.5 0 0 0 5.5 20H20", "m8 15 3.5-4 3 2.5L20 7"] }),
  icon("area-chart", "Charts", "graph volume analytics", { s: [poly([[4, 20], [4, 14], [8.5, 9.5], [12.5, 12.5], [20, 5], [20, 20]], 1.2)] }),
  icon("donut-chart", "Charts", "ring graph share", { s: [RING], k: [c(12, 12, 4), "M12 3.5V8"] }),
  icon("scatter-chart", "Charts", "plot points data", { s: [c(9, 15, 1.3), c(12, 9.5, 1.3), c(16, 13, 1.3), c(18.5, 7, 1.3)], l: ["M4 4v14.5A1.5 1.5 0 0 0 5.5 20H20"] }),
  icon("bar-chart-horizontal", "Charts", "graph ranking stats", { s: [rect(4, 4, 10, 4, 1.2), rect(4, 10, 16, 4, 1.2), rect(4, 16, 7, 4, 1.2)] }),
  icon("kanban", "Charts", "board tasks project", { s: [rect(3, 3.5, 18, 17, 3)], k: ["M8 7.5v8", "M12 7.5v4", "M16 7.5v6"] }),
  icon("presentation", "Charts", "slides board meeting", { s: [rect(3, 4, 18, 12, 2)], l: ["M12 16v4.5", "M8.5 20.5h7", "M12 2.5V4"], k: ["m7 12.5 3-3 2.5 2 4.5-4"] }),

  // Weather
  icon("cloud-sun", "Weather", "partly cloudy forecast", { s: ["M8.5 20a3.5 3.5 0 0 1-.5-7 5 5 0 0 1 9.4-.8A3.8 3.8 0 0 1 17.5 20Z"], l: ["M5.7 10.5A3.6 3.6 0 1 1 12.4 7", "M9 2.5v1", "M3 8h1", "m4.9 4.1.7.7", "m13.1 4.1-.7.7"] }),
  icon("cloud-lightning", "Weather", "storm thunder", { s: [CLOUD_HIGH], l: ["m12.5 15-2.5 3.5h4L11.5 22"] }),
  icon("cloud-snow", "Weather", "winter snowing", { s: [CLOUD_HIGH], l: [dot(8, 18.5), dot(12, 19.5), dot(16, 18.5), dot(10, 21.5), dot(14, 21.5)] }),
  icon("thermometer", "Weather", "temperature heat cold", { s: ["M9.5 5a2.5 2.5 0 0 1 5 0v9a4.5 4.5 0 1 1-5 0Z"], k: ["M12 10v6"] }),
  icon("sunrise", "Weather", "morning dawn", { l: ["M3 18h18", "M7 18a5 5 0 0 1 10 0", "M12 3v6", "m9.5 6.5 2.5-2.5 2.5 2.5", "m4 13.5 1.2.8", "m20 13.5-1.2.8", "M5.5 21.5h13"] }),
  icon("rainbow", "Weather", "arc colors pride", { l: ["M3 18a9 9 0 0 1 18 0", "M6.5 18a5.5 5.5 0 0 1 11 0", "M10 18a2 2 0 0 1 4 0"] }),
  icon("sprout", "Weather", "plant grow seedling", { s: ["M12 13c0-4-2.5-6.5-7-6.5 0 4 2.5 6.5 7 6.5Z", "M12 11c0-3.5 2-6 6.5-6 0 3.5-2 6-6.5 6Z"], l: ["M12 21v-10"] }),
  icon("planet", "Weather", "space saturn orbit", { s: [c(12, 12, 6)], l: ["M17.2 9c3.3-1 5.1-.7 4.8.6-.6 2.5-7 6.4-14 8.6-3.7 1.2-6 1.4-6.2.4-.2-1 1.8-2.6 4.6-4.1"] }),
  icon("waves", "Weather", "water sea ocean", { l: ["M3 8c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0", "M3 12c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0", "M3 16c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0"] }),

  // Places
  icon("route", "Places", "path directions trip", { s: [c(6, 18, 2.5), c(18, 6, 2.5)], l: ["M8.5 18H16a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h7.5"] }),
  icon("crosshair", "Places", "locate gps target position", { s: [c(12, 12, 2)], l: [c(12, 12, 6.5), "M12 2.5v3", "M12 18.5v3", "M2.5 12h3", "M18.5 12h3"] }),
  icon("hospital", "Places", "clinic medical health", { s: [rect(4, 3.5, 16, 17, 2.5)], k: ["M12 8v6", "M9 11h6"] }),
  icon("parking", "Places", "car park sign", { s: [rect(3.5, 3.5, 17, 17, 4)], k: ["M10 17V7h3a3 3 0 0 1 0 6h-3"] }),
  icon("signpost", "Places", "directions way guide", { s: [poly([[5, 5], [18, 5], [20.5, 7.5], [18, 10], [5, 10]], 1), poly([[19, 13], [6, 13], [3.5, 15.5], [6, 18], [19, 18]], 1)], l: ["M12 3v2", "M12 10v3", "M12 18v3"] }),
  icon("tent", "Places", "camping outdoor trip", { s: [poly([[12, 4], [21, 20], [3, 20]], 1.5)], k: ["m9 20 3-5 3 5"] }),

  // Travel
  icon("plane", "Travel", "flight airport trip", { s: ["M10.5 3.5a1.5 1.5 0 0 1 3 0V9l7.5 4.5v2.2L13.5 13v4.5l2.5 2v1.5L12 20l-4 1v-1.5l2.5-2V13L3 15.7v-2.2L10.5 9Z"] }),
  icon("car", "Travel", "vehicle drive auto", { s: ["M3.5 12.5 5.3 7.4A2 2 0 0 1 7.2 6h9.6a2 2 0 0 1 1.9 1.4l1.8 5.1V17a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1Z"], l: ["M6 18v2", "M18 18v2"], k: [dot(7.5, 14.5), dot(16.5, 14.5), "M5 12h14"] }),
  icon("bus", "Travel", "public transport commute", { s: [rect(4.5, 3, 15, 15.5, 3)], l: ["M7.5 18.5V21", "M16.5 18.5V21"], k: ["M5 10.5h14", dot(8, 14.5), dot(16, 14.5)] }),
  icon("train", "Travel", "rail metro transport", { s: [rect(5.5, 3, 13, 14, 4)], l: ["m8 21 2-3.5", "m16 21-2-3.5"], k: ["M6 10h12", dot(9, 13.5), dot(15, 13.5)] }),
  icon("bike", "Travel", "bicycle cycle ride", { s: [c(5.5, 16, 3.5), c(18.5, 16, 3.5)], l: ["M5.5 16 9 9.5h7l2.5 6.5", "M9 9.5l3.5 6.5h-7", "M7.5 6.5h3", "M16 9.5 14.5 6h2"] }),
  icon("luggage", "Travel", "suitcase bag trip", { s: [rect(4, 7, 16, 13, 2.5)], l: ["M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"], k: ["M8.5 7.5v12", "M15.5 7.5v12"] }),
  icon("bed", "Travel", "hotel sleep room", { s: [c(7, 12.5, 2)], l: ["M3 5v15", "M3 16h18", "M21 20v-6.5a2.5 2.5 0 0 0-2.5-2.5H11v5"] }),

  // Food
  icon("pizza", "Food", "slice fast food", { s: ["M3.5 6.5a12 12 0 0 1 17 0L12 21Z"], k: [c(10, 10, 1), dot(14.5, 10), dot(12, 14.5)] }),
  icon("apple", "Food", "fruit healthy", { s: ["M12 7.5c-1.5-1-5.5-1.6-7 2-1.4 3.4.5 8.4 3 10.2 1.3.9 2.6.6 4 0 1.4.6 2.7.9 4 0 2.5-1.8 4.4-6.8 3-10.2-1.5-3.6-5.5-3-7-2Z"], l: ["M12 7.5c0-2 .8-3.5 2.5-4.5"] }),
  icon("ice-cream", "Food", "dessert sweet cone", { s: ["M7 11a5 5 0 0 1 10 0Z", poly([[7, 11], [17, 11], [12, 21.5]], 1.5)], k: ["m9.5 13.5 3.5 3.5"] }),
  icon("cake", "Food", "birthday dessert party", { s: [rect(4, 11, 16, 9.5, 2)], l: ["M12 7v4", "M3 20.5h18", dot(12, 4.5)], k: ["M4.5 15c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0"] }),
  icon("cookie", "Food", "biscuit snack", { s: [RING], k: [dot(9, 9), dot(14.5, 8.5), dot(15.5, 14), dot(9.5, 15), dot(12, 12)] }),
  icon("utensils", "Food", "fork knife restaurant eat", { l: ["M6 3v5a2.5 2.5 0 0 0 5 0V3", "M8.5 3v18", "M17.5 21V3c-2 1-3.5 3.5-3.5 7.5v3h3.5"] }),
  icon("cup-straw", "Food", "drink soda juice", { s: ["M6 7h12l-1.4 12.2A2 2 0 0 1 14.6 21H9.4a2 2 0 0 1-2-1.8Z"], l: ["M12 7l2-4.5h2.5"], k: ["M7 11.5h10"] }),
  icon("egg", "Food", "breakfast easter", { s: ["M12 3c3.6 0 6.5 6 6.5 10.5a6.5 6.5 0 0 1-13 0C5.5 9 8.4 3 12 3Z"], k: ["M9 14a3 3 0 0 0 2 2.8"] }),
  icon("chef-hat", "Food", "cook kitchen recipe", { s: ["M7 15a4 4 0 0 1-.8-7.9A6 6 0 0 1 17.8 7.1 4 4 0 0 1 17 15v5H7Z"], k: ["M7.5 17.5h9"] }),

  // Health
  icon("heart-pulse", "Health", "heartbeat cardio medical", { s: ["M12 20.5C7 17.5 3.5 14.2 3.5 9.8A4.3 4.3 0 0 1 7.8 5.5c1.7 0 3.2.9 4.2 2.4 1-1.5 2.5-2.4 4.2-2.4a4.3 4.3 0 0 1 4.3 4.3c0 4.4-3.5 7.7-8.5 10.7Z"], k: ["M5.5 12h2.5l1.5-2.5 3 5 1.5-2.5h4.5"] }),
  icon("pill", "Health", "medicine capsule drug", { s: ["M10.6 4.6a4.5 4.5 0 0 1 6.4 6.4l-6.1 6.1a4.5 4.5 0 0 1-6.4-6.4Z"], k: ["m7.6 7.6 6.4 6.4"] }),
  icon("stethoscope", "Health", "doctor checkup medical", { s: [c(18.5, 11, 2)], l: ["M5 3.5h-.5a1 1 0 0 0-1 1V9a5 5 0 0 0 10 0V4.5a1 1 0 0 0-1-1H12", "M8.5 14v1.5a5 5 0 0 0 10 0V13"] }),
  icon("first-aid", "Health", "kit emergency medical", { s: [rect(3, 6.5, 18, 13.5, 2.5)], l: ["M8.5 6.5V5A1.5 1.5 0 0 1 10 3.5h4A1.5 1.5 0 0 1 15.5 5v1.5"], k: ["M12 10.5v6", "M9 13.5h6"] }),
  icon("dumbbell", "Health", "gym fitness workout", { s: [rect(5, 7, 3, 10, 1.2), rect(16, 7, 3, 10, 1.2)], l: ["M8 12h8", "M2.5 10v4", "M21.5 10v4", "M2.5 12H5", "M19 12h2.5"] }),
  icon("accessibility", "Health", "a11y disability person", { s: [c(12, 4.5, 1.8)], l: ["m5 8.5 7 1.5 7-1.5", "M12 10v4.5l-3 6", "m12 14.5 3 6"] }),

  // People
  icon("user-minus", "People", "remove person", { s: [c(10, 8, 4), "M3 20.5c0-3.6 3.1-6 7-6s7 2.4 7 6Z"], l: ["M16 11h6"] }),
  icon("user-check", "People", "verified approved person", { s: [c(10, 8, 4), "M3 20.5c0-3.6 3.1-6 7-6s7 2.4 7 6Z"], l: ["m16 11 2 2 4-4"] }),
  icon("user-circle", "People", "profile account avatar", { s: [RING], k: [c(12, 10, 3), "M6.5 18.2c1.3-1.9 3.2-2.9 5.5-2.9s4.2 1 5.5 2.9"] }),
  icon("frown", "People", "sad emoji unhappy", { s: [RING], k: ["M8.5 16a4 4 0 0 1 7 0", dot(9, 9.5), dot(15, 9.5)] }),
  icon("meh", "People", "neutral emoji face", { s: [RING], k: ["M9 15h6", dot(9, 9.5), dot(15, 9.5)] }),
  icon("laugh", "People", "happy emoji joy", { s: [RING], k: ["M7.5 13h9a4.5 4.5 0 0 1-9 0Z", "M8 9.5l1.5-1 1.5 1", "m13 9.5 1.5-1 1.5 1"] }),
  icon("hand", "People", "wave stop palm hi", { s: ["M8 12V5.5a1.5 1.5 0 0 1 3 0V11V4a1.5 1.5 0 0 1 3 0v7V5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-4.8-2.4L3.5 15.6a1.5 1.5 0 0 1 2.3-1.9L8 15.5Z"] }),
  icon("id-card", "People", "identity badge license", { s: [rect(2.5, 5, 19, 14, 3)], k: [c(8.5, 11, 2), "M5.8 16a3 3 0 0 1 5.4 0", "M14 10h4", "M14 13.5h3"] }),
  icon("graduation-cap", "People", "school education student", { s: [poly([[12, 4], [22, 9], [12, 14], [2, 9]], 1.2)], l: ["M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5", "M21 9.5v5"] }),

  // Objects
  icon("feather", "Objects", "write light quill", { s: ["M20 4C12 4 6 9 6 17v3h3c8 0 11-6 11-16Z"], l: ["M14 10 3 21"], k: ["M10 14h6"] }),
  icon("glasses", "Objects", "read vision spectacles", { s: [c(6.5, 14, 3.5), c(17.5, 14, 3.5)], l: ["M10 13.5a2 2 0 0 1 4 0", "M3 14 4.5 7.5", "M21 14l-1.5-6.5"] }),
  icon("hourglass", "Objects", "time wait loading", { s: ["M6.5 3h11v3.5a5.5 5.5 0 0 1-5.5 5.5 5.5 5.5 0 0 1 5.5 5.5V21h-11v-3.5A5.5 5.5 0 0 1 12 12a5.5 5.5 0 0 1-5.5-5.5Z"], l: ["M5 3h14", "M5 21h14"], k: ["M9 18h6"] }),
  icon("alarm-clock", "Objects", "wake time morning", { s: [c(12, 13, 7.5)], l: ["M4 4.5 2.5 6", "M20 4.5 21.5 6", "m6 19.5-1.5 1.5", "m18 19.5 1.5 1.5"], k: ["M12 9.5V13l2.5 1.5"] }),
  icon("timer", "Objects", "stopwatch countdown", { s: [c(12, 13.5, 7.5)], l: ["M10 2.5h4", "M12 2.5V6", "m18.5 7 1.5-1.5"], k: ["M12 13.5 15 10.5"] }),
  icon("magnet", "Objects", "attract pull", { s: ["M5 4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v8a2 2 0 0 0 4 0V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v8a7 7 0 0 1-14 0Z"], k: ["M5.5 7.5h4", "M14.5 7.5h4"] }),
  icon("wrench", "Objects", "tool settings fix repair", { s: ["M15.5 3.5a5 5 0 0 0-4.6 6.9L4 17.3a2.1 2.1 0 0 0 3 3l6.9-6.9a5 5 0 0 0 6.6-4.9l-3 3-3-1-1-3 3-3Z"] }),
  icon("dice", "Objects", "game random chance", { s: [rect(3.5, 3.5, 17, 17, 4)], k: [dot(8, 8), dot(16, 8), dot(12, 12), dot(8, 16), dot(16, 16)] }),
  icon("balloon", "Objects", "party birthday celebrate", { s: ["M12 3a6 6 0 0 1 6 6c0 4-3 7.5-6 7.5S6 13 6 9a6 6 0 0 1 6-6Z"], l: ["M12 16.5c-1 1.5 1 2.5 0 4.5"], k: ["M9 8a3 3 0 0 1 2-2"] }),
  icon("medal", "Objects", "award prize achievement", { s: [c(12, 15, 5.5)], l: ["M8.5 10.7 5.5 3h4l2.5 5", "m15.5 10.7 3-7.7h-4l-1.4 3.5"], k: [sparkle(12, 15, 2.3)] }),
  icon("shirt", "Objects", "clothes fashion tshirt", { s: [poly([[8.5, 3.5], [3, 6.5], [4.5, 11], [7, 10], [7, 20.5], [17, 20.5], [17, 10], [19.5, 11], [21, 6.5], [15.5, 3.5]], 1.2)], k: ["M9 4a3 3 0 0 0 6 0"] }),
  icon("lamp", "Objects", "light desk home", { s: [poly([[8, 3], [16, 3], [19, 11], [5, 11]], 1.2)], l: ["M12 11v9", "M8 20.5h8"] }),
  icon("plant", "Objects", "pot nature home", { s: ["M7 14h10l-1.2 5.8a1.5 1.5 0 0 1-1.5 1.2H9.7a1.5 1.5 0 0 1-1.5-1.2Z", "M12 9C12 5.5 10 3.5 6.5 3.5 6.5 7 8.5 9 12 9Z", "M12 9c0-3 1.8-4.8 5-4.8 0 3-1.8 4.8-5 4.8Z"], l: ["M12 14V9"] }),
];
