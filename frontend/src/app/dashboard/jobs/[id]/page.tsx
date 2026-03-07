"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { getJob, patchJob, getCustomers, Job, Customer } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const STATUSES = ["new", "quoted", "scheduled", "in_progress", "done", "cancelled"];
const STATUS_LABELS: Record<string, string> = {
  new: "Nové", quoted: "Nacenené", scheduled: "Naplánované",
  in_progress: "Prebieha", done: "Hotové", cancelled: "Zrušené",
};

export default function JobDetailPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!token) return;

    const load = async () => {
      try {
        const j = await getJob(token, jobId);
        setJob(j);
        const customers = await getCustomers(token);
        setCustomer(customers.find((c) => c.id === j.customer_id) || null);
      } catch {
        router.push("/dashboard/jobs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, isAuthenticated, jobId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!token || !job) return;
    const updated = await patchJob(token, job.id, { status: newStatus });
    setJob(updated);
  };

  if (loading || !job) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Načítavam...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full mx-auto px-6 py-8 flex-1">
      <div className="border-b border-slate-200 pb-6">
        <Link href="/dashboard/jobs">
          <Button variant="ghost" className="gap-2 mb-4 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg h-9 px-3 -ml-3">
            <ArrowLeft className="h-4 w-4" /> Späť na Kanban
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{job.title}</h2>
            <p className="text-sm text-slate-500 mt-2">
              Vytvorené {new Date(job.created_at).toLocaleDateString("sk-SK")}
            </p>
          </div>
          <Badge variant="secondary" className="w-fit text-sm px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-0">
            {STATUS_LABELS[job.status] || job.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Detail zákazky
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-sm font-medium">Naliehavosť</span>
                <Badge variant={job.urgency === "high" || job.urgency === "critical" ? "destructive" : "secondary"} className="shadow-none">
                  {job.urgency}
                </Badge>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-sm font-medium">Odhad ceny</span>
                <span className="font-semibold text-slate-900">{job.estimated_price ? `€${job.estimated_price}` : "—"}</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-slate-500 text-sm font-medium">Finálna cena</span>
                <span className="font-semibold text-slate-900">{job.final_price ? `€${job.final_price}` : "—"}</span>
              </div>
              
              {job.description && (
                <div className="pt-4 mt-2 border-t border-slate-100">
                  <p className="text-slate-500 font-medium text-sm mb-2">Popis problému:</p>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                    {job.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Zákazník
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {customer ? (
                <>
                  <p className="font-semibold text-slate-900 text-xl">{customer.name}</p>
                  <div className="space-y-2 text-sm text-slate-600 mt-2">
                    <p className="flex items-center gap-2"><span className="text-slate-400 w-16">Telefón:</span> {customer.phone || "—"}</p>
                    <p className="flex items-center gap-2"><span className="text-slate-400 w-16">Email:</span> {customer.email || "—"}</p>
                    <p className="flex items-center gap-2"><span className="text-slate-400 w-16">Adresa:</span> {customer.address || "—"}</p>
                  </div>
                </>
              ) : (
                <p className="text-slate-500 italic">Zákazník nenájdený.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Posunúť v procese
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-col gap-2">
                {STATUSES.map((s) => (
                  <Button
                    key={s}
                    variant={s === job.status ? "default" : "outline"}
                    onClick={() => handleStatusChange(s)}
                    disabled={s === job.status}
                    className={`justify-start h-10 ${
                      s === job.status 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {STATUS_LABELS[s] || s}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
