import { useId, type SVGProps } from "react";

/** Glint Bot in 2D: the site logo (same art as src/app/icon.svg). */
export function Logo(props: SVGProps<SVGSVGElement>) {
  const clip = `glint-logo-${useId()}`;
  return (
    <svg viewBox="0 0 32 32" aria-hidden {...props}>
      <defs>
        <clipPath id={clip}>
          <rect x="2" y="2" width="28" height="28" rx="7" />
        </clipPath>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="7" fill="#b5e61d" />
      <rect x="2" y="5.5" width="28" height="3.2" fill="#f4b860" clipPath={`url(#${clip})`} />
      <rect x="6.5" y="11.5" width="19" height="14.5" rx="3.5" fill="#f4efdf" />
      <rect x="11" y="14.6" width="2.6" height="4.6" rx="1.3" fill="#1c2410" />
      <rect x="18.4" y="14.6" width="2.6" height="4.6" rx="1.3" fill="#1c2410" />
      <path d="M13.8 21.4q2.2 1.9 4.4 0" fill="none" stroke="#1c2410" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

export function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"
      />
    </svg>
  );
}
