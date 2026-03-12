"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Wrench, CheckCircle2, Mic, ClipboardList, Calendar, Users, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const containerClass = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8";
  const sectionClass = "py-16 md:py-20";
  const buttonBase =
    "inline-flex items-center justify-center gap-2 h-12 rounded-md border-2 border-foreground px-6 font-black uppercase tracking-wide transition-all";
  const buttonPrimary =
    `${buttonBase} bg-primary text-foreground shadow-[3px_3px_0px_#1a1919] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1a1919]`;

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] font-sans overflow-x-hidden selection:bg-primary selection:text-white">
      
      {/* Aggressive Grid Background overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Navigation - Industrial Nav */}
      <header className="fixed top-0 z-40 w-full border-b-[3px] border-foreground bg-[#FAF9F6]">
        <div className={`flex h-16 items-center justify-between ${containerClass}`}>
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center bg-primary border-[2px] border-foreground shadow-[2px_2px_0px_#1a1919]">
              <Wrench className="h-5 w-5 text-foreground stroke-[2.5]" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground uppercase">Rýchly Servis</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login">
              <span className="font-heading text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer uppercase tracking-widest hidden md:block">
                SYS.LOGIN()
              </span>
            </Link>
            <Link href="/login">
              <button className={`${buttonPrimary} h-10 px-4 text-xs`}>
                Spustiť Systém
              </button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16 relative">
        {/* Floating background industrial elements */}
        <motion.div style={{ y: y1 }} className="absolute -left-20 top-40 w-64 h-64 border-[1px] border-foreground/10 rounded-full flex items-center justify-center -z-10 hidden lg:flex">
          <div className="w-48 h-48 border-[1px] border-foreground/10 rounded-full flex items-center justify-center">
            <div className="w-32 h-32 border-[1px] border-primary/20 rounded-full" />
          </div>
        </motion.div>

        <motion.div style={{ y: y2 }} className="absolute -right-10 top-96 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -z-10 hidden lg:block" />

        {/* Hero Section */}
        <section className={`${sectionClass} relative pt-20 md:pt-24 ${containerClass} flex flex-col lg:flex-row items-center gap-10 lg:gap-14`}>
          
          {/* Hero Content */}
          <div className="flex-1 w-full max-w-2xl">
            <div className="inline-flex items-center gap-2 border-[2px] border-foreground bg-white px-3 py-1 mb-8 shadow-[2px_2px_0px_#1a1919]">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="font-heading text-xs font-bold uppercase tracking-widest text-foreground">AI_PROCESOR_AKTÍVNY</span>
            </div>
            
            <h1 className="text-[3.5rem] leading-[1.0] sm:text-[5rem] md:text-[6rem] lg:text-[7rem] font-black uppercase tracking-tighter text-foreground mb-8">
              ZÁKAZKY<br/>
              <span className="text-primary [-webkit-text-stroke:2px_#1a1919] text-transparent drop-shadow-[4px_4px_0px_#1a1919]">POD</span><br/>
              KONTROLOU.
            </h1>

            <p className="font-sans font-medium text-base md:text-lg text-foreground/80 mb-10 max-w-lg border-l-[4px] border-primary pl-4">
              Kompletný operačný systém pre inštalatérov, elektrikárov a lokálne servisy. Zahoďte papiere. Zvýšte výkon.
            </p>

            <div className="mt-2 flex items-center gap-2 font-heading text-sm text-foreground/70 font-bold uppercase">
              <Zap className="h-5 w-5 text-primary" />
              <span>Rychly start pre servisny tim</span>
            </div>
          </div>

          {/* Hero Visual (Demo Component) */}
          <div id="demo" className="flex-1 w-full">
            <HeroDemo />
          </div>
        </section>

        <section className={`${containerClass} -mt-2 mb-12 md:mb-16`}>
          <div className="w-full bg-white border-[2px] border-foreground shadow-[4px_4px_0px_#1a1919] p-6">
            <p className="font-heading text-[11px] md:text-xs font-black uppercase tracking-widest text-foreground/70 mb-3">
              Overene v dennej prevadzke
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TRUST_ITEMS.map((item) => (
                <div key={item.label} className="border-[2px] border-foreground bg-[#FAF9F6] px-4 py-4">
                  <p className="text-2xl md:text-3xl font-black text-primary leading-none">{item.value}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wide text-foreground/80">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Marquee Divider */}
        <div className="w-full overflow-hidden border-y-[3px] border-foreground bg-primary py-3 flex relative z-10">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex gap-8 whitespace-nowrap px-4 font-heading font-bold text-foreground uppercase tracking-widest text-sm"
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="flex items-center gap-8">
                <span>INTELIGENTNÝ DISPEČING</span>
                <span className="w-2 h-2 bg-foreground rounded-full"></span>
                <span>AI PREPIS HLASOVIEK</span>
                <span className="w-2 h-2 bg-foreground rounded-full"></span>
                <span>CRM & FAKTURÁCIA</span>
                <span className="w-2 h-2 bg-foreground rounded-full"></span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* Features Section Container */}
        <section id="moduly" className={`${sectionClass} ${containerClass}`}>
          <div className="mb-20 max-w-3xl">
            <h2 className="text-[3rem] md:text-[5rem] font-black uppercase tracking-tighter leading-[1.0] text-foreground mb-6">
              MODULY<br/>SYSTÉMU
            </h2>
            <p className="font-sans font-medium text-lg text-foreground/70 border-l-[2px] border-foreground pl-4">
              Vytvorené špeciálne pre remeselníkov. Zabudnite na komplikované Enterprise riešenia. Toto je čistý, surový výkon.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <div key={idx} className="group flex flex-col p-6 bg-white border-[2px] border-foreground shadow-[4px_4px_0px_#1a1919] hover:shadow-[3px_3px_0px_#1a1919] hover:-translate-y-0.5 transition-all">
                <div className="flex justify-between items-start mb-7">
                  <div className="h-16 w-16 bg-[#FAF9F6] border-[2px] border-foreground flex items-center justify-center shadow-[4px_4px_0px_#1a1919] group-hover:bg-primary transition-colors">
                    <feature.icon className="h-8 w-8 text-foreground stroke-[2]" />
                  </div>
                  <span className="font-heading text-2xl font-black text-foreground/20">0{idx + 1}</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground mb-3">{feature.title}</h3>
                <p className="font-sans font-medium text-sm text-foreground/70 leading-relaxed flex-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className={`pb-20 md:pb-24 ${containerClass}`}>
          <div className="mb-12 max-w-3xl">
            <h2 className="text-[2.5rem] md:text-[4rem] font-black uppercase tracking-tighter leading-[1.0] text-foreground mb-4">
              FAQ
            </h2>
            <p className="font-sans font-medium text-lg text-foreground/70 border-l-[2px] border-foreground pl-4">
              Najcastejsie otazky pred spustenim do ostrej prevadzky.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FAQ_ITEMS.map((item) => (
              <article key={item.question} className="bg-white border-[2px] border-foreground shadow-[4px_4px_0px_#1a1919] p-6">
                <h3 className="text-xl font-black uppercase tracking-tight text-foreground mb-3">{item.question}</h3>
                <p className="font-sans text-sm font-medium text-foreground/75 leading-relaxed">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-[3px] border-foreground bg-foreground text-[#FAF9F6] py-14">
        <div className={`${containerClass} flex flex-col md:flex-row justify-between items-start md:items-end gap-10`}>
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center bg-primary border-[2px] border-[#FAF9F6]">
                <Wrench className="h-6 w-6 text-foreground stroke-[2.5]" />
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase">Rýchly Servis</h2>
            </div>
            <p className="font-sans font-medium text-sm text-[#FAF9F6]/60">
              Umelá inteligencia pre skutočnú prácu. Nehráme sa na IT. Upratujeme servis.
            </p>
          </div>
          
          <div className="font-heading text-xs text-[#FAF9F6]/40 uppercase tracking-widest text-right">
            [ VER. 1.0.0 ]<br/>
            © {new Date().getFullYear()} Všetky práva vyhradené
          </div>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-[2px] border-foreground bg-[#FAF9F6] p-3 md:hidden">
        <Link href="/login" className="block w-full">
          <button className={`${buttonPrimary} w-full text-sm`}>
            Spustit System <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </Link>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: "AI Asistent na hlasovky",
    description: "Zákazník vám pošle WhatsApp hlasovku? Nahrajte ju do systému a AI ju prepíše, nájde adresu a predvyplní pracovný list.",
    icon: Mic,
  },
  {
    title: "Kanban Nástenka",
    description: "Prehľadný systém stĺpcov ('Nové', 'Nacenené', 'Prebieha'). Zákazky jednoducho preklikávate podla aktuálneho stavu.",
    icon: ClipboardList,
  },
  {
    title: "Prehľadné plánovanie",
    description: "Nikdy nezabudnete kedy máte kam ísť. Pridávajte konkrétne termíny a časy výjazdov priamo do karty zákazky.",
    icon: Calendar,
  },
  {
    title: "Klientska databáza (CRM)",
    description: "Všetci zákazníci na jednom mieste s kompletnou históriou opráv, telefónnymi číslami a adresami.",
    icon: Users,
  },
  {
    title: "Denník aktivity",
    description: "Píšte si interné poznámky o priebehu práce. Čo bolo dohodnuté na mieste zostane zaznamenané navždy.",
    icon: CheckCircle2,
  },
  {
    title: "Blesková rýchlosť",
    description: "Aplikácia reaguje okamžite bez otravného načítavania. Moderná architektúra šetrí váš čas pri každom kliknutí.",
    icon: Zap,
  }
];

const TRUST_ITEMS = [
  { value: "< 2 min", label: "Od hlasovky po zalozenu zakazku" },
  { value: "7 dni", label: "Typicky onboarding maleho timu" },
  { value: "24/7", label: "Pristup z mobilu aj desktopu" },
];

const FAQ_ITEMS = [
  {
    question: "Ako rychlo to vieme nasadit?",
    answer:
      "Pri beznom servise dokazete mat zakazky, kalendar a CRM pripravene v horizonte par dni. Zaciname importom kontaktov a jednoduchym workflow.",
  },
  {
    question: "Potrebujeme nieco instalovat?",
    answer:
      "Nie. Platforma bezi v prehliadaci. Technikom staci telefon, kancelarii desktop. Prihlasenie je centralne a roly riadia pristupy.",
  },
  {
    question: "Co je s bezpecnostou dat?",
    answer:
      "Pouzivame HTTPS, tenant izolaciu a role-based pristupy. Kazda firma vidi iba svoje data a citlive operacie su kontrolovane na serveri.",
  },
  {
    question: "Vieme importovat existujucich zakaznikov?",
    answer:
      "Ano, cez CSV import. Dostanete sablonu stlpcov name, phone, email, address, notes a system importuje validne riadky aj s reportom chyb.",
  },
  {
    question: "Je to vhodne aj pre mensi tim?",
    answer:
      "Presne na to je to navrhnute. Procesy su jednoduche, bez enterprise balastu, no stale mate poriadok v zakazkach, terminoch a komunikacii.",
  },
  {
    question: "Ako prebieha podpora po spusteni?",
    answer:
      "Po nasadeni doladime workflow podla realnej prevadzky a vratime sa k metrikam vykonu. Ciel je menej chaosu a rychlejsi cashflow.",
  },
];

function HeroDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full border-[3px] border-foreground bg-white shadow-[12px_12px_0px_#1a1919] p-2 overflow-hidden rotate-[-1deg] hover:rotate-[0deg] transition-all duration-500 origin-bottom-right">
      <div className="flex flex-col md:flex-row lg:h-[450px] relative">
        
        {/* Decorative caution tapes */}
        <div className="absolute top-0 left-0 w-full h-3 bg-[repeating-linear-gradient(45deg,#1a1919,#1a1919_10px,#FAF9F6_10px,#FAF9F6_20px)] border-b-[2px] border-foreground z-20"></div>

        {/* Left: Input Simulation (Voice note) */}
        <div className="flex-1 border-b-[3px] md:border-b-0 md:border-r-[3px] border-foreground p-8 flex flex-col justify-center items-center bg-[#FAF9F6] relative pt-12">
          
          <div className="w-full mb-8">
            <span className="bg-foreground text-white font-heading text-[10px] uppercase font-bold px-3 py-1 tracking-widest">
              &gt; VSTUPNÝ MODUL
            </span>
          </div>
          
          <div className="relative w-full max-w-[320px]">
            {/* Brutalist Voice Bubble */}
            <motion.div 
              animate={{ 
                scale: step === 0 ? 1 : step === 1 ? 1.05 : 0.95,
                opacity: step >= 2 ? 0.3 : 1,
                borderColor: step === 1 ? "var(--primary)" : "var(--foreground)",
              }}
              className="bg-white p-5 border-[3px] border-foreground shadow-[6px_6px_0px_#1a1919] flex items-center gap-4 w-full"
            >
              <div className="w-12 h-12 bg-primary flex items-center justify-center text-foreground border-[2px] border-foreground shrink-0">
                <Mic className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 h-6 opacity-80">
                  {[...Array(6)].map((_, i) => (
                     <motion.div 
                       key={i}
                       animate={{ 
                         height: step === 0 ? [8, 16, 8] : step === 1 ? [8, 24, 8] : 8,
                         backgroundColor: step === 1 ? "var(--primary)" : "var(--foreground)"
                       }}
                       transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                       className="w-2"
                       style={{ height: 8 }}
                     />
                  ))}
                </div>
                <p className="font-heading text-[10px] text-foreground font-bold uppercase tracking-widest mt-2">{"> SYS.AUDIO / 0:14"}</p>
              </div>
            </motion.div>

            {/* AI Processing Ribbon */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: step === 1 ? 1 : 0,
                x: step === 1 ? -20 : -10,
                y: -15
              }}
              className="absolute -bottom-8 -right-8 bg-primary text-foreground border-[2px] border-foreground font-heading text-[11px] font-black px-4 py-2 shadow-[4px_4px_0px_#1a1919] flex items-center gap-2 uppercase tracking-wide z-10"
            >
              <Zap className="w-4 h-4" />
              Spracovávam...
            </motion.div>
          </div>
        </div>

        {/* Right: Output Kanban Card */}
        <div className="flex-1 p-8 flex flex-col justify-center items-center bg-foreground relative pt-12 overflow-hidden">
          <div className="w-full mb-8 text-right">
            <span className="bg-primary text-foreground font-heading text-[10px] uppercase font-bold px-3 py-1 tracking-widest border-[1px] border-primary">
              &gt; CRM VÝSTUP
            </span>
          </div>
          
          <div className="w-full max-w-[320px] relative z-10 flex flex-col items-end">
            
            <motion.div
               initial={{ y: 20, opacity: 0, rotate: 2 }}
               animate={{ 
                 y: step >= 2 ? 0 : 20, 
                 opacity: step >= 2 ? 1 : 0,
                 rotate: step >= 2 ? 2 : 0,
               }}
               transition={{ type: "spring", stiffness: 400, damping: 20 }}
               className="bg-white p-6 border-[3px] border-foreground shadow-[8px_8px_0px_#1a1919] w-full"
            >
               <div className="flex justify-between items-start mb-4 border-b-[2px] border-foreground/10 pb-3">
                 <h4 className="font-black text-foreground text-lg uppercase tracking-tight leading-none">Únik Vody<br/>Novákovci</h4>
                 <div className="w-3 h-3 bg-primary rounded-full animate-pulse border-[1px] border-foreground"></div>
               </div>
               
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: step >= 2 ? 1 : 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-sans font-medium text-xs text-foreground/80 mb-5 leading-relaxed"
               >
                 <span className="font-bold uppercase text-foreground">Popis:</span> Masívny únik pod vaňou. Zastavili prívod.<br/><br/>
                 <span className="font-bold uppercase text-foreground">Lokácia:</span> 831 04, Dlhá ul.
               </motion.div>
               
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: step >= 3 ? 1 : 0 }}
                 className="flex flex-col gap-2"
               >
                 <div className="flex justify-between items-center bg-[#FAF9F6] border-[2px] border-foreground px-2 py-1">
                   <span className="text-[10px] font-heading font-bold uppercase">Naliehavosť</span>
                   <span className="bg-destructive text-white text-[10px] font-black px-2 py-0.5 tracking-wider uppercase">KRITICKÁ</span>
                 </div>
                 
                 <button className="w-full bg-foreground text-white font-heading text-[10px] uppercase font-bold py-2 hover:bg-primary hover:text-foreground transition-colors mt-2">
                   ŠTART VÝJAZDU
                 </button>
               </motion.div>
            </motion.div>
          </div>
          
          {/* Abstract Grid background for the dark side */}
          <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        {/* Progress Bar bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-foreground/10 z-30 flex">
          <motion.div 
            animate={{ width: ["0%", "33%", "66%", "100%", "100%"][step] }}
            transition={{ type: "tween", duration: 0.5 }}
            className="h-full bg-primary border-r-[2px] border-foreground"
          />
        </div>
      </div>
    </div>
  );
}
