"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { getCustomer, getJobs, Customer, Job } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Mail, MapPin, StickyNote, Briefcase, Euro } from "lucide-react";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  new: "Nové",
  triaged: "Vyhodnotené",
  quoted: "Nacenené",
  scheduled: "Naplánované",
  in_progress: "Prebieha",
  done: "Hotové",
  cancelled: "Zrušené",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  triaged: "bg-violet-100 text-violet-700",
  quoted: "bg-yellow-100 text-yellow-700",
  scheduled: "bg-orange-100 text-orange-700",
  in_progress: "bg-fuchsia-100 text-fuchsia-700",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const URGENCY_LABELS: Record<string, string> = {
  low: "Nízka",
  normal: "Normálna",
  high: "Vysoká",
  critical: "Kritická",
};

export default function CustomerDetailPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!token) return;

    const load = async () => {
      try {
        const [c, allJobs] = await Promise.all([
          getCustomer(token, customerId),
          getJobs(token),
        ]);
        setCustomer(c);
        setJobs(allJobs.filter((j) => j.customer_id === customerId));
      } catch {
        router.push("/dashboard/customers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, isAuthenticated, isLoaded, customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
        Načítavam...
      </div>
    );
  }

  if (!customer) return null;

  const totalRevenue = jobs
    .filter((j) => j.status === "done")
    .reduce((sum, j) => sum + (j.final_price ?? j.estimated_price ?? 0), 0);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/customers"
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Späť na databázu
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{customer.name}</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Zákazník od {new Date(customer.created_at).toLocaleDateString("sk-SK")}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 shadow-sm">
          <Euro className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Celkové tržby</p>
            <p className="text-xl font-bold text-emerald-700">€{totalRevenue.toFixed(0)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white lg:col-span-1 h-fit">
          <CardHeader className="pb-3 border-b border-slate-100 px-6 pt-5">
            <CardTitle className="text-base font-bold text-slate-800">Kontaktné údaje</CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-5 space-y-4">
            {customer.phone && (
              <div className="flex items-center gap-3 text-slate-700">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Telefón</p>
                  <a
                    href={`tel:${customer.phone}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {customer.phone}
                  </a>
                </div>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-3 text-slate-700">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</p>
                  <a
                    href={`mailto:${customer.email}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {customer.email}
                  </a>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3 text-slate-700">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Adresa</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(customer.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {customer.address}
                  </a>
                </div>
              </div>
            )}
            {customer.notes && (
              <div className="flex items-start gap-3 text-slate-700">
                <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <StickyNote className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Poznámky</p>
                  <p className="font-medium text-slate-700 text-sm mt-0.5">{customer.notes}</p>
                </div>
              </div>
            )}
            {!customer.phone && !customer.email && !customer.address && !customer.notes && (
              <p className="text-sm text-slate-400 font-medium">Žiadne kontaktné údaje.</p>
            )}
          </CardContent>
        </Card>

        {/* Job History */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              História zákaziek
            </h3>
            <span className="text-sm font-semibold text-slate-500 bg-slate-100 rounded-full px-3 py-1">
              {jobs.length} {jobs.length === 1 ? "zákazka" : jobs.length >= 2 && jobs.length <= 4 ? "zákazky" : "zákaziek"}
            </span>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Zákazník zatiaľ nemá žiadne zákazky.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {jobs
                .slice()
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/jobs/${job.id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                          {job.title}
                        </p>
                        {job.description && (
                          <p className="text-sm text-slate-500 font-medium mt-1 line-clamp-2">
                            {job.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[job.status] ?? "bg-slate-100 text-slate-700"}`}
                          >
                            {STATUS_LABELS[job.status] ?? job.status}
                          </span>
                          <span className="text-xs font-medium text-slate-400">
                            Naliehavosť: {URGENCY_LABELS[job.urgency] ?? job.urgency}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {(job.final_price != null || job.estimated_price != null) && (
                          <p className="text-base font-bold text-slate-900">
                            €{(job.final_price ?? job.estimated_price ?? 0).toFixed(0)}
                          </p>
                        )}
                        <p className="text-xs font-medium text-slate-400 mt-1">
                          {new Date(job.created_at).toLocaleDateString("sk-SK")}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
