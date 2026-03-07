"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getJobs, patchJob, Job } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateJobSheet } from "@/components/jobs/CreateJobSheet";

const COLUMNS = [
  { key: "new", label: "Nové", color: "bg-blue-500/10 border-blue-500/30" },
  { key: "quoted", label: "Nacenené", color: "bg-yellow-500/10 border-yellow-500/30" },
  { key: "scheduled", label: "Naplánované", color: "bg-purple-500/10 border-purple-500/30" },
  { key: "in_progress", label: "Prebieha", color: "bg-orange-500/10 border-orange-500/30" },
  { key: "done", label: "Hotové", color: "bg-green-500/10 border-green-500/30" },
];

const URGENCY_COLORS: Record<string, "destructive" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  normal: "secondary",
  low: "outline",
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
  }, [token, isAuthenticated]);

  const moveJob = async (e: React.MouseEvent, jobId: string, newStatus: string) => {
    e.preventDefault(); // Prevent Link navigation
    if (!token) return;
    try {
      await patchJob(token, jobId, { status: newStatus });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Načítavam zákazky...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Zákazky</h2>
          <p className="text-muted-foreground">Kanban nástěnka pre správu zákaziek.</p>
        </div>
        <CreateJobSheet onCreated={fetchJobs} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map((col) => {
          const colJobs = jobs.filter((j) => j.status === col.key);
          return (
            <div key={col.key} className={`rounded-lg border p-3 ${col.color} min-h-[200px]`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <Badge variant="outline" className="text-xs">{colJobs.length}</Badge>
              </div>
              <div className="space-y-2">
                {colJobs.map((job) => (
                  <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3 space-y-2">
                        <p className="font-medium text-sm">{job.title}</p>
                        {job.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant={URGENCY_COLORS[job.urgency] || "secondary"} className="text-xs">
                            {job.urgency}
                          </Badge>
                          {job.estimated_price && (
                            <span className="text-xs font-medium">€{job.estimated_price}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {COLUMNS.filter((c) => c.key !== col.key).slice(0, 2).map((target) => (
                            <Button
                              key={target.key}
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6 px-2"
                              onClick={(e) => moveJob(e, job.id, target.key)}
                            >
                              → {target.label}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
