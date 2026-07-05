import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Github, Linkedin, Instagram, Mail, Phone, MapPin, ExternalLink,
  ArrowUp, ArrowRight, Command, X, ChevronLeft, ChevronRight,
  Download, Sparkles, Terminal, Send, Award, BadgeCheck
} from "lucide-react";

/* ---------------------------------------------------------------
   TOKENS
--------------------------------------------------------------- */
const C = {
  void: "#0A0E1A",
  ink: "#10152A",
  inkLight: "#171E38",
  line: "rgba(139,147,168,0.14)",
  cyan: "#00E5FF",
  violet: "#8B5CF6",
  frost: "#E8ECF7",
  mist: "#8B93A8",
};

const FONT_DISPLAY = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Sora', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const PROFILE_IMG = "/profile.jpg";


const RESUME_PDF = "/resume.pdf";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ---------------------------------------------------------------
   DATA (placeholder — swap with real info)
--------------------------------------------------------------- */
const ROLES = ["Full Stack Developer", "AI Enthusiast", "AI Intern", "Data Analytics", "Problem Solver"];

const NAV = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];

const STATS = [
  { label: "Projects built", value: 4, suffix: "+" },
  { label: "Certifications earned", value: 5, suffix: "" },
  { label: "Industry simulations", value: 2, suffix: "" },
  { label: "Technologies learned", value: 12, suffix: "+" },
];

const SKILLS = [
  { category: "Frontend", items: [["HTML5", 92], ["CSS3", 88], ["JavaScript", 88], ["React.js", 85]] },
  { category: "Backend", items: [["Node.js", 80], ["Express.js", 78]] },
  { category: "Languages & DSA", items: [["C++ (DSA)", 85], ["Python", 80]] },
  { category: "Databases", items: [["SQL", 80], ["MongoDB", 78]] },
  { category: "Cloud & AI", items: [["Oracle Cloud Infra", 75], ["AI Fundamentals", 78], ["Python for Data Science", 82]] },
  { category: "Data Analytics", items: [["Data Analysis", 80], ["Data Visualization", 75], ["Business Analytics", 72]] },
  { category: "Tools", items: [["Git & GitHub", 88], ["VS Code", 90]] },
  { category: "Core Strengths", items: [["Problem Solving", 90], ["Communication", 85], ["Adaptability", 88]] },
];

const PROJECT_FILTERS = ["All", "Web", "UI/UX"];

const PROJECTS = [
  {
    title: "Portfolio Website",
    desc: "A responsive personal portfolio showcasing projects, certifications, skills, and contact info — optimized for desktop and mobile.",
    tags: ["HTML5", "CSS3", "JavaScript"],
    cat: ["Web", "UI/UX"],
    color: C.cyan,
    demo: null,
    github: "https://github.com/AbhijatPatel/PROJECTS/tree/main/portfolio-project",
  },
  {
    title: "Weather Dashboard",
    desc: "A weather forecasting app with live API integration, showing real-time conditions and forecasts in a clean, responsive UI.",
    tags: ["JavaScript", "REST API", "CSS3"],
    cat: ["Web"],
    color: C.violet,
  },
  {
    title: "Ecommerce Website",
    desc: "A full-stack ecommerce storefront with product listings, cart, and checkout flow, built end to end on the MERN stack.",
    tags: ["React.js", "Node.js", "Express.js", "MongoDB"],
    cat: ["Web"],
    color: C.cyan,
  },
  {
    title: "Airbnb Clone",
    desc: "A responsive Airbnb-inspired listing platform with property listings and modern UI components.",
    tags: ["React.js", "Node.js", "MongoDB"],
    cat: ["Web", "UI/UX"],
    color: C.violet,
  },
];

