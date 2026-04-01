/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const CHART_OPTIONS = [
  {
    value: "performanceTrend",
    label: "Performance Trend",
    description: "Score progression across attempts or students",
  },
  {
    value: "scoreDistribution",
    label: "Score Distribution",
    description: "Grouped score spread for the current exam",
  },
];

const tooltipLabelClassName = "mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500";

const CustomTooltip = ({ active, payload, label, chartType }) => {
  if (!active || !payload?.length) return null;

  const datum = payload[0]?.payload || {};
  const title = chartType === "performanceTrend" ? label || datum.label : datum.range || label;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className={tooltipLabelClassName}>{title}</p>
      {chartType === "performanceTrend" ? (
        <p className="text-sm font-semibold text-gray-900">{datum.score ?? 0}% score</p>
      ) : (
        <p className="text-sm font-semibold text-gray-900">{datum.count ?? 0} students</p>
      )}
    </div>
  );
};

const EmptyChartState = ({ label }) => (
  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 text-center">
    <div>
      <p className="text-sm font-semibold text-gray-700">No {label.toLowerCase()} data available</p>
      <p className="mt-1 text-sm text-gray-500">Data will appear here once exam analytics are ready.</p>
    </div>
  </div>
);

const CombinedChartCard = ({
  performanceTrendData = [],
  scoreDistributionData = [],
  defaultChart = "performanceTrend",
}) => {
  const [selectedChart, setSelectedChart] = useState(defaultChart);

  const activeOption = useMemo(
    () => CHART_OPTIONS.find((option) => option.value === selectedChart) || CHART_OPTIONS[0],
    [selectedChart]
  );

  const activeData = selectedChart === "performanceTrend" ? performanceTrendData : scoreDistributionData;

  const hasData = activeData.length > 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{activeOption.label}</h2>
          <p className="mt-1 text-sm text-gray-500">{activeOption.description}</p>
        </div>

        <div className="relative shrink-0">
          <select
            value={selectedChart}
            onChange={(event) => setSelectedChart(event.target.value)}
            className="min-w-[220px] appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
            aria-label="Select chart type"
          >
            {CHART_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="mt-5 h-[320px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedChart}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-full"
          >
            {!hasData ? (
              <EmptyChartState label={activeOption.label} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {selectedChart === "performanceTrend" ? (
                  <LineChart data={performanceTrendData} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="label"
                      stroke="#6B7280"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={56}
                    />
                    <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip chartType="performanceTrend" />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0F766E"
                      strokeWidth={3}
                      dot={{ r: 3.5, fill: "#0F766E", stroke: "#FFFFFF", strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: "#115E59", stroke: "#FFFFFF", strokeWidth: 2 }}
                      animationDuration={300}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={scoreDistributionData} margin={{ top: 8, right: 12, left: -20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="range" stroke="#6B7280" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip chartType="scoreDistribution" />} />
                    <Bar
                      dataKey="count"
                      fill="#0F766E"
                      radius={[8, 8, 0, 0]}
                      animationDuration={300}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CombinedChartCard;
