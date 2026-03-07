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
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <Link href="/dashboard/jobs">
          <Button variant="ghost" size="sm" className="gap-2 mb-2">
            <ArrowLeft className="h-4 w-4" /> Späť na Kanban
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">{job.title}</h2>
        <p className="text-muted-foreground mt-1">
          Vytvorené: {new Date(job.created_at).toLocaleDateString("sk-SK")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail zákazky</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge>{STATUS_LABELS[job.status] || job.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Naliehavosť</span>
              <Badge variant={job.urgency === "high" || job.urgency === "critical" ? "destructive" : "secondary"}>
                {job.urgency}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Odhad ceny</span>
              <span>{job.estimated_price ? `€${job.estimated_price}` : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Finálna cena</span>
              <span>{job.final_price ? `€${job.final_price}` : "—"}</span>
            </div>
            {job.description && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground mb-1">Popis</p>
                <p>{job.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zákazník</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer ? (
              <>
                <p className="font-medium">{customer.name}</p>
                <p className="text-muted-foreground">{customer.phone || "—"}</p>
                <p className="text-muted-foreground">{customer.email || "—"}</p>
                <p className="text-muted-foreground">{customer.address || "—"}</p>
              </>
            ) : (
              <p className="text-muted-foreground">Zákazník nenájdený.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zmeniť status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <Button
                key={s}
                variant={s === job.status ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusChange(s)}
                disabled={s === job.status}
              >
                {STATUS_LABELS[s] || s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
