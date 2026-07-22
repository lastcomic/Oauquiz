"use client";

import { useEffect, useState } from "react";

/**
 * The OAU seal. Renders a clean inline SVG seal by default, and upgrades
 * to your real artwork at /oau-seal.png automatically if that file exists
 * (drop your seal PNG into /public/oau-seal.png — no code change needed).
 */
export default function OauSeal({ size = 96 }: { size?: number }) {
  const [imgOk, setImgOk] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth > 1) setImgOk(true);
    };
    img.src = "/oau-seal.png";
  }, []);

  if (imgOk) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/oau-seal.png"
        alt="Old Age University seal"
        width={size}
        height={size}
        style={{ display: "block", borderRadius: "50%" }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Old Age University seal"
      style={{ display: "block" }}
    >
      <defs>
        <path id="oau-arc-top" d="M 16 52 A 34 34 0 0 1 84 52" fill="none" />
        <path id="oau-arc-bot" d="M 84 50 A 34 34 0 0 1 16 50" fill="none" />
      </defs>
      <circle cx="50" cy="50" r="48" fill="#1b2a47" stroke="#c9a961" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="#c9a961" strokeWidth="0.6" opacity="0.7" />
      <text
        fill="#e8dcc4"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="7.2"
        letterSpacing="1.6"
        fontWeight="600"
      >
        <textPath href="#oau-arc-top" startOffset="50%" textAnchor="middle">
          OLD AGE UNIVERSITY
        </textPath>
      </text>
      <text
        fill="#c9a961"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="5.4"
        letterSpacing="2.4"
      >
        <textPath href="#oau-arc-bot" startOffset="50%" textAnchor="middle">
          VERITAS · WISDOM · KNOWLEDGE
        </textPath>
      </text>

      {/* Center emblem: bird on a stool (minimal line motif) */}
      <g stroke="#c9a961" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* stool seat */}
        <ellipse cx="50" cy="58" rx="11" ry="2.6" />
        {/* stool legs */}
        <line x1="42" y1="59" x2="39" y2="70" />
        <line x1="58" y1="59" x2="61" y2="70" />
        <line x1="50" y1="60" x2="50" y2="70" />
        <line x1="41" y1="65" x2="59" y2="65" />
      </g>
      <g fill="#c9a961" stroke="none">
        {/* bird body */}
        <ellipse cx="49" cy="47" rx="7.5" ry="5" transform="rotate(-12 49 47)" />
        {/* head */}
        <circle cx="55" cy="41.5" r="3.4" />
        {/* crest (cardinal peak) */}
        <path d="M 55 38 L 57 34 L 58.5 38 Z" />
        {/* beak */}
        <path d="M 58 41.5 L 61.5 42.3 L 58 43.2 Z" />
        {/* tail */}
        <path d="M 42 49 L 34 53 L 43 51 Z" transform="rotate(-6 42 49)" />
        {/* legs to stool */}
      </g>
      <g stroke="#1b2a47" strokeWidth="1" strokeLinecap="round">
        <line x1="49" y1="52" x2="48" y2="56" />
        <line x1="52" y1="52" x2="53" y2="56" />
      </g>
      <circle cx="56.2" cy="41" r="0.7" fill="#1b2a47" />

      {/* est. + side dots */}
      <text x="50" y="79" fill="#c9a961" fontFamily="Georgia, serif" fontSize="5" letterSpacing="1.5" textAnchor="middle">
        EST. 2026
      </text>
      <circle cx="12.5" cy="50" r="1.1" fill="#c9a961" />
      <circle cx="87.5" cy="50" r="1.1" fill="#c9a961" />
    </svg>
  );
}