const EXPERIENCE = [
  {
    company: "Codec Technologies Pvt. Ltd.",
    role: "Artificial Intelligence Intern",
    duration: "June 2026 — July 2026",
    points: [
      "Completed a 1-month AICTE and ICAC approved Artificial Intelligence internship",
      "Gained practical exposure to AI, machine learning, and data analysis concepts",
      "Worked on AI-based learning modules and real-world applications",
    ],
  },
  {
    company: "Tata Group (via Forage)",
    role: "GenAI Powered Data Analytics Job Simulation",
    duration: "June 2026",
    points: [
      "Performed exploratory data analysis and risk profiling",
      "Predicted delinquency with AI-driven models",
      "Built a business report and data storytelling for a collections strategy",
    ],
  },
  {
    company: "Deloitte Australia (via Forage)",
    role: "Data Analytics Job Simulation",
    duration: "June 2026",
    points: [
      "Completed practical tasks in data analysis and forensic technology",
      "Applied analytical thinking to simulate real client engagements",
    ],
  },
];

const CERTIFICATIONS = [
  { title: "Python for Data Science, AI & Development", issuer: "IBM · Coursera", date: "Dec 2024" },
  { title: "Oracle Cloud Infrastructure Foundations", issuer: "Oracle · Coursera", date: "2024" },
  { title: "Artificial Intelligence Internship Certificate", issuer: "Codec Technologies Pvt. Ltd.", date: "July 2026" },
  { title: "Data Analytics Job Simulation", issuer: "Deloitte Australia · Forage", date: "June 2026" },
  { title: "GenAI Powered Data Analytics Job Simulation", issuer: "Tata Group · Forage", date: "June 2026" },
];

