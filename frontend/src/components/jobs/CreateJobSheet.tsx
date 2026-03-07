"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { createJob, getCustomers, Customer } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface Props {
  onCreated: () => void;
}

export function CreateJobSheet({ onCreated }: Props) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && token) {
      getCustomers(token).then(setCustomers).catch(console.error);
    }
  }, [open, token]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customer_id = formData.get("customer_id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const urgency = formData.get("urgency") as string;
    const estimated_price_str = formData.get("estimated_price") as string;

    if (!token || !customer_id) return;
    
    setLoading(true);
    try {
      await createJob(token, {
        customer_id,
        title,
        description: description || undefined,
        urgency,
        estimated_price: estimated_price_str ? parseFloat(estimated_price_str) : undefined,
      });
      setOpen(false);
      onCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
          <Plus className="h-4 w-4" /> Nová zákazka
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto w-full">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-semibold text-slate-900">Vytvoriť novú zákazku</SheetTitle>
          <SheetDescription className="text-slate-500">
            Vyplňte detaily novej zákazky pre rýchly presun do Kanbanu.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="customer_id" className="text-slate-700 font-medium text-sm">Zákazník *</Label>
            <div className="relative">
              <select
                id="customer_id"
                name="customer_id"
                required
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all shadow-sm"
              >
                <option value="">-- Vyberte zákazníka --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {customers.length === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200 mt-2">
                Najprv musíte vytvoriť zákazníka.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-700 font-medium text-sm">Názov zákazky *</Label>
            <Input id="title" name="title" required placeholder="Napr. Oprava potrubia v kúpeľni" className="border-slate-300 focus-visible:ring-blue-600 text-slate-900" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium text-sm">Popis problému</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Zákazník hlási unikajúcu vodu z pod umývadla..."
              rows={4}
              className="resize-none border-slate-300 focus-visible:ring-blue-600 text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency" className="text-slate-700 font-medium text-sm">Naliehavosť</Label>
            <select
              id="urgency"
              name="urgency"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-all shadow-sm"
            >
              <option value="low">Nízka (Do týždňa)</option>
              <option value="normal" selected>Normálna (Do 3 dní)</option>
              <option value="high">Vysoká (Zajtra)</option>
              <option value="critical">Kritická (Havarijný stav)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_price" className="text-slate-700 font-medium text-sm">Odhadovaná cena (€)</Label>
            <Input id="estimated_price" name="estimated_price" type="number" step="0.01" placeholder="Napr. 150" className="border-slate-300 focus-visible:ring-blue-600 text-slate-900" />
          </div>

          <div className="pt-4 mt-6">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={loading || customers.length === 0}>
              {loading ? "Vytváram..." : "Vytvoriť zákazku"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
