"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { createJob, getCustomers, Customer, aiIntake, createCustomer } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sparkles, Wand2, UploadCloud, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  onCreated: () => void;
}

export function CreateJobSheet({ onCreated }: Props) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // AI State
  const [aiMode, setAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiFile, setAiFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    urgency: "normal",
    estimated_price: "",
    customer_id: ""
  });

  useEffect(() => {
    if (open && token) {
      getCustomers(token).then(setCustomers).catch(console.error);
      // Reset state on open
      setFormState({ title: "", description: "", urgency: "normal", estimated_price: "", customer_id: "" });
      setAiMode(false);
      setAiText("");
      setAiFile(null);
    }
  }, [open, token]);

  const handleAiProcess = async () => {
    if (!token || (!aiText && !aiFile)) return;
    setAiLoading(true);
    try {
      const draft = await aiIntake(token, aiText, aiFile || undefined);
      
      let draftCustId = formState.customer_id;
      if (draft.customer_name) {
        // Find existing or create
        const match = customers.find(c => c.name.toLowerCase().includes(draft.customer_name!.toLowerCase()));
        if (match) {
          draftCustId = match.id;
        } else {
          const newC = await createCustomer(token, {
            name: draft.customer_name,
            phone: draft.customer_phone || undefined,
            address: draft.customer_address || undefined,
          });
          setCustomers(prev => [...prev, newC]);
          draftCustId = newC.id;
        }
      }

      setFormState(prev => ({
        ...prev,
        title: draft.job_title || "",
        description: draft.job_description || "",
        urgency: draft.job_urgency || "normal",
        customer_id: draftCustId
      }));
      setAiMode(false);
    } catch (err: any) {
      alert(err.message || "Nepodarilo sa spracovať AI požiadavku.");
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !formState.customer_id) return;
    
    setLoading(true);
    try {
      await createJob(token, {
        customer_id: formState.customer_id,
        title: formState.title,
        description: formState.description || undefined,
        urgency: formState.urgency,
        estimated_price: formState.estimated_price ? parseFloat(formState.estimated_price) : undefined,
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
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all hover:scale-105 active:scale-95">
          <Plus className="h-4 w-4" /> Nová zákazka
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto w-full custom-scrollbar">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between mt-4 sm:mt-0">
            <div>
              <SheetTitle className="text-xl font-semibold text-slate-900">Vytvoriť novú zákazku</SheetTitle>
              <SheetDescription className="text-slate-500">
                Vyplňte detaily novej zákazky pre rýchly presun do Kanbanu.
              </SheetDescription>
            </div>
            {!aiMode && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setAiMode(true)}
                className="gap-1.5 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 shrink-0 shadow-sm"
              >
                <Sparkles className="h-4 w-4" /> AI Asistent
              </Button>
            )}
          </div>
        </SheetHeader>

        {aiMode && (
          <div className="mb-6 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-purple-600" /> Vložte správu z WhatsAppu
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setAiMode(false)} className="h-6 w-6 text-purple-600 hover:bg-purple-200/50 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Textarea 
              placeholder="Vložte textovú správu od zákazníka (Meno, Problém, Adresa...)"
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              className="resize-none bg-white/80 border-purple-200 focus-visible:ring-purple-500 shadow-sm text-sm"
              rows={3}
            />
            
            <div className="mt-3 flex items-center justify-between">
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="audio/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className={`gap-2 text-xs shadow-sm ${aiFile ? 'border-purple-400 bg-purple-100/50 text-purple-800' : 'bg-white/80 text-slate-600 hover:text-purple-700 hover:border-purple-300'}`}
                >
                  <UploadCloud className="h-4 w-4" />
                  {aiFile ? aiFile.name : "Nahrať hlasovú správu (.mp3, .m4a)"}
                </Button>
              </div>
              
              <Button 
                type="button" 
                onClick={handleAiProcess} 
                disabled={aiLoading || (!aiText && !aiFile)}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all active:scale-95 text-xs h-8"
              >
                {aiLoading ? "Spracovávam..." : "Vyhodnotiť zadanie"}
              </Button>
            </div>
          </div>
        )}
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_id" className="text-slate-700 font-medium text-sm flex items-center justify-between">
              <span>Zákazník *</span>
              {formState.customer_id && customers.find(c => c.id === formState.customer_id) && (
                 <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 h-5">Vybraný</Badge>
              )}
            </Label>
            <select
              id="customer_id"
              required
              value={formState.customer_id}
              onChange={(e) => setFormState({ ...formState, customer_id: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all shadow-sm"
            >
              <option value="">-- Vyberte zákazníka --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {customers.length === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200 mt-2">
                Najprv musíte vytvoriť zákazníka.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-700 font-medium text-sm">Názov zákazky *</Label>
            <Input 
              id="title" 
              required 
              value={formState.title}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
              placeholder="Napr. Oprava potrubia v kúpeľni" 
              className="border-slate-300 focus-visible:ring-blue-600 text-slate-900 shadow-sm" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium text-sm">Popis problému</Label>
            <Textarea 
              id="description" 
              value={formState.description}
              onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              placeholder="Zákazník hlási unikajúcu vodu z pod umývadla..."
              rows={4}
              className="resize-none border-slate-300 focus-visible:ring-blue-600 text-slate-900 shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency" className="text-slate-700 font-medium text-sm">Naliehavosť</Label>
            <select
              id="urgency"
              value={formState.urgency}
              onChange={(e) => setFormState({ ...formState, urgency: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-all shadow-sm"
            >
              <option value="low">Nízka (Do týždňa)</option>
              <option value="normal">Normálna (Do 3 dní)</option>
              <option value="high">Vysoká (Zajtra)</option>
              <option value="critical">Kritická (Havarijný stav)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_price" className="text-slate-700 font-medium text-sm">Odhadovaná cena (€)</Label>
            <Input 
              id="estimated_price" 
              type="number" 
              step="0.01" 
              value={formState.estimated_price}
              onChange={(e) => setFormState({ ...formState, estimated_price: e.target.value })}
              placeholder="Napr. 150" 
              className="border-slate-300 focus-visible:ring-blue-600 text-slate-900 shadow-sm" 
            />
          </div>

          <div className="pt-4 mt-6">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all active:scale-[0.98]" disabled={loading || customers.length === 0}>
              {loading ? "Vytváram..." : "Vytvoriť zákazku a uložiť"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