/* ---------------------------------------------------------------
   HOOKS
--------------------------------------------------------------- */
function useOnScreen(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useCountUp(target, active, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    let raf;
    const step = (t) => {
      if (start === null) start = t;
      const progress = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
}

/* ---------------------------------------------------------------
   CUSTOM CURSOR
--------------------------------------------------------------- */
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  useEffect(() => {
    let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;
    const onMove = (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (dotRef.current) { dotRef.current.style.left = mouseX + "px"; dotRef.current.style.top = mouseY + "px"; }
    };
    let raf;
    const animate = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) { ringRef.current.style.left = ringX + "px"; ringRef.current.style.top = ringY + "px"; }
      raf = requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(animate);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return (
    <>
      <div ref={dotRef} style={{
        position: "fixed", width: 6, height: 6, borderRadius: "50%",
        background: C.cyan, pointerEvents: "none", zIndex: 9999,
        transform: "translate(-50%,-50%)", boxShadow: `0 0 8px ${C.cyan}`,
        display: window.matchMedia && window.matchMedia("(pointer: coarse)").matches ? "none" : "block",
      }} />
      <div ref={ringRef} style={{
        position: "fixed", width: 32, height: 32, borderRadius: "50%",
        border: `1px solid ${C.violet}`, pointerEvents: "none", zIndex: 9998,
        transform: "translate(-50%,-50%)", opacity: 0.6,
        display: window.matchMedia && window.matchMedia("(pointer: coarse)").matches ? "none" : "block",
      }} />
    </>
  );
}

/* ---------------------------------------------------------------
   NEURAL NETWORK CANVAS BACKGROUND
--------------------------------------------------------------- */
function NeuralCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, nodes, raf;
    const NODE_COUNT = 60;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    const init = () => {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };
    resize();
    init();
    window.addEventListener("resize", () => { resize(); init(); });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.strokeStyle = `rgba(0,229,255,${0.14 * (1 - d / 130)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        ctx.fillStyle = "rgba(139,92,246,0.55)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

/* ---------------------------------------------------------------
   TYPEWRITER
--------------------------------------------------------------- */
function Typewriter({ text, speed = 70, style }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <span style={style}>{shown}<span style={{ opacity: 0.6 }}>|</span></span>;
}

function RoleRotator() {
  const [idx, setIdx] = useState(0);
  const [display, setDisplay] = useState(ROLES[0]);
  const [phase, setPhase] = useState("static");
  useEffect(() => {
    let timeout;
    if (phase === "static") {
      timeout = setTimeout(() => setPhase("deleting"), 1800);
    } else if (phase === "deleting") {
      if (display.length > 0) {
        timeout = setTimeout(() => setDisplay(display.slice(0, -1)), 28);
      } else {
        const next = (idx + 1) % ROLES.length;
        setIdx(next);
        setPhase("typing");
      }
    } else if (phase === "typing") {
      const target = ROLES[idx];
      if (display.length < target.length) {
        timeout = setTimeout(() => setDisplay(target.slice(0, display.length + 1)), 45);
      } else {
        setPhase("static");
      }
    }
    return () => clearTimeout(timeout);
  }, [phase, display, idx]);
  return (
    <span style={{ fontFamily: FONT_MONO, color: C.cyan }}>
      {display}<span style={{ color: C.violet }}>_</span>
    </span>
  );
}

/* ---------------------------------------------------------------
   COMMAND PALETTE
--------------------------------------------------------------- */
function CommandPalette({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);
  if (!open) return null;
  const filtered = NAV.filter((n) => n.label.toLowerCase().includes(query.toLowerCase()));
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(6,8,16,0.75)", backdropFilter: "blur(6px)",
        zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 90vw)", background: "rgba(19,24,45,0.95)", border: `1px solid ${C.line}`,
          borderRadius: 14, overflow: "hidden", boxShadow: `0 0 40px rgba(139,92,246,0.15)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.line}` }}>
          <Terminal size={16} color={C.cyan} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a section..."
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: C.frost, fontFamily: FONT_MONO, fontSize: 14,
            }}
          />
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.mist, border: `1px solid ${C.line}`, borderRadius: 4, padding: "2px 6px" }}>ESC</span>
        </div>
        <div style={{ padding: 8, maxHeight: 260, overflowY: "auto" }}>
          {filtered.length === 0 && (
            <div style={{ padding: 16, color: C.mist, fontFamily: FONT_BODY, fontSize: 13 }}>No matches.</div>
          )}
          {filtered.map((n) => (
            <button
              key={n.id}
              onClick={() => { onNavigate(n.id); onClose(); }}
              style={{
                width: "100%", textAlign: "left", background: "transparent", border: "none",
                color: C.frost, padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                fontFamily: FONT_BODY, fontSize: 14, display: "flex", justifyContent: "space-between",
                alignItems: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,229,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {n.label}
              <ArrowRight size={14} color={C.mist} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SHARED UI PIECES
--------------------------------------------------------------- */
function GlassCard({ children, style, hoverGlow }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "rgba(23,30,56,0.55)",
        border: `1px solid ${hover && hoverGlow ? hoverGlow : C.line}`,
        borderRadius: 16,
        backdropFilter: "blur(14px)",
        transition: "border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hover && hoverGlow ? `0 12px 32px -8px ${hoverGlow}55` : "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ index, title }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 40 }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.cyan }}>{index}</span>
      <div style={{ height: 1, width: 40, background: `linear-gradient(90deg, ${C.cyan}, transparent)` }} />
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 600, color: C.frost, margin: 0 }}>
        {title}
      </h2>
    </div>
  );
}

/* ---------------------------------------------------------------
   NAV
--------------------------------------------------------------- */
function Nav({ onNavigate, onOpenPalette, scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(10,14,26,0.75)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.line}` : "1px solid transparent",
      transition: "all 0.35s ease",
    }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19, color: C.frost, letterSpacing: 0.5 }}>
          A<span style={{ color: C.cyan }}>.</span>P
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="nav-desktop">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => onNavigate(n.id)}
              style={{ background: "none", border: "none", color: C.mist, fontFamily: FONT_BODY, fontSize: 14, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.frost)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.mist)}
            >
              {n.label}
            </button>
          ))}
          <button
            onClick={onOpenPalette}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "rgba(0,229,255,0.06)",
              border: `1px solid ${C.line}`, color: C.mist, borderRadius: 8, padding: "6px 10px",
              fontFamily: FONT_MONO, fontSize: 12, cursor: "pointer",
            }}
          >
            <Command size={13} /> K
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ---------------------------------------------------------------
   HERO
