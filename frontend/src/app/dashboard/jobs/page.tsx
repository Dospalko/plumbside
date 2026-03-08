"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getJobs, patchJob, Job } from "@/lib/api";
import { CreateJobSheet } from "@/components/jobs/CreateJobSheet";
import { Calendar, GripHorizontal } from "lucide-react";
import { motion, Variants } from "framer-motion";

const COLUMNS = [
  { key: "new", label: "Nové", color: "bg-blue-400", txt: "text-foreground", borderHover: "border-blue-400", bgHover: "bg-blue-400/10" },
  { key: "quoted", label: "Nacenené", color: "bg-amber-400", txt: "text-foreground", borderHover: "border-amber-400", bgHover: "bg-amber-400/10" },
  { key: "scheduled", label: "Naplánované", color: "bg-purple-400", txt: "text-foreground", borderHover: "border-purple-400", bgHover: "bg-purple-400/10" },
  { key: "in_progress", label: "Prebieha", color: "bg-orange-500", txt: "text-foreground", borderHover: "border-orange-500", bgHover: "bg-orange-500/10" },
  { key: "done", label: "Hotové", color: "bg-emerald-400", txt: "text-foreground", borderHover: "border-emerald-400", bgHover: "bg-emerald-400/10" },
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
    return <div className="flex items-center justify-center h-64 text-slate-500 font-medium">Načítavam nástenku...</div>;
  }

  return (
    <div className="flex flex-col w-full h-full md:px-2 md:py-2 overflow-hidden bg-transparent">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0 bg-transparent">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Zákazky</h2>
          <p className="text-slate-500 mt-1">Presúvajte zákazky medzi stavmi (Drag & Drop).</p>
        </div>
        <CreateJobSheet onCreated={fetchJobs} />
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="flex overflow-x-auto xl:overflow-x-hidden overflow-y-hidden gap-4 pb-4 snap-x flex-1 min-h-0 w-full select-none"
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
                `flex-1 min-w-[280px] xl:min-w-0 snap-center flex flex-col rounded-xl overflow-hidden transition-all duration-200 relative bg-slate-100/50 border border-slate-200/60 ` +
                (isDragOver ? `scale-[1.02] shadow-md z-10 border-blue-400 bg-blue-50/50` : ``)
              }
            >
              
              <div className="px-4 py-3 flex items-center justify-between shrink-0 bg-slate-100/80 border-b border-slate-200/50">
                <div className="flex items-center gap-2 truncate pr-2">
                  <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                  <span className="font-semibold text-slate-700 text-sm truncate">{col.label}</span>
                </div>
                <div className="bg-white text-slate-600 font-medium text-xs px-2 py-0.5 rounded-full border border-slate-200 shrink-0 shadow-sm">
                  {colJobs.length}
                </div>
              </div>

              <div className="flex flex-col gap-3 p-3 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                {colJobs.map((job) => (
                  <div 
                    key={job.id} 
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, job.id)}
                    onDragEnd={() => setDraggedJobId(null)}
                    onClick={() => router.push(`/dashboard/jobs/${job.id}`)} 
                    className={
                      `rounded-xl border border-slate-200 shadow-sm bg-white cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md transition-all group shrink-0 relative overflow-hidden p-4 flex flex-col gap-3 ` +
                      (draggedJobId === job.id ? 'opacity-40 scale-[0.98]' : '')
                    }
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h4>
                      <GripHorizontal className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-2">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wide ${job.urgency === "high" || job.urgency === "critical" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                        {job.urgency === 'normal' ? 'Bežná' : job.urgency === 'low' ? 'Nízka' : job.urgency === 'high' ? 'Vysoká' : 'Kritická'}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(job.created_at).toLocaleDateString("sk-SK", { day: 'numeric', month: 'short' })}
                      </div>
                    </div>

                    {/* Mobile Status Select Dropdown (Visible mainly on touch screens as a fallback) */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex sm:hidden">
                      <select 
                        value={job.status} 
                        onChange={(e) => handleStatusChange(e, job.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-xs font-medium p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                      >
                        {COLUMNS.map(c => (
                          <option key={c.key} value={c.key}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                
                {colJobs.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 font-medium text-sm py-8 pointer-events-none">
                    {isDragOver ? "Sem presuňte" : "Žiadne zákazky"}
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
