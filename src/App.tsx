"use client";

import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AFF } from "./constants/affiliate";
import { FAQ } from "./components/FAQ";
import { LangSwitch } from "./components/LangSwitch";
import { Planner } from "./components/Planner";
import { BackToTop } from "./components/BackToTop";
import { FooterLocalTime } from "./components/FooterLocalTime";
import { HeroPlanVisual } from "./components/HeroPlanVisual";
const ProjectBuildGlbViewer = lazy(() =>
  import("./components/ProjectBuildGlbViewer").then((m) => ({
    default: m.ProjectBuildGlbViewer,
  })),
);
import { SiteLogo } from "./components/SiteLogo";
import { Results } from "./components/Results";
import { SaveModal } from "./components/SaveModal";
import { DocumentLibrary } from "./components/DocumentLibrary";
import { Ey, HR } from "./components/ui";
import { generatePlan } from "./lib/generatePlan";
import { fetchMaintenance, type MaintenancePayload } from "./api/maintenance";
import { getPublicPreviewBypassFromWindow } from "./lib/publicPreviewBypass";
import { ComingSoonScreen, MaintenanceScreen } from "./components/SystemStateScreens";
import { translations, type Lang } from "./translations";
import type { GeneratedPlan, PlanForm } from "./types/plan";

const EMPTY_PLAN_FORM: PlanForm = {
  projectType: null,
  tasks: [],
  size: "",
  budget: 2,
  stage: 0,
  userType: 0,
  infra: 0,
  location: "",
};

