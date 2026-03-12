# PlumbSide MVP: Aktuálny Stav & Plán (Roadmap)

Tento dokument sumarizuje, čo bolo doteraz vyvinuté a čo zostáva spraviť pred spustením prvého ostrého pilota.

---

## ✅ Dokončené Funkcionality (Aktuálny stav)

Aplikácia je momentálne v stave **plne funkčného MVP** s nasledujúcimi modulmi:

1.  **Multi-tenant Architektúra**: Podpora pre viaceré firmy s izolovanými dátami.
2.  **Dashboard s Analytikou**: Prehľad tržieb, stavu zákaziek a grafy prírastku práce.
3.  **Inteligentný Intake (AI)**:
    *   Možnosť nahrať hlasovú správu.
    *   Automatická extrakcia mena, adresy, problému a naliehavosti cez OpenAI.
    *   Vytvorenie konceptu (draft) zákazky.
4.  **Manažment Zákaziek (Kanban)**: Prehľadný board s drag-and-drop posunom stavov.
5.  **Plánovanie**: Kalendár a pridávanie termínov (appointments) k zákazkám.
6.  **Komunikácia & Notifikácie**:
    *   Časová os komunikácie (timeline) na detaile zákazky.
    *   Automatické e-mailové notifikácie (cez Resend) pri zmene stavu na "Prebieha".
7.  **Zmazanie & Správa**: Možnosť mazať firmy (admin), zamestnancov (owner) a zákazky.
8.  **Mobilná Responsivita**: Plne funkčné bočné menu (hamburger), upravené tabuľky a formuláre pre telefóny.
9.  **Technik Mód**: Špeciálne zjednodušené rozhranie pre technika v teréne (`/mobile/jobs`).
10. **Servisný List (PDF)**: Generovanie čistého A4 dokumentu na tlač pre zákazníka.

---

## 🚀 Čo nás čaká (Next Steps)

Navrhujem tieto ďalšie kroky pred pilotným testovaním:

### 1. Fáza 13: Hardening & História (Priorita: VYSOKÁ)
*   **Detail Zákazníka**: Nová stránka s históriou všetkých zákaziek pre konkrétneho klienta. Majiteľ uvidí, čo sa u daného človeka robilo pred rokom.
*   **Bezpečnostný Audit**: Implementácia automatických filtrov na backend, ktoré znemožnia prístup k cudzím dátam aj pri chybe programátora.
*   **Finančné spresnenie**: Rozlíšenie medzi "Očakávaným príjmom" (nacenené) a "Skutočným ziskom" (hotové zákazky).

### 2. Pilotná Príprava (Priorita: STREDNÁ)
*   **Import Dát**: Jednoduchý import zákazníkov z Excelu/CSV (väčšina firiem má zoznam klientov v exceli).
*   **Logy Aktivít**: Prehľad o tom, ktorý zamestnanec kedy a čo upravil (Audit log).

### 3. Stabilita (Priorita: STREDNÁ)
*   **Sentry/Logovanie**: Nasadenie monitoringu chýb do produkcie, aby sme vedeli o pádoch aplikácie skôr ako zákazník.

---

## 🌐 Infraštruktúra & Nasadenie (Cloud)

Projekt je plne nasadený v cloude a pripravený na produkčnú prevádzku:

*   **Frontend**: Nasadený na **Vercel** ([plumbside.me](https://plumbside.me)).
*   **Backend**: Nasadený na **Heroku** ([plumbside-64d207b6d2d8.herokuapp.com](https://plumbside-64d207b6d2d8.herokuapp.com)).
*   **Databáza**: **Heroku Postgres** (produkčná verzia).
*   **Doména**: Vlastná doména `plumbside.me` s SSL certifikátom.
*   **Lokálny vývoj**: Plne kontajnerizované prostredie cez **Docker & Docker Compose**.
*   **Emailing**: Integrovaný **Resend** pre transakčné maily.

---

## 🛠️ Technický dlh / Údržba
*   Refaktorizácia `lib/api.ts` pre lepšiu typovú bezpečnosť.
*   Doplnenie unit testov pre kritickú logiku (výpočet ceny, AI extrakcia).

---

*Posledná aktualizácia: 12. 3. 2026*
