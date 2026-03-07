"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getJobs, patchJob, Job } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateJobSheet } from "@/components/jobs/CreateJobSheet";
import { Calendar } from "lucide-react";
import { motion, Variants } from "framer-motion";

const COLUMNS = [
  { key: "new", label: "Nové", color: "bg-white border-black text-black" },
  { key: "quoted", label: "Nacenené", color: "bg-yellow-400 border-black text-black" },
  { key: "scheduled", label: "Naplánované", color: "bg-purple-400 border-black text-black" },
  { key: "in_progress", label: "Prebieha", color: "bg-[#FF3E00] border-black text-black" },
  { key: "done", label: "Hotové", color: "bg-black border-black text-white" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const columnVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, type: "spring", stiffness: 200 } }
};

export default function JobsPage() {
  const { token, isAuthenticated } = useAuth();
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
    if (!isAuthenticated) { router.push("/login"); return; }
    fetchJobs();
  }, [token, isAuthenticated, router]);

  const moveJob = async (e: React.MouseEvent, jobId: string, newStatus: string) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await patchJob(token, jobId, { status: newStatus });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500 font-medium">Načítavam systém...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto px-6 py-6 flex-1 min-h-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Zákazky</h2>
          <p className="text-slate-500 mt-1">Kanban systém pre rýchlu správu.</p>
        </div>
        <CreateJobSheet onCreated={fetchJobs} />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex overflow-x-auto pb-4 gap-4 snap-x flex-1 mt-2 min-h-0">
        {COLUMNS.map((col) => {
          const colJobs = jobs.filter((j) => j.status === col.key);
          
          let colColors = "bg-slate-100 text-slate-700";
          if (col.key === "new") colColors = "bg-blue-50 text-blue-700 border border-blue-100";
          if (col.key === "quoted") colColors = "bg-yellow-50 text-yellow-700 border border-yellow-100";
          if (col.key === "scheduled") colColors = "bg-purple-50 text-purple-700 border border-purple-100";
          if (col.key === "in_progress") colColors = "bg-orange-50 text-orange-700 border border-orange-100";
          if (col.key === "done") colColors = "bg-green-50 text-green-700 border border-green-100";

          return (
            <motion.div key={col.key} variants={columnVariants} className="flex-1 min-w-[320px] max-w-[400px] snap-center flex flex-col gap-3">
              <div className={`px-4 py-3 rounded-xl font-semibold flex items-center justify-between shadow-sm ${colColors}`}>
                <span>{col.label}</span>
                <Badge variant="outline" className="bg-white/60 border-current/20 text-current">{colJobs.length}</Badge>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto pb-2 min-h-0">
                {colJobs.map((job) => (
                  <Card key={job.id} onClick={() => router.push(`/dashboard/jobs/${job.id}`)} className="rounded-xl border border-slate-200/60 shadow-sm bg-white cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group flex flex-col shrink-0">
                    <CardHeader className="p-4 pb-2 border-b-0">
                      <CardTitle className="text-base font-semibold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 flex flex-col gap-3">
                      {job.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <Badge variant={job.urgency === "high" || job.urgency === "critical" ? "destructive" : "secondary"} className="shadow-none text-[10px] font-medium px-2 py-0.5">
                          {job.urgency}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(job.created_at).toLocaleDateString("sk-SK")}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-slate-100 mt-1">
                        {COLUMNS.filter((c) => c.key !== col.key).slice(0, 2).map((target) => (
                          <Button
                            key={target.key}
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs text-slate-600 border-slate-200 hover:bg-slate-50"
                            onClick={(e) => moveJob(e, job.id, target.key)}
                          >
                            → {target.label}
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