--------------------------------------------------------------- */
function Hero({ onNavigate }) {
  return (
    <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <NeuralCanvas />
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at 20% 20%, rgba(139,92,246,0.16), transparent 45%), radial-gradient(circle at 80% 70%, rgba(0,229,255,0.13), transparent 45%)`,
      }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", padding: "0 24px", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 40, alignItems: "center" }} className="hero-grid">
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FONT_MONO, fontSize: 12,
              color: C.cyan, border: `1px solid ${C.line}`, borderRadius: 20, padding: "6px 14px", marginBottom: 28,
              background: "rgba(0,229,255,0.05)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3EE68C", boxShadow: "0 0 6px #3EE68C" }} />
              STATUS: OPEN TO OPPORTUNITIES
            </div>

            <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "clamp(36px, 6.4vw, 68px)", color: C.frost, margin: "0 0 8px", lineHeight: 1.05 }}>
              <Typewriter text="Abhijat Patel" speed={90} />
            </h1>
            <div style={{ fontFamily: FONT_MONO, fontSize: "clamp(15px, 2.2vw, 21px)", marginBottom: 24, minHeight: 30 }}>
              <RoleRotator />
            </div>
            <p style={{ fontFamily: FONT_BODY, fontSize: 17, color: C.mist, maxWidth: 560, lineHeight: 1.7, marginBottom: 36 }}>
              I turn ideas into applications and data into insights — building full-stack products with the
              MERN stack, solving problems in C++, and exploring how AI can make software smarter and more human.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 44 }}>
              <button
                onClick={() => onNavigate("projects")}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10,
                  border: "none", cursor: "pointer", fontFamily: FONT_BODY, fontWeight: 600, fontSize: 14,
                  color: C.void, background: `linear-gradient(120deg, ${C.cyan}, ${C.violet})`,
                  boxShadow: `0 0 24px rgba(0,229,255,0.25)`,
                }}
              >
                View my work <ArrowRight size={16} />
              </button>
              <a
                href={RESUME_PDF}
                download="Abhijat_Patel_Resume.pdf"
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "13px 26px", borderRadius: 10,
                  border: `1px solid ${C.line}`, cursor: "pointer", fontFamily: FONT_BODY, fontWeight: 600,
                  fontSize: 14, color: C.frost, background: "rgba(255,255,255,0.02)", textDecoration: "none",
                }}
              >
                <Download size={16} /> Download resume
              </a>
            </div>

            <div style={{ display: "flex", gap: 18 }}>
              {[
                [Github, "https://github.com/AbhijatPatel"],
                [Linkedin, "https://www.linkedin.com/in/abhijatpatel01/"],
                [Instagram, "https://www.instagram.com/theabhijatpatel"],
                [Mail, "mailto:abhijatpatelfaizabad@gmail.com"],
              ].map(([Icon, href], i) => (
                <a key={i} href={href} style={{
                  width: 40, height: 40, borderRadius: "50%", border: `1px solid ${C.line}`,
                  display: "flex", alignItems: "center", justifyContent: "center", color: C.mist,
                  transition: "all 0.25s ease",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = C.cyan; e.currentTarget.style.borderColor = C.cyan; e.currentTarget.style.boxShadow = `0 0 14px rgba(0,229,255,0.35)`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = C.mist; e.currentTarget.style.borderColor = C.line; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              position: "relative", width: "min(320px, 70vw)", aspectRatio: "1 / 1", borderRadius: "50%",
              padding: 5, background: `conic-gradient(${C.cyan}, ${C.violet}, ${C.cyan})`,
              boxShadow: `0 0 50px rgba(0,229,255,0.2)`,
            }}>
              <img
                src={PROFILE_IMG}
                alt="Abhijat Patel"
                style={{
                  width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover",
                  display: "block", border: `4px solid ${C.void}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   ABOUT
--------------------------------------------------------------- */
function StatCard({ stat }) {
  const [ref, visible] = useOnScreen(0.4);
  const val = useCountUp(stat.value, visible);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 700, color: C.frost }}>
        {val}{stat.suffix}
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mist, marginTop: 6 }}>{stat.label}</div>
    </div>
  );
}

