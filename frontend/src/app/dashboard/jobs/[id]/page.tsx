"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { getJob, patchJob, getCustomers, Job, Customer, createMessage, createAppointment } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, MessageSquare, Send, Calendar, Edit2, Check, X, Euro } from "lucide-react";
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

  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editEstPrice, setEditEstPrice] = useState("");
  const [editFinalPrice, setEditFinalPrice] = useState("");
  
  const [isEditingUrgency, setIsEditingUrgency] = useState(false);
  const [editUrgency, setEditUrgency] = useState("");

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

  const handleUpdateDetails = async (type: 'desc' | 'price' | 'title' | 'urgency') => {
    if (!token || !job) return;
    
    let updateData = {};
    if (type === 'desc') {
      updateData = { description: editDesc };
    } else if (type === 'price') {
      updateData = { 
        estimated_price: editEstPrice ? parseFloat(editEstPrice) : null,
        final_price: editFinalPrice ? parseFloat(editFinalPrice) : null
      };
    } else if (type === 'title') {
      updateData = { title: editTitle };
    } else if (type === 'urgency') {
      updateData = { urgency: editUrgency };
    }

    try {
      await patchJob(token, job.id, updateData);
      const reloaded = await getJob(token, job.id);
      setJob(reloaded);
      
      if (type === 'desc') setIsEditingDesc(false);
      if (type === 'price') setIsEditingPrice(false);
      if (type === 'title') setIsEditingTitle(false);
      if (type === 'urgency') setIsEditingUrgency(false);
    } catch (err) {
      console.error(err);
      alert("Chyba pri ukladaní.");
    }
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
    <div className="flex flex-col gap-8 max-w-5xl w-full mx-auto px-6 py-8 flex-1 bg-transparent">
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/jobs">
            <button className="flex items-center gap-2 mb-6 font-semibold text-sm text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Naspäť na Nástenku
            </button>
          </Link>
          
          <div className="group relative pr-10">
            {isEditingTitle ? (
              <div className="flex items-center gap-3 mb-2">
                <input 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)} 
                  className="text-2xl font-bold h-12 w-full max-w-md bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4"
                  autoFocus
                />
                <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors" onClick={() => setIsEditingTitle(false)}><X className="h-5 w-5"/></button>
                <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" onClick={() => handleUpdateDetails('title')}><Check className="h-5 w-5"/></button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{job.title}</h2>
                <button className="h-8 w-8 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900" onClick={() => {
                  setEditTitle(job.title);
                  setIsEditingTitle(true);
                }}>
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          
          <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2">
            Založené {new Date(job.created_at).toLocaleDateString("sk-SK")}
          </p>
        </div>
        <div className="mt-8 md:mt-12">
          <Badge className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
            job.status === "new" ? "bg-blue-100 text-blue-700" :
            job.status === "in_progress" ? "bg-amber-100 text-amber-700" :
            job.status === "done" ? "bg-emerald-100 text-emerald-700" :
            "bg-slate-100 text-slate-700"
          }`}>
            {STATUS_LABELS[job.status] || job.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_380px]">
        {/* Main Content Column */}
        <div className="space-y-6">
          <Card className="rounded-xl border border-slate-200 shadow-sm bg-white flex flex-col overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Euro className="h-5 w-5 text-slate-400" /> Detaily Zákazky
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Urgency & Prices */}
              <div className="flex flex-col sm:flex-row gap-4">
                
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-5 group relative">
                  <div className="flex justify-between items-start">
                    <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Naliehavosť</span>
                    {!isEditingUrgency && (
                      <button className="h-7 w-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-100 absolute right-3 top-3" onClick={() => {
                        setEditUrgency(job.urgency);
                        setIsEditingUrgency(true);
                      }}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  
                  {isEditingUrgency ? (
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="flex flex-wrap gap-2">
                        {[
                          {val: "low", label: "Nízka"}, 
                          {val: "normal", label: "Normálna"}, 
                          {val: "high", label: "Vysoká"}, 
                          {val: "critical", label: "Kritická"}
                        ].map((u) => (
                          <button 
                            key={u.val}
                            className={`font-semibold text-xs px-3 py-1.5 rounded-md border ${
                              editUrgency === u.val
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                            onClick={() => setEditUrgency(u.val)}
                          >
                            {u.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex w-full justify-end gap-2 mt-2 pt-2 border-t border-slate-200/50">
                         <button className="h-8 w-8 flex items-center justify-center rounded-md text-red-600 hover:bg-red-50 transition-colors" onClick={() => setIsEditingUrgency(false)}><X className="h-4 w-4"/></button>
                         <button className="h-8 w-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" onClick={() => handleUpdateDetails('urgency')}><Check className="h-4 w-4"/></button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <span className={`inline-block px-2.5 py-1 text-sm font-semibold rounded-md ${
                        job.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                        job.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                        job.urgency === 'normal' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {job.urgency === "low" ? "Nízka" :
                         job.urgency === "normal" ? "Normálna" :
                         job.urgency === "high" ? "Vysoká" : "Kritická"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-5 group relative">
                  <div className="flex justify-between items-start">
                    <span className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Cena</span>
                    {!isEditingPrice && (
                      <button className="h-7 w-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-100 absolute right-3 top-3" onClick={() => {
                        setEditEstPrice(job.estimated_price?.toString() || "");
                        setEditFinalPrice(job.final_price?.toString() || "");
                        setIsEditingPrice(true);
                      }}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  
                  {isEditingPrice ? (
                    <div className="space-y-3 mt-2">
                       <div className="flex items-center gap-3">
                         <span className="text-xs font-semibold text-slate-500 w-14">Odhad:</span>
                         <input type="number" value={editEstPrice} onChange={e => setEditEstPrice(e.target.value)} placeholder="0.00" className="flex-1 h-8 bg-white border border-slate-200 rounded-md px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="text-xs font-semibold text-slate-500 w-14">Finál:</span>
                         <input type="number" value={editFinalPrice} onChange={e => setEditFinalPrice(e.target.value)} placeholder="0.00" className="flex-1 h-8 bg-white border border-slate-200 rounded-md px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                       </div>
                       <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-200/50">
                         <button className="h-8 w-8 flex items-center justify-center rounded-md text-red-600 hover:bg-red-50 transition-colors" onClick={() => setIsEditingPrice(false)}><X className="h-4 w-4"/></button>
                         <button className="h-8 w-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" onClick={() => handleUpdateDetails('price')}><Check className="h-4 w-4"/></button>
                       </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-medium text-slate-500">Odhad:</span>
                        <span className="text-base font-semibold text-slate-700">{job.estimated_price ? `${job.estimated_price} €` : "—"}</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-slate-200/50">
                        <span className="text-sm font-medium text-slate-500">Finálna:</span>
                        <span className="text-xl font-bold text-emerald-600">{job.final_price ? `${job.final_price} €` : "—"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div className="pt-2 group relative">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-slate-900">Popis problému</h4>
                  {!isEditingDesc && (
                    <button className="flex items-center gap-1.5 h-7 px-2 text-xs font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-slate-100" onClick={() => {
                      setEditDesc(job.description || "");
                      setIsEditingDesc(true);
                    }}>
                      <Edit2 className="h-3 w-3" /> Upraviť
                    </button>
                  )}
                </div>

                {isEditingDesc ? (
                  <div className="space-y-3">
                    <Textarea 
                      value={editDesc} 
                      onChange={e => setEditDesc(e.target.value)} 
                      rows={5}
                      className="w-full text-sm resize-y"
                    />
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" size="sm" onClick={() => setIsEditingDesc(false)}>Zrušiť</Button>
                      <Button size="sm" onClick={() => handleUpdateDetails('desc')}>Uložiť zmeny</Button>
                    </div>
                  </div>
                ) : (
                  job.description ? (
                    <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap p-4 bg-slate-50 rounded-lg border border-slate-100">
                      {job.description}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic py-2">Pridajte popis zákazky na tomto mieste.</p>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Section */}
          <Card className="rounded-xl border border-slate-200 shadow-sm bg-white flex flex-col overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-slate-400" /> Komunikácia a Poznámky
              </CardTitle>
            </CardHeader>
            <div className="flex flex-col">
              <div className="max-h-[400px] overflow-y-auto p-5 space-y-4 bg-white">
                {(job.messages || []).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">Žiadne poznámky zatiaľ.</p>
                ) : (
                  (job.messages || []).map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-lg rounded-tl-none p-3 border border-slate-100">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-2">
                          {new Date(msg.created_at).toLocaleString("sk-SK", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <form onSubmit={handleAddMessage} className="flex gap-3">
                  <Input 
                    placeholder="Pridať internú poznámku..." 
                    className="flex-1 bg-white"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" disabled={isSubmittingMessage || !newMessage.trim()} size="icon" className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <CardTitle className="text-lg font-semibold text-slate-900">Zákazník</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {customer ? (
                <>
                  <p className="font-bold text-lg text-slate-900 mb-4">{customer.name}</p>
                  <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-slate-500">Telefón:</span>
                      <span className="font-medium text-slate-900">{customer.phone || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-slate-500">Email:</span>
                      <span className="text-slate-700">{customer.email || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-xs font-semibold text-slate-500">Adresa:</span>
                      <span className="text-slate-700 leading-relaxed bg-slate-50 p-2 rounded-md border border-slate-100 mt-1">
                        {customer.address || "Neuvedená"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400 py-2">Zákazník nebol nájdený.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-400" /> Plánovanie
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {job.appointments && job.appointments.length > 0 ? (
                <div className="space-y-3 mb-5">
                  {job.appointments.map(appt => (
                    <div key={appt.id} className="flex items-center gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50/50">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{new Date(appt.scheduled_time).toLocaleString("sk-SK", { dateStyle: "medium", timeStyle: "short" })}</span>
                        <span className="text-xs font-medium text-slate-500 mt-0.5">{appt.duration_minutes || 60} minút</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 mb-5">Zatiaľ žiadne naplánované termíny.</p>
              )}
              
              <form onSubmit={handleAddAppointment} className="flex flex-col gap-3 pt-5 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-500">Nový termín</label>
                <Input 
                  type="datetime-local" 
                  value={appointmentDate}
                  onChange={e => setAppointmentDate(e.target.value)}
                  className="w-full text-sm"
                />
                <Button type="submit" disabled={isSubmittingAppt || !appointmentDate} className="w-full mt-1">
                  Pridať termín
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <CardTitle className="text-lg font-semibold text-slate-900">Zmeniť Stav</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-col gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={s === job.status}
                    className={`text-left text-sm font-medium px-4 py-2.5 rounded-lg transition-colors border ${
                      s === job.status 
                        ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm cursor-default"
                        : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {STATUS_LABELS[s] || s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
