'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function ActivityChart({ data }) {
    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <div className="mb-4">
                <h3 className="font-semibold text-white">Monthly Activity</h3>
                <p className="text-sm text-gray-500">Your XP and questions over time</p>
            </div>

            <div className="h-64">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                        No activity yet
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#111827',
                                border: '1px solid #1f2937',
                                borderRadius: '12px',
                                padding: '12px',
                            }}
                            labelStyle={{ color: '#fff', marginBottom: '4px' }}
                            itemStyle={{ color: '#22c55e' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="xp"
                            stroke="#22c55e"
                            strokeWidth={2}
                            fill="url(#xpGradient)"
                            name="XP Earned"
                        />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               