function About() {
  return (
    <section id="about" style={{ padding: "120px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <SectionLabel index="01" title="About me" />
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 60, alignItems: "start" }} className="about-grid">
        <div>
          <p style={{ fontFamily: FONT_BODY, fontSize: 17, lineHeight: 1.8, color: C.mist, marginBottom: 20 }}>
            I'm a B.Tech Information Technology student at JSS Academy of Technical Education, Noida, passionate
            about turning ideas into applications and data into insights. My journey started with curiosity about
            programming and evolved into exploring Full Stack Development, Artificial Intelligence, and Data
            Analytics — building with the MERN stack, solving problems in C++, and experimenting with AI-driven
            solutions.
          </p>
          <p style={{ fontFamily: FONT_BODY, fontSize: 17, lineHeight: 1.8, color: C.mist, marginBottom: 32 }}>
            I recently completed an AI internship and industry simulations with Deloitte Australia and Tata Group,
            gaining hands-on exposure to data visualization, business analytics, and AI-powered decision-making —
            experiences that reinforced how technology creates real impact when it solves real problems. What
            excites me most is the intersection of software, data, and AI, and I'm always up for connecting with
            people building meaningful things.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {STATS.map((s) => <StatCard key={s.label} stat={s} />)}
          </div>
        </div>
        <GlassCard style={{ padding: 28 }} hoverGlow={C.violet}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.violet, marginBottom: 18 }}>MY JOURNEY</div>
          {[
            ["2021", "Completed schooling at S.S.S.V Inter College, Ayodhya"],
            ["2023", "Started B.Tech in Information Technology, JSS Academy of Technical Education, Noida"],
            ["2026", "AI Internship at Codec Technologies Pvt. Ltd."],
            ["2026", "Data Analytics simulations with Deloitte Australia and Tata Group"],
          ].map(([year, text], i, arr) => (
            <div key={year + i} style={{ display: "flex", gap: 16, position: "relative", paddingBottom: i === arr.length - 1 ? 0 : 26 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 8px ${C.cyan}`, flexShrink: 0 }} />
                {i !== arr.length - 1 && <div style={{ width: 1, flex: 1, background: C.line, marginTop: 4 }} />}
              </div>
              <div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.cyan, marginBottom: 4 }}>{year}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.frost }}>{text}</div>
              </div>
            </div>
          ))}
        </GlassCard>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   SKILLS
--------------------------------------------------------------- */
function SkillBar({ name, level, visible, delay }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.frost }}>{name}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.mist }}>{level}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 4, width: visible ? `${level}%` : "0%",
          background: `linear-gradient(90deg, ${C.cyan}, ${C.violet})`,
          transition: `width 1s ease ${delay}ms`,
        }} />
      </div>
    </div>
  );
}

function SkillCard({ group }) {
  const [ref, visible] = useOnScreen(0.25);
  return (
    <div ref={ref}>
      <GlassCard style={{ padding: 24, height: "100%" }} hoverGlow={C.cyan}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600, color: C.frost, marginBottom: 18 }}>
          {group.category}
        </div>
        {group.items.map(([name, level], i) => (
          <SkillBar key={name} name={name} level={level} visible={visible} delay={i * 120} />
        ))}
      </GlassCard>
    </div>
  );
}

function Skills() {
  return (
    <section id="skills" style={{ padding: "120px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <SectionLabel index="02" title="Skills" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }} className="skills-grid">
        {SKILLS.map((g) => <SkillCard key={g.category} group={g} />)}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   PROJECTS
--------------------------------------------------------------- */
function ProjectCard({ project }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 8 });
  };
  const onLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: 800 }}
    >
      <GlassCard
        hoverGlow={project.color}
        style={{
          padding: 0, overflow: "hidden",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.15s ease",
        }}
      >
        <div style={{
          height: 150, background: `linear-gradient(135deg, ${project.color}33, transparent 70%)`,
          display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${C.line}`,
        }}>
          <Sparkles size={28} color={project.color} />
        </div>
        <div style={{ padding: 22 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, color: C.frost, margin: "0 0 8px" }}>
            {project.title}
          </h3>
          <p style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: C.mist, lineHeight: 1.6, margin: "0 0 16px" }}>
            {project.desc}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {project.tags.map((t) => (
              <span key={t} style={{
                fontFamily: FONT_MONO, fontSize: 11, color: C.cyan, border: `1px solid ${C.line}`,
                borderRadius: 6, padding: "3px 8px",
              }}>{t}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ display: "flex", alignItems: "center", gap: 6, color: C.frost, fontFamily: FONT_BODY, fontSize: 13, textDecoration: "none" }}>
              <ExternalLink size={14} /> Live demo
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ display: "flex", alignItems: "center", gap: 6, color: C.mist, fontFamily: FONT_BODY, fontSize: 13, textDecoration: "none" }}>
              <Github size={14} /> Code
            </a>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function Projects() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.cat.includes(filter));
  return (
    <section id="projects" style={{ padding: "120px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <SectionLabel index="03" title="Featured projects" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 36 }}>
        {PROJECT_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px", borderRadius: 20, fontFamily: FONT_BODY, fontSize: 13, cursor: "pointer",
              border: `1px solid ${filter === f ? C.cyan : C.line}`,
              background: filter === f ? "rgba(0,229,255,0.1)" : "transparent",
              color: filter === f ? C.cyan : C.mist,
              transition: "all 0.25s ease",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="projects-grid">
        {filtered.map((p) => <ProjectCard key={p.title} project={p} />)}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   EXPERIENCE
--------------------------------------------------------------- */
function ExperienceItem({ item, index }) {
  const [ref, visible] = useOnScreen(0.3);
  return (
    <div ref={ref} style={{
      display: "flex", gap: 24, marginBottom: 40,
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: "all 0.6s ease",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 14, height: 14, borderRadius: "50%", background: C.void,
          border: `2px solid ${C.cyan}`, boxShadow: `0 0 10px ${C.cyan}`,
        }} />
        <div style={{ width: 1, flex: 1, background: C.line, marginTop: 6 }} />
      </div>
      <GlassCard style={{ padding: 22, flex: 1, marginBottom: 8 }} hoverGlow={C.cyan}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600, color: C.frost }}>{item.role}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.cyan }}>{item.company}</div>
          </div>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.mist }}>{item.duration}</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {item.points.map((pt) => (
            <li key={pt} style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: C.mist, lineHeight: 1.7 }}>{pt}</li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}

