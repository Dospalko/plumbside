"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getCustomers, createCustomer, Customer } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Users, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export default function CustomersPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    if (!token) return;
    const data = await getCustomers(token);
    setCustomers(data);
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    fetchCustomers();
  }, [token, isAuthenticated, isLoaded, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      await createCustomer(token, form);
      setForm({ name: "", phone: "", email: "", address: "" });
      setOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone || "").includes(searchQuery) ||
    (c.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full px-6 py-8 flex-1 bg-transparent">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Databáza Klientov</h2>
          <p className="font-medium text-sm text-slate-500 mt-2">Prístup ku klientským dátam a kontaktom</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-lg px-5 py-2.5 shadow-sm hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> Nový Záznam
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] p-0 border-slate-200 rounded-xl shadow-lg bg-white overflow-hidden gap-0">
            <DialogHeader className="bg-slate-50/80 border-b border-slate-100 p-6 pb-5">
              <DialogTitle className="text-xl font-bold text-slate-900">Pridať klienta do databázy</DialogTitle>
              <DialogDescription className="text-slate-500 text-sm mt-1">
                Vyplňte základné údaje o zákazníkovi pre budúce použitie.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-5 p-6 bg-white">
              <div className="space-y-2">
                <label htmlFor="name" className="text-slate-700 font-semibold text-sm">Meno / Firma *</label>
                <input id="name" name="name" required placeholder="Napr. Ján Mrkvička" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-11 border border-slate-200 rounded-lg px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 text-slate-900 text-sm transition-all bg-white" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-slate-700 font-semibold text-sm">Email</label>
                <input id="email" name="email" type="email" placeholder="jan@priklad.sk" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-11 border border-slate-200 rounded-lg px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 text-slate-900 text-sm transition-all bg-white" />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-slate-700 font-semibold text-sm">Telefón</label>
                <input id="phone" name="phone" placeholder="+421 900 123 456" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-11 border border-slate-200 rounded-lg px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 text-slate-900 text-sm transition-all bg-white" />
              </div>
              <div className="space-y-2">
                <label htmlFor="address" className="text-slate-700 font-semibold text-sm">Adresa</label>
                <input id="address" name="address" placeholder="Hlavná 1, Bratislava" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full h-11 border border-slate-200 rounded-lg px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 text-slate-900 text-sm transition-all bg-white" />
              </div>
              <div className="pt-3">
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold rounded-lg h-11 shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={loading}>
                  {loading ? "Ukladám..." : "Uložiť do systému"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-slate-200 shadow-sm bg-white flex flex-col overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 p-5">
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              placeholder="Vyhľadať v databáze..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 h-12 bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>
        </div>
        
        <div className="p-0">
          {filteredCustomers.length === 0 ? (
            <div className="p-16 text-center text-slate-500 font-medium text-sm">
              {customers.length === 0 ? "Databáza je zatiaľ úplne prázdna." : "Žiadny klient nevyhovuje vášmu hľadaniu."}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <Link key={customer.id} href={`/dashboard/customers/${customer.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50/80 transition-colors gap-4 group">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{customer.name}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs font-semibold text-slate-500">
                        {customer.phone && (
                          <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{customer.phone}</span>
                        )}
                        {customer.email && (
                          <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{customer.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {customer.address && (
                    <div className="text-sm font-medium text-slate-600 sm:text-right flex items-center sm:justify-end gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />{customer.address}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
