import { useEffect, useMemo, useState, type RefObject } from "react";
import { AFF } from "../constants/affiliate";
import { fmt } from "../lib/format";
import { generateProjectDocuments, type DocLang, type ProjectDocument } from "../lib/generateProjectDocs";
import { monthlyPayment } from "../lib/loan";
import { DocumentPreviewModal, downloadProjectDocument } from "./DocumentPreviewModal";
import { HR } from "./ui";
import type { GeneratedPlan, PlanForm, ProjectType } from "../types/plan";
import { translations } from "../translations";

type T = (typeof translations)["sr"];

/** Text inputs: allow only digits (no native number spinners). */
function inputDigitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** Interest field: digits and at most one decimal separator (. or ,). */
function inputDecimal(raw: string): string {
  let sep = false;
  let out = "";
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") out += ch;
    else if ((ch === "." || ch === ",") && !sep) {
      out += ".";
      sep = true;
    }
  }
  return out;
}

function finSearchQuery(pt: ProjectType | null): string {
  if (!pt) return "stambeni kredit Srbija";
  const m: Record<ProjectType, string> = {
    newbuild: "stambeni kredit izgradnja kuće Srbija",
    reno: "kredit za renoviranje stan Srbija",
    extension: "kredit adaptacija nadogradnja Srbija",
    interior: "kredit enterijer renoviranje Srbija",
    yard: "kredit dvorište pejzaž Srbija",
  };
  return m[pt];
}

