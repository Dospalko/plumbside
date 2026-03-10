"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getJobs, getCustomers, Job, Customer } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Users, Clock, DollarSign } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (token) {
      getJobs(token).then(setJobs).catch(console.error);
      getCustomers(token).then(setCustomers).catch(console.error);
    }
  }, [token, isAuthenticated, isLoaded, router]);

  const newJobs = jobs.filter((j) => j.status === "new").length;
  const inProgress = jobs.filter((j) => j.status === "in_progress").length;
  const done = jobs.filter((j) => j.status === "done").length;
  const revenue = jobs.reduce((sum, j) => sum + (j.final_price || j.estimated_price || 0), 0);

  // --- Data processing for charts ---
  
  // 1. Jobs over the last 7 days (Bar Chart)
  const barData = useMemo(() => {
    const last7Days = Array.from({length: 12}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (11 - i));
      return d.toISOString().split('T')[0];
    });

    const counts = jobs.reduce((acc, job) => {
      const dateStr = new Date(job.created_at).toISOString().split('T')[0];
      if (acc[dateStr] !== undefined) {
        acc[dateStr] += 1;
      }
      return acc;
    }, last7Days.reduce((a, v) => ({ ...a, [v]: 0 }), {} as Record<string, number>));

    return last7Days.map(dateStr => {
      const d = new Date(dateStr);
      return {
        name: `${d.getDate()}.${d.getMonth() + 1}.`,
        Zákazky: counts[dateStr]
      };
    });
  }, [jobs]);

  // 2. Jobs by Status (Donut Chart)
  const donutData = useMemo(() => {
    const sc = { new: 0, triaged: 0, quoted: 0, scheduled: 0, in_progress: 0, done: 0, cancelled: 0 };
    jobs.forEach(j => {
      if (sc[j.status as keyof typeof sc] !== undefined) {
        sc[j.status as keyof typeof sc]++;
      }
    });
    
    return [
      { name: 'Nová', value: sc.new, color: '#3b82f6' },        // blue-500
      { name: 'Vyhodnotená', value: sc.triaged, color: '#8b5cf6' },// violet-500
      { name: 'Nacenená', value: sc.quoted, color: '#eab308' },  // yellow-500
      { name: 'Naplánovaná', value: sc.scheduled, color: '#f97316' },// orange-500
      { name: 'Prebieha', value: sc.in_progress, color: '#d946ef' },// fuchsia-500
      { name: 'Hotovo', value: sc.done, color: '#10b981' },      // emerald-500
      { name: 'Zrušená', value: sc.cancelled, color: '#ef4444' }, // red-500
    ].filter(d => d.value > 0);
  }, [jobs]);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full"
    >
      <motion.div variants={item} className="mb-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Prehľad</h2>
        <p className="text-slate-500 mt-1">Sledujte svoj výkon a dôležité udalosti.</p>
      </motion.div>

      {/* Main KPI Stats */}
      <motion.div variants={container} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Nové zákazky", value: newJobs, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Práve Prebieha", value: inProgress, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
          { title: "Dokončené", value: done, icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-100" },
          { title: "Očakávaný Príjem", value: `€${revenue.toFixed(0)}`, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-100" },
        ].map((stat, i) => (
          <motion.div variants={item} key={i}>
            <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Charts */}
      <motion.div variants={container} className="grid gap-6 md:grid-cols-7">
        <motion.div variants={item} className="md:col-span-4">
          <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
              <CardTitle className="text-lg font-semibold text-slate-900">Prívod Zákaziek</CardTitle>
              <CardDescription>Počet zaznamenaných zákaziek za posledných 12 dní.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Zákazky" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="md:col-span-3">
          <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
              <CardTitle className="text-lg font-semibold text-slate-900">Rozdelenie Zákaziek</CardTitle>
              <CardDescription>Pomer aktuálnych zákaziek na základe ich stavu.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-[300px] flex justify-center items-center">
              {donutData.length === 0 ? (
                <p className="text-slate-400 text-sm">Zatiaľ nemáte dáta o zákazkách.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value, entry, index) => <span style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Lists */}
      <motion.div variants={container} className="grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
              <CardTitle className="text-lg font-semibold text-slate-900">Posledné zákazky</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {jobs.length === 0 ? (
                <p className="text-sm text-slate-500 flex items-center justify-center p-8">Žiadne zákazky zatiaľ.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job.id} onClick={() => router.push(`/dashboard/jobs/${job.id}`)} className="flex items-center justify-between group cursor-pointer p-4 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(job.created_at).toLocaleDateString("sk-SK")}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        job.urgency === "high" || job.urgency === "critical" 
                          ? "bg-red-100 text-red-700" 
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {job.status === 'new' ? 'Nová' : job.status === 'in_progress' ? 'Prebieha' : job.status === 'done' ? 'Hotovo' : job.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white h-full flex flex-col">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
              <CardTitle className="text-lg font-semibold text-slate-900">Nedávni zákazníci</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {customers.length === 0 ? (
                <p className="text-sm text-slate-500 flex items-center justify-center p-8">Žiadni zákazníci v systéme.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {customers.slice(0, 5).map((c) => (
                    <div key={c.id} onClick={() => router.push(`/dashboard/customers`)} className="flex items-center justify-between group cursor-pointer p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{c.phone || c.email || "Bez kontaktu"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
