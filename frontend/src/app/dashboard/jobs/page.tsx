"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getJobs, patchJob, Job } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateJobSheet } from "@/components/jobs/CreateJobSheet";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { motion, Variants } from "framer-motion";

const COLUMNS = [
  { key: "new", label: "Nové", color: "bg-blue-600", dot: "bg-blue-500", txt: "text-blue-700", bg: "bg-blue-50/50" },
  { key: "quoted", label: "Nacenené", color: "bg-amber-500", dot: "bg-amber-400", txt: "text-amber-700", bg: "bg-amber-50/50" },
  { key: "scheduled", label: "Naplánované", color: "bg-purple-500", dot: "bg-purple-400", txt: "text-purple-700", bg: "bg-purple-50/50" },
  { key: "in_progress", label: "Prebieha", color: "bg-indigo-500", dot: "bg-indigo-400", txt: "text-indigo-700", bg: "bg-indigo-50/50" },
  { key: "done", label: "Hotové", color: "bg-emerald-500", dot: "bg-emerald-400", txt: "text-emerald-700", bg: "bg-emerald-50/50" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, type: "spring", stiffness: 250 } }
};

export default function JobsPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    if (!token) return;
    try {
      const data = await getJobs(token);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    fetchJobs();
  }, [token, isAuthenticated, isLoaded, router]);

  const moveJob = async (e: React.MouseEvent, jobId: string, newStatus: string) => {
    e.stopPropagation();
    if (!token) return;
    try {
      // Optimistic update
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      await patchJob(token, jobId, { status: newStatus });
      fetchJobs();
    } catch (err) {
      console.error(err);
      fetchJobs(); // revert on fail
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500 font-medium">Načítavam systém...</div>;
  }

  return (
    <div className="flex flex-col w-full h-full px-4 py-6 md:px-6 md:py-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Zákazky</h2>
          <p className="text-sm text-slate-500 mt-0.5">Potiahni alebo klikni na zákazku pre detaily.</p>
        </div>
        <CreateJobSheet onCreated={fetchJobs} />
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="flex overflow-x-auto overflow-y-hidden gap-3 lg:gap-4 pb-2 snap-x flex-1 min-h-0 w-full"
      >
        {COLUMNS.map((col) => {
          const colJobs = jobs.filter((j) => j.status === col.key);
          
          return (
            <motion.div 
              key={col.key} 
              variants={columnVariants} 
              className={`flex-1 min-w-[260px] max-w-[340px] snap-center flex flex-col rounded-2xl ${col.bg} border-t-4 border-t-transparent hover:border-t-${col.color.replace('bg-', '')} transition-colors duration-300 relative`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${col.color} opacity-80`} />
              
              <div className="px-4 py-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className={`font-semibold tracking-tight text-sm ${col.txt}`}>{col.label}</span>
                </div>
                <Badge variant="secondary" className="bg-white/60 text-slate-700 shadow-sm border-0 font-medium px-2 py-0">
                  {colJobs.length}
                </Badge>
              </div>

              <div className="flex flex-col gap-2.5 px-2 pb-3 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                {colJobs.map((job) => (
                  <Card 
                    key={job.id} 
                    onClick={() => router.push(`/dashboard/jobs/${job.id}`)} 
                    className="rounded-xl border-transparent shadow-[0_1px_3px_rgb(0,0,0,0.05),0_1px_2px_rgb(0,0,0,0.02)] bg-white cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group shrink-0"
                  >
                    <CardContent className="p-3.5 flex flex-col gap-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-[13px] font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h4>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-auto">
                        <Badge variant={job.urgency === "high" || job.urgency === "critical" ? "destructive" : "secondary"} className="shadow-none text-[9px] font-medium px-1.5 py-0 uppercase tracking-wide">
                          {job.urgency}
                        </Badge>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium ml-auto">
                          <Calendar className="h-3 w-3" />
                          {new Date(job.created_at).toLocaleDateString("sk-SK", { day: 'numeric', month: 'short' })}
                        </div>
                      </div>

                      {/* Quick Move Buttons (Visible on hover or mobile) */}
                      <div className="flex gap-1.5 pt-2.5 border-t border-slate-50 mt-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        {COLUMNS.filter((c) => c.key !== col.key).slice(0, 2).map((target) => (
                          <Button
                            key={target.key}
                            variant="secondary"
                            size="sm"
                            className="flex-1 h-7 text-[10px] bg-slate-50 text-slate-600 hover:bg-slate-100 px-1"
                            onClick={(e) => moveJob(e, job.id, target.key)}
                          >
                            <span className="truncate">→ {target.label}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