export function Results({
  plan,
  t,
  form,
  onRestart,
  onSave,
  exportRootRef,
}: {
  plan: GeneratedPlan;
  t: T;
  form: PlanForm;
  onRestart: () => void;
  onSave: () => void;
  exportRootRef: RefObject<HTMLDivElement | null>;
}) {
  const r  = t.results;
  const sr = t.stageRecs;
  const pw = t.planner;
  const pt = pw.projectTypes.find(p=>p.k===form.projectType);
  const stageOpts =
    form.projectType != null ? pw.stagesByType[form.projectType] : [];
  const stageLabel =
    form.stage !== undefined && stageOpts.length > 0
      ? (stageOpts[form.stage] ?? "")
      : "";
  const ctaLabel = t.lang==="sr"?"Istraži":t.lang==="en"?"Explore":"Перейти";

  const finCtaLabel =
    form.projectType && r.finCta[form.projectType]
      ? r.finCta[form.projectType]
      : r.finBankCta;

  const costMidpoint = Math.round((plan.costs.lo + plan.costs.hi) / 2);
  const [finTotal, setFinTotal] = useState(String(costMidpoint));
  const [finDown, setFinDown] = useState("0");
  const [finRate, setFinRate] = useState("6");
  const [finYears, setFinYears] = useState("20");

  useEffect(() => {
    setFinTotal(String(Math.round((plan.costs.lo + plan.costs.hi) / 2)));
  }, [plan.costs.lo, plan.costs.hi]);

  const [previewDoc, setPreviewDoc] = useState<ProjectDocument | null>(null);
  const [planZipLoading, setPlanZipLoading] = useState(false);

  const projectDocs = useMemo(() => {
    if (!form.projectType) return [];
    const ptEntry = pw.projectTypes.find((p) => p.k === form.projectType);
    if (!ptEntry) return [];
    const stageOpts = pw.stagesByType[form.projectType] ?? [];
    const stageLabel = stageOpts[form.stage] ?? "";
    const taskList = pw.tasks[form.projectType] ?? [];
    const taskLabels = form.tasks.map((k) => taskList.find((x) => x.k === k)?.label ?? k);
    return generateProjectDocuments(form, plan, {
      lang: t.lang as DocLang,
      projectType: form.projectType,
      projectTitle: `${ptEntry.icon} ${ptEntry.label}`.trim(),
      taskKeys: form.tasks,
      taskLabels,
      location: form.location,
      sizeM2: form.size,
      stageLabel,
      userProfile: pw.fields.userType.opts[form.userType] ?? "",
      infrastructure: pw.fields.infra.opts[form.infra] ?? "",
    });
  }, [form, plan, pw, t.lang]);

  const handleDownloadPlanZip = async () => {
    const root = exportRootRef.current;
    if (!root) return;
    setPlanZipLoading(true);
    try {
      const { downloadPlanZip } = await import("../lib/downloadPlanZip");
      await downloadPlanZip(root, projectDocs);
    } finally {
      setPlanZipLoading(false);
    }
  };

  const finResult = useMemo(() => {
    const parseNum = (s: string, fallback: number) => {
      const n = parseFloat(s.replace(",", ".").trim());
      return Number.isFinite(n) ? n : fallback;
    };
    const total = parseNum(finTotal, 0);
    const down = parseNum(finDown, 0);
    const rateAnnual = parseNum(finRate, 6);
    const years = parseNum(finYears, 20);
    const principal = total - down;
    const months = Math.round(years * 12);
    if (total <= 0 || principal <= 0 || months <= 0) return null;
    const m = monthlyPayment(principal, rateAnnual, months);
    if (!Number.isFinite(m) || m <= 0) return null;
    const totalRepay = m * months;
    return {
      monthly: m,
      totalRepay,
      totalInterest: totalRepay - principal,
    };
  }, [finTotal, finDown, finRate, finYears]);

  return(
    <div className="fu result-view">
      {/* Header bar */}
      <div style={{background:"var(--ink)",borderRadius:"var(--rl)",padding:"20px 26px",marginBottom:28,display:"flex",flexWrap:"wrap",gap:14,alignItems:"center"}}>
        <div style={{flex:1,minWidth:200}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <p style={{fontSize:11,color:"rgba(255,255,255,.45)",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",fontFamily:"var(--sans)"}}>
              {r.title}
            </p>
            <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,background:plan.isMicro?"rgba(196,92,46,.35)":"rgba(29,78,216,.35)",color:plan.isMicro?"#FECBAB":"#BFDBFE",fontFamily:"var(--sans)",letterSpacing:".06em"}}>
              {plan.isMicro?r.microTag:r.multiTag}
            </span>
          </div>
          <p style={{fontSize:16,fontWeight:500,color:"#fff",fontFamily:"var(--heading)",marginBottom:3}}>
            {pt?.icon} {pt?.label}{form.size?` · ${form.size} m²`:""}
          </p>
          <p style={{fontSize:12,color:"rgba(255,255,255,.42)",fontFamily:"var(--sans)"}}>
            {form.location||""}{form.location&&stageLabel?" · ":""}{stageLabel}
          </p>
        </div>
        <div data-pdf-hide style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button className="btn-save" onClick={onSave} disabled={planZipLoading}><span>💾</span>{r.savePlan}</button>
          <button
            type="button"
            className="btn-p"
            onClick={() => void handleDownloadPlanZip()}
            disabled={planZipLoading}
            style={{fontSize:13,padding:"10px 18px",background:"rgba(196,92,46,.95)",border:"none"}}
          >
            {planZipLoading ? r.planZipPreparing : `📦 ${r.downloadPlan}`}
          </button>
          <button className="btn-g" onClick={onRestart} disabled={planZipLoading}
            style={{borderColor:"rgba(255,255,255,.2)",color:"rgba(255,255,255,.6)"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.08)";e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="rgba(255,255,255,.6)";}}>
            ← {r.restart}
          </button>
        </div>
      </div>

      {/* ── START HERE BLOCK ── */}
      {plan.steps.length>0&&(
        <div style={{background:"linear-gradient(135deg,var(--accbg),#FFF8F5)",border:"2px solid var(--accmid)",borderRadius:"var(--rl)",padding:"24px 26px",marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <span style={{fontSize:16}}>🚀</span>
            <p className="start-here-title">{r.startHereLabel}</p>
          </div>
          <p style={{fontSize:13,color:"var(--ink3)",marginBottom:20,fontFamily:"var(--sans)",lineHeight:1.55}}>{r.startHereSub}</p>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {plan.steps.slice(0,3).map(({step},i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",background:"rgba(255,255,255,.85)",borderRadius:"var(--r)",padding:"14px 18px",border:"1px solid var(--accmid)"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:"var(--acc)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{i+1}</div>
                <p style={{fontSize:13.5,fontWeight:500,color:"var(--ink)",fontFamily:"var(--sans)",lineHeight:1.5,paddingTop:3}}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:28}} className="res-2col">

        {/* Cost card */}
        <div className="card" style={{background:"linear-gradient(135deg,#FEF3EE,#FFFAF8)",borderColor:"var(--accmid)"}}>
          <div style={{padding:"22px 24px"}}>
            <p className="res-sec-title res-sec-title--acc">{r.costsLabel}</p>
            <p style={{fontSize:32,fontWeight:400,color:"var(--ink)",fontFamily:"var(--heading)",lineHeight:1.05,marginBottom:4}}>
              {fmt(plan.costs.lo)}<span style={{color:"var(--ink3)",fontSize:22}}> – </span>{fmt(plan.costs.hi)}
            </p>
            <p style={{fontSize:12,color:"var(--ink3)",marginBottom:16,fontFamily:"var(--sans)"}}>{t.planner.fields.size.label}: {form.size||"100"} m²</p>
            <HR/>
            <p style={{fontSize:11.5,color:"var(--ink4)",marginTop:14,lineHeight:1.65,fontFamily:"var(--sans)"}}>{r.costsNote}</p>
            {plan.infraPartial&&(
              <div className="inf-warn" style={{marginTop:14}}>
                <span style={{fontSize:16,flexShrink:0}}>⚠️</span>
                <p style={{fontSize:12,color:"var(--amb)",lineHeight:1.6,fontFamily:"var(--sans)"}}>{t.infra.partial}</p>
              </div>
            )}
            {plan.infraNone&&(
              <div className="inf-warn" style={{marginTop:14}}>
                <span style={{fontSize:16,flexShrink:0}}>🏡</span>
                <p style={{fontSize:12,color:"var(--amb)",lineHeight:1.6,fontFamily:"var(--sans)"}}>{t.infra.none}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes card */}
        <div className="card">
          <div style={{padding:"22px 24px"}}>
            <p className="res-sec-title res-sec-title--muted">{r.notesLabel}</p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {plan.notes.map((n,i)=>(
                <div key={i} className="note-row" style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{color:"var(--acc)",fontSize:13,lineHeight:"22px",flexShrink:0}}>→</span>
                  <span style={{fontSize:13,color:"var(--ink2)",lineHeight:1.62,fontFamily:"var(--sans)"}}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Financing calculator */}
      <div className="card" style={{borderColor:"var(--accmid)",marginBottom:28}}>
        <div style={{padding:"22px 24px"}}>
          <div
            style={{
              marginBottom:18,
              padding:"12px 14px",
              borderRadius:"var(--r)",
              background:"var(--blubg)",
              border:"1px solid var(--blumid)",
            }}
          >
            <p style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.62,fontFamily:"var(--sans)",whiteSpace:"pre-line"}}>
              {r.finContextBox}
            </p>
          </div>
          <p className="res-sec-title res-sec-title--acc">{r.finTitle}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}} className="res-2col">
            <div>
              <label className="flabel">{r.finTotalCost}</label>
              <input
                className="finput"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={finTotal}
                onChange={(e) => setFinTotal(inputDigitsOnly(e.target.value))}
              />
            </div>
            <div>
              <label className="flabel">{r.finDown}</label>
              <input
                className="finput"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={finDown}
                onChange={(e) => setFinDown(inputDigitsOnly(e.target.value))}
              />
            </div>
            <div>
              <label className="flabel">{r.finRate}</label>
              <input
                className="finput"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={finRate}
                onChange={(e) => setFinRate(inputDecimal(e.target.value))}
              />
              <p style={{fontSize:11,color:"var(--ink4)",fontFamily:"var(--sans)",marginTop:8,lineHeight:1.5}}>
                {r.finNbsHint}
              </p>
            </div>
            <div>
              <label className="flabel">{r.finYears}</label>
              <input
                className="finput"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={finYears}
                onChange={(e) => setFinYears(inputDigitsOnly(e.target.value))}
              />
            </div>
          </div>

          {finResult ? (
            <>
              <HR />
              <div
                style={{
                  marginTop:16,
                  marginBottom:16,
                  padding:"18px 20px",
                  borderRadius:"var(--r)",
                  background:"var(--accbg)",
                  border:"1.5px solid var(--accmid)",
                }}
              >
                <p style={{fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"var(--acc)",marginBottom:8,fontFamily:"var(--sans)"}}>
                  {r.finMonthly}
                </p>
                <p style={{fontSize:28,fontWeight:600,color:"var(--acc)",fontFamily:"var(--heading)",lineHeight:1.1}}>
                  {fmt(Math.round(finResult.monthly))}
                </p>
                <p style={{fontSize:12,color:"var(--ink3)",fontFamily:"var(--sans)",marginTop:10,lineHeight:1.55}}>
                  {r.finMonthlyAnchor}
                </p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="res-2col">
                <div>
                  <p style={{fontSize:11,color:"var(--ink4)",fontFamily:"var(--sans)",marginBottom:4}}>{r.finTotalRepay}</p>
                  <p style={{fontSize:16,fontWeight:600,color:"var(--ink)",fontFamily:"var(--sans)"}}>{fmt(Math.round(finResult.totalRepay))}</p>
                </div>
                <div>
                  <p style={{fontSize:11,color:"var(--ink4)",fontFamily:"var(--sans)",marginBottom:4}}>{r.finTotalInterest}</p>
                  <p style={{fontSize:16,fontWeight:600,color:"var(--ink)",fontFamily:"var(--sans)"}}>{fmt(Math.round(finResult.totalInterest))}</p>
                </div>
              </div>
              <p style={{fontSize:12,color:"var(--ink3)",fontFamily:"var(--sans)",marginTop:16,lineHeight:1.55}}>
                {r.finScenarioTip}
              </p>
              <a
                data-pdf-hide
                href={`https://www.google.com/search?q=${encodeURIComponent(finSearchQuery(form.projectType))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-p"
                style={{
                  display:"inline-flex",
                  marginTop:14,
                  fontSize:13,
                  padding:"11px 22px",
                  textDecoration:"none",
                }}
              >
                {finCtaLabel} →
              </a>
              <p style={{fontSize:12,color:"var(--ink3)",fontFamily:"var(--sans)",marginTop:12,lineHeight:1.55,maxWidth:520}}>
                {r.finTipBelowCta}
              </p>
            </>
          ) : null}

          <p style={{fontSize:11,color:"var(--ink4)",fontFamily:"var(--sans)",marginTop:finResult ? 18 : 20,lineHeight:1.58}}>
            {r.finHelper}
          </p>
        </div>
      </div>

      {/* Full steps list */}
      <div className="card" style={{overflow:"hidden",marginBottom:28}}>
        <div style={{padding:"16px 24px",borderBottom:"1px solid var(--bdr)",background:"var(--bgw)"}}>
          <p className="res-sec-title res-sec-title--inhead res-sec-title--muted">{r.planLabel}</p>
        </div>
        <div style={{padding:"24px 24px 20px"}}>
          {plan.steps.map(({ step }, i) => (
            <div key={i} className="rstep">
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                <div className="rstep-dot" style={{
                  background:i<3?"var(--acc)":i<5?"var(--ambbg)":"var(--bgw)",
                  border:`1.5px solid ${i<3?"var(--acc)":i<5?"var(--ambmid)":"var(--bdr)"}`,
                  color:i<3?"#fff":i<5?"var(--amb)":"var(--ink3)",
                }}>{i+1}</div>
                {i<plan.steps.length-1&&<div style={{width:1.5,height:i<3?32:24,background:i<3?"rgba(196,92,46,.25)":"var(--bdr)",marginTop:3,marginBottom:3}}/>}
              </div>
              <div style={{paddingTop:3,paddingBottom:i<plan.steps.length-1?22:0,flex:1}}>
                <p style={{fontSize:i<3?14:13.5,fontWeight:i<3?500:400,color:i<3?"var(--ink)":"var(--ink2)",lineHeight:1.55,fontFamily:"var(--sans)"}}>{step}</p>
                {/* Inline rec — highlighted block after step index 2 */}
                {i===2&&plan.affKeys.length>0&&(()=>{
                  const k=plan.affKeys[0];
                  const a=AFF[k]; const s=sr[k as keyof typeof sr];
                  if(!a||!s) return null;
                  return(
                    <div data-pdf-hide style={{marginTop:12,marginBottom:4,background:"var(--blubg)",border:"1px solid var(--blumid)",borderRadius:"var(--r)",padding:"12px 14px"}}>
                      <p style={{fontSize:11,fontWeight:600,color:"var(--blu)",fontFamily:"var(--sans)",marginBottom:8,letterSpacing:".04em",textTransform:"uppercase"}}>{r.forPhase}</p>
                      <a href={a.href} target="_blank" rel="noopener noreferrer" className="irec" style={{background:"white",borderColor:"var(--blumid)"}}>
                        <span style={{fontSize:18}}>{a.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <span className="irec-name">{s.name}</span>
                          <p className="irec-desc">{s.desc}</p>
                        </div>
                        <span className="irec-cta">{ctaLabel} →</span>
                      </a>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next steps */}
      <div className="card" style={{background:"var(--grnbg)",borderColor:"var(--grnmid)",marginBottom:28}}>
        <div style={{padding:"22px 24px"}}>
          <p className="res-sec-title res-sec-title--grn">{r.nextLabel}</p>
          <div className="next-g" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {plan.next.map((n,i)=>(
              <div key={i} style={{display:"flex",gap:12,background:"rgba(255,255,255,.82)",borderRadius:8,padding:"13px 16px",border:"1px solid var(--grnmid)"}}>
                <span style={{fontWeight:700,color:"var(--grn)",fontSize:12.5,flexShrink:0,minWidth:18,fontFamily:"var(--sans)"}}>{i+1}.</span>
                <span style={{fontSize:13,color:"var(--grn)",fontFamily:"var(--sans)",lineHeight:1.5}}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AFFILIATE: What you'll need next ── */}
      <div data-pdf-hide className="card" style={{overflow:"hidden",marginBottom:28}}>
        <div style={{padding:"20px 24px 14px",borderBottom:"1px solid var(--bdr)"}}>
          <p className="res-sec-title res-sec-title--inhead res-sec-title--acc" style={{marginBottom:8}}>{r.stageRecsLabel}</p>
          <p style={{fontSize:13,color:"var(--ink3)",fontFamily:"var(--sans)",lineHeight:1.55}}>{r.stageRecsContext}</p>
          <p style={{fontSize:12,color:"var(--ink4)",fontFamily:"var(--sans)",lineHeight:1.5,marginTop:8}}>{r.stageRecsHelper}</p>
        </div>
        <div style={{padding:"18px 24px 22px"}}>
          {/* First 2 items — large featured cards */}
          {plan.affKeys.length>0&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}} className="res-2col">
              {plan.affKeys.slice(0,2).map(key=>{
                const a=AFF[key]; const s=sr[key as keyof typeof sr];
                if(!a||!s) return null;
                return(
                  <a key={key} href={a.href} target="_blank" rel="noopener noreferrer"
                    style={{display:"flex",flexDirection:"column",gap:10,padding:"18px 18px",border:"1.5px solid var(--accmid)",borderRadius:"var(--r)",background:"var(--accbg)",transition:"all .15s",cursor:"pointer",textDecoration:"none"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="#FEE9DD";e.currentTarget.style.boxShadow="var(--sh1)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="var(--accbg)";e.currentTarget.style.boxShadow="none";}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:24}}>{a.icon}</span>
                      <div style={{flex:1}}>
                        <p style={{fontSize:14,fontWeight:600,color:"var(--ink)",fontFamily:"var(--sans)",marginBottom:3}}>{s.name}</p>
                        <p style={{fontSize:12,color:"var(--ink3)",fontFamily:"var(--sans)",lineHeight:1.4}}>{s.desc}</p>
                      </div>
                    </div>
                    <span style={{fontSize:12.5,fontWeight:600,color:"var(--acc)",fontFamily:"var(--sans)"}}>{ctaLabel} →</span>
                  </a>
                );
              })}
            </div>
          )}
          {/* Remaining items — compact rows */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}} className="aff-g">
            {plan.affKeys.slice(2).map(key=>{
              const a=AFF[key]; const s=sr[key as keyof typeof sr];
              if(!a||!s) return null;
              return(
                <a key={key} href={a.href} target="_blank" rel="noopener noreferrer" className="irec">
                  <span style={{fontSize:18,flexShrink:0}}>{a.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p className="irec-name">{s.name}</p>
                    <p className="irec-desc">{s.desc}</p>
                  </div>
                  <span className="irec-cta">→</span>
                </a>
              );
            })}
          </div>
        </div>
        <div style={{padding:"0 24px 16px",borderTop:"1px solid var(--bdr)"}}>
          <p style={{fontSize:11,color:"var(--ink4)",fontFamily:"var(--sans)",paddingTop:14,lineHeight:1.55}}>{r.affilNote}</p>
        </div>
      </div>

      {/* Generated project documentation */}
      {projectDocs.length > 0 && (
        <div className="card" style={{overflow:"hidden",marginBottom:28}}>
          <div style={{padding:"20px 24px 12px",borderBottom:"1px solid var(--bdr)"}}>
            <p className="res-sec-title res-sec-title--inhead res-sec-title--acc">{r.docSectionTitle}</p>
          </div>
          <div style={{padding:"18px 24px 22px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}} className="aff-g">
              {projectDocs.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display:"flex",
                    flexDirection:"column",
                    gap:12,
                    padding:"16px 18px",
                    border:"1.5px solid var(--bdr)",
                    borderRadius:"var(--r)",
                    background:"var(--bgw)",
                  }}
                >
                  <div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                      <span style={{fontSize:10,fontWeight:700,letterSpacing:".04em",textTransform:"uppercase",padding:"3px 8px",borderRadius:4,background:"var(--accbg)",color:"var(--acc)",border:"1px solid var(--accmid)",fontFamily:"var(--sans)"}}>{r.docBadgeAuto}</span>
                      <span style={{fontSize:10,fontWeight:700,letterSpacing:".04em",textTransform:"uppercase",padding:"3px 8px",borderRadius:4,background:"var(--blubg)",color:"var(--blu)",border:"1px solid var(--blumid)",fontFamily:"var(--sans)"}}>{r.docBadgeTailored}</span>
                    </div>
                    <p style={{fontSize:14,fontWeight:600,color:"var(--ink)",fontFamily:"var(--sans)",marginBottom:6}}>{doc.title}</p>
                    <p style={{fontSize:12.5,color:"var(--ink3)",fontFamily:"var(--sans)",lineHeight:1.55}}>{doc.description}</p>
                  </div>
                  <div data-pdf-hide style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    <button
                      type="button"
                      className="btn-g"
                      style={{fontSize:13,padding:"10px 16px"}}
                      onClick={() => setPreviewDoc(doc)}
                    >
                      {r.docPreview}
                    </button>
                    <button
                      type="button"
                      className="btn-p"
                      style={{fontSize:13,padding:"10px 16px"}}
                      onClick={() => downloadProjectDocument(doc)}
                    >
                      {r.docDownload}
                    </button>
                    <button
                      type="button"
                      className="btn-g"
                      style={{fontSize:13,padding:"10px 16px"}}
                      onClick={() => {
                        void import("../lib/exportDocx").then((m) =>
                          m.downloadProjectDocumentDocx(doc),
                        );
                      }}
                    >
                      {r.docDownloadDocx}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{padding:"0 24px 18px",borderTop:"1px solid var(--bdr)"}}>
            <p style={{fontSize:11,color:"var(--ink4)",fontFamily:"var(--sans)",paddingTop:14,lineHeight:1.55}}>{r.docGenNote}</p>
          </div>
        </div>
      )}

      {previewDoc ? (
        <DocumentPreviewModal
          doc={previewDoc}
          downloadLabel={r.docDownload}
          docxLabel={r.docDownloadDocx}
          closeLabel={t.save.close}
          onClose={() => setPreviewDoc(null)}
          onDownload={(d) => {
            downloadProjectDocument(d);
            setPreviewDoc(null);
          }}
          onDownloadDocx={async (d) => {
            const { downloadProjectDocumentDocx } = await import("../lib/exportDocx");
            await downloadProjectDocumentDocx(d);
            setPreviewDoc(null);
          }}
        />
      ) : null}

      {/* Donja traka: iste akcije kao u headeru (sačuvaj + PDF + novi plan) */}
      <div
        data-pdf-hide
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: 12,
          paddingTop: 22,
          borderTop: "1px solid var(--bdr)",
        }}
      >
        <button type="button" className="btn-save btn-save--light" onClick={onSave} disabled={planZipLoading}>
          <span>💾</span>
          {r.savePlan}
        </button>
        <button
          type="button"
          className="btn-p"
          onClick={() => void handleDownloadPlanZip()}
          disabled={planZipLoading}
          style={{ fontSize: 13, padding: "11px 20px" }}
        >
          {planZipLoading ? r.planZipPreparing : `📦 ${r.downloadPlan}`}
        </button>
        <button type="button" className="btn-g" onClick={onRestart} disabled={planZipLoading}>
          ← {r.restart}
        </button>
      </div>
    </div>
  );
}
