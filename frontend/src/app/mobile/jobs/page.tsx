"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getJobs, getCustomers, Job, Customer } from "@/lib/api";
import { MapPin, Phone, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function MobileJobsPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();
  
  const [jobs, setJobs] = useState<(Job & { customer_name?: string, customer_phone?: string, customer_address?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!token) return;

    const loadData = async () => {
      try {
        const [allJobs, allCustomers] = await Promise.all([
          getJobs(token),
          getCustomers(token)
        ]);

        const customerMap = new Map(allCustomers.map(c => [c.id, c]));

        // Filter out completed and cancelled jobs for the mobile view
        let activeJobs = allJobs.filter(j => j.status !== 'done' && j.status !== 'cancelled');

        // Sort: In Progress first, then Scheduled, then New/Quoted
        const statusWeight: Record<string, number> = { in_progress: 0, scheduled: 1, new: 2, quoted: 3 };
        activeJobs.sort((a, b) => (statusWeight[a.status] ?? 9) - (statusWeight[b.status] ?? 9));

        const enrichedJobs = activeJobs.map(job => {
          const cust = customerMap.get(job.customer_id);
          return {
            ...job,
            customer_name: cust?.name,
            customer_phone: cust?.phone || undefined,
            customer_address: cust?.address || undefined
          };
        });

        setJobs(enrichedJobs);
      } catch (err) {
        console.error("Failed to load mobile jobs", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [token, isAuthenticated, isLoaded, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-slate-900 tracking-tight mb-4">Moje dnešné zákazky</h1>

      {jobs.length === 0 ? (
        <div className="text-center bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <p className="text-slate-500 font-medium tracking-tight">Nemáte zatiaľ žiadne aktívne zákazky na dnešný deň.</p>
        </div>
      ) : (
        jobs.map(job => (
          <Link href={`/mobile/jobs/${job.id}`} key={job.id} className="block group">
            <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm group-hover:border-blue-200 group-hover:shadow-md transition-all">
              
              <div className="flex justify-between items-start mb-2">
                <Badge className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  job.status === "in_progress" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
                  job.status === "scheduled" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
                  "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}>
                  {job.status === "in_progress" ? "Prebieha" : job.status === "scheduled" ? "Naplánované" : "Nové"}
                </Badge>
                
                {job.urgency !== "normal" && job.urgency !== "low" && (
                  <Badge variant="destructive" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md">
                    {job.urgency === "critical" ? "Kritické" : "Súrne"}
                  </Badge>
                )}
              </div>

              <h2 className="font-bold text-lg text-slate-900 mb-1 leading-tight">{job.customer_name || "Neznámy zákazník"}</h2>
              <p className="text-slate-500 text-sm font-medium line-clamp-1 mb-4">{job.title}</p>

              <div className="space-y-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-700 leading-snug break-words">
                    {job.customer_address || "Adresa chýba"}
                  </span>
                </div>
                {job.customer_phone && (
                   <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-sm font-bold text-slate-700">
                      {job.customer_phone}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between items-center text-blue-600 font-bold text-sm bg-blue-50/50 py-2.5 rounded-lg px-3 group-hover:bg-blue-100 transition-colors">
                Otvoriť detail
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
