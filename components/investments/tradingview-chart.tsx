'use client';

import { useEffect, useRef, memo } from 'react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

function TradingViewChartInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    const container = containerRef.current;
    if (!mounted || !container) return;

    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: 'FOREXCOM:SPXUSD',
      interval: 'D',
      theme: resolvedTheme,
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      hide_side_toolbar: false,
      withdateranges: true,
      width: '100%',
      height: 400,
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [mounted, resolvedTheme]);

  if (!mounted) return null;

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      style={{ height: '400px', width: '100%' }}
    />
  );
}

export const TradingViewChart = memo(TradingViewChartInner);
