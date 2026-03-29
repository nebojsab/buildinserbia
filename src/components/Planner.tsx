import { Fragment, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  FULL_RENOVATION_TASK_KEY,
  resolveTasksForPlanSubmit,
} from "../constants/renovation";
import { generatePlan } from "../lib/generatePlan";
import type { PlanForm, ProjectType } from "../types/plan";
import { translations, type Lang } from "../translations";
import { LocationAutocomplete } from "./LocationAutocomplete";

type T = (typeof translations)["sr"];

export function Planner({
  t,
  onResult,
}: {
  t: T;
  onResult: (plan: ReturnType<typeof generatePlan>, form: PlanForm) => void;
}) {
  const pw = t.planner;
  const [step, setStep] = useState(0); // 0=type, 1=tasks, 2=details, 3=infra
  const [pType, setPType] = useState<ProjectType | null>(null);
  const [selTasks, setSelTasks] = useState<string[]>([]);
  const [size,setSize] = useState("");
  const [budget,setBudget] = useState(2);
  const [location,setLocation] = useState("");
  const [stage, setStage] = useState(0);
  const [userType, setUserType] = useState(0);
  const [infra, setInfra] = useState(0);
  const [submitting, setSub] = useState(false);

  const stageOptions = pType ? pw.stagesByType[pType] : [];
  const stageHelper = pType ? pw.stageHelperByType[pType] : "";

  useEffect(() => {
    setStage(0);
  }, [pType]);

  useEffect(() => {
    if (stageOptions.length === 0) return;
    setStage((s) => Math.min(s, stageOptions.length - 1));
  }, [t.lang, stageOptions.length]);

  const pct = ((step + 1) / 4) * 100;

  const taskList = pType ? pw.tasks[pType] || [] : [];
  const renoGranularKeys = taskList
    .map((x) => x.k)
    .filter((k) => k !== FULL_RENOVATION_TASK_KEY);

  const fullRenoShortcutActive =
    pType === "reno" &&
    selTasks.length === 1 &&
    selTasks[0] === FULL_RENOVATION_TASK_KEY;

  const handleTaskClick = (k: string) => {
    if (pType !== "reno") {
      setSelTasks((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
      return;
    }
    if (k === FULL_RENOVATION_TASK_KEY) {
      if (fullRenoShortcutActive) {
        setSelTasks([]);
      } else {
        setSelTasks([FULL_RENOVATION_TASK_KEY]);
      }
      return;
    }
    if (fullRenoShortcutActive) {
      setSelTasks([k]);
      return;
    }
    setSelTasks((p) => {
      const base = p.filter((x) => x !== FULL_RENOVATION_TASK_KEY);
      return base.includes(k) ? base.filter((x) => x !== k) : [...base, k];
    });
  };

  const canNext0 = !!pType;
  const canNext1 = selTasks.length > 0;

  const doSubmit = () => {
    if (!pType) return;
    setSub(true);
    const form: PlanForm = {
      projectType: pType,
      tasks: resolveTasksForPlanSubmit(pType, selTasks, renoGranularKeys),
      size,
      budget,
      stage,
      userType,
      infra,
      location,
    };
    setTimeout(() => {
      setSub(false);
      onResult(generatePlan(form, t.lang as Lang), form);
    }, 1000);
  };

  const S = (children: ReactNode, delay = 0) => (
    <div className="fu" style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );

  return(
    <div>
      {/* Step indicator */}
      <div className="step-ind">
        {pw.stepLabels.map((lbl,i)=>(
          <Fragment key={i}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div className="step-dot" style={{
                background:step>i?"var(--acc)":step===i?"var(--ink)":"var(--bgw)",
                border:`2px solid ${step>=i?"var(--acc)":"var(--bdr2)"}`,
                color:step>i||step===i?"#fff":"var(--ink4)",
                width:26,height:26,fontSize:10,fontWeight:700,
              }}>{step>i?"✓":i+1}</div>
              <span style={{fontSize:10,fontWeight:500,color:step===i?"var(--acc)":step>i?"var(--ink3)":"var(--ink4)",fontFamily:"var(--sans)",whiteSpace:"nowrap"}}>{lbl}</span>
            </div>
            {i<pw.stepLabels.length-1&&(
              <div className="step-line" style={{background:step>i?"var(--acc)":"var(--bdr)",marginBottom:14}}/>
            )}
          </Fragment>
        ))}
      </div>

      {/* Progress bar */}
      <div className="pbar"><div className="pfill" style={{width:`${pct}%`}}/></div>

      {/* STEP 0: Project type */}
      {step===0&&S(
        <div>
          <p style={{fontFamily:"var(--heading)",fontSize:22,fontWeight:500,color:"var(--ink)",marginBottom:22,lineHeight:1.3}}>{pw.title}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}} className="task-g">
            {pw.projectTypes.map(pt=>(
              <button key={pt.k}
                onClick={() => {
                  setPType(pt.k as ProjectType);
                  setSelTasks([]);
                }}
                style={{display:"flex",alignItems:"center",gap:12,padding:"16px 18px",border:`2px solid ${pType===pt.k?"var(--acc)":"var(--bdr)"}`,borderRadius:"var(--rl)",background:pType===pt.k?"var(--accbg)":"var(--bg)",cursor:"pointer",transition:"all .15s",textAlign:"left"}}>
                <span style={{fontSize:28}}>{pt.icon}</span>
                <span style={{fontSize:14,fontWeight:600,color:pType===pt.k?"var(--acc)":"var(--ink)",fontFamily:"var(--sans)"}}>{pt.label}</span>
              </button>
            ))}
          </div>
          <div style={{marginTop:28,display:"flex",justifyContent:"flex-end"}}>
            <button className="btn-p" onClick={()=>setStep(1)} disabled={!canNext0} style={{fontSize:14}}>{pw.next}</button>
          </div>
        </div>
      )}

      {/* STEP 1: Task selection */}
      {step===1&&S(
        <div>
          <p style={{fontFamily:"var(--heading)",fontSize:22,fontWeight:500,color:"var(--ink)",marginBottom:6,lineHeight:1.3}}>
            {pw.projectTypes.find(p=>p.k===pType)?.icon} {pw.projectTypes.find(p=>p.k===pType)?.label}
          </p>
          <p style={{fontSize:13.5,color:"var(--ink3)",marginBottom:22,fontFamily:"var(--sans)"}}>{pw.selectHint}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="task-g">
            {taskList.map((tk) => {
              const selected =
                pType === "reno" && fullRenoShortcutActive
                  ? tk.k === FULL_RENOVATION_TASK_KEY
                  : selTasks.includes(tk.k);
              const muted =
                pType === "reno" &&
                fullRenoShortcutActive &&
                tk.k !== FULL_RENOVATION_TASK_KEY;
              return (
                <div
                  key={tk.k}
                  className={`task-opt${selected ? " sel" : ""}${muted ? " muted" : ""}`}
                  onClick={() => handleTaskClick(tk.k)}
                  style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      width: "100%",
                    }}
                  >
                    <span className="task-icon">{tk.icon}</span>
                    <span className="task-label" style={{ flex: 1, minWidth: 0 }}>
                      {tk.label}
                    </span>
                    <div className="task-chk">
                      {selected ? (
                        <span style={{ fontSize: 10, color: "#fff" }}>✓</span>
                      ) : null}
                    </div>
                  </div>
                  {tk.k === FULL_RENOVATION_TASK_KEY ? (
                    <p
                      style={{
                        fontSize: 11.5,
                        color: "var(--ink3)",
                        lineHeight: 1.45,
                        fontFamily: "var(--sans)",
                        margin: 0,
                        paddingLeft: 28,
                      }}
                    >
                      {pw.fullRenoHint}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div style={{marginTop:28,display:"flex",justifyContent:"space-between"}}>
            <button className="btn-g" onClick={()=>setStep(0)}>{pw.back}</button>
            <button className="btn-p" onClick={()=>setStep(2)} disabled={!canNext1} style={{fontSize:14}}>{pw.next}</button>
          </div>
        </div>
      )}

      {/* STEP 2: Details */}
      {step===2&&S(
        <div>
          <p style={{fontFamily:"var(--heading)",fontSize:22,fontWeight:500,color:"var(--ink)",marginBottom:22,lineHeight:1.3}}>
            {t.lang==="sr"?"Detalji projekta":t.lang==="en"?"Project details":"Детали проекта"}
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:4}} className="res-2col">
            <div>
              <label className="flabel">{pw.fields.size.label}</label>
              <input className="finput" type="number" value={size} onChange={e=>setSize(e.target.value)} placeholder={pw.fields.size.ph}/>
            </div>
            <div>
              <label className="flabel">{pw.fields.budget.label}</label>
              <select className="fselect" value={budget} onChange={e=>setBudget(Number(e.target.value))}>
                {pw.fields.budget.opts.map((o,i)=><option key={i} value={i}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label className="flabel">{pw.fields.location.label}</label>
            <LocationAutocomplete
              value={location}
              onChange={setLocation}
              placeholder={pw.fields.location.ph}
              labels={pw.locationSearch}
              lang={t.lang as Lang}
            />
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
              {pw.locChips.map(lc=>(
                <button key={lc} className={`lchip${location===lc?" act":""}`} onClick={()=>setLocation(lc)}>{lc}</button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="res-2col">
            <div>
              <label className="flabel">{pw.fields.stage.label}</label>
              <select
                className="fselect"
                value={stage}
                onChange={(e) => setStage(Number(e.target.value))}
              >
                {stageOptions.map((o, i) => (
                  <option key={i} value={i}>
                    {o}
                  </option>
                ))}
              </select>
              {stageHelper ? (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--ink3)",
                    lineHeight: 1.55,
                    fontFamily: "var(--sans)",
                    marginTop: 8,
                  }}
                >
                  {stageHelper}
                </p>
              ) : null}
            </div>
            <div>
              <label className="flabel">{pw.fields.userType.label}</label>
              <select className="fselect" value={userType} onChange={e=>setUserType(Number(e.target.value))}>
                {pw.fields.userType.opts.map((o,i)=><option key={i} value={i}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginTop:28,display:"flex",justifyContent:"space-between"}}>
            <button className="btn-g" onClick={()=>setStep(1)}>{pw.back}</button>
            <button className="btn-p" onClick={()=>setStep(3)} style={{fontSize:14}}>{pw.next}</button>
          </div>
        </div>
      )}

      {/* STEP 3: Infrastructure */}
      {step===3&&S(
        <div>
          <p style={{fontFamily:"var(--heading)",fontSize:22,fontWeight:500,color:"var(--ink)",marginBottom:8,lineHeight:1.3}}>
            {pw.fields.infra.label}
          </p>
          <p style={{fontSize:13.5,color:"var(--ink3)",marginBottom:22,fontFamily:"var(--sans)"}}>
            {t.lang==="sr"?"Ovo pomaže alatu da predloži prava rešenja za vašu situaciju.":t.lang==="en"?"This helps the tool suggest the right solutions for your situation.":"Это помогает инструменту предложить правильные решения для вашей ситуации."}
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {pw.fields.infra.opts.map((opt,i)=>(
              <div key={i} onClick={()=>setInfra(i)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",border:`2px solid ${infra===i?"var(--acc)":"var(--bdr)"}`,borderRadius:"var(--r)",background:infra===i?"var(--accbg)":"var(--bg)",cursor:"pointer",transition:"all .15s"}}>
                <span style={{fontSize:18}}>{i===0?"🏙️":i===1?"⚡":"🏡"}</span>
                <span style={{fontSize:13.5,fontWeight:500,color:infra===i?"var(--acc)":"var(--ink)",fontFamily:"var(--sans)"}}>{opt}</span>
                <div style={{marginLeft:"auto",width:18,height:18,borderRadius:"50%",border:`2px solid ${infra===i?"var(--acc)":"var(--bdr2)"}`,background:infra===i?"var(--acc)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {infra===i&&<span style={{fontSize:9,color:"#fff"}}>●</span>}
                </div>
              </div>
            ))}
          </div>

          {infra===2&&(
            <div className="inf-warn" style={{marginTop:16}}>
              <span style={{fontSize:16,flexShrink:0}}>🏡</span>
              <p style={{fontSize:12.5,color:"var(--amb)",lineHeight:1.65,fontFamily:"var(--sans)"}}>{t.infra.none}</p>
            </div>
          )}

          <div style={{marginTop:28,display:"flex",justifyContent:"space-between"}}>
            <button className="btn-g" onClick={()=>setStep(2)}>{pw.back}</button>
            <button className="btn-p" onClick={doSubmit} disabled={submitting} style={{fontSize:14,padding:"12px 28px"}}>
              {submitting?(<span style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:14,height:14,border:"2px solid rgba(255,255,255,.35)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block"}}/>
                {pw.submitting}
              </span>):pw.submit}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
