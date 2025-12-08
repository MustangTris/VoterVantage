"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface SourceData {
    name: string
    value: number
    color: string
    [key: string]: any
}

interface SourceBreakdownChartProps {
    data: SourceData[]
}

export function SourceBreakdownChart({ data }: SourceBreakdownChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center bg-white/5 rounded-lg border border-white/5">
                <div className="text-center text-slate-500">
                    <p className="text-lg font-medium">No Data Available</p>
                    <p className="text-sm">No contributions recorded.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-[300px]">
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
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
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
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
