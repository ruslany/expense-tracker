'use client';

import * as React from 'react';

export function useScreenshot<T extends HTMLElement = HTMLDivElement>() {
  const ref = React.useRef<T>(null);

  async function handleScreenshot() {
    if (!ref.current) return;
    const { toPng } = await import('html-to-image');

    const node = ref.current;
    const elements = [node, ...Array.from(node.querySelectorAll('*'))] as HTMLElement[];
    const saved = elements.map((el) => ({ el, overflow: el.style.overflow }));
    elements.forEach((el) => {
      const computed = window.getComputedStyle(el);
      if (
        computed.overflow === 'auto' ||
        computed.overflow === 'scroll' ||
        computed.overflowX === 'auto' ||
        computed.overflowX === 'scroll' ||
        computed.overflowY === 'auto' ||
        computed.overflowY === 'scroll'
      ) {
        el.style.overflow = 'visible';
      }
    });

    try {
      const dataUrl = await toPng(node, { pixelRatio: 2, style: { borderRadius: '0' } });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } finally {
      saved.forEach(({ el, overflow }) => {
        el.style.overflow = overflow;
      });
    }
  }

  return { ref, handleScreenshot };
}
