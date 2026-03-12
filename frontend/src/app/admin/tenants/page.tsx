"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getAdminTenants, createAdminTenant, deleteAdminTenant, AdminTenantList } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Plus, Loader2, CheckCircle2, Trash2 } from "lucide-react";
import { motion, Variants } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AdminTenantsPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();
  
  const [tenants, setTenants] = useState<AdminTenantList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingTenantId, setDeletingTenantId] = useState<string | null>(null);
  
  // Form state
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadTenants = async (token: string) => {
    try {
      const data = await getAdminTenants(token);
      setTenants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (token) {
      loadTenants(token);
    }
  }, [token, isAuthenticated, isLoaded, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    setCreating(true);
    try {
      const res = await createAdminTenant(token, {
        company_name: companyName,
        admin_name: adminName,
        admin_email: adminEmail,
        admin_password: adminPassword
      });
      setSuccessMsg(res.message);
      
      // Reset form
      setCompanyName("");
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      setShowForm(false);
      
      // Reload list
      await loadTenants(token);
      
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err: any) {
      setError(err.message || "Nepodarilo sa vytvoriť firmu");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string, name: string) => {
    if (!confirm(`Naozaj chcete natrvalo vymazať firmu "${name}" a všetky jej dáta? Túto akciu nie je možné vrátiť.`)) return;
    if (!token) return;
    setDeletingTenantId(tenantId);
    try {
      await deleteAdminTenant(token, tenantId);
      setTenants(tenants.filter(t => t.id !== tenantId));
      setSuccessMsg(`Firma ${name} bola úspešne vymazaná.`);
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err: any) {
      alert("Chyba: " + (err.message || "Nepodarilo sa vymazať firmu"));
    } finally {
      setDeletingTenantId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-slate-500"><Loader2 className="animate-spin h-6 w-6" /></div>;
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full"
    >
      <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center bg-red-100 text-red-600 rounded-xl">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Správa Firiem</h2>
            <p className="text-slate-500 mt-1">Zoznam zaregistrovaných tenantov na platforme.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="h-10 px-4 bg-slate-900 text-white font-medium rounded-lg shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Zrušiť" : "Pridať novú firmu"}
        </button>
      </motion.div>

      {successMsg && (
        <motion.div variants={item} className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-medium text-sm">{successMsg}</p>
        </motion.div>
      )}

      {showForm && (
        <motion.div variants={item} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle>Nová inštalácia pre zákazníka (Tenant)</CardTitle>
              <CardDescription>Týmto procesom vytvoríte firemné prostredie a inicializačný administrátorský účet pre nového zákazníka.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreate} className="space-y-6">
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Názov firmy / Značky</label>
                    <input 
                      required
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="Napr. inštalatéri s.r.o."
                      className="w-full h-10 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Meno Majiteľa (Admin)</label>
                    <input 
                      required
                      value={adminName}
                      onChange={e => setAdminName(e.target.value)}
                      placeholder="Napr. Ján Novák"
                      className="w-full h-10 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Prihlasovací e-mail</label>
                    <input 
                      required
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@firma.sk"
                      className="w-full h-10 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Iniciálne Heslo</label>
                    <input 
                      required
                      type="text"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Generujte bezpečné heslo"
                      className="w-full h-10 border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button 
                    type="submit" 
                    disabled={creating}
                    className="h-10 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Rozbehnúť novú firmu
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={item}>
        <Card className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Zákazník (Firma)</th>
                  <th className="px-6 py-4 font-semibold">Vytvorené</th>
                  <th className="px-6 py-4 font-semibold">Počet účtov</th>
                  <th className="px-6 py-4 font-semibold text-right">Akcie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString("sk-SK")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-100 rounded-full">
                        {t.user_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteTenant(t.id, t.name)}
                        disabled={deletingTenantId === t.id}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Vymazať firmu"
                      >
                        {deletingTenantId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Zatiaľ nemáte žiadnych zákazníkov na platforme.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
