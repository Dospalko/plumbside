"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { getJob, getCustomers, getTenant, Job, Customer, TenantProfile } from "@/lib/api";
import { Loader2, Printer } from "lucide-react";

export default function PrintJobPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!token) return;

    const load = async () => {
      try {
        const [j, customers, t] = await Promise.all([
          getJob(token, jobId),
          getCustomers(token),
          getTenant(token)
        ]);
        setJob(j);
        setCustomer(customers.find((c) => c.id === j.customer_id) || null);
        setTenant(t);
      } catch (err) {
        console.error("Failed to load data for printing", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, isAuthenticated, isLoaded, jobId, router]);

  if (loading || !job || !tenant) {
    return (
      <div className="flex items-center justify-center p-12 min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 print:py-0 print:bg-white flex flex-col items-center">
      
      {/* Floating Action Bar (Hidden when printing) */}
      <div className="fixed top-4 right-4 flex gap-3 print:hidden z-50">
        <button 
          onClick={() => window.close()} 
          className="px-4 py-2 bg-white text-slate-700 font-medium text-sm rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
        >
          Zatvoriť
        </button>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <Printer className="w-4 h-4" /> Vytlačiť PDF
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="w-full max-w-[210mm] min-h-[297mm] bg-white p-12 shadow-md print:shadow-none print:p-0 mx-auto text-slate-900">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Servisný List</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">Číslo zákazky: {job.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-slate-900">{tenant.name}</h2>
            <p className="text-sm text-slate-500 mt-2">Dátum vystavenia:</p>
            <p className="text-base font-semibold">{new Date().toLocaleDateString("sk-SK")}</p>
          </div>
        </div>

        {/* Entities (Customer & Job Details) */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Zákazník</h3>
            {customer ? (
              <div className="text-base leading-relaxed">
                <p className="font-bold">{customer.name}</p>
                <p>{customer.phone}</p>
                <p>{customer.email}</p>
                <p className="mt-2">{customer.address}</p>
              </div>
            ) : (
              <p className="italic text-slate-500">Neuvedený</p>
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Údaje o zákazke</h3>
            <div className="text-base leading-relaxed">
              <p><span className="font-medium text-slate-500">Názov:</span> <span className="font-bold">{job.title}</span></p>
              <p><span className="font-medium text-slate-500">Založené:</span> {new Date(job.created_at).toLocaleDateString("sk-SK")}</p>
              <p><span className="font-medium text-slate-500">Naliehavosť:</span> {
                job.urgency === 'low' ? 'Nízka' : 
                job.urgency === 'normal' ? 'Normálna' : 
                job.urgency === 'high' ? 'Vysoká' : 'Kritická'
              }</p>
            </div>
          </div>
        </div>

        {/* Description / Scope of Work */}
        <div className="mb-12">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Popis prác / Závady</h3>
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-lg min-h-[160px]">
             {job.description ? (
               <p className="text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
             ) : (
               <p className="text-sm italic text-slate-400">Nebol pridaný žiadny textový popis zákazky.</p>
             )}
          </div>
        </div>

        {/* Price Summary */}
        <div className="flex justify-end mb-24">
          <div className="w-1/2 bg-white border-2 border-slate-900 rounded-xl overflow-hidden">
            <div className="border-b border-slate-200 p-4 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600">Odhadovaná cena:</span>
              <span className="text-lg font-medium">{job.estimated_price ? `${job.estimated_price.toFixed(2)} €` : '—'}</span>
            </div>
            <div className="p-4 bg-slate-50 flex justify-between items-center">
              <span className="text-lg font-bold text-slate-900">Konečná Cena:</span>
              <span className="text-2xl font-black text-slate-900">{job.final_price ? `${job.final_price.toFixed(2)} €` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-16 mt-auto">
           <div className="text-center">
             <div className="border-b border-slate-400 h-16 w-full mb-2"></div>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Podpis Technika</p>
           </div>
           <div className="text-center">
             <div className="border-b border-slate-400 h-16 w-full mb-2"></div>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Podpis Zákazníka</p>
           </div>
        </div>

      </div>

    </div>
  );
}
