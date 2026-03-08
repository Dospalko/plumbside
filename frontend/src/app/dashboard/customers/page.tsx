"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getCustomers, createCustomer, Customer } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Users, Phone, Mail, MapPin } from "lucide-react";

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
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full px-6 py-8 flex-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Zákazníci</h2>
          <p className="text-slate-500 mt-1">Správa vašej klientely.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
              <Plus className="h-4 w-4" /> Nový zákazník
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-xl border border-slate-200 p-0 overflow-hidden shadow-lg">
            <DialogHeader className="bg-slate-50 border-b border-slate-100 p-6 pb-4">
              <DialogTitle className="text-xl font-semibold text-slate-900">Pridať zákazníka</DialogTitle>
              <DialogDescription className="text-slate-500 mt-1">
                Vyplňte údaje o novom zákazníkovi.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 p-6 bg-white">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium text-sm">Meno / Firma *</Label>
                <Input id="name" name="name" required placeholder="Napr. Ján Mrkvička" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-slate-300 focus-visible:ring-blue-600 text-slate-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Email</Label>
                <Input id="email" name="email" type="email" placeholder="jan@priklad.sk" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border-slate-300 focus-visible:ring-blue-600 text-slate-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium text-sm">Telefón</Label>
                <Input id="phone" name="phone" placeholder="+421 900 123 456" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border-slate-300 focus-visible:ring-blue-600 text-slate-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-700 font-medium text-sm">Adresa</Label>
                <Input id="address" name="address" placeholder="Hlavná 1, Bratislava" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="border-slate-300 focus-visible:ring-blue-600 text-slate-900" />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={loading}>
                  {loading ? "Ukladám..." : "Uložiť zákazníka"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 w-full max-w-md shadow-sm focus-within:ring-1 focus-within:ring-blue-600 focus-within:border-blue-600 transition-all">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              placeholder="Hľadať zákazníka..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-1 py-0 h-auto font-normal text-slate-900 placeholder:text-slate-400 w-full"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              {customers.length === 0 ? "Žiadni zákazníci v systéme." : "Nenašli sa žiadne výsledky."}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{customer.name}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
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
                    <div className="text-sm text-slate-500 sm:text-right flex items-center sm:justify-end gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />{customer.address}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
