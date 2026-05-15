import { useMemo } from "react";
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getChartData } from "../../utils/accountingUtils";
import { FiBarChart2, FiClock, FiLayers } from "react-icons/fi";

interface Props {
    orders: any[];
}

export default function AnalyticsSection({ orders }: Props) {
    const { t } = useTranslation();
    const data = useMemo(() => getChartData(orders), [orders]);

    const COLORS = ['#5A3E2B', '#58755A', '#F59E0B', '#10B981']; // Primary, Secondary, Amber, Emerald

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 my-12">

            {/* Sales Trend Line Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white shadow-soft flex flex-col gap-10 group hover:shadow-premium transition-all duration-700"
            >
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-[11px] font-black text-(--color-primary)/40 uppercase tracking-[0.3em]">{t('admin.sales_trend') || "اتجاه المبيعات (7 أيام)"}</h3>
                    <div className="w-12 h-12 rounded-2xl bg-(--color-primary)/5 text-(--color-primary) flex items-center justify-center shadow-inner border border-(--color-primary)/5">
                        <FiBarChart2 size={24} />
                    </div>
                </div>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.dailyTrend}>
                            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="var(--color-primary)" strokeOpacity={0.05} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: 'var(--color-primary)', opacity: 0.3 }} dy={15} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: 'var(--color-primary)', opacity: 0.3 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', fontWeight: '900', padding: '20px', color: 'var(--color-primary)' }}
                                labelStyle={{ color: 'var(--color-primary)', opacity: 0.4, marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}
                                cursor={{ stroke: 'var(--color-primary)', strokeWidth: 2, strokeDasharray: '8 8', strokeOpacity: 0.2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="var(--color-primary)"
                                strokeWidth={6}
                                dot={{ fill: 'var(--color-primary)', strokeWidth: 3, r: 6, stroke: '#fff' }}
                                activeDot={{ r: 10, strokeWidth: 4, stroke: '#fff' }}
                                animationDuration={2000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Hourly Sales Bar Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white shadow-soft flex flex-col gap-10 group hover:shadow-premium transition-all duration-700"
            >
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-[11px] font-black text-(--color-primary)/40 uppercase tracking-[0.3em]">{t('admin.peak_hours') || "ساعات الذروة اليوم"}</h3>
                    <div className="w-12 h-12 rounded-2xl bg-(--color-secondary)/5 text-(--color-secondary) flex items-center justify-center shadow-inner border border-(--color-secondary)/5">
                        <FiClock size={24} />
                    </div>
                </div>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.hourly}>
                            <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="var(--color-primary)" strokeOpacity={0.05} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: '900', fill: 'var(--color-primary)', opacity: 0.3 }} dy={15} />
                            <Tooltip
                                cursor={{ fill: 'var(--color-primary)', fillOpacity: 0.03 }}
                                contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', fontWeight: '900', padding: '20px', color: 'var(--color-primary)' }}
                            />
                            <Bar dataKey="value" fill="var(--color-secondary)" radius={[10, 10, 10, 10]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Order Distribution Pie Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white shadow-soft flex flex-col items-center gap-12 group hover:shadow-premium transition-all lg:col-span-2 duration-700"
            >
                <div className="w-full flex justify-between items-center px-4">
                    <h3 className="text-[11px] font-black text-(--color-primary)/40 uppercase tracking-[0.3em]">{t('admin.order_distribution') || "توزيع الطلبات"}</h3>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/5 text-amber-500 flex items-center justify-center shadow-inner border border-amber-500/5">
                        <FiLayers size={24} />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center w-full gap-12">
                    <div className="h-72 w-full md:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {data.distribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', fontWeight: '900', padding: '20px', color: 'var(--color-primary)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-10 md:w-1/2">
                        {data.distribution.map((entry, index) => (
                            <div key={entry.name} className="flex flex-col gap-3 p-6 rounded-[2rem] bg-(--color-primary)/5 border border-transparent transition-all hover:bg-white hover:shadow-soft hover:border-(--color-primary)/5 group/item">
                                <div className="flex items-center gap-4">
                                    <div className="w-5 h-5 rounded-full shadow-lg group-hover/item:scale-125 transition-transform" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-[10px] font-black text-(--color-primary)/40 uppercase tracking-[0.2em]">{entry.name}</span>
                                </div>
                                <div className="text-3xl font-black text-(--color-primary) tracking-tighter">{entry.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
