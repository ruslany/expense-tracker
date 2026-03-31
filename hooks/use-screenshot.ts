'use client';

import * as React from 'react';

export function useScreenshot<T extends HTMLElement = HTMLDivElement>() {
  const ref = React.useRef<T>(null);

  async function handleScreenshot() {
    if (!ref.current) return;
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(ref.current, { pixelRatio: 2, style: { borderRadius: '0' } });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  }

  return { ref, handleScreenshot };
}
