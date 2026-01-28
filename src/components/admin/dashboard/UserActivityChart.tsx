"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Desktop", value: 60, color: "#568c2c" },
  { name: "Mobile", value: 30, color: "#0ea5e9" },
  { name: "Tablet", value: 10, color: "#38bdf8" },
];

export default function UserActivityChart() {
  return (
    <div className="bg-white p-0 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-white">
        <h3 className="font-bold text-gray-900 text-lg">User Activity</h3>
      </div>
      <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
        <div className="h-[250px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                cornerRadius={5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "1px solid #f3f4f6", 
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "8px 12px"
                }}
                itemStyle={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-3xl font-bold text-gray-900">100%</span>
             <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-2">
           {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2.5">
                 <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                 <span className="text-sm text-gray-600 font-medium">{item.name} <span className="text-gray-900 font-bold ml-1">{item.value}%</span></span>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
