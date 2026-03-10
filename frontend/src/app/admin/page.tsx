"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getUser, getAdminTenants, AdminTenantList } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ShieldCheck, Activity } from "lucide-react";
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

export default function AdminDashboardPage() {
  const { token, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();
  const [tenants, setTenants] = useState<AdminTenantList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (token) {
      // Verify Super Admin
      getUser(token)
        .then((user) => {
          if (!user.is_super_admin) {
            router.push("/dashboard");
          } else {
            // Load stats
            getAdminTenants(token).then(setTenants).catch(console.error);
          }
        })
        .catch(() => router.push("/login"))
        .finally(() => setLoading(false));
    }
  }, [token, isAuthenticated, isLoaded, router]);

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-slate-500">Načítavam administráciu...</div>;
  }

  const totalTenants = tenants.length;
  const totalUsers = tenants.reduce((acc, t) => acc + t.user_count, 0);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full"
    >
      <motion.div variants={item} className="mb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center bg-red-100 text-red-600 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Prehľad Platformy</h2>
            <p className="text-slate-500 mt-1">Súhrnné štatistiky všetkých firiem v systéme.</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={container} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Firemné Účty", value: totalTenants, icon: Building2, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Počet Používateľov", value: totalUsers, icon: Users, color: "text-amber-600", bg: "bg-amber-100" },
          { title: "Status Platformy", value: "Online", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-100" },
        ].map((stat, i) => (
          <motion.div variants={item} key={i}>
            <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
