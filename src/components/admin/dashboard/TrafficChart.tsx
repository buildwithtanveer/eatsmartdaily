"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ChartData = {
  name: string;
  date: string;
  visits: number;
  pageViews: number;
};

export default function TrafficChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [days]);

  return (
    <div className="bg-white p-0 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 className="font-bold text-gray-900 text-lg">Traffic Overview</h3>
        <select 
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <option value={30}>Last 30 Days</option>
          <option value={7}>Last 7 Days</option>
          <option value={90}>Last 3 Months</option>
        </select>
      </div>
      <div className="p-6 flex-1 min-h-[300px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }}
                dy={15}
                interval={days > 14 ? 2 : 0} // Skip labels if many data points
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                dx={-10}
              />
              <Tooltip
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "1px solid #f3f4f6", 
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "12px"
                }}
                itemStyle={{ fontSize: "12px", fontWeight: 600, padding: "2px 0" }}
                labelStyle={{ color: "#6b7280", fontSize: "12px", marginBottom: "8px" }}
                cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0 && payload[0].payload) {
                    return `${payload[0].payload.date} (${label})`;
                  }
                  return label;
                }}
              />
              <Legend
                 wrapperStyle={{ paddingTop: "20px" }}
                 iconType="circle"
                 iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="visits"
                name="Visits"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#0ea5e9" }}
              />
              <Line
                type="monotone"
                dataKey="pageViews"
                name="Page Views"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
