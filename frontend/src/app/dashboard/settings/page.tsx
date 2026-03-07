import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full px-4 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Nastavenia</h2>
        <p className="text-slate-500 mt-1">Správa vášho účtu a firemných preferencií.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="general" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Všeobecné</TabsTrigger>
          <TabsTrigger value="team" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Tím</TabsTrigger>
          <TabsTrigger value="billing" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Fakturácia</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card className="rounded-xl border border-slate-200/60 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
              <CardTitle className="text-lg font-semibold text-slate-900">
                O biznise
              </CardTitle>
              <CardDescription className="text-slate-500 mt-1">
                Upravte detaily o spoločnosti, ktoré sa zobrazia na faktúrach a ponukách.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">Názov spoločnosti</Label>
                <Input id="name" defaultValue="Rýchly Servis s.r.o." className="border-slate-300 focus-visible:ring-blue-600 w-full max-w-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email pre podporu</Label>
                <Input id="email" defaultValue="kontakt@rychlyservis.sk" className="border-slate-300 focus-visible:ring-blue-600 w-full max-w-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium">Telefón na dispečing</Label>
                <Input id="phone" defaultValue="+421 2 555 1234" className="border-slate-300 focus-visible:ring-blue-600 w-full max-w-md" />
              </div>
              
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium px-6">
                  Uložiť zmeny
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
