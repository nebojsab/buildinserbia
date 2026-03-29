import { useEffect, useRef, useState } from "react";
import type { Lang } from "../translations";
import { HR } from "./ui";

const STEP_MS = 560;
const TOAST_AFTER_MS = 420;
const TOAST_VISIBLE_MS = 3200;
const LOOP_GAP_MS = 4000;
const FIRST_STEP_AT = 320;

export function HeroPlanVisual({ lang }: { lang: Lang }) {
  const [completed, setCompleted] = useState(0);
  const [toast, setToast] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const timeoutsRef = useRef<number[]>([]);

  const clearTimers = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setCompleted(5);
      setToast(true);
      return;
    }

    const schedule = () => {
      clearTimers();
      setCompleted(0);
      setToast(false);
      for (let i = 1; i <= 5; i++) {
        const id = window.setTimeout(
          () => setCompleted(i),
          FIRST_STEP_AT + (i - 1) * STEP_MS,
        );
        timeoutsRef.current.push(id);
      }
      const lastStepAt = FIRST_STEP_AT + 4 * STEP_MS;
      const t1 = window.setTimeout(
        () => setToast(true),
        lastStepAt + TOAST_AFTER_MS,
      );
      timeoutsRef.current.push(t1);
      const t2 = window.setTimeout(() => {
        setToast(false);
        const t3 = window.setTimeout(schedule, LOOP_GAP_MS);
        timeoutsRef.current.push(t3);
      }, lastStepAt + TOAST_AFTER_MS + TOAST_VISIBLE_MS);
      timeoutsRef.current.push(t2);
    };

    schedule();
    return () => {
      clearTimers();
    };
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 12, y: py * -10 });
  };

  const onLeave = () => setTilt({ x: 0, y: 0 });

  const cardTransform = `perspective(960px) rotateX(${tilt.y * 0.55}deg) rotateY(${tilt.x * 0.65}deg)`;

  const title =
    lang === "sr" ? "Vaš plan" : lang === "en" ? "Your plan" : "Ваш план";
  const toastTitle =
    lang === "sr"
      ? "Plan spreman"
      : lang === "en"
        ? "Plan ready"
        : "План готов";
  const toastSub =
    lang === "sr"
      ? "11 koraka · ~€72.000"
      : lang === "en"
        ? "11 steps · ~€72,000"
        : "11 шагов · ~€72 000";

  const barW = [210, 170, 185, 145, 125];

  return (
    <div
      className="hero-vis fu2"
      style={{ position: "relative" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        className="hero-vis-card-outer"
        style={{
          transform: cardTransform,
          transformStyle: "preserve-3d",
          transition: "transform 0.2s ease-out",
        }}
      >
        <div className="hero-vis-card-float">
          <div className="card" style={{ padding: 26, boxShadow: "var(--sh2)" }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--acc)",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                marginBottom: 14,
                fontFamily: "var(--sans)",
              }}
            >
              {title}
            </p>
            {[1, 2, 3, 4, 5].map((i) => {
              const done = i <= completed;
              return (
                <div
                  key={i}
                  className="hero-step-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    className="hero-step-dot"
                    data-done={done}
                    style={{
                      width: 21,
                      height: 21,
                      borderRadius: "50%",
                      background: done ? "var(--acc)" : "var(--bgw)",
                      border: `1.5px solid ${done ? "var(--acc)" : "var(--bdr)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: done ? 10 : 9,
                      fontWeight: 700,
                      color: done ? "#fff" : "var(--ink4)",
                      flexShrink: 0,
                      transition:
                        "background .35s ease,border-color .35s ease,color .35s ease,transform .25s ease",
                      transform: done ? "scale(1)" : "scale(1)",
                    }}
                  >
                    {done ? "✓" : i}
                  </div>
                  <div
                    style={{
                      height: 7,
                      background: done ? "var(--accmid)" : "var(--bgw)",
                      borderRadius: 4,
                      flex: 1,
                      maxWidth: barW[i - 1],
                      opacity: done ? 1 : 0.5,
                      transition: "background .35s ease,opacity .35s ease",
                    }}
                  />
                </div>
              );
            })}
            <HR />
            <div
              className="hero-mini-cards"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 16,
              }}
            >
              <div
                className={`hero-mini-card hero-mini-card--acc${completed >= 3 ? " hero-mini-card--live" : ""}`}
                style={{
                  background: "var(--accbg)",
                  border: "1px solid var(--accmid)",
                  borderRadius: 8,
                  padding: "13px 14px",
                  transition: "transform .35s ease,box-shadow .35s ease",
                }}
              >
                <span style={{ fontSize: 16, display: "block", marginBottom: 7 }}>
                  💰
                </span>
                <div
                  style={{
                    height: 6,
                    background: "var(--accmid)",
                    borderRadius: 3,
                    width: "75%",
                    marginBottom: 4,
                  }}
                />
                <div
                  style={{
                    height: 6,
                    background: "var(--accmid)",
                    borderRadius: 3,
                    width: "50%",
                    opacity: 0.5,
                  }}
                />
              </div>
              <div
                className={`hero-mini-card hero-mini-card--grn${completed >= 4 ? " hero-mini-card--live" : ""}`}
                style={{
                  background: "var(--grnbg)",
                  border: "1px solid var(--grnmid)",
                  borderRadius: 8,
                  padding: "13px 14px",
                  transition: "transform .35s ease,box-shadow .35s ease",
                }}
              >
                <span style={{ fontSize: 16, display: "block", marginBottom: 7 }}>
                  ✅
                </span>
                <div
                  style={{
                    height: 6,
                    background: "var(--grnmid)",
                    borderRadius: 3,
                    width: "65%",
                    marginBottom: 4,
                  }}
                />
                <div
                  style={{
                    height: 6,
                    background: "var(--grnmid)",
                    borderRadius: 3,
                    width: "40%",
                    opacity: 0.5,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: -16,
          right: -16,
          opacity: toast ? 1 : 0,
          pointerEvents: toast ? "auto" : "none",
          transition: "opacity .45s cubic-bezier(.22,1,.36,1)",
          transform: toast ? "translateY(0)" : "translateY(10px)",
        }}
        aria-hidden={!toast}
      >
        <div className="hero-vis-toast-bob">
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--bdr)",
              borderRadius: 11,
              padding: "9px 14px",
              boxShadow: "var(--sh1)",
              display: "flex",
              alignItems: "center",
              gap: 9,
              transform: `translate3d(${tilt.x * 5}px, ${tilt.y * 4}px, 0)`,
              transition: "transform 0.2s ease-out",
            }}
          >
            <span style={{ fontSize: 18 }}>✅</span>
            <div>
              <p
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "var(--grn)",
                  fontFamily: "var(--sans)",
                  marginBottom: 2,
                }}
              >
                {toastTitle}
              </p>
              <p
                style={{
                  fontSize: 10.5,
                  color: "var(--ink4)",
                  fontFamily: "var(--sans)",
                }}
              >
                {toastSub}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
