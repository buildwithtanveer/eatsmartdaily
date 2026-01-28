"use client";

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

const data = [
  { name: "Monday", visits: 24000, pageViews: 20000 },
  { name: "Tuesday", visits: 28000, pageViews: 21000 },
  { name: "Wednesday", visits: 32000, pageViews: 26000 },
  { name: "Thursday", visits: 36000, pageViews: 29000 },
  { name: "Friday", visits: 27000, pageViews: 21000 },
  { name: "Saturday", visits: 29000, pageViews: 25000 },
  { name: "Sunday", visits: 32000, pageViews: 24000 },
  { name: "Monday", visits: 32000, pageViews: 27000 },
  { name: "Tuesday", visits: 36000, pageViews: 30000 },
  { name: "Wednesday", visits: 31000, pageViews: 27000 },
  { name: "Thursday", visits: 34000, pageViews: 31000 },
  { name: "Friday", visits: 38000, pageViews: 35000 },
  { name: "Sunday", visits: 45000, pageViews: 37000 },
];

export default function TrafficChart() {
  return (
    <div className="bg-white p-0 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 className="font-bold text-gray-900 text-lg">Traffic Overview</h3>
        <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-black/5 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
        </select>
      </div>
      <div className="p-6 flex-1 min-h-[300px]">
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
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => `${value / 1000}k`}
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
      </div>
    </div>
  );
}
