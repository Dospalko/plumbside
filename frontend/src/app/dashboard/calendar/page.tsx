"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getJobs, getCustomers, createAppointment, Job, Customer, Appointment } from "@/lib/api";
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Plus, X, Check } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type EnrichedAppointment = Appointment & {
  jobTitle: string;
  customerName: string;
  jobId: string;
  jobStatus: string;
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nové", quoted: "Nacenené", scheduled: "Naplánované",
  in_progress: "Prebieha", done: "Hotové", cancelled: "Zrušené",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500",
  quoted: "bg-violet-500",
  scheduled: "bg-cyan-500",
  in_progress: "bg-amber-500",
  done: "bg-emerald-500",
  cancelled: "bg-slate-400",
};

const DAYS_SK = ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"];
const MONTHS_SK = [
  "Január", "Február", "Marec", "Apríl", "Máj", "Jún",
  "Júl", "August", "September", "Október", "November", "December"
];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday=0, Sunday=6 (ISO)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  // Previous month fill
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }
  // Next month fill to complete 6 rows 
  while (days.length < 42) {
    const nextDate = new Date(year, month + 1, days.length - lastDay.getDate() - startDow + 1);
    days.push({ date: nextDate, isCurrentMonth: false });
  }

  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Calendar nav
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Selected day
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Add appointment form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addJobId, setAddJobId] = useState("");
  const [addTime, setAddTime] = useState("09:00");
  const [addDuration, setAddDuration] = useState("60");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    if (!token) return;
    try {
      const [jobsRes, customersRes] = await Promise.all([
        getJobs(token),
        getCustomers(token)
      ]);
      setJobs(jobsRes);
      setCustomers(customersRes);

      const appts: EnrichedAppointment[] = [];
      jobsRes.forEach((job) => {
        if (job.appointments && job.appointments.length > 0) {
          const cust = customersRes.find(c => c.id === job.customer_id);
          job.appointments.forEach(a => {
            appts.push({
              ...a,
              jobTitle: job.title,
              customerName: cust ? cust.name : "Neznámy",
              jobId: job.id,
              jobStatus: job.status
            });
          });
        }
      });

      appts.sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());
      setAppointments(appts);
    } catch (e) {
      console.error("Chyba pri načítaní kalendára", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    loadData();
  }, [isLoaded, isAuthenticated, token]);

  const monthDays = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const goToPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goToNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const goToToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDate(today); };

  const getApptsForDate = (date: Date) =>
    appointments.filter(a => isSameDay(new Date(a.scheduled_time), date));

  const selectedAppts = selectedDate ? getApptsForDate(selectedDate) : [];

  // Available jobs for adding appointment
  const activeJobs = jobs.filter(j => j.status !== "done" && j.status !== "cancelled");

  const handleAddAppointment = async () => {
    if (!token || !addJobId || !selectedDate) return;
    setIsSubmitting(true);
    try {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}T${addTime}:00`;
      await createAppointment(token, addJobId, {
        scheduled_time: new Date(dateStr).toISOString(),
        duration_minutes: parseInt(addDuration) || 60,
      });
      setShowAddForm(false);
      setAddJobId("");
      setAddTime("09:00");
      setAddDuration("60");
      await loadData();
    } catch (err) {
      console.error("Chyba pri pridávaní termínu", err);
      alert("Nepodarilo sa pridať termín.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 font-medium">Načítavam kalendár...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full px-6 py-8 flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Kalendár</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Prehľad a plánovanie výjazdov</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Calendar Grid */}
        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <button onClick={goToPrev} className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-600 hover:text-slate-900">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-slate-900 min-w-[180px] text-center">
                {MONTHS_SK[viewMonth]} {viewYear}
              </h3>
              <button onClick={goToNext} className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-600 hover:text-slate-900">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button onClick={goToToday} className="text-sm font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
              Dnes
            </button>
          </div>

          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS_SK.map(d => (
                <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-lg overflow-hidden">
              {monthDays.map(({ date, isCurrentMonth }, idx) => {
                const dayAppts = getApptsForDate(date);
                const isToday = isSameDay(date, today);
                const isSelected = selectedDate && isSameDay(date, selectedDate);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      relative flex flex-col items-start p-2 min-h-[80px] text-left transition-all bg-white
                      ${!isCurrentMonth ? "opacity-40" : ""}
                      ${isSelected ? "ring-2 ring-blue-500 ring-inset z-10" : "hover:bg-slate-50"}
                    `}
                  >
                    <span className={`
                      text-sm font-semibold mb-1 w-7 h-7 flex items-center justify-center rounded-full
                      ${isToday ? "bg-blue-600 text-white" : "text-slate-700"}
                    `}>
                      {date.getDate()}
                    </span>

                    {dayAppts.length > 0 && (
                      <div className="flex flex-col gap-0.5 w-full overflow-hidden mt-0.5">
                        {dayAppts.slice(0, 2).map(a => (
                          <div key={a.id} className={`text-[10px] font-semibold text-white px-1.5 py-0.5 rounded truncate ${STATUS_COLORS[a.jobStatus] || "bg-slate-500"}`}>
                            {new Date(a.scheduled_time).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })} {a.jobTitle}
                          </div>
                        ))}
                        {dayAppts.length > 2 && (
                          <span className="text-[10px] font-bold text-slate-500">+{dayAppts.length - 2} ďalších</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Right Sidebar: Details for selected day */}
        <div className="space-y-4">
          <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h4 className="font-bold text-slate-900">
                {selectedDate
                  ? selectedDate.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long' })
                  : "Vyberte deň"
                }
              </h4>
              {selectedDate && (
                <button
                  onClick={() => { setShowAddForm(true); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Pridať
                </button>
              )}
            </div>

            <CardContent className="p-5">
              {!selectedDate ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium">Kliknite na deň v kalendári</p>
                </div>
              ) : selectedAppts.length === 0 && !showAddForm ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium">Žiadne termíny na tento deň.</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    + Naplánovať termín
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedAppts.map(appt => {
                    const d = new Date(appt.scheduled_time);
                    const timeStr = d.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <Link key={appt.id} href={`/dashboard/jobs/${appt.jobId}`}>
                        <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                          <div className={`w-1 self-stretch rounded-full shrink-0 ${STATUS_COLORS[appt.jobStatus] || "bg-slate-400"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{appt.jobTitle}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                              <span className="flex items-center gap-1 font-semibold">
                                <Clock className="w-3 h-3" /> {timeStr} · {appt.duration_minutes || 60}m
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <User className="w-3 h-3" />
                              <span>{appt.customerName}</span>
                              <span className="text-slate-300">·</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${STATUS_COLORS[appt.jobStatus]}`}>
                                {STATUS_LABELS[appt.jobStatus] || appt.jobStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Add Appointment Form */}
              {showAddForm && selectedDate && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-900">Nový termín</h5>
                    <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Zákazka *</label>
                    <select
                      value={addJobId}
                      onChange={e => setAddJobId(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">— Vyberte zákazku —</option>
                      {activeJobs.map(j => {
                        const cust = customers.find(c => c.id === j.customer_id);
                        return (
                          <option key={j.id} value={j.id}>
                            {j.title} {cust ? `(${cust.name})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600">Čas</label>
                      <input
                        type="time"
                        value={addTime}
                        onChange={e => setAddTime(e.target.value)}
                        className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600">Trvanie (min)</label>
                      <input
                        type="number"
                        value={addDuration}
                        onChange={e => setAddDuration(e.target.value)}
                        min={15}
                        step={15}
                        className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddAppointment}
                    disabled={!addJobId || isSubmitting}
                    className="w-full h-10 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-1"
                  >
                    {isSubmitting ? "Ukladám..." : <><Check className="w-4 h-4" /> Naplánovať</>}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-5">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Tento mesiac</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {appointments.filter(a => {
                      const d = new Date(a.scheduled_time);
                      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
                    }).length}
                  </p>
                  <p className="text-xs text-blue-600 font-semibold mt-1">Termínov</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700">
                    {new Set(appointments.filter(a => {
                      const d = new Date(a.scheduled_time);
                      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
                    }).map(a => a.jobId)).size}
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">Zákaziek</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
