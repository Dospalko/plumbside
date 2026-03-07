"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { createJob, getCustomers, Customer } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface Props {
  onCreated: () => void;
}

export function CreateJobSheet({ onCreated }: Props) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_id: "",
    title: "",
    description: "",
    urgency: "normal",
    estimated_price: "",
  });

  useEffect(() => {
    if (open && token) {
      getCustomers(token).then(setCustomers).catch(console.error);
    }
  }, [open, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !form.customer_id) return;
    setSaving(true);
    try {
      await createJob(token, {
        customer_id: form.customer_id,
        title: form.title,
        description: form.description || undefined,
        urgency: form.urgency,
        estimated_price: form.estimated_price ? parseFloat(form.estimated_price) : undefined,
      });
      setForm({ customer_id: "", title: "", description: "", urgency: "normal", estimated_price: "" });
      setOpen(false);
      onCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nová zákazka
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Vytvoriť zákazku</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="customer">Zákazník *</Label>
            <select
              id="customer"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
            >
              <option value="">-- Vyber zákazníka --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Názov zákazky *</Label>
            <Input
              id="title"
              required
              placeholder="napr. Oprava kúrenia"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Popis</Label>
            <textarea
              id="desc"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
              placeholder="Detailný popis problému..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgency">Naliehavosť</Label>
              <select
                id="urgency"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
              >
                <option value="low">Nízka</option>
                <option value="normal">Normálna</option>
                <option value="high">Vysoká</option>
                <option value="critical">Kritická</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Odhad ceny (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.estimated_price}
                onChange={(e) => setForm({ ...form, estimated_price: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Ukladám..." : "Vytvoriť zákazku"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