export default function App() {
  const [lang, setLang] = useState<Lang>("sr");
  const [result, setResult] = useState<GeneratedPlan | null>(null);
  const [planForm, setPlanForm] = useState<PlanForm>(EMPTY_PLAN_FORM);
  const [showSave, setShowSave] = useState(false);
  const [maint, setMaint] = useState<MaintenancePayload | null>(null);
  const previewBypassRef = useRef<boolean | null>(null);
  if (previewBypassRef.current === null) {
    previewBypassRef.current = getPublicPreviewBypassFromWindow();
  }
  const previewBypass = previewBypassRef.current;
  const [gateLoading, setGateLoading] = useState(() => !previewBypassRef.current!);
  const plannerRef = useRef<HTMLElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const planExportRef = useRef<HTMLDivElement | null>(null);
  const t = translations[lang];
  const plannerNote = "note" in t.planner ? (t.planner as { note?: string }).note : undefined;
  const foreignerBlock = "foreignerBlock" in t ? t.foreignerBlock : undefined;

  // Fetch maintenance / coming-soon status and re-check on focus/visibility.
  // This prevents "flash" of the normal app when maintenance mode is enabled.
  useEffect(() => {
    let cancelled = false;

    const reload = async () => {
      if (!previewBypass) setGateLoading(true);
      try {
        const data = await fetchMaintenance();
        if (!cancelled) setMaint(data);
      } finally {
        if (!cancelled) setGateLoading(false);
      }
    };

    void reload();

    const onVisible = () => {
      if (document.visibilityState === "visible") void reload();
    };
    const onFocus = () => void reload();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [previewBypass]);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleResult = (plan: GeneratedPlan, form: PlanForm) => {
    setResult(plan);
    setPlanForm(form);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };
  const handleRestart = () => {
    setResult(null);
    setPlanForm(EMPTY_PLAN_FORM);
    setTimeout(() => plannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  /* Keep generated steps, notes and next actions aligned with the UI language when user switches after submit. */
  useLayoutEffect(() => {
    if (!result || planForm.projectType == null || planForm.tasks.length === 0) return;
    setResult(generatePlan(planForm, lang));
    // Intentionally only `lang`: avoid re-running when `result` updates (would loop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const PY="96px 24px";
  const MX={maxWidth:1100,margin:"0 auto"};

  const previewBypassEffective = previewBypass || maint?.previewBypass === true;

  // Global gate: URL/sessionStorage/cookie OR server confirms admin session (see /api/status + credentials: include).
  if (gateLoading && !previewBypass) {
    return <div style={{ background: "var(--bg)", minHeight: "100vh" }} />;
  }
  if (maint && !previewBypassEffective) {
    if (maint.mode === "COMING_SOON") {
      return <ComingSoonScreen lang={lang} status={maint} setLang={setLang} />;
    }
    if (maint.mode === "MAINTENANCE") {
      return <MaintenanceScreen lang={lang} status={maint} setLang={setLang} />;
    }
  }

  return(
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      {showSave&&<SaveModal t={t} plan={result} onClose={()=>setShowSave(false)}/>}

      {/* ── NAV ── */}
      <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(250,250,249,.94)",backdropFilter:"blur(14px)",borderBottom:"1px solid var(--bdr)"}}>
        <div style={{...MX,padding:"0 24px",height:62,display:"flex",alignItems:"center",justifyContent:"space-between",gap:14}}>
          <div style={{display:"flex",alignItems:"center",flexShrink:0}}>
            <SiteLogo priority />
          </div>
          <nav className="hide-xs" style={{display:"flex",gap:24,alignItems:"center"}}>
            {[["how","0"],["planner","1"],["docs","4"],["faq","3"]].map(([id,li])=>(
              <button key={id} className="nav-lnk" onClick={()=>scrollTo(id)}>{t.nav.links[Number(li)]}</button>
            ))}
          </nav>
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <LangSwitch lang={lang} setLang={setLang}/>
            <button className="btn-p hide-xs" onClick={()=>scrollTo("planner")} style={{fontSize:13,padding:"9px 18px"}}>{t.nav.cta}</button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{padding:"80px 24px 64px",background:"linear-gradient(175deg,#FDFBF8 0%,var(--bg) 100%)",borderBottom:"1px solid var(--bdr)"}}>
        <div style={{...MX}}>
          <div className="hero-g" style={{display:"grid",gridTemplateColumns:"1.05fr .95fr",gap:68,alignItems:"center"}}>
            <div className="fu">
              <p className="eyebrow" style={{marginBottom:16}}>{t.hero.eyebrow}</p>
              <h1
                style={{
                  fontFamily:"var(--heading)",
                  fontSize:"clamp(30px,4.2vw,50px)",
                  fontWeight:500,
                  lineHeight:1.13,
                  letterSpacing:"-.02em",
                  marginTop:0,
                  marginBottom:22,
                }}
              >
                <span style={{display:"block",color:"var(--ink)",marginBottom:6}}>{t.hero.title}</span>
                <span style={{display:"block",color:"var(--acc)",fontWeight:400,fontStyle:"italic"}}>{t.hero.accent}</span>
              </h1>
              <p style={{fontSize:16,color:"var(--ink3)",lineHeight:1.72,maxWidth:490,marginBottom:24,fontFamily:"var(--sans)"}}>{t.hero.sub}</p>
              {/* Cost preview */}
              <div style={{display:"inline-flex",alignItems:"center",gap:9,background:"var(--ambbg)",border:"1px solid var(--ambmid)",borderRadius:8,padding:"8px 15px",marginBottom:26}}>
                <span style={{fontSize:14}}>💡</span>
                <span style={{fontSize:13,fontWeight:500,color:"var(--amb)",fontFamily:"var(--sans)"}}>{t.hero.preview}</span>
              </div>
              {/* CTA */}
              <div style={{display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",marginBottom:12}}>
                <button className="btn-p" onClick={()=>scrollTo("planner")} style={{fontSize:15,padding:"13px 28px"}}>{t.hero.cta} →</button>
              </div>
              <p style={{fontSize:12,color:"var(--ink4)",fontFamily:"var(--sans)",marginBottom:24}}>{t.hero.ctaNote}</p>
              {/* Trust bar */}
              <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:10}}>
                <span style={{fontSize:12,fontWeight:600,color:"var(--ink3)",fontFamily:"var(--sans)"}}>{t.hero.trustBar.label}</span>
                {t.hero.trustBar.items.map((item,i)=>(
                  <span key={i} style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:500,color:"var(--ink2)",background:"var(--bgw)",border:"1px solid var(--bdr)",borderRadius:20,padding:"3px 11px",fontFamily:"var(--sans)"}}>
                    <span style={{color:"var(--grn)",fontSize:10}}>●</span> {item}
                  </span>
                ))}
              </div>
            </div>

            <HeroPlanVisual lang={lang} />
          </div>
        </div>
      </section>

      {/* ── COMMON MISTAKES ── */}
      {t.mistakes&&(
        <section style={{padding:"72px 24px",background:"var(--bgw)",borderBottom:"1px solid var(--bdr)"}}>
          <div style={{...MX}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:52,alignItems:"start"}} className="plan-g">
              <div>
                <Ey>{t.mistakes.eyebrow}</Ey>
                <h2 style={{fontFamily:"var(--heading)",fontSize:"clamp(24px,3vw,36px)",fontWeight:500,color:"var(--ink)",lineHeight:1.25,letterSpacing:"-.01em",marginBottom:14}}>
                  {t.mistakes.title}
                </h2>
                <p style={{fontSize:14.5,color:"var(--ink3)",lineHeight:1.7,fontFamily:"var(--sans)",marginBottom:22}}>{t.mistakes.sub}</p>
                <Suspense
                  fallback={
                    <div
                      className="mistakes-glb fu3"
                      style={{
                        width: "100%",
                        minHeight: 252,
                        height: "min(36vh, 340px)",
                        maxWidth: 480,
                        borderRadius: "var(--rl)",
                        border: "1px solid var(--bdr)",
                        boxShadow: "var(--sh1)",
                        background:
                          "linear-gradient(165deg, #FBF9F6 0%, #EFEBE5 55%, var(--card) 100%)",
                      }}
                      aria-hidden
                    />
                  }
                >
                  <ProjectBuildGlbViewer />
                </Suspense>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                <p style={{fontSize:13.5,color:"var(--ink2)",fontFamily:"var(--sans)",lineHeight:1.55,marginBottom:14,fontWeight:500}}>
                  {t.mistakes.listIntro}
                </p>
                {t.mistakes.items.map((it,i)=>(
                  <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",padding:"16px 0",borderBottom:i<t.mistakes.items.length-1?"1px solid var(--bdr)":"none"}}>
                    <span style={{fontSize:20,flexShrink:0,marginTop:1}}>{it.icon}</span>
                    <div>
                      <h3 style={{fontSize:14,fontWeight:600,color:"var(--ink)",marginBottom:4,marginTop:0,fontFamily:"var(--sans)"}}>{it.t}</h3>
                      <p style={{fontSize:13,color:"var(--ink3)",lineHeight:1.65,fontFamily:"var(--sans)"}}>{it.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Bottom CTA */}
            <div style={{marginTop:36,padding:"20px 24px",background:"var(--accbg)",border:"1px solid var(--accmid)",borderRadius:"var(--r)",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:16}}>
              <p style={{fontSize:14.5,fontWeight:500,color:"var(--ink)",fontFamily:"var(--sans)",lineHeight:1.5,maxWidth:520}}>
                {t.mistakes.bottomCta}
              </p>
              <button className="btn-p" onClick={()=>scrollTo("planner")} style={{fontSize:14,flexShrink:0}}>
                {t.hero.cta} →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{padding:PY}}>
        <div style={{...MX}}>
          <Ey>{t.how.eyebrow}</Ey>
          <h2 style={{fontFamily:"var(--heading)",fontSize:"clamp(24px,3vw,36px)",fontWeight:500,color:"var(--ink)",lineHeight:1.25,letterSpacing:"-.01em",marginBottom:48}}>
            {t.how.title}
          </h2>
          <div className="how-g" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18}}>
            {t.how.steps.map((s,i)=>(
              <div key={i} className="card card-h" style={{padding:"24px 20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                  <span style={{fontSize:12,fontWeight:700,color:"var(--acc)",fontFamily:"var(--sans)",letterSpacing:".04em"}}>{s.n}</span>
                  <div style={{flex:1,height:1,background:"var(--bdr)"}}/>
                </div>
                <h3 style={{fontFamily:"var(--heading)",fontSize:17,fontWeight:500,color:"var(--ink)",marginBottom:10,lineHeight:1.35}}>{s.t}</h3>
                <p style={{fontSize:13.5,color:"var(--ink3)",lineHeight:1.6,fontFamily:"var(--sans)"}}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HR/>

      {/* ── PLANNER ── */}
      <section id="planner" ref={plannerRef} style={{padding:PY,background:"linear-gradient(180deg,#F8F5F2 0%,var(--bg) 100%)"}}>
        <div style={{...MX}}>
          <Ey>{t.planner.eyebrow}</Ey>
          <h2 className="sr-only">
            {t.planner.eyebrow}: {t.planner.title}
          </h2>
          <div
            className="plan-g"
            ref={planExportRef}
            style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:26,alignItems:"stretch"}}
          >
            <div style={{ alignSelf: "start", minWidth: 0 }}>
              <div className="card" style={{padding:34}}>
                {!result?(
                  <Planner t={t} onResult={handleResult}/>
                ):(
                  <div ref={resultRef}>
                    <Results
                      plan={result}
                      t={t}
                      form={planForm}
                      onRestart={handleRestart}
                      onSave={()=>setShowSave(true)}
                      exportRootRef={planExportRef}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Spoljašnji stub = visina reda; unutra sticky kartice dok skroluješ plan */}
            <div className="planner-sidebar-host">
              <div className="planner-sidebar" style={{display:"flex",flexDirection:"column",gap:14}}>
              <div className="card" style={{padding:"22px 24px",background:"var(--accbg)",borderColor:"var(--accmid)"}}>
                <p style={{fontSize:11,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--acc)",marginBottom:14,fontFamily:"var(--sans)"}}>
                  {t.lang==="sr"?"Šta ćete dobiti":t.lang==="en"?"What you'll receive":"Что вы получите"}
                </p>
                {[
                  t.lang==="sr"?"Konkretan plan za vaše zadatke":t.lang==="en"?"A concrete plan for your tasks":"Конкретный план для ваших задач",
                  t.lang==="sr"?"Procena troškova u evrima":t.lang==="en"?"Cost estimate in euros":"Оценка расходов в евро",
                  t.lang==="sr"?"Saveti za infrastrukturu":t.lang==="en"?"Infrastructure guidance":"Советы по инфраструктуре",
                  t.lang==="sr"?"Preporuke za materijale":t.lang==="en"?"Material recommendations":"Рекомендации по материалам",
                ].map((g,i)=>(
                  <div key={i} style={{display:"flex",gap:9,marginBottom:11,alignItems:"flex-start"}}>
                    <span style={{color:"var(--acc)",fontWeight:700,lineHeight:"20px",flexShrink:0}}>✓</span>
                    <span style={{fontSize:13.5,color:"var(--ink2)",lineHeight:1.55,fontFamily:"var(--sans)"}}>{g}</span>
                  </div>
                ))}
              </div>
              <div className="card" style={{padding:"20px 24px",background:"var(--blubg)",borderColor:"var(--blumid)"}}>
                <p style={{fontSize:12.5,color:"var(--blu)",lineHeight:1.65,fontFamily:"var(--sans)"}}>
                  <strong style={{display:"block",marginBottom:4,fontSize:11,letterSpacing:".08em",textTransform:"uppercase",fontWeight:700}}>
                    {t.lang==="sr"?"Napomena":t.lang==="en"?"Note":"Примечание"}
                  </strong>
                  {plannerNote || t.trust.items[3]?.d}
                </p>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HR/>

      {/* ── FOREIGNER BLOCK (EN + RU only) ── */}
      {lang !== "sr" && foreignerBlock && (
        <>
          <section style={{padding:PY}}>
            <div style={{...MX}}>
              <div style={{background:"var(--blubg)",border:"1px solid var(--blumid)",borderRadius:"var(--rxl)",padding:"34px 38px"}}>
                <Ey>{foreignerBlock.eyebrow}</Ey>
                <h2 style={{fontFamily:"var(--heading)",fontSize:"clamp(22px,2.8vw,32px)",fontWeight:500,color:"var(--blu)",lineHeight:1.3,letterSpacing:"-.01em",marginBottom:8}}>
                  {foreignerBlock.title}
                </h2>
                <p style={{fontSize:14,color:"var(--blu)",opacity:.7,marginBottom:26,fontFamily:"var(--sans)",lineHeight:1.6}}>{foreignerBlock.sub}</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}} className="res-2col">
                  {foreignerBlock.items.map((it: { icon: string; t: string; d: string }, i: number) => (
                    <div key={i} style={{display:"flex",gap:13,alignItems:"flex-start"}}>
                      <span style={{fontSize:20,flexShrink:0,marginTop:1}}>{it.icon}</span>
                      <div>
                        <h3 style={{fontSize:13.5,fontWeight:600,color:"var(--blu)",marginBottom:5,marginTop:0,fontFamily:"var(--sans)"}}>{it.t}</h3>
                        <p style={{fontSize:13,color:"var(--blu)",opacity:.7,lineHeight:1.65,fontFamily:"var(--sans)"}}>{it.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <HR/>
        </>
      )}

      {/* ── RESOURCES SECTION ── */}
      {(()=>{
        const REC_GROUPS: Record<
          Lang,
          { label: string; keys: string[]; recommended: string[] }[]
        > = {
          sr:[
            {label:"Materijali i konstrukcija", keys:["insulation","windows","heating"],     recommended:["windows","insulation"]},
            {label:"Enterijer i oprema",         keys:["flooring","lighting","bathroom","kitchen","furniture"], recommended:["flooring","kitchen"]},
            {label:"Eksterijer i dvorište",      keys:["garden","tools"],                   recommended:[]},
          ],
          en:[
            {label:"Materials & structure",     keys:["insulation","windows","heating"],     recommended:["windows","insulation"]},
            {label:"Interior & equipment",      keys:["flooring","lighting","bathroom","kitchen","furniture"], recommended:["flooring","kitchen"]},
            {label:"Exterior & garden",         keys:["garden","tools"],                    recommended:[]},
          ],
          ru:[
            {label:"Материалы и конструкция",   keys:["insulation","windows","heating"],     recommended:["windows","insulation"]},
            {label:"Интерьер и оборудование",   keys:["flooring","lighting","bathroom","kitchen","furniture"], recommended:["flooring","kitchen"]},
            {label:"Экстерьер и сад",           keys:["garden","tools"],                    recommended:[]},
          ],
        };
        const groups = REC_GROUPS[lang];
        const ctaLabel = lang==="sr"?"Istraži":lang==="en"?"Explore":"Перейти";
        const recLabel = lang==="sr"?"Preporučeno":lang==="en"?"Recommended":"Рекомендуем";
        const heading  = lang==="sr"?"Korisne kategorije za vaš projekat":lang==="en"?"Useful categories for your project":"Полезные категории для вашего проекта";
        const sub      = lang==="sr"?"Pažljivo odabrane kategorije materijala, opreme i usluga. Neke veze su partnerske — to jasno označavamo.":lang==="en"?"Carefully selected material, equipment and service categories. Where links are referral-based, we say so clearly.":"Тщательно подобранные категории материалов и оборудования. Партнёрские ссылки всегда отмечаются.";
        const eyebrow  = lang==="sr"?"Resursi":lang==="en"?"Resources":"Ресурсы";

        /* Left group (first group) shown in left column, rest in right */
        const leftGroup  = groups[0];
        const rightGroups = groups.slice(1);

        const RecRow = ({ k, recommended }: { k: string; recommended: string[] }) => {
          const a = AFF[k];
          const sr = t.stageRecs[k as keyof typeof t.stageRecs];
          if(!a||!sr) return null;
          const isRec = recommended.includes(k);
          return(
            <a href={a.href} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",gap:14,padding:"17px 20px",borderBottom:"1px solid var(--bdr)",transition:"background .15s",cursor:"pointer",textDecoration:"none"}}
              onMouseEnter={e=>e.currentTarget.style.background="var(--bgw)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{fontSize:20,flexShrink:0,lineHeight:1}}>{a.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <span style={{fontSize:13.5,fontWeight:600,color:"var(--ink)",fontFamily:"var(--sans)"}}>{sr.name}</span>
                {isRec&&(
                  <span style={{display:"inline-flex",alignItems:"center",fontSize:9,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--grn)",background:"var(--grnbg)",border:"1px solid var(--grnmid)",borderRadius:4,padding:"2px 7px",marginLeft:8,verticalAlign:"middle"}}>
                    {recLabel}
                  </span>
                )}
                <p style={{fontSize:12,color:"var(--ink4)",fontFamily:"var(--sans)",lineHeight:1.45,marginTop:3}}>{sr.desc}</p>
              </div>
              <span style={{fontSize:12,fontWeight:600,color:"var(--acc)",flexShrink:0,fontFamily:"var(--sans)"}}>{ctaLabel} →</span>
            </a>
          );
        };

        const GroupBox = ({
          group,
          style = {},
        }: {
          group: { label: string; keys: string[]; recommended: string[] };
          style?: CSSProperties;
        }) => (
          <div className="card" style={{overflow:"hidden",...style}}>
            <div style={{padding:"13px 20px",borderBottom:"1px solid var(--bdr)",background:"var(--bgw)"}}>
              <h3 style={{fontSize:10.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--ink3)",fontFamily:"var(--sans)",margin:0}}>{group.label}</h3>
            </div>
            {group.keys.map(k=><RecRow key={k} k={k} recommended={group.recommended}/>)}
          </div>
        );

        return(
          <section id="recs" style={{padding:PY}}>
            <div style={{...MX}}>
              <Ey>{eyebrow}</Ey>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:52,alignItems:"start",marginBottom:48}} className="plan-g">
                <div>
                  <h2 style={{fontFamily:"var(--heading)",fontSize:"clamp(24px,3vw,36px)",fontWeight:500,color:"var(--ink)",lineHeight:1.25,letterSpacing:"-.01em",marginBottom:16}}>
                    {heading}
                  </h2>
                  <p style={{fontSize:14,color:"var(--ink3)",lineHeight:1.7,fontFamily:"var(--sans)",marginBottom:0}}>{sub}</p>
                </div>
                <GroupBox group={leftGroup}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="res-2col">
                {rightGroups.map((g,i)=><GroupBox key={i} group={g}/>)}
              </div>
              <p style={{fontSize:11.5,color:"var(--ink4)",marginTop:18,fontFamily:"var(--sans)"}}>{t.results.affilNote}</p>
            </div>
          </section>
        );
      })()}

      {/* ── TRUST ── */}
      <section style={{padding:PY,background:"var(--ink)"}}>
        <div style={{...MX}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:22,height:1.5,background:"rgba(196,92,46,.7)",borderRadius:2}}/>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"rgba(196,92,46,.85)",fontFamily:"var(--sans)"}}>{t.trust.eyebrow}</p>
          </div>
          <h2 style={{fontFamily:"var(--heading)",fontSize:"clamp(22px,2.8vw,32px)",fontWeight:500,color:"#FAFAF9",lineHeight:1.3,letterSpacing:"-.01em",marginBottom:40}}>
            {t.trust.title}
          </h2>
          <div className="trust-g" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18}}>
            {t.trust.items.map((it,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:"var(--rl)",padding:"24px 20px"}}>
                <span style={{fontSize:24,display:"block",marginBottom:14}}>{it.icon}</span>
                <h3 style={{fontFamily:"var(--heading)",fontSize:16,fontWeight:500,color:"#FAFAF8",marginBottom:8,lineHeight:1.35}}>{it.t}</h3>
                <p style={{fontSize:12.5,color:"rgba(250,250,248,.5)",lineHeight:1.65,fontFamily:"var(--sans)"}}>{it.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCUMENT LIBRARY ── */}
      <section id="docs" style={{padding:PY,background:"var(--bgw)",borderBottom:"1px solid var(--bdr)"}}>
        <div style={{...MX}}>
          <p className="eyebrow" style={{marginBottom:14}}>{t.nav.links[4]}</p>
          <h2 style={{fontFamily:"var(--heading)",fontSize:"clamp(24px,3vw,36px)",fontWeight:500,color:"var(--ink)",lineHeight:1.25,letterSpacing:"-.01em",marginBottom:12}}>
            {lang==="sr"?"Preuzmite relevantne dokumente":lang==="en"?"Download relevant documents":"Скачайте нужные документы"}
          </h2>
          <p style={{fontSize:14,color:"var(--ink3)",lineHeight:1.7,fontFamily:"var(--sans)",marginBottom:36,maxWidth:620}}>
            {lang==="sr"
              ?"Ovde možete pronaći i preuzeti sve dokumente potrebne za gradnju i renoviranje u Srbiji — propisi, obrasci, uputstva i više."
              :lang==="en"
              ?"Find and download all documents you need for building and renovating in Serbia — regulations, forms, guides and more."
              :"Здесь вы найдёте все документы, необходимые для строительства и ремонта в Сербии — нормативы, бланки, инструкции и многое другое."}
          </p>
          <DocumentLibrary lang={lang} />
        </div>
      </section>

      <HR/>

      {/* ── FAQ ── */}
      <section id="faq" style={{padding:PY}}>
        <div style={{maxWidth:700,margin:"0 auto",padding:"0 24px"}}>
          <Ey>{t.faq.eyebrow}</Ey>
          <h2 style={{fontFamily:"var(--heading)",fontSize:"clamp(24px,3vw,36px)",fontWeight:500,color:"var(--ink)",lineHeight:1.25,letterSpacing:"-.01em",marginBottom:36}}>
            {t.faq.title}
          </h2>
          <FAQ items={t.faq.items}/>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:"var(--bgw)",borderTop:"1px solid var(--bdr)",padding:"52px 24px 32px"}}>
        <div style={{...MX}}>
          <div className="how-g footer-g" style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr",gap:44,marginBottom:44}}>
            <div>
              <div style={{display:"flex",alignItems:"center",marginBottom:12}}>
                <SiteLogo compact loading="lazy" />
              </div>
              <p style={{fontSize:13,color:"var(--ink3)",lineHeight:1.7,maxWidth:270,marginBottom:12,fontFamily:"var(--sans)"}}>{t.footer.tagline}</p>
              <p style={{fontSize:11,color:"var(--ink4)",lineHeight:1.6,maxWidth:290,fontFamily:"var(--sans)"}}>{t.footer.disclaimer}</p>
            </div>
            <div>
              <p style={{fontSize:10.5,fontWeight:700,color:"var(--ink3)",letterSpacing:".09em",textTransform:"uppercase",marginBottom:14,fontFamily:"var(--sans)"}}>
                {lang==="sr"?"Navigacija":lang==="en"?"Navigation":"Навигация"}
              </p>
              {[["how","0"],["planner","1"],["docs","4"],["faq","3"]].map(([id,li])=>(
                <button key={id} onClick={()=>scrollTo(id)}
                  style={{display:"block",fontSize:13.5,color:"var(--ink3)",background:"none",border:"none",marginBottom:10,padding:0,fontFamily:"var(--sans)",cursor:"pointer",transition:"color .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.color="var(--ink)"}
                  onMouseLeave={e=>e.currentTarget.style.color="var(--ink3)"}>
                  {t.nav.links[Number(li)]}
                </button>
              ))}
            </div>
            <div>
              <p style={{fontSize:10.5,fontWeight:700,color:"var(--ink3)",letterSpacing:".09em",textTransform:"uppercase",marginBottom:14,fontFamily:"var(--sans)"}}>
                {lang==="sr"?"Kontakt":lang==="en"?"Contact":"Контакт"}
              </p>
              <a href={`mailto:${t.footer.contact}`} style={{fontSize:13.5,color:"var(--ink3)",fontFamily:"var(--sans)",transition:"color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.color="var(--acc)"}
                onMouseLeave={e=>e.currentTarget.style.color="var(--ink3)"}>
                {t.footer.contact}
              </a>
              <div style={{marginTop:18}}>
                <p style={{fontSize:10.5,fontWeight:700,color:"var(--ink3)",letterSpacing:".09em",textTransform:"uppercase",marginBottom:8,fontFamily:"var(--sans)"}}>
                  {lang==="sr"?"Jezik":lang==="en"?"Language":"Язык"}
                </p>
                <div style={{display:"flex",gap:6}}>
                  {(["sr", "en", "ru"] as const).map((l) => (
                    <button key={l} type="button" onClick={() => setLang(l)}
                      style={{fontSize:11,fontWeight:700,padding:"5px 10px",borderRadius:6,border:"1.5px solid",letterSpacing:".06em",textTransform:"uppercase",fontFamily:"var(--sans)",cursor:"pointer",transition:"all .15s",borderColor:lang===l?"var(--acc)":"var(--bdr)",background:lang===l?"var(--accbg)":"transparent",color:lang===l?"var(--acc)":"var(--ink4)"}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <HR/>
          <div style={{paddingTop:18,display:"flex",flexWrap:"wrap",justifyContent:"space-between",gap:16,alignItems:"flex-start"}}>
            <div>
              <p style={{fontSize:12,color:"var(--ink4)",fontFamily:"var(--sans)"}}>{t.footer.copy}</p>
              <FooterLocalTime lang={lang} label={t.footer.localTimePrefix} />
            </div>
            <p style={{fontSize:11.5,color:"var(--ink4)",fontFamily:"var(--sans)",maxWidth:460,textAlign:"right"}}>{t.footer.legal}</p>
          </div>
        </div>
      </footer>

      <BackToTop label={t.nav.backToTop} />
    </div>
  );
}
