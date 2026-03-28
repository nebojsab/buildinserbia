import { AFF } from "../constants/affiliate";
import { fmt } from "../lib/format";
import { HR } from "./ui";
import type { GeneratedPlan, PlanForm } from "../types/plan";
import { translations } from "../translations";

type T = (typeof translations)["sr"];

export function Results({
  plan,
  t,
  form,
  onRestart,
  onSave,
}: {
  plan: GeneratedPlan;
  t: T;
  form: PlanForm;
  onRestart: () => void;
  onSave: () => void;
}) {
  const r  = t.results;
  const sr = t.stageRecs;
  const pw = t.planner;
  const pt = pw.projectTypes.find(p=>p.k===form.projectType);
  const ctaLabel = t.lang==="sr"?"Istraži":t.lang==="en"?"Explore":"Перейти";

  return(
    <div className="fu">
      {/* Header bar */}
      <div style={{background:"var(--ink)",borderRadius:"var(--rl)",padding:"20px 26px",marginBottom:20,display:"flex",flexWrap:"wrap",gap:14,alignItems:"center"}}>
        <div style={{flex:1,minWidth:200}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <p style={{fontSize:11,color:"rgba(255,255,255,.45)",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",fontFamily:"var(--sans)"}}>
              {r.title}
            </p>
            <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,background:plan.isMicro?"rgba(196,92,46,.35)":"rgba(29,78,216,.35)",color:plan.isMicro?"#FECBAB":"#BFDBFE",fontFamily:"var(--sans)",letterSpacing:".06em"}}>
              {plan.isMicro?r.microTag:r.multiTag}
            </span>
          </div>
          <p style={{fontSize:16,fontWeight:500,color:"#fff",fontFamily:"var(--serif)",marginBottom:3}}>
            {pt?.icon} {pt?.label}{form.size?` · ${form.size} m²`:""}
          </p>
          <p style={{fontSize:12,color:"rgba(255,255,255,.42)",fontFamily:"var(--sans)"}}>
            {form.location||""}{form.location&&form.stage!==undefined?" · ":""}{form.stage!==undefined?pw.fields.stage.opts[form.stage]:""}
          </p>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button className="btn-save" onClick={onSave}><span>💾</span>{r.savePlan}</button>
          <button className="btn-g" onClick={onRestart}
            style={{borderColor:"rgba(255,255,255,.2)",color:"rgba(255,255,255,.6)"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.08)";e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="rgba(255,255,255,.6)";}}>
            ← {r.restart}
          </button>
        </div>
      </div>

      {/* ── START HERE BLOCK ── */}
      {plan.steps.length>0&&(
        <div style={{background:"linear-gradient(135deg,var(--accbg),#FFF8F5)",border:"2px solid var(--accmid)",borderRadius:"var(--rl)",padding:"22px 24px",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <span style={{fontSize:16}}>🚀</span>
            <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--acc)",fontFamily:"var(--sans)"}}>{r.startHereLabel}</p>
          </div>
          <p style={{fontSize:13,color:"var(--ink3)",marginBottom:18,fontFamily:"var(--sans)"}}>{r.startHereSub}</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {plan.steps.slice(0,3).map(({step},i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",background:"rgba(255,255,255,.75)",borderRadius:"var(--r)",padding:"12px 16px",border:"1px solid var(--accmid)"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:"var(--acc)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{i+1}</div>
                <p style={{fontSize:13.5,fontWeight:500,color:"var(--ink)",fontFamily:"var(--sans)",lineHeight:1.5,paddingTop:3}}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}} className="res-2col">

        {/* Cost card */}
        <div className="card" style={{background:"linear-gradient(135deg,#FEF3EE,#FFFAF8)",borderColor:"var(--accmid)"}}>
          <div style={{padding:"20px 22px"}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--acc)",marginBottom:10,fontFamily:"var(--sans)"}}>{r.costsLabel}</p>
            <p style={{fontSize:32,fontWeight:400,color:"var(--ink)",fontFamily:"var(--serif)",lineHeight:1.05,marginBottom:4}}>
              {fmt(plan.costs.lo)}<span style={{color:"var(--ink3)",fontSize:22}}> – </span>{fmt(plan.costs.hi)}
            </p>
            <p style={{fontSize:12,color:"var(--ink3)",marginBottom:14,fontFamily:"var(--sans)"}}>{t.planner.fields.size.label}: {form.size||"100"} m²</p>
            <HR/>
            <p style={{fontSize:11.5,color:"var(--ink4)",marginTop:12,lineHeight:1.6,fontFamily:"var(--sans)"}}>{r.costsNote}</p>
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
          <div style={{padding:"20px 22px"}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--ink3)",marginBottom:14,fontFamily:"var(--sans)"}}>{r.notesLabel}</p>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              {plan.notes.map((n,i)=>(
                <div key={i} style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                  <span style={{color:"var(--acc)",fontSize:13,lineHeight:"20px",flexShrink:0}}>→</span>
                  <span style={{fontSize:13,color:"var(--ink2)",lineHeight:1.6,fontFamily:"var(--sans)"}}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full steps list */}
      <div className="card" style={{overflow:"hidden",marginBottom:16}}>
        <div style={{padding:"13px 22px",borderBottom:"1px solid var(--bdr)",background:"var(--bgw)"}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--ink3)",fontFamily:"var(--sans)"}}>{r.planLabel}</p>
        </div>
        <div style={{padding:"22px 22px 18px"}}>
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
              <div style={{paddingTop:3,paddingBottom:i<plan.steps.length-1?20:0,flex:1}}>
                <p style={{fontSize:i<3?14:13.5,fontWeight:i<3?500:400,color:i<3?"var(--ink)":"var(--ink2)",lineHeight:1.55,fontFamily:"var(--sans)"}}>{step}</p>
                {/* Inline rec — highlighted block after step index 2 */}
                {i===2&&plan.affKeys.length>0&&(()=>{
                  const k=plan.affKeys[0];
                  const a=AFF[k]; const s=sr[k as keyof typeof sr];
                  if(!a||!s) return null;
                  return(
                    <div style={{marginTop:12,marginBottom:4,background:"var(--blubg)",border:"1px solid var(--blumid)",borderRadius:"var(--r)",padding:"12px 14px"}}>
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
      <div className="card" style={{background:"var(--grnbg)",borderColor:"var(--grnmid)",marginBottom:16}}>
        <div style={{padding:"20px 22px"}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--grn)",marginBottom:16,fontFamily:"var(--sans)"}}>{r.nextLabel}</p>
          <div className="next-g" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {plan.next.map((n,i)=>(
              <div key={i} style={{display:"flex",gap:11,background:"rgba(255,255,255,.7)",borderRadius:8,padding:"11px 14px",border:"1px solid var(--grnmid)"}}>
                <span style={{fontWeight:700,color:"var(--grn)",fontSize:12.5,flexShrink:0,minWidth:18,fontFamily:"var(--sans)"}}>{i+1}.</span>
                <span style={{fontSize:13,color:"var(--grn)",fontFamily:"var(--sans)",lineHeight:1.5}}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AFFILIATE: What you'll need next ── */}
      <div className="card" style={{overflow:"hidden"}}>
        <div style={{padding:"18px 22px 10px",borderBottom:"1px solid var(--bdr)"}}>
          <p style={{fontSize:12,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"var(--acc)",marginBottom:4,fontFamily:"var(--sans)"}}>{r.stageRecsLabel}</p>
          <p style={{fontSize:13,color:"var(--ink3)",fontFamily:"var(--sans)",paddingBottom:4,lineHeight:1.5}}>{r.stageRecsContext}</p>
        </div>
        <div style={{padding:"16px 22px 20px"}}>
          {/* First 2 items — large featured cards */}
          {plan.affKeys.length>0&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}} className="res-2col">
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
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}} className="aff-g">
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
        <div style={{padding:"0 22px 14px",borderTop:"1px solid var(--bdr)"}}>
          <p style={{fontSize:11,color:"var(--ink4)",fontFamily:"var(--sans)",paddingTop:12}}>{r.affilNote}</p>
        </div>
      </div>
    </div>
  );
}
