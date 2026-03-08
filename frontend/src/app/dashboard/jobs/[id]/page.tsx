"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { getJob, patchJob, getCustomers, Job, Customer, createMessage, createAppointment } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, MessageSquare, Send, Calendar } from "lucide-react";
import Link from "next/link";

const STATUSES = ["new", "quoted", "scheduled", "in_progress", "done", "cancelled"];
const STATUS_LABELS: Record<string, string> = {
  new: "Nové", quoted: "Nacenené", scheduled: "Naplánované",
  in_progress: "Prebieha", done: "Hotové", cancelled: "Zrušené",
};

export default function JobDetailPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Phase 4 states
  const [newMessage, setNewMessage] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [isSubmittingAppt, setIsSubmittingAppt] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
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
  }, [token, isAuthenticated, isLoaded, jobId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!token || !job) return;
    const updated = await patchJob(token, job.id, { status: newStatus });
    // Keep existing messages/appointments from local state since patchJob might not return them eager loaded based on backend config, or just reload job.
    const reloaded = await getJob(token, job.id);
    setJob(reloaded);
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !job || !newMessage.trim()) return;
    setIsSubmittingMessage(true);
    try {
      await createMessage(token, job.id, { content: newMessage, channel: "SYSTEM", direction: "OUTBOUND" });
      setNewMessage("");
      const reloaded = await getJob(token, job.id);
      setJob(reloaded);
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !job || !appointmentDate) return;
    setIsSubmittingAppt(true);
    try {
      await createAppointment(token, job.id, { scheduled_time: new Date(appointmentDate).toISOString(), duration_minutes: 60 });
      setAppointmentDate("");
      const reloaded = await getJob(token, job.id);
      setJob(reloaded);
    } finally {
      setIsSubmittingAppt(false);
    }
  };

  if (loading || !job) {
    return <div className="flex items-center justify-center h-64 text-slate-500 font-medium tracking-tight">Načítavam dáta...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full mx-auto px-6 py-8 flex-1">
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/jobs">
            <Button variant="ghost" className="gap-2 mb-4 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg h-9 px-3 -ml-3">
              <ArrowLeft className="h-4 w-4" /> Späť na Kanban
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{job.title}</h2>
          <p className="text-sm text-slate-500 mt-2">
            Vytvorené {new Date(job.created_at).toLocaleDateString("sk-SK")}
          </p>
        </div>
        <div className="mt-8 md:mt-12">
          <Badge variant="secondary" className="w-fit text-sm px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 shadow-sm shadow-blue-600/10">
            {STATUS_LABELS[job.status] || job.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_380px]">
        {/* Main Content Column */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-5">
              <CardTitle className="text-lg font-semibold text-slate-900 tracking-tight">
                Detail problému
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="flex gap-4 mb-2">
                <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Naliehavosť</span>
                  <Badge variant={job.urgency === "high" || job.urgency === "critical" ? "destructive" : "secondary"} className="shadow-none rounded-md px-2 py-0.5">
                    {job.urgency}
                  </Badge>
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Cena (Odhad)</span>
                  <span className="font-semibold text-slate-900">{job.estimated_price ? `€${job.estimated_price}` : "—"}</span>
                </div>
              </div>
              
              {job.description ? (
                <div className="pt-2">
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {job.description}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic py-2">Bez bližšieho popisu.</p>
              )}
            </CardContent>
          </Card>

          {/* Activity Section */}
          <Card className="rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-5 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2 tracking-tight">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Aktivita & Poznámky
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[300px] overflow-y-auto p-5 space-y-4">
                {(job.messages || []).length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-4">Žiadne poznámky.</p>
                ) : (
                  (job.messages || []).map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-slate-500">
                          {msg.direction === "INBOUND" ? "IN" : "OUT"}
                        </span>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-sm p-3.5 border border-slate-100">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">
                          {new Date(msg.created_at).toLocaleString("sk-SK")} • {msg.channel}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-slate-50 bg-slate-50/30">
                <form onSubmit={handleAddMessage} className="flex gap-2">
                  <Input 
                    placeholder="Pridať internú poznámku..." 
                    className="flex-1 rounded-xl border-slate-200 bg-white"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" disabled={isSubmittingMessage || !newMessage.trim()} className="rounded-xl px-4 bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-5">
              <CardTitle className="text-lg font-semibold text-slate-900 tracking-tight">
                Zákazník
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {customer ? (
                <>
                  <p className="font-semibold text-slate-900 text-xl">{customer.name}</p>
                  <div className="space-y-2 text-sm text-slate-600 mt-2">
                    <p className="flex items-center gap-2"><span className="text-slate-400 w-16">Telefón:</span> <span className="font-medium text-slate-800">{customer.phone || "—"}</span></p>
                    <p className="flex items-center gap-2"><span className="text-slate-400 w-16">Email:</span> <span className="font-medium text-slate-800">{customer.email || "—"}</span></p>
                    <p className="flex flex-col gap-1 mt-3"><span className="text-slate-400">Adresa:</span> <span className="p-2 bg-slate-50 rounded-lg border border-slate-100">{customer.address || "Neuvedená"}</span></p>
                  </div>
                </>
              ) : (
                <p className="text-slate-500 italic text-sm">Zákazník nenájdený.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-5 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2 tracking-tight">
                <Calendar className="h-5 w-5 text-indigo-500" />
                Plánovanie
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {job.appointments && job.appointments.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Naplánované termíny</p>
                  {job.appointments.map(appt => (
                    <div key={appt.id} className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{new Date(appt.scheduled_time).toLocaleString("sk-SK", { dateStyle: "medium", timeStyle: "short" })}</span>
                        <span className="text-[10px] text-indigo-500 font-medium">Trvanie: {appt.duration_minutes || 60} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic pb-2">Zatiaľ nenaplánované.</p>
              )}
              
              <form onSubmit={handleAddAppointment} className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-600">Nový termín</label>
                <Input 
                  type="datetime-local" 
                  value={appointmentDate}
                  onChange={e => setAppointmentDate(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
                <Button type="submit" disabled={isSubmittingAppt || !appointmentDate} className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
                  Pridať termín
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-5">
              <CardTitle className="text-lg font-semibold text-slate-900 tracking-tight">
                Stav zákazky
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
                    className={`justify-start h-[42px] rounded-xl font-medium transition-colors ${
                      s === job.status 
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20 border-transparent" 
                        : "text-slate-600 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900"
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
