"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getJobs, patchJob, Job } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateJobSheet } from "@/components/jobs/CreateJobSheet";
import { Calendar, GripHorizontal } from "lucide-react";
import { motion, Variants } from "framer-motion";

const COLUMNS = [
  { key: "new", label: "Nové", color: "bg-blue-600", dot: "bg-blue-500", txt: "text-blue-700", bg: "bg-blue-50/50", borderHover: "border-blue-300", bgHover: "bg-blue-100/50" },
  { key: "quoted", label: "Nacenené", color: "bg-amber-500", dot: "bg-amber-400", txt: "text-amber-700", bg: "bg-amber-50/50", borderHover: "border-amber-300", bgHover: "bg-amber-100/50" },
  { key: "scheduled", label: "Naplánované", color: "bg-purple-500", dot: "bg-purple-400", txt: "text-purple-700", bg: "bg-purple-50/50", borderHover: "border-purple-300", bgHover: "bg-purple-100/50" },
  { key: "in_progress", label: "Prebieha", color: "bg-indigo-500", dot: "bg-indigo-400", txt: "text-indigo-700", bg: "bg-indigo-50/50", borderHover: "border-indigo-300", bgHover: "bg-indigo-100/50" },
  { key: "done", label: "Hotové", color: "bg-emerald-500", dot: "bg-emerald-400", txt: "text-emerald-700", bg: "bg-emerald-50/50", borderHover: "border-emerald-300", bgHover: "bg-emerald-100/50" },
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

  // Drag and drop states
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

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

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedJobId(id);
    e.dataTransfer.setData("jobId", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, statusKey: string) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== statusKey) {
      setDragOverCol(statusKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverCol(null);
    
    const jobId = e.dataTransfer.getData("jobId");
    setDraggedJobId(null);

    if (!jobId || !token) return;

    // Check if dropping in the same column
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status === targetStatus) return;

    try {
      // Optimistic update
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: targetStatus } : j));
      await patchJob(token, jobId, { status: targetStatus });
      fetchJobs(); // sync with server
    } catch (err) {
      console.error(err);
      fetchJobs(); // revert on fail
    }
  };

  // Mobile fallback handler via native select
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, jobId: string) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (!token) return;
    try {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      await patchJob(token, jobId, { status: newStatus });
      fetchJobs();
    } catch (err) {
      console.error(err);
      fetchJobs();
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
          <p className="text-sm text-slate-500 mt-0.5">Potiahnite (drag & drop) zákazku a presuňte ju do iného stavu.</p>
        </div>
        <CreateJobSheet onCreated={fetchJobs} />
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="flex overflow-x-auto xl:overflow-x-hidden overflow-y-hidden gap-3 pb-2 snap-x flex-1 min-h-0 w-full select-none"
      >
        {COLUMNS.map((col) => {
          const colJobs = jobs.filter((j) => j.status === col.key);
          const isDragOver = dragOverCol === col.key;
          
          return (
            <motion.div 
              key={col.key} 
              variants={columnVariants}
              onDragOver={(e: any) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e: any) => handleDrop(e, col.key)}
              className={
                `flex-1 min-w-[240px] xl:min-w-0 snap-center flex flex-col rounded-2xl border-2 transition-all duration-200 relative ` +
                (isDragOver ? `border-dashed ${col.borderHover} ${col.bgHover} scale-[1.01] shadow-md z-10` : `border-transparent ${col.bg} border-t-4`)
              }
            >
              {/* Top Accent Line */}
              {!isDragOver && <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${col.color} opacity-80`} />}
              
              <div className="px-3 py-3 lg:px-4 lg:py-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${col.dot} ${isDragOver ? 'animate-pulse' : ''}`} />
                  <span className={`font-semibold tracking-tight text-sm truncate ${col.txt}`}>{col.label}</span>
                </div>
                <Badge variant="secondary" className="bg-white/60 text-slate-700 shadow-sm border-0 font-medium px-2 py-0 shrink-0">
                  {colJobs.length}
                </Badge>
              </div>

              <div className="flex flex-col gap-2.5 px-2 pb-3 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                {colJobs.map((job) => (
                  <Card 
                    key={job.id} 
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, job.id)}
                    onDragEnd={() => setDraggedJobId(null)}
                    onClick={() => router.push(`/dashboard/jobs/${job.id}`)} 
                    className={
                      `rounded-xl border-transparent shadow-[0_1px_3px_rgb(0,0,0,0.05),0_1px_2px_rgb(0,0,0,0.02)] bg-white cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all group shrink-0 ` +
                      (draggedJobId === job.id ? 'opacity-40 scale-95 border-blue-200' : '')
                    }
                  >
                    <CardContent className="p-3.5 flex flex-col gap-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-[13px] font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h4>
                        <GripHorizontal className="h-4 w-4 text-slate-300 opacity-50 group-hover:opacity-100 shrink-0" />
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

                      {/* Mobile Status Select Dropdown (Visible mainly on touch screens as a fallback) */}
                      <div className="mt-2 pt-2 border-t border-slate-50 flex sm:hidden">
                        <select 
                          value={job.status} 
                          onChange={(e) => handleStatusChange(e, job.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-xs p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {COLUMNS.map(c => (
                            <option key={c.key} value={c.key}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {colJobs.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 italic text-xs py-10 opacity-60 pointer-events-none">
                    {isDragOver ? "Pustite sem..." : "Žiadne zákazky"}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