function Experience() {
  return (
    <section id="experience" style={{ padding: "120px 24px", maxWidth: 900, margin: "0 auto" }}>
      <SectionLabel index="04" title="Experience" />
      {EXPERIENCE.map((item, i) => <ExperienceItem key={item.company} item={item} index={i} />)}
    </section>
  );
}

/* ---------------------------------------------------------------
   CERTIFICATIONS
--------------------------------------------------------------- */
function CertCard({ cert }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ transform: hover ? "scale(1.03)" : "scale(1)", transition: "transform 0.3s ease" }}
    >
      <GlassCard style={{ padding: 24, height: "100%" }} hoverGlow={C.cyan}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: "rgba(0,229,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
        }}>
          <Award size={20} color={C.cyan} />
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 600, color: C.frost, marginBottom: 8, lineHeight: 1.4 }}>
          {cert.title}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.cyan, marginBottom: 6 }}>{cert.issuer}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_MONO, fontSize: 11, color: C.mist }}>
          <BadgeCheck size={13} /> {cert.date}
        </div>
      </GlassCard>
    </div>
  );
}

function Certifications() {
  return (
    <section id="certifications" style={{ padding: "120px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <SectionLabel index="05" title="Certifications" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="certs-grid">
        {CERTIFICATIONS.map((c) => <CertCard key={c.title} cert={c} />)}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   CONTACT
--------------------------------------------------------------- */
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Something went wrong.");
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 3500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Couldn't send message. Is the backend running?");
    }
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.line}`,
    borderRadius: 8, padding: "11px 14px", color: C.frost, fontFamily: FONT_BODY, fontSize: 14,
    outline: "none", marginBottom: 14, boxSizing: "border-box",
  };
  return (
    <section id="contact" style={{ padding: "120px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <SectionLabel index="06" title="Contact" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }} className="contact-grid">
        <GlassCard style={{ padding: 28 }} hoverGlow={C.cyan}>
          <form onSubmit={submit}>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} required />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} required />
            <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={inputStyle} />
            <textarea placeholder="Message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} required />
            <button type="submit" disabled={status === "sending"} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 8,
              border: "none", cursor: status === "sending" ? "wait" : "pointer", fontFamily: FONT_BODY, fontWeight: 600, fontSize: 14,
              color: C.void, background: `linear-gradient(120deg, ${C.cyan}, ${C.violet})`,
              opacity: status === "sending" ? 0.7 : 1,
            }}>
              {status === "sending" ? "Sending..." : status === "sent" ? "Message sent" : "Send message"} <Send size={15} />
            </button>
            {status === "error" && (
              <div style={{ marginTop: 12, fontFamily: FONT_BODY, fontSize: 13, color: "#FF6B6B" }}>{errorMsg}</div>
            )}
          </form>
        </GlassCard>
        <div>
          {[
            [Mail, "Email", "abhijatpatelfaizabad@gmail.com", "mailto:abhijatpatelfaizabad@gmail.com"],
            [Phone, "Phone", "+91 9569629355", "tel:+919569629355"],
            [MapPin, "Location", "Noida, Uttar Pradesh, India", null],
            [Linkedin, "LinkedIn", "/abhijatpatel01", "https://www.linkedin.com/in/abhijatpatel01/"],
            [Github, "GitHub", "/AbhijatPatel", "https://github.com/AbhijatPatel"],
            [Instagram, "Instagram", "@theabhijatpatel", "https://www.instagram.com/theabhijatpatel"],
          ].map(([Icon, label, value, href], i, arr) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(0,229,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color={C.cyan} />
              </div>
              <div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.mist }}>{label}</div>
                {href ? (
                  <a href={href} style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.frost, textDecoration: "none" }}>{value}</a>
                ) : (
                  <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.frost }}>{value}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   FOOTER
--------------------------------------------------------------- */
function Footer({ onNavigate }) {
  return (
    <footer style={{ borderTop: `1px solid ${C.line}`, padding: "32px 24px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: C.frost }}>A<span style={{ color: C.cyan }}>.</span>P</span>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => onNavigate(n.id)} style={{ background: "none", border: "none", color: C.mist, fontFamily: FONT_BODY, fontSize: 13, cursor: "pointer" }}>
              {n.label}
            </button>
          ))}
        </div>
        <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.mist }}>© 2026 Abhijat Patel</span>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------
   ROOT APP
--------------------------------------------------------------- */
export default function Portfolio() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowTop(window.scrollY > 800);
      const h = document.documentElement;
      const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
      setScrollPct(isFinite(pct) ? pct : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navigate = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div style={{
      background: C.void, minHeight: "100vh", position: "relative",
      fontFamily: FONT_BODY, cursor: "none",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: rgba(0,229,255,0.3); }
        input::placeholder, textarea::placeholder { color: ${C.mist}; opacity: 0.6; }
        input:focus, textarea:focus { border-color: ${C.cyan} !important; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-grid > div:last-child { order: -1; margin-bottom: 24px; }
          .about-grid { grid-template-columns: 1fr !important; }
          .skills-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .projects-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .certs-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
          .nav-desktop { display: none !important; }
        }
        @media (max-width: 600px) {
          .skills-grid { grid-template-columns: 1fr !important; }
          .projects-grid { grid-template-columns: 1fr !important; }
          .certs-grid { grid-template-columns: 1fr !important; }
        }
        @media (pointer: coarse) {
          div[style*="cursor: none"] { cursor: auto !important; }
        }
      `}</style>

      <CustomCursor />

      <div style={{ position: "fixed", top: 0, left: 0, height: 2, width: `${scrollPct * 100}%`, background: `linear-gradient(90deg, ${C.cyan}, ${C.violet})`, zIndex: 150, transition: "width 0.1s linear" }} />

      <Nav onNavigate={navigate} onOpenPalette={() => setPaletteOpen(true)} scrolled={scrolled} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={navigate} />

      <Hero onNavigate={navigate} />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Certifications />
      <Contact />
      <Footer onNavigate={navigate} />

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed", bottom: 28, right: 28, width: 46, height: 46, borderRadius: "50%",
            background: `linear-gradient(120deg, ${C.cyan}, ${C.violet})`, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120,
            boxShadow: "0 8px 24px rgba(0,229,255,0.3)",
          }}
        >
          <ArrowUp size={18} color={C.void} />
        </button>
      )}
    </div>
  );
}
