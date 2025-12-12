// @ts-nocheck
"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface DistributionData {
    name: string
    value: number
    color: string
}

interface DistributionPieChartProps {
    data: DistributionData[]
    title?: string
}

export function DistributionPieChart({ data, title }: DistributionPieChartProps) {
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
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
                        ))}
                    </Pie>
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
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: "20px" }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
