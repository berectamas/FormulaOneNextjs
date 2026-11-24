'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const CanvasJSChart = dynamic(
  () => import('@canvasjs/react-charts').then((mod) => mod.default.CanvasJSChart),
  { ssr: false },
);

export default function MultilineChart({ data, height = 512 }) {
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(400);
  const isMobile = chartWidth < 640;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setChartWidth(Math.max(200, Math.floor(entry.contentRect.width)));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const options = {
    animationEnabled: true,
    theme: 'light2',
    title: {
      text: 'Pontok alakulása',
      fontSize: isMobile ? 16 : 24,
    },
    axisY: {
      title: isMobile ? '' : 'Érték',
    },
    axisX: {
      title: '',
      interval: 1,
      labelAngle: isMobile ? -90 : -45,
      labelFontSize: isMobile ? 10 : 12,
    },
    width: chartWidth,
    height: isMobile ? 320 : height,
    data,
    toolTip: {
      shared: true,
      contentFormatter: (e) => {
        let content = '<div>';

        // Kiírjuk az x értéket
        const xLabel = e.entries[0].dataPoint.label ?? `Race ${e.entries[0].dataPoint.x + 1}`;
        content += `<b>${xLabel}</b><br/>`;

        // Sorozatok csökkenő sorrendben az y érték szerint
        const sortedEntries = [...e.entries].sort(
          (a, b) => (b.dataPoint.y ?? 0) - (a.dataPoint.y ?? 0),
        );

        sortedEntries.forEach((entry) => {
          const y = entry.dataPoint.y;
          if (y != null) {
            // csak ha van érték
            const color = entry.dataSeries.color;
            content += `<span style="color: ${color}">${entry.dataSeries.name}: ${y}</span><br/>`;
          }
        });

        content += '</div>';
        return content;
      },
    },
    legend: {
      cursor: 'pointer',
      verticalAlign: 'bottom',
      horizontalAlign: 'center',
      fontSize: isMobile ? 11 : 14,
      itemclick: (e) => {
        e.dataSeries.visible = !e.dataSeries.visible;
        e.chart.render();
      },
    },
  };

  return (
    <div ref={containerRef} className="w-full min-w-0 overflow-hidden">
      <CanvasJSChart options={options} />
    </div>
  );
}
