import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Loader2, X } from 'lucide-react';

Chart.register(...registerables);

const CHART_TYPES = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'pie', label: 'Pie' },
  { value: 'doughnut', label: 'Doughnut' },
];

const DEFAULT_LABELS = 'Q1\nQ2\nQ3\nQ4';
const DEFAULT_VALUES = '10\n14\n8\n17';

const splitInputLines = (value) =>
  String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const buildChartConfig = ({ chartType, chartTitle, labelsText, valuesText, color }) => {
  const labels = splitInputLines(labelsText);
  const values = splitInputLines(valuesText).map((value) => Number(value));

  if (!labels.length || !values.length || labels.length !== values.length || values.some((value) => Number.isNaN(value))) {
    return null;
  }

  return {
    type: chartType,
    data: {
      labels,
      datasets: [
        {
          label: chartTitle || 'Dataset',
          data: values,
          backgroundColor: chartType === 'line' ? `${color}33` : color,
          borderColor: color,
          borderWidth: 2,
          fill: chartType === 'line',
          tension: chartType === 'line' ? 0.35 : 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: chartType !== 'bar' && chartType !== 'line',
          position: 'bottom',
        },
        title: {
          display: Boolean(chartTitle),
          text: chartTitle || '',
          color: '#0f172a',
          font: {
            size: 16,
            weight: '600',
          },
        },
      },
      scales:
        chartType === 'pie' || chartType === 'doughnut'
          ? {}
          : {
              x: {
                ticks: { color: '#475569' },
                grid: { color: '#e2e8f0' },
              },
              y: {
                beginAtZero: true,
                ticks: { color: '#475569' },
                grid: { color: '#e2e8f0' },
              },
            },
    },
  };
};

const ChartInsertModal = ({ open, onClose, onInsert }) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [chartType, setChartType] = useState('bar');
  const [chartTitle, setChartTitle] = useState('Exam Performance');
  const [labelsText, setLabelsText] = useState(DEFAULT_LABELS);
  const [valuesText, setValuesText] = useState(DEFAULT_VALUES);
  const [color, setColor] = useState('#0f766e');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chartConfig = useMemo(
    () => buildChartConfig({ chartType, chartTitle, labelsText, valuesText, color }),
    [chartType, chartTitle, labelsText, valuesText, color],
  );

  useEffect(() => {
    if (!open || !canvasRef.current) return undefined;

    chartInstanceRef.current?.destroy();

    if (chartConfig) {
      chartInstanceRef.current = new Chart(canvasRef.current, chartConfig);
    }

    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, [open, chartConfig]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSubmitting, onClose, open]);

  if (!open) {
    return null;
  }

  const handleInsert = async () => {
    if (!chartConfig || !canvasRef.current) {
      return;
    }

    setIsSubmitting(true);
    try {
      const blob = await new Promise((resolve) => canvasRef.current.toBlob(resolve, 'image/png'));
      if (!blob) {
        throw new Error('Failed to generate chart image');
      }

      const safeTitle = (chartTitle || 'exam-chart').trim().replace(/\s+/g, '-').toLowerCase();
      const file = new File([blob], `${safeTitle}.png`, { type: 'image/png' });
      await onInsert(file);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-8 backdrop-blur-[2px]">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Insert Chart</h3>
            <p className="mt-1 text-sm text-slate-500">Create a chart and insert it into the document as a stable image.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-0 md:grid-cols-[340px_minmax(0,1fr)]">
          <div className="border-b border-slate-200 bg-slate-50 p-6 md:border-b-0 md:border-r">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Chart type</span>
                <select
                  value={chartType}
                  onChange={(event) => setChartType(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                >
                  {CHART_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Chart title</span>
                <input
                  type="text"
                  value={chartTitle}
                  onChange={(event) => setChartTitle(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                  placeholder="Exam Performance"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Labels</span>
                <textarea
                  value={labelsText}
                  onChange={(event) => setLabelsText(event.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                  placeholder="Q1&#10;Q2&#10;Q3"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Values</span>
                <textarea
                  value={valuesText}
                  onChange={(event) => setValuesText(event.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                  placeholder="10&#10;14&#10;8"
                />
              </label>

              <label className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Color</span>
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col bg-white">
            <div className="flex-1 p-6">
              <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {chartConfig ? (
                  <div className="h-[360px] w-full max-w-3xl rounded-xl bg-white p-4 shadow-sm">
                    <canvas ref={canvasRef} />
                  </div>
                ) : (
                  <div className="max-w-sm text-center text-sm leading-6 text-slate-500">
                    Enter matching labels and numeric values to preview the chart.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsert}
                disabled={!chartConfig || isSubmitting}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Insert Chart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartInsertModal;
