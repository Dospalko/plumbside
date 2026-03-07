"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getJobs, getCustomers, Job, Customer } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (token) {
      getJobs(token).then(setJobs).catch(console.error);
      getCustomers(token).then(setCustomers).catch(console.error);
    }
  }, [token, isAuthenticated, router]);

  const newJobs = jobs.filter((j) => j.status === "new").length;
  const inProgress = jobs.filter((j) => j.status === "in_progress").length;
  const done = jobs.filter((j) => j.status === "done").length;
  const revenue = jobs.reduce((sum, j) => sum + (j.final_price || j.estimated_price || 0), 0);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 max-w-7xl mx-auto w-full px-6 py-8 flex-1"
    >
      <motion.div variants={item} className="mb-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Prehľad</h2>
        <p className="text-slate-500 mt-1">Dôležité informácie o vašom biznise.</p>
      </motion.div>

      <motion.div variants={container} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Nové zákazky", value: newJobs, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Rozpracované", value: inProgress, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
          { title: "Dokončené", value: done, icon: Briefcase, color: "text-green-600", bg: "bg-green-50" },
          { title: "Odhadovaný príjem", value: `€${revenue.toFixed(0)}`, icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((stat, i) => (
          <motion.div variants={item} key={i}>
            <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={container} className="grid gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white h-full">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Posledné zákazky</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {jobs.length === 0 ? (
                <p className="text-sm text-slate-500 flex items-center justify-center h-24">Zatiaľ prázdne.</p>
              ) : (
                <div className="space-y-4">
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(job.created_at).toLocaleDateString("sk-SK")}
                        </p>
                      </div>
                      <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-xs font-medium shadow-none ${job.urgency === "high" || job.urgency === "critical" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                        {job.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white h-full">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Nedávni zákazníci</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {customers.length === 0 ? (
                <p className="text-sm text-slate-500 flex items-center justify-center h-24">Zatiaľ prázdne.</p>
              ) : (
                <div className="space-y-4">
                  {customers.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{c.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{c.phone || c.email || "—"}</p>
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
