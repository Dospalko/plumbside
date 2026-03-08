"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, ArrowRight } from "lucide-react";
import { login as apiLogin } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      login(data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Prihlásenie zlyhalo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10 z-10">
        
        <form onSubmit={handleSubmit} className="mt-2">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center bg-blue-50 text-blue-600 rounded-xl">
              <Wrench className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
              Prihlásenie do systému
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Zadajte svoje prístupové údaje
            </p>
          </div>

          <div className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 text-red-600 border border-red-100 px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 border border-slate-200 rounded-lg px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 font-medium transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Heslo
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 border border-slate-200 rounded-lg px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-medium transition-all"
              />
            </div>
          </div>

          <div className="mt-8">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Spracovávam..." : "Prihlásiť sa"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
