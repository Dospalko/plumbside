"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getJobs, getCustomers, Job, Customer } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Clock, DollarSign } from "lucide-react";
import { motion, Variants } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
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

      <motion.div variants={container} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Nové", value: newJobs, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Prebieha", value: inProgress, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
          { title: "Hotovo", value: done, icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-100" },
          { title: "Príjem", value: `€${revenue.toFixed(0)}`, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-100" },
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
                    <div key={job.id} className="flex items-center justify-between group cursor-pointer p-4 hover:bg-slate-50 transition-colors">
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
                    <div key={c.id} className="flex items-center justify-between group p-4 hover:bg-slate-50 transition-colors">
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
