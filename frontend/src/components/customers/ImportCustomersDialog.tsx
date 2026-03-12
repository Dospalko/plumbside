"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  customers: Array<{ id: string; name: string }>;
}

export function ImportCustomersDialog({ onImportComplete }: { onImportComplete: () => void }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !token) {
      alert("Vyberte CSV súbor.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/customers/import/csv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Chyba: ${error.detail || "Import neúspešný"}`);
        return;
      }

      const data: ImportResult = await res.json();
      setResult(data);

      // Refresh customers list
      if (data.success > 0) {
        setTimeout(() => {
          onImportComplete();
          setOpen(false);
          setFile(null);
          setResult(null);
        }, 2000);
      }
    } catch (err) {
      alert(`Chyba: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-emerald-600 text-white font-semibold rounded-lg px-4 py-2.5 shadow-sm hover:bg-emerald-700 transition-colors">
          <Upload className="h-4 w-4" /> Import CSV
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 border-slate-200 rounded-xl shadow-lg bg-white overflow-hidden gap-0">
        <DialogHeader className="bg-slate-50/80 border-b border-slate-100 p-6 pb-5">
          <DialogTitle className="text-xl font-bold text-slate-900">Import Klientov z CSV</DialogTitle>
          <DialogDescription className="text-slate-500 text-sm mt-1">
            Nahrajte CSV súbor s klientmi. Povinný stĺpec: <span className="font-semibold">name</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {result ? (
            <div className="space-y-4">
              {/* Success/Fail Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600 uppercase">Úspešne</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700">{result.success}</p>
                </div>
                <div className={`border rounded-lg p-4 ${
                  result.failed > 0
                    ? "bg-red-50 border-red-200"
                    : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className={`h-4 w-4 ${result.failed > 0 ? "text-red-600" : "text-slate-400"}`} />
                    <span className={`text-xs font-semibold uppercase ${
                      result.failed > 0 ? "text-red-600" : "text-slate-500"
                    }`}>
                      Chyby
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    result.failed > 0 ? "text-red-700" : "text-slate-600"
                  }`}>
                    {result.failed}
                  </p>
                </div>
              </div>

              {/* Error List */}
              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <h4 className="font-semibold text-red-700 mb-2 text-sm">Chyby pri importe:</h4>
                  <ul className="space-y-1">
                    {result.errors.slice(0, 10).map((err, i) => (
                      <li key={i} className="text-xs text-red-600">
                        <span className="font-semibold">Riadok {err.row}:</span> {err.error}
                      </li>
                    ))}
                    {result.errors.length > 10 && (
                      <li className="text-xs text-red-600 font-semibold">
                        ... a ďalších {result.errors.length - 10} chýb
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <Button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                }}
                variant="outline"
                className="w-full"
              >
                Zatvoriť
              </Button>
            </div>
          ) : (
            <>
              {/* File Input */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  {file ? file.name : "Klikni alebo prehľadaj CSV súbor"}
                </p>
                <p className="text-xs text-slate-500 mt-1">Max 5MB, CSV alebo TXT</p>
              </div>

              {/* Sample CSV */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-600 mb-2">Vzorový formát:</p>
                <pre className="text-xs text-slate-600 overflow-x-auto">
{`name,phone,email,address,notes
Ján Mrkvička,+421 900 123 456,jan@example.sk,Ulica 1 Bratislava,Poznámka1
Mária Nováková,+421 900 654 321,maria@example.sk,Ulica 2 Košice,Poznámka2`}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Zrušiť
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!file || loading}
                  className="flex-1"
                >
                  {loading ? "Import..." : "Importovať"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
