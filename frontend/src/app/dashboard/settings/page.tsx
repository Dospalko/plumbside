"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getUser, updateUser, getTenant, updateTenant, UserProfile, TenantProfile } from "@/lib/api";
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
      showSuccess("ZÁZNAM ÚSPEŠNE UPRAVENÝ");
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
      showSuccess("DÁTA FIRMY BOLI ZMENENÉ");
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
    return <div className="flex items-center justify-center h-64 text-foreground font-black uppercase tracking-widest text-lg">Systém načítava dáta...</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl w-full mx-auto px-6 py-8 flex-1 bg-transparent">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[3px] border-foreground pb-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">Nastavenia</h2>
          <p className="font-sans font-medium text-xs text-foreground/70 uppercase tracking-widest mt-2">Dáta & Konfigurácia Systému</p>
        </div>
        
        {/* Success toast dummy inline */}
        <div className={`transition-all duration-300 flex items-center gap-3 bg-emerald-400 text-foreground px-4 py-3 border-[3px] border-foreground shadow-[4px_4px_0px_#1a1919] font-black uppercase tracking-widest ${successMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
          <span className="text-xs">{successMsg}</span>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-[460px] grid-cols-2 mb-8 bg-transparent p-0 gap-4">
          <TabsTrigger value="profile" className="data-[state=active]:bg-foreground data-[state=active]:text-white data-[state=active]:shadow-[4px_4px_0px_#1a1919] border-[3px] border-foreground bg-white text-foreground font-black uppercase tracking-widest flex items-center gap-2 h-14 rounded-none hover:translate-x-[2px] transition-all">
            <UserCircle className="h-5 w-5 stroke-[2.5]" /> Osobný Profil
          </TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-foreground data-[state=active]:text-white data-[state=active]:shadow-[4px_4px_0px_#1a1919] border-[3px] border-foreground bg-white text-foreground font-black uppercase tracking-widest flex items-center gap-2 h-14 rounded-none hover:translate-x-[2px] transition-all">
            <Building2 className="h-5 w-5 stroke-[2.5]" /> Profil Firmy
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-0 outline-none">
          <div className="border-[3px] border-foreground shadow-[8px_8px_0px_#1a1919] bg-white flex flex-col max-w-2xl">
            <div className="border-b-[3px] border-foreground bg-[#FAF9F6] p-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Osobný Záznam</h3>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-foreground/50 mt-2">// Osobné Prístupové Údaje</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleUserSave} className="space-y-8">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-foreground">Základné meno</label>
                    <input 
                      id="fullName" 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      className="border-[3px] border-foreground focus:outline-none focus:border-primary shadow-[4px_4px_0px_#1a1919] h-14 px-4 font-bold uppercase transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-foreground">Prihlasovací e-mail</label>
                    <input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="border-[3px] border-foreground focus:outline-none focus:border-primary shadow-[4px_4px_0px_#1a1919] h-14 px-4 font-bold transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2 border-t-[3px] border-foreground/10 pt-6 mt-4">
                    <label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-foreground flex justify-between">
                      Nové Heslo <span className="text-foreground/40">// VOLITEĽNÉ</span>
                    </label>
                    <input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="NEVYPLŇUJTE, AK NECHCETE ZMENIŤ"
                      className="border-[3px] border-foreground focus:outline-none focus:border-primary shadow-[4px_4px_0px_#1a1919] h-14 px-4 font-bold placeholder:font-mono placeholder:text-foreground/30 transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={savingUser || (!fullName && !email)} className="bg-primary hover:bg-white text-foreground border-[3px] border-foreground font-black uppercase tracking-widest shadow-[4px_4px_0px_#1a1919] h-14 px-10 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1a1919] disabled:opacity-50 flex items-center">
                    {savingUser ? <Loader2 className="mr-3 h-5 w-5 animate-spin stroke-[2.5]" /> : <Save className="mr-3 h-5 w-5 stroke-[2.5]" />}
                    Zapísať Zmeny
                  </button>
                </div>
              </form>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="company" className="mt-0 outline-none">
          <div className="border-[3px] border-foreground shadow-[8px_8px_0px_#1a1919] bg-white flex flex-col max-w-2xl">
            <div className="border-b-[3px] border-foreground bg-[#FAF9F6] p-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">Firemné Dáta</h3>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-foreground/50 mt-2">// Oficiálna reprezentácia subjektu</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleTenantSave} className="space-y-8">
                <div className="flex flex-col gap-2">
                  <label htmlFor="companyName" className="text-xs font-black uppercase tracking-widest text-foreground">Identifikátor (Názov/Živnosť)</label>
                  <input 
                    id="companyName" 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)} 
                    placeholder="Napr. Vodár Ján Novák..."
                    className="border-[3px] border-foreground focus:outline-none focus:border-primary shadow-[4px_4px_0px_#1a1919] h-14 px-4 font-bold uppercase transition-all"
                  />
                  <p className="text-[10px] font-mono font-bold text-foreground/50 mt-2">// URČUJE ZOBRAZENIE V HLAVNOM PANELI</p>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={savingTenant || !companyName.trim()} className="bg-foreground hover:bg-white border-[3px] hover:border-foreground hover:text-foreground text-white font-black uppercase tracking-widest shadow-[4px_4px_0px_#1a1919] h-14 px-10 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1a1919] disabled:opacity-50 flex items-center">
                    {savingTenant ? <Loader2 className="mr-3 h-5 w-5 animate-spin stroke-[2.5]" /> : <Save className="mr-3 h-5 w-5 stroke-[2.5]" />}
                    Zapísať Zmeny
                  </button>
                </div>
              </form>
            </div>
          </div>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
