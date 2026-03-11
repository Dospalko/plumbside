"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { getJob, getCustomers, patchJob, Job, Customer } from "@/lib/api";
import { ArrowLeft, PhoneCall, Navigation, CheckCircle2, Loader2, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function MobileJobDetailPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Completion modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [finalPrice, setFinalPrice] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!token) return;

    const loadData = async () => {
      try {
        const j = await getJob(token, jobId);
        setJob(j);
        const customers = await getCustomers(token);
        setCustomer(customers.find((c) => c.id === j.customer_id) || null);
      } catch (err) {
        console.error("Failed to load job", err);
        router.push("/mobile/jobs");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token, isAuthenticated, isLoaded, jobId, router]);

  const handleCompleteJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !job) return;
    
    setIsSubmitting(true);
    try {
      // Create description update string combining original notes with new completion notes
      const newDescription = completionNotes.trim() 
        ? `${job.description ? job.description + '\n\n--- ZÁZNAM TECHNIKA ---\n' : ''}${completionNotes}`
        : job.description;

      await patchJob(token, job.id, { 
        status: "done",
        final_price: finalPrice ? parseFloat(finalPrice) : null,
        description: newDescription
      });
      
      // Redirect back to list
      router.push("/mobile/jobs");
    } catch (err) {
      console.error(err);
      alert("Nepodarilo sa uložiť zákazku.");
      setIsSubmitting(false);
    }
  };

  const handleMapOpen = () => {
    if (!customer?.address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.address)}`;
    window.open(url, "_blank");
  };

  const handleCall = () => {
    if (!customer?.phone) return;
    window.open(`tel:${customer.phone}`, "_self");
  };

  if (loading || !job) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-28">
      {/* Back Button */}
      <Link href="/mobile/jobs" className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-4 px-1 py-2 active:scale-95 transition-transform w-max">
        <ArrowLeft className="w-4 h-4" /> Naspäť
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-1">
        
        <div className="flex justify-between items-center mb-4">
           <Badge className={`px-3 py-1 text-sm font-bold rounded-xl ${
              job.status === "in_progress" ? "bg-amber-100 text-amber-700" :
              job.status === "scheduled" ? "bg-blue-100 text-blue-700" :
              "bg-slate-100 text-slate-700"
            }`}>
              {job.status === "in_progress" ? "Prebieha" : job.status === "scheduled" ? "Naplánované" : "Nové"}
            </Badge>

            {job.urgency !== "normal" && job.urgency !== "low" && (
              <Badge variant="destructive" className="px-3 py-1 text-xs uppercase font-black tracking-wider rounded-xl">
                {job.urgency === "critical" ? "Kritické" : "Súrne"}
              </Badge>
            )}
        </div>

        <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">
          {customer?.name || "Neznámy zákazník"}
        </h1>
        <p className="text-lg font-medium text-slate-500 mb-8 border-b border-slate-100 pb-6">{job.title}</p>


        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          <button 
            onClick={handleMapOpen} 
            disabled={!customer?.address}
            className="w-full bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 rounded-2xl p-4 flex items-center gap-4 transition-colors active:scale-98"
          >
            <div className="bg-indigo-100 rounded-full p-3 shrink-0">
              <Navigation className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className="block text-sm font-bold uppercase tracking-wider text-indigo-400 mb-0.5">Navigovať</span>
              <span className="block font-semibold text-base leading-tight truncate">{customer?.address || "Zákazník nemá adresu"}</span>
            </div>
          </button>

          <button 
            onClick={handleCall} 
            disabled={!customer?.phone}
            className="w-full bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 rounded-2xl p-4 flex items-center gap-4 transition-colors active:scale-98"
          >
            <div className="bg-emerald-100 rounded-full p-3 shrink-0">
              <PhoneCall className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className="block text-sm font-bold uppercase tracking-wider text-emerald-400 mb-0.5">Zavolať</span>
              <span className="block font-semibold text-lg">{customer?.phone || "Chýba číslo"}</span>
            </div>
          </button>
        </div>


        {/* Description Section */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Zadaný popis problému</h3>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
            {job.description || "Dispečing nepridal žiadne detaily."}
          </div>
        </div>

      </div>

      {/* Floating Action Button - Complete Job */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-slate-200 z-10 flex justify-center pb-safe-bottom">
        <button 
          onClick={() => setShowCompleteModal(true)}
          className="w-full max-w-md bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg p-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <CheckCircle2 className="w-7 h-7" />
          DOKONČIŤ ZÁKAZKU
        </button>
      </div>

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-6 pb-safe-bottom animate-in slide-in-from-bottom-full duration-300">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Uzavrieť prácu</h2>
              <button onClick={() => setShowCompleteModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteJob} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Výsledná Cena (€)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl p-4 pl-12 text-2xl font-black text-slate-900 outline-none transition-all"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-2xl">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Poznámka z realizácie (Voliteľné)</label>
                <textarea 
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Čo bolo vymenené, aký materiál sa minul..."
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl p-4 text-slate-700 font-medium outline-none transition-all resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !finalPrice}
                className="w-full bg-slate-900 disabled:opacity-50 hover:bg-black text-white font-black text-lg p-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "ULOŽIŤ A ZAVRIEŤ"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
