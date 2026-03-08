"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getUser, updateUser, getTenant, updateTenant, UserProfile, TenantProfile } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, UserCircle, Save, Loader2, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingTenant, setSavingTenant] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!token) return;

    const load = async () => {
      try {
        const [u, t] = await Promise.all([
          getUser(token),
          getTenant(token)
        ]);
        setUser(u);
        setTenant(t);
        setFullName(u.full_name);
        setEmail(u.email);
        setCompanyName(t.name);
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, isAuthenticated, isLoaded, router]);

  const handleUserSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingUser(true);
    setSuccessMsg("");
    try {
      const updateData: any = { full_name: fullName, email: email };
      if (password) updateData.password = password;
      const updated = await updateUser(token, updateData);
      setUser(updated);
      setPassword(""); // Clear password field
      showSuccess("Profil bol úspešne upravený");
    } catch (err: any) {
      alert("Chyba: " + (err.message || "Nepodarilo sa uložiť profil"));
    } finally {
      setSavingUser(false);
    }
  };

  const handleTenantSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingTenant(true);
    setSuccessMsg("");
    try {
      const updated = await updateTenant(token, { name: companyName });
      setTenant(updated);
      showSuccess("Názov firmy bol zmenený");
      
      // Force trigger an auth context update if we want the sidebar to update immediately (requires context change, but for MVP a reload/re-render is okay)
    } catch (err: any) {
      alert("Chyba: " + (err.message || "Nepodarilo sa uložiť firmu"));
    } finally {
      setSavingTenant(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500 font-medium tracking-tight">Načítavam nastavenia...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full mx-auto px-6 py-8 flex-1">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Nastavenia</h2>
          <p className="text-slate-500 mt-2">Spravujte svoj osobný profil a nastavenia firmy.</p>
        </div>
        
        {/* Success toast dummy inline */}
        <div className={`transition-all duration-300 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 shadow-sm ${successMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8 bg-slate-100/50 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex items-center gap-2 h-9">
            <UserCircle className="h-4 w-4" /> Môj Profil
          </TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex items-center gap-2 h-9">
            <Building2 className="h-4 w-4" /> Firma
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-0 outline-none">
          <Card className="rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] bg-white overflow-hidden max-w-2xl">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-6">
              <CardTitle className="text-xl font-semibold text-slate-900 tracking-tight">Základné údaje</CardTitle>
              <CardDescription>Zmeňte si svoje meno, email alebo vygenerujte nové heslo.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUserSave} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-slate-700 font-semibold">Celé meno</Label>
                    <Input 
                      id="fullName" 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      className="bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 rounded-xl h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 rounded-xl h-11"
                    />
                  </div>
                  <div className="grid gap-2 border-t border-slate-100 pt-4 mt-2">
                    <Label htmlFor="password" className="text-slate-700 font-semibold">Nové heslo (nepovinné)</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="Zadajte iba ak chcete heslo zmeniť..."
                      className="bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 rounded-xl h-11"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={savingUser || (!fullName && !email)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-8 shadow-sm transition-all hover:-translate-y-0.5">
                    {savingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Uložiť zmeny
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="mt-0 outline-none">
          <Card className="rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] bg-white overflow-hidden max-w-2xl">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-6">
              <CardTitle className="text-xl font-semibold text-slate-900 tracking-tight">Profil vašej firmy</CardTitle>
              <CardDescription>Tieto údaje sa zobrazujú zákazníkom a na faktúrach.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleTenantSave} className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="companyName" className="text-slate-700 font-semibold">Názov firmy / Živnosti</Label>
                  <Input 
                    id="companyName" 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)} 
                    placeholder="Napr. Vodár Ján Novák..."
                    className="bg-slate-50/50 border-slate-200 focus-visible:ring-blue-500 rounded-xl h-11"
                  />
                  <p className="text-xs text-slate-500 mt-1">Názov sa hneď objaví v ľavom hlavnom paneli.</p>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={savingTenant || !companyName.trim()} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-8 shadow-sm transition-all hover:-translate-y-0.5">
                    {savingTenant ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Uložiť názov firmy
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
