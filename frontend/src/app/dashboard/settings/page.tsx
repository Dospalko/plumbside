"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getUser, updateUser, getTenant, updateTenant, getUsers, createUser, deleteUser, UserProfile, TenantProfile } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, UserCircle, Save, Loader2, CheckCircle2, Users, Plus, Wrench, Shield, Trash2 } from "lucide-react";
import { motion, Variants } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function SettingsPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingTenant, setSavingTenant] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Form states - Profile
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Form states - Tenant
  const [companyName, setCompanyName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Form states - New Team Member
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("technician");
  const [savingNewUser, setSavingNewUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!token) return;

    const load = async () => {
      try {
        const [u, t, usersData] = await Promise.all([
          getUser(token),
          getTenant(token),
          getUsers(token)
        ]);
        setUser(u);
        setTenant(t);
        setTeam(usersData);
        setFullName(u.full_name);
        setEmail(u.email);
        setCompanyName(t.name);
        if (t.notifications_enabled !== undefined) {
          setNotificationsEnabled(t.notifications_enabled);
        }
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
      setPassword("");
      showSuccess("Zmeny používateľa uložené.");
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
      const updated = await updateTenant(token, { name: companyName, notifications_enabled: notificationsEnabled });
      setTenant(updated);
      showSuccess("Firemné údaje uložené.");
    } catch (err: any) {
      alert("Chyba: " + (err.message || "Nepodarilo sa uložiť firmu"));
    } finally {
      setSavingTenant(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingNewUser(true);
    try {
      const created = await createUser(token, {
        email: newUserEmail,
        full_name: newUserName,
        password: newUserPassword,
        role: newUserRole,
        is_super_admin: false
      });
      setTeam([created, ...team]);
      setShowNewUserForm(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      showSuccess("Používateľ úspešne vytvorený.");
    } catch (err: any) {
      alert("Chyba: " + (err.message || "Nepodarilo sa vytvoriť používateľa"));
    } finally {
      setSavingNewUser(false);
    }
  }

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Naozaj chcete natrvalo vymazať prístup pre používateľa "${name}"?Táto akcia je nevratná.`)) return;
    if (!token) return;
    setDeletingUserId(userId);
    try {
      await deleteUser(token, userId);
      setTeam(team.filter(u => u.id !== userId));
      showSuccess(`Používateľ ${name} bol vymazaný.`);
    } catch (err: any) {
      alert("Chyba: " + (err.message || "Nepodarilo sa vymazať používateľa"));
    } finally {
      setDeletingUserId(null);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 w-full h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Nastavenia</h2>
          <p className="text-slate-500 mt-1">Spravujte svoj osobný profil a nastavenia firmy.</p>
        </div>
        
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            {successMsg}
          </motion.div>
        )}
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="flex flex-col md:grid w-full md:w-[600px] md:grid-cols-3 h-auto mb-6 gap-1 md:gap-0 bg-transparent md:bg-slate-100 p-0 md:p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2 w-full justify-start md:justify-center border border-slate-200 md:border-none bg-white md:bg-transparent"><UserCircle className="h-4 w-4" /> Osobný Profil</TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2 w-full justify-start md:justify-center border border-slate-200 md:border-none bg-white md:bg-transparent"><Building2 className="h-4 w-4" /> Profil Firmy</TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2 w-full justify-start md:justify-center border border-slate-200 md:border-none bg-white md:bg-transparent"><Users className="h-4 w-4" /> Tím a Zamestnanci</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
            <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden transition-all h-full flex flex-col">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                <CardTitle className="text-lg font-semibold text-slate-900">Osobný Záznam</CardTitle>
                <CardDescription>Základné informácie a prístupové údaje vášho účtu.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleUserSave} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700">Meno a Priezvisko</label>
                      <input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Prihlasovací e-mail</label>
                      <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium transition-all" />
                    </div>
                    <div className="pt-4 border-t border-slate-100 mt-6">
                      <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 flex justify-between">
                          <span>Nové Heslo</span><span className="text-slate-400 font-normal text-xs">Voliteľné</span>
                        </label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Zadajte iba ak chcete zmeniť súčasné heslo" className="w-full h-10 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium transition-all placeholder:font-normal placeholder:text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={savingUser || (!fullName && !email)} className="h-10 px-6 w-full sm:w-auto bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Uložiť Zmeny
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
            <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden transition-all h-full flex flex-col">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                <CardTitle className="text-lg font-semibold text-slate-900">Firemný Profil</CardTitle>
                <CardDescription>Oficiálna reprezentácia subjektu pre fakturačné a zobrazovacie účely.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleTenantSave} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700">Názov firmy / Živnosti</label>
                    <input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Napr. inštalatér Ján Novák" className="w-full h-10 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium transition-all" />
                    <p className="text-xs text-slate-500 mt-1">Tento názov sa bude zobrazovať vašim zákazníkom a na dokladoch.</p>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-slate-100 mt-6">
                    <h3 className="text-sm font-semibold text-slate-900">Komunikácia so zákazníkmi</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium text-slate-900">Automatické SMS / E-maily</label>
                        <p className="text-xs text-slate-500">Posielať zákazníkom automatickú notifikáciu "Inštalatér je na ceste", keď zmeníte stav zákazky na "Prebieha".</p>
                      </div>
                      <div className="flex justify-end">
                        <button type="button" role="switch" aria-checked={notificationsEnabled} onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}>
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={savingTenant || !companyName.trim()} className="h-10 w-full sm:w-auto px-6 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {savingTenant ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Uložiť Zmeny
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
            <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden transition-all h-full flex flex-col">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Správa Tímu</CardTitle>
                  <CardDescription>Pridajte prístupy pre dispečerov a montérov v teréne.</CardDescription>
                </div>
                {!showNewUserForm && (
                  <button onClick={() => setShowNewUserForm(true)} className="h-9 px-4 w-full sm:w-auto justify-center bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Pridať člena
                  </button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {showNewUserForm && (
                  <div className="p-6 bg-slate-50 border-b border-slate-100">
                    <form onSubmit={handleCreateUser} className="max-w-md space-y-4">
                      <h4 className="font-semibold text-slate-900 text-sm mb-4">Nový člen tímu</h4>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Meno a Priezvisko</label>
                        <input required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full h-9 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Prihlasovací e-mail</label>
                        <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full h-9 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Prístupové Heslo</label>
                        <input type="password" required value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full h-9 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Rola (Prístupové práva)</label>
                        <select required value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full h-9 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm bg-white">
                          <option value="technician">Montér / Technik (ba mobilná appka)</option>
                          <option value="dispatcher">Dispečer (Kancelária)</option>
                          <option value="owner">Majiteľ (Plný prístup)</option>
                        </select>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowNewUserForm(false)} className="h-9 px-4 w-full sm:w-auto text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Zrušiť</button>
                        <button type="submit" disabled={savingNewUser} className="h-9 px-4 w-full sm:w-auto bg-blue-600 justify-center text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                          {savingNewUser && <Loader2 className="w-3 h-3 animate-spin"/>} Vytvoriť používateľa
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                <div className="divide-y divide-slate-100">
                  {team.map((tUser) => (
                    <div key={tUser.id} className="p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full border border-slate-100 shadow-sm shrink-0 ${tUser.role === 'owner' ? 'bg-purple-50 text-purple-600 border-purple-100' : tUser.role === 'technician' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                          {tUser.role === 'owner' ? <Shield className="w-5 h-5" /> : tUser.role === 'technician' ? <Wrench className="w-5 h-5" /> : <UserCircle className="w-5 h-5"/>}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{tUser.full_name}</p>
                          <p className="text-sm text-slate-500">{tUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center sm:justify-end justify-between gap-3 pt-2 sm:pt-0 border-t border-slate-100 sm:border-none">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 flex items-center justify-center rounded-md border border-slate-200">
                          {tUser.role === 'owner' ? 'Majiteľ' : tUser.role === 'technician' ? 'Technik' : 'Dispečer'}
                        </span>
                        {(user?.role === 'owner' && user.id !== tUser.id) && (
                          <button 
                            onClick={() => handleDeleteUser(tUser.id, tUser.full_name)}
                            disabled={deletingUserId === tUser.id}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 border border-transparent hover:border-red-100"
                            title="Vymazať používateľa"
                          >
                            {deletingUserId === tUser.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {team.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-sm">Zatiaľ nemáte žiadnych ďalších členov tímu.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
