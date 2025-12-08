"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface TrendData {
    date: string
    amount: number
    [key: string]: any
}

interface TrendChartProps {
    data: TrendData[]
    title?: string
    color?: string
}

export function TrendChart({ data, title, color = "#8b5cf6" }: TrendChartProps) {
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

    return (
        <div className="w-full h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value >= 1000 ? `${value / 1000}k` : value}`}
                    />
                    <Tooltip
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
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke={color}
                        fillOpacity={1}
                        fill={`url(#gradient-${color})`}
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
