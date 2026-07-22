"use client";

import { useEffect, useState } from "react";

/**
 * Renders an image from /public only if the file actually exists (probed
 * client-side). Until the file is added, it renders `fallback` (default
 * nothing), so an un-uploaded asset never shows a broken image.
 *
 * Drop the matching file into /public and it appears automatically —
 * no code change or redeploy needed.
 */
export default function BrandImage({
  src,
  alt,
  maxHeight = 120,
  radius = 4,
  fallback = null,
}: {
  src: string;
  alt: string;
  maxHeight?: number;
  radius?: number;
  fallback?: React.ReactNode;
}) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth > 1) setOk(true);
    };
    img.src = src;
  }, [src]);

  if (!ok) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      style={{
        maxHeight,
        maxWidth: "100%",
        height: "auto",
        borderRadius: radius,
        display: "block",
      }}
    />
  );
}
