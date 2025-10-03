'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const CanvasJSChart = dynamic(
  () => import('@canvasjs/react-charts').then((mod) => mod.default.CanvasJSChart),
  { ssr: false },
);

export default function MultilineChart({ data, height = '100%' }) {
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(400);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const options = {
    animationEnabled: true,
    theme: 'light2',
    title: {
      text: 'Egyszerű Multiline Chart',
    },
    axisY: {
      title: 'Érték',
    },
    axisX: {
      title: '',
      interval: 1,
    },
    width: chartWidth,
    height,
    data,
    toolTip: {
      shared: true,
      contentFormatter: (e) => {
        let content = '<div>';

        // Kiírjuk az x értéket
        const xLabel = e.entries[0].dataPoint.label ?? `Race ${e.entries[0].dataPoint.x + 1}`;
        content += `<b>${xLabel}</b><br/>`;

        // Sorozatok csökkenő sorrendben a y érték szerint
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
      itemclick: (e) => {
        e.dataSeries.visible = !e.dataSeries.visible;
        e.chart.render();
      },
    },
  };

  if (!CanvasJSChart) return null;

  return (
    <div ref={containerRef} className="w-full">
      <CanvasJSChart options={options} />
    </div>
  );
}
