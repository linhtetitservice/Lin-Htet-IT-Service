import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, CheckCircle2, Calendar, BarChart3, PieChart as PieIcon } from 'lucide-react';

interface OrderTrendsChartProps {
  orders: Order[];
}

export const OrderTrendsChart: React.FC<OrderTrendsChartProps> = ({ orders }) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly'>('daily');
  const [metricView, setMetricView] = useState<'volume' | 'revenue'>('volume');

  // Key Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
    const completedOrders = orders.filter(o => o.status === 'paid' || o.status === 'delivered').length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return { totalOrders, totalRevenue, completedOrders, avgOrderValue };
  }, [orders]);

  // Aggregate Daily / Weekly Trend Data
  const trendData = useMemo(() => {
    if (timeframe === 'daily') {
      // Last 7 days
      const days: { [key: string]: { date: string; label: string; orders: number; revenue: number; paid: number; newOrders: number } } = {};
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const dayNames = ['နင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
        const dayLabel = `${d.getDate()}/${d.getMonth() + 1} (${dayNames[d.getDay()]})`;
        days[key] = { date: key, label: dayLabel, orders: 0, revenue: 0, paid: 0, newOrders: 0 };
      }

      orders.forEach(o => {
        const orderDate = new Date(o.created_at).toISOString().split('T')[0];
        if (days[orderDate]) {
          days[orderDate].orders += 1;
          days[orderDate].revenue += o.total;
          if (o.status === 'paid' || o.status === 'delivered') {
            days[orderDate].paid += 1;
          } else if (o.status === 'new') {
            days[orderDate].newOrders += 1;
          }
        }
      });

      return Object.values(days);
    } else {
      // Last 6 weeks
      const weeks: { [key: string]: { date: string; label: string; orders: number; revenue: number; paid: number; newOrders: number } } = {};

      for (let i = 5; i >= 0; i--) {
        const start = new Date();
        start.setDate(start.getDate() - (i * 7 + 6));
        const end = new Date();
        end.setDate(end.getDate() - (i * 7));

        const key = `week-${5 - i}`;
        const label = i === 0 ? 'ယခုအပတ် (This Week)' : `${5 - i + 1} ပတ်အလို`;
        weeks[key] = { date: key, label, orders: 0, revenue: 0, paid: 0, newOrders: 0 };
      }

      orders.forEach(o => {
        const oTime = new Date(o.created_at).getTime();
        const now = Date.now();
        const diffDays = Math.floor((now - oTime) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.min(5, Math.floor(diffDays / 7));
        const key = `week-${5 - weekIndex}`;
        if (weeks[key]) {
          weeks[key].orders += 1;
          weeks[key].revenue += o.total;
          if (o.status === 'paid' || o.status === 'delivered') {
            weeks[key].paid += 1;
          } else if (o.status === 'new') {
            weeks[key].newOrders += 1;
          }
        }
      });

      return Object.values(weeks);
    }
  }, [orders, timeframe]);

  // Status Distribution for Pie Chart
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { new: 0, paid: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });

    return [
      { name: 'အသစ် (New)', value: counts.new, color: '#ef4444' },
      { name: 'ငွေစစ်ပြီး (Paid)', value: counts.paid, color: '#10b981' },
      { name: 'ပို့ဆောင်ပြီး (Delivered)', value: counts.delivered, color: '#3b82f6' },
      { name: 'ပယ်ဖျက် (Cancelled)', value: counts.cancelled, color: '#9ca3af' },
    ].filter(item => item.value > 0);
  }, [orders]);

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl border border-[#e6d8c8] shadow-lg text-xs space-y-1">
          <p className="font-bold text-[#6b4226] border-b border-[#f2e8dc] pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="font-medium flex justify-between gap-4">
              <span>{entry.name}:</span>
              <b className="font-mono">
                {entry.dataKey === 'revenue'
                  ? `${entry.value.toLocaleString()} Ks`
                  : `${entry.value} စောင်`}
              </b>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-white p-4 rounded-2xl border border-[#e6d8c8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 block">စုစုပေါင်း အော်ဒါ</span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#6b4226]">
              {summaryMetrics.totalOrders.toLocaleString()} <span className="text-xs font-normal text-stone-600">စောင်</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f7f0e8] text-[#6b4226] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-[#e6d8c8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 block">စုစုပေါင်း ရောင်းရငွေ</span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#6b4226]">
              {summaryMetrics.totalRevenue.toLocaleString()} <span className="text-xs font-normal text-stone-600">Ks</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Paid / Completed Orders */}
        <div className="bg-white p-4 rounded-2xl border border-[#e6d8c8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 block">အတည်ပြုပြီး အော်ဒါ</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-700">
              {summaryMetrics.completedOrders.toLocaleString()} <span className="text-xs font-normal text-stone-600">စောင်</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-4 rounded-2xl border border-[#e6d8c8] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 block">ပျမ်းမျှ အော်ဒါတန်ဖိုး</span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#6b4226]">
              {summaryMetrics.avgOrderValue.toLocaleString()} <span className="text-xs font-normal text-stone-600">Ks</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Chart Controls & Filter */}
      <div className="bg-white rounded-2xl border border-[#e6d8c8] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#f2e8dc] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f7f0e8] text-[#6b4226] flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#6b4226]">
                အော်ဒါ Trend & ဝင်ငွေ စာရင်းဇယား
              </h3>
              <p className="text-xs text-stone-500">
                အချိန်ကာလအလိုက် အော်ဒါအရေအတွက်နှင့် ဝင်ငွေတိုးတက်မှု အခြေအနေ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Volume vs Revenue Metric Toggle */}
            <div className="bg-[#f7f0e8] p-1 rounded-xl flex items-center gap-1 border border-[#ebdccd]">
              <button
                type="button"
                onClick={() => setMetricView('volume')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  metricView === 'volume'
                    ? 'bg-[#6b4226] text-white shadow-xs'
                    : 'text-[#6b4226] hover:bg-white/60'
                }`}
              >
                အော်ဒါ အရေအတွက်
              </button>
              <button
                type="button"
                onClick={() => setMetricView('revenue')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  metricView === 'revenue'
                    ? 'bg-[#6b4226] text-white shadow-xs'
                    : 'text-[#6b4226] hover:bg-white/60'
                }`}
              >
                ရောင်းရငွေ (Ks)
              </button>
            </div>

            {/* Timeframe Toggle (Daily / Weekly) */}
            <div className="bg-white border border-[#d9c4b3] p-1 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTimeframe('daily')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === 'daily'
                    ? 'bg-stone-800 text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                နေ့စဉ် (Daily)
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('weekly')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === 'weekly'
                    ? 'bg-stone-800 text-white shadow-2xs font-bold'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                အပတ်စဉ် (Weekly)
              </button>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="h-72 sm:h-80 w-full pt-2">
          {metricView === 'volume' ? (
            /* Bar Chart for Order Volume */
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebdccd" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                />
                <Bar
                  dataKey="orders"
                  name="စုစုပေါင်း အော်ဒါ"
                  fill="#6b4226"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
                <Bar
                  dataKey="paid"
                  name="အတည်ပြုပြီး (Paid)"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            /* Area Chart for Revenue Trend */
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b4226" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6b4226" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebdccd" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <YAxis
                  tickFormatter={value => `${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e7e5e4' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="ရောင်းရငွေ (Ks)"
                  stroke="#6b4226"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Status Breakdown & Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-2xl border border-[#e6d8c8] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-[#6b4226] flex items-center gap-1.5 mb-1">
              <PieIcon className="w-4 h-4" />
              <span>အော်ဒါ အခြေအနေ ခွဲခြမ်းစိတ်ဖြာမှု</span>
            </h4>
            <p className="text-xs text-stone-500">လက်ရှိအော်ဒါများ၏ Status အချိုးအစား</p>
          </div>

          <div className="h-48 w-full my-2">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} စောင်`, name]}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px', border: '1px solid #e6d8c8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                အချက်အလက် မရှိသေးပါ
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#f2e8dc]">
            {statusData.map(st => (
              <div key={st.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }}></span>
                <span className="text-stone-600 truncate">{st.name}:</span>
                <b className="font-mono text-stone-800">{st.value}</b>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights Card */}
        <div className="md:col-span-2 bg-[#fcfaf7] rounded-2xl border border-[#ebdccd] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-bold text-sm text-[#6b4226] flex items-center gap-1.5 mb-1">
              <Calendar className="w-4 h-4" />
              <span>အကျဉ်းချုပ် သုံးသပ်ချက် (Business Insights)</span>
            </h4>
            <p className="text-xs text-stone-500">ဆိုင်၏ လတ်တလော စွမ်းဆောင်ရည်နှင့် အရောင်းဆိုင်ရာ အချက်များ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-[#e6d8c8] space-y-1">
              <span className="text-stone-500 font-medium">ငွေလွှဲစစ်ဆေးမှုနှုန်း (Conversion Rate):</span>
              <p className="text-base font-extrabold text-emerald-700">
                {summaryMetrics.totalOrders > 0
                  ? `${Math.round((summaryMetrics.completedOrders / summaryMetrics.totalOrders) * 100)}%`
                  : '0%'}
              </p>
              <p className="text-[11px] text-stone-500">
                အော်ဒါများအနက် အောင်မြင်စွာ ငွေလွှဲပြီး Download Link ရယူပြီးသော ရာခိုင်နှုန်း
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#e6d8c8] space-y-1">
              <span className="text-stone-500 font-medium">စစ်ဆေးရန်ကျန် အော်ဒါ (Pending Reviews):</span>
              <p className="text-base font-extrabold text-amber-700">
                {orders.filter(o => o.status === 'new').length} စောင်
              </p>
              <p className="text-[11px] text-stone-500">
                ငွေလွှဲပြေစာ (Slip) စစ်ဆေးပြီး 'paid' ပြောင်းပေးရန် လိုအပ်နေသော အော်ဒါများ
              </p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed">
            💡 <b>အကြံပြုချက်:</b> အော်ဒါများကို Status ပြောင်းပေးသည့်အခါ ဝယ်ယူသူများ၏ ဆိုင်ရှေ့မျက်နှာပြင်တွင် Toast Notification ဖြင့် ချက်ချင်း အသိပေးသွားမည်ဖြစ်ပြီး Download Link ကို ဖွင့်ပေးပါမည်။
          </div>
        </div>
      </div>
    </div>
  );
};
