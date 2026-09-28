"use client";

import { Title } from "../../demo-kit";
import { StaggeredMenu } from "./staggered-menu";

const items = [
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#studio" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];
const socials = [
  { label: "Instagram", href: "#instagram" },
  { label: "Dribbble", href: "#dribbble" },
  { label: "LinkedIn", href: "#linkedin" },
];

export default function Demo(p: Record<string, unknown>) {
  return (
    <>
      <Title>Open the menu</Title>
      <StaggeredMenu
        items={items}
        socials={socials}
        logo={
          <span>
            forma<span style={{ color: "#c6ff3d" }}>.</span>
          </span>
        }
        {...p}
        position="absolute"
      />
    </>
  );
}
