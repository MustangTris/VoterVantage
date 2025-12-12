"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"

interface CategoryData {
    name: string
    value: number
    color?: string
}

interface CategoryBarChartProps {
    data: CategoryData[]
    title?: string
    color?: string
}

export function CategoryBarChart({ data, title, color = "#8b5cf6" }: CategoryBarChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center bg-white/5 rounded-lg border border-white/5">
                <div className="text-center text-slate-500">
                    <p className="text-lg font-medium">No Data Available</p>
                    <p className="text-sm">Not enough data points yet.</p>
                </div>
            </div>
        )
    }

    // Sort data descending
    const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 10) // Top 10

    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={sortedData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 15)}...` : val}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            borderColor: "rgba(255, 255, 255, 0.1)",
                            color: "#fff",
                            borderRadius: "8px",
                            backdropFilter: "blur(4px)"
                        }}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, title || "Amount"]}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {sortedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
