import { Link } from "react-router-dom";
import { useState } from "react";

/* ─── Tiny SVG icons ─────────────────────────────────────────────────────── */
const HexIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5">
    <path d="M24 4L44 15.5V32.5L24 44L4 32.5V15.5L24 4Z" />
    <path d="M24 14L36 20.5V27.5L24 34L12 27.5V20.5L24 14Z" />
  </svg>
);
const SquareIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="6" width="36" height="36" rx="2" />
    <rect x="14" y="14" width="20" height="20" rx="1" />
  </svg>
);
const TriquetraIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5">
    <path d="M24 8C18 8 13 13 13 19C13 25 18 28 24 28C30 28 35 25 35 19C35 13 30 8 24 8Z" />
    <path d="M12 28C8 22 9 15 14 11C11 17 13 24 19 27C15 32 16 39 21 42C16 39 12 34 12 28Z" />
    <path d="M36 28C40 22 39 15 34 11C37 17 35 24 29 27C33 32 32 39 27 42C32 39 36 34 36 28Z" />
  </svg>
);
const ChevronDown = () => (
  <svg className="w-3.5 h-3.5 ml-0.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
    <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PlayIcon = () => (
  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1" fill="none" />
    <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" />
  </svg>
);
/* ─── Logo bar brands ─────────────────────────────────────────────────────── */
const logos = [
  { name: "✦ tropic", style: "font-semibold tracking-tight" },
  { name: "N| Netcore", style: "font-semibold tracking-tight" },
  { name: "△ ANNEX CLOUD", style: "font-medium tracking-widest text-xs uppercase" },
  { name: "# cansaas", style: "font-bold tracking-tight" },
  { name: "⌇ ramp ↗", style: "font-semibold" },
  { name: "◫ SQUARESPACE", style: "font-medium tracking-widest text-xs uppercase" },
  { name: "ORACLE", style: "font-semibold tracking-widest text-xs uppercase" },
];

/* ─── Check list item ─────────────────────────────────────────────────────── */
const Check = ({ children }) => (
  <li className="flex items-start gap-2 text-sm text-gray-600">
    <svg className="w-4 h-4 mt-0.5 text-violet-600 shrink-0" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6.5 11.5L3 8l1.4-1.4 2.1 2.1 4.6-4.6L12.5 5.5l-6 6z" />
    </svg>
    {children}
  </li>
);

/* ─── Plan card ───────────────────────────────────────────────────────────── */
const PlanCard = ({ name, price, features, primary, badge }) => (
  <div
    className={`rounded-2xl p-6 w-56 relative ${
      primary
        ? "bg-gray-900 text-white shadow-2xl scale-105"
        : "bg-white text-gray-800 border border-gray-200 shadow-sm"
    }`}
  >
    {badge && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
        {badge}
      </span>
    )}
    <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${primary ? "text-gray-400" : "text-gray-400"}`}>
      {name}
    </p>
    <p className={`text-2xl font-bold mb-4 ${primary ? "text-white" : "text-gray-900"}`}>
      {price}
      <span className={`text-xs font-normal ml-1 ${primary ? "text-gray-400" : "text-gray-400"}`}>/month</span>
    </p>
    <ul className="space-y-2 mb-6">
      {features.map((f) => (
        <li key={f} className={`flex items-center gap-2 text-xs ${primary ? "text-gray-300" : "text-gray-600"}`}>
          <svg className={`w-3.5 h-3.5 shrink-0 ${primary ? "text-violet-400" : "text-violet-600"}`} viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.5 11.5L3 8l1.4-1.4 2.1 2.1 4.6-4.6L12.5 5.5l-6 6z" />
          </svg>
          {f}
        </li>
      ))}
    </ul>
    <button
      className={`w-full py-2 rounded-lg text-xs font-semibold transition ${
        primary
          ? "bg-white text-gray-900 hover:bg-gray-100"
          : "bg-gray-900 text-white hover:bg-gray-700"
      }`}
    >
      {primary ? "Get Started →" : "Try for free"}
    </button>
  </div>
);

/* ─── Integration chip ─────────────────────────────────────────────────────── */
const Chip = ({ label, icon }) => (
  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm text-sm font-medium text-gray-700">
    <span className="text-lg">{icon}</span>
    {label}
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-white text-gray-900 min-h-screen font-sans antialiased">

      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 font-bold text-lg text-gray-900">
            <span className="w-7 h-7 rounded-md bg-black flex items-center justify-center text-white text-sm">◈</span>
            SpendWise
          </Link>

   

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login" className="text-sm text-gray-600 px-4 py-1.5 rounded-md hover:bg-gray-100 transition">
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="block w-5 h-0.5 bg-gray-800 mb-1" />
            <span className="block w-5 h-0.5 bg-gray-800 mb-1" />
            <span className="block w-5 h-0.5 bg-gray-800" />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-2 text-sm text-gray-700">
            <a href="#features" className="block py-2">Features</a>
            <a href="#pricing" className="block py-2">Pricing</a>
            <Link to="/login" className="block py-2">Sign in</Link>
            <Link to="/register" className="block py-2 font-semibold text-violet-600">Sign up</Link>
          </div>
        )}
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Badge */}
   

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 max-w-3xl mx-auto">
          Overcoming 🗂️ Key Challenges{" "}
          <span className="inline-flex items-center gap-2">
            in 📊 Expense{" "}
            <span className="text-violet-600">Tracking</span> 🗃️
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
          Addressing financial obstacles and optimizing workflows to maximize
          efficiency, performance, and long-term success.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-700 transition shadow-sm"
          >
            Book a demo
          </Link>
          <Link
            to="/login"
            className="flex items-center text-gray-600 px-5 py-3 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition"
          >
            <PlayIcon />
            Learn more
          </Link>
        </div>
      </section>



      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Top-tier Tools for Enhanced Productivity
        </h2>
        <p className="text-center text-gray-400 mt-1 mb-12">and Efficiency.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border border-gray-200 p-7 hover:shadow-md transition group">
            <div className="text-gray-400 mb-5 group-hover:text-violet-500 transition">
              <HexIcon />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Seamless Integration{" "}
              <span className="text-gray-400 font-normal">–</span>
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Easily connect with existing tools and systems for a unified expense workflow.
            </p>
          </div>

          {/* Card 2 – highlighted */}
          <div className="rounded-2xl bg-sky-100 border border-sky-200 p-7 relative shadow-sm">
            <div className="text-sky-700 mb-5">
              <SquareIcon />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Customizable Workflows{" "}
              <span className="text-gray-400 font-normal">–</span>
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tailor approval processes to fit your team's specific needs for maximum efficiency.
            </p>
            <button className="mt-5 flex items-center gap-1 text-xs font-semibold text-gray-800 border border-gray-900 rounded-full px-4 py-1.5 hover:bg-gray-900 hover:text-white transition">
              Learn more →
            </button>
            {/* Cursor decoration */}
            <div className="absolute bottom-5 right-6 text-2xl select-none opacity-50">▲</div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-gray-200 p-7 hover:shadow-md transition group">
            <div className="text-gray-400 mb-5 group-hover:text-violet-500 transition">
              <TriquetraIcon />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Real-time Collaboration{" "}
              <span className="text-gray-400 font-normal">–</span>
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Collaborate instantly with team members, sharing updates and feedback in real time.
            </p>
          </div>
        </div>
      </section>

      {/* ── DARK FEATURES SHOWCASE ────────────────────────────────────────── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 block">
              Smart Access Control
            </span>
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Delegate expenses to the{" "}
              <span className="text-violet-400">right individuals</span>.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Grant assistants the ability to submit expenses on behalf of executives.
              Full audit trail — every submission records both the owner and the submitter.
            </p>
            <ul className="space-y-2">
              {["Role-based access control (RBAC)", "Executive / assistant delegation", "Audit-complete ownership trail", "Time-boxed delegate permissions"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mock card */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-gray-500">Delegation Manager</span>
            </div>
            <div className="space-y-3">
              {[
                { name: "Sarah Chen", role: "CFO → Assistant", active: true },
                { name: "James Park", role: "VP Sales → Assistant", active: false },
                { name: "Priya Nair", role: "CEO → EA", active: false },
              ].map((d) => (
                <div key={d.name} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${d.active ? "border-violet-700 bg-violet-950" : "border-gray-800 bg-gray-800/50"}`}>
                  <div>
                    <p className="text-sm font-medium text-white">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.role}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${d.active ? "bg-violet-600 text-white" : "bg-gray-700 text-gray-300"}`}>
                    {d.active ? "Active" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 bg-green-950 border border-green-800 rounded-xl px-4 py-2.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">3 delegates online</span>
            </div>
          </div>
        </div>
      </section>



 
      {/* ── BUDGET CONCURRENCY SHOWCASE ───────────────────────────────────── */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Mock budget card */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-2xl">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Live Budget Monitor</p>
            {[
              { name: "Q1 Marketing", dept: "Marketing", pct: 72, spent: 3600, total: 5000 },
              { name: "Ops Travel", dept: "Operations", pct: 30, spent: 1500, total: 5000 },
              { name: "Engineering Tools", dept: "Engineering", pct: 94, spent: 9400, total: 10000 },
            ].map((b) => (
              <div key={b.name} className="mb-5 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-white">{b.name}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.pct >= 90 ? "bg-red-900 text-red-300" : b.pct >= 65 ? "bg-yellow-900 text-yellow-300" : "bg-green-900 text-green-300"}`}>
                    {b.pct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${b.pct >= 90 ? "bg-red-500" : b.pct >= 65 ? "bg-yellow-400" : "bg-green-500"}`}
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">₹{b.spent.toLocaleString()} / ₹{b.total.toLocaleString()}</p>
              </div>
            ))}
            <div className="mt-4 flex items-center gap-2 bg-blue-950 border border-blue-800 rounded-xl px-4 py-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs text-blue-400">Live sync · Concurrency protected</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 block">
              Advanced Workflow Management
            </span>
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Shared Department Budgets with{" "}
              <span className="text-violet-400">Race Condition Protection</span>.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Multiple team members submit against the same budget pool — our
              optimistic concurrency control prevents over-spending even under
              simultaneous submissions.
            </p>
            <ul className="space-y-2">
              {["Real-time remaining balance via WebSockets", "Optimistic locking (version-key based)", "Automatic retry on concurrent writes", "Live progress bars per department"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── REAL-TIME COMMENTS SHOWCASE ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 block">
            Contextual Collaboration
          </span>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
            Real-Time Comments on{" "}
            <span className="text-violet-600">Every Expense</span>.
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            No more back-and-forth emails. Managers ask "Why was this dinner $800?" and
            employees reply with receipts — all attached directly to the line item.
          </p>
          <ul className="space-y-2">
            {["Live chat thread per expense", "Typing indicators (WebSocket powered)", "Presence: see who's currently reviewing", "Messages persisted to database"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Mock comment thread */}
        <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">Client Dinner · ₹4,200</p>
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Sarah is viewing
            </span>
          </div>
          {/* Messages */}
          <div className="px-5 py-4 space-y-3">
            {[
              { from: "manager", name: "Sarah (Manager)", text: "Why was this client dinner so expensive?", time: "2:14 PM" },
              { from: "user", name: "You", text: "We had 6 guests including two enterprise clients. Receipt attached.", time: "2:17 PM" },
              { from: "manager", name: "Sarah (Manager)", text: "Got it, approved! 👍", time: "2:18 PM" },
            ].map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${m.from === "user" ? "bg-violet-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}>
                  {m.from !== "user" && <p className="text-xs font-semibold mb-1 text-violet-600">{m.name}</p>}
                  <p>{m.text}</p>
                  <p className={`text-xs mt-1 ${m.from === "user" ? "text-violet-300 text-right" : "text-gray-400"}`}>{m.time}</p>
                </div>
              </div>
            ))}
            {/* Typing indicator */}
            <div className="flex justify-start">
              <div className="bg-gray-100 px-3.5 py-2.5 rounded-2xl rounded-bl-none text-xs text-gray-400 italic">
                Sarah is typing<span className="animate-pulse">…</span>
              </div>
            </div>
          </div>
          {/* Input */}
          <div className="border-t border-gray-200 px-4 py-3 flex gap-2">
            <input
              readOnly
              value="Add a comment…"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-400 cursor-default focus:outline-none"
            />
            <button className="bg-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-violet-500 transition">
              Send
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="bg-gray-950 text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6 text-2xl">✦</div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Looking for more efficient,{" "}
            <br />
            streamlined productivity solutions?
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Discover tools to solve your challenges, automate routine workflows,
            foster team efficiency, and drive business success.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="bg-white text-gray-900 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 transition"
            >
              Book a demo
            </Link>
            <Link
              to="/login"
              className="border border-gray-700 text-white text-sm px-6 py-3 rounded-xl hover:bg-gray-800 transition"
            >
              Learn more
            </Link>
          </div>
        </div>
        {/* Big watermark */}
        <p className="mt-12 text-8xl font-black text-gray-900 select-none pointer-events-none tracking-tight">
          SpendWise
        </p>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-1.5 font-bold text-gray-900 mb-3">
              <span className="w-7 h-7 rounded-md bg-black flex items-center justify-center text-white text-sm">◈</span>
              SpendWise
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              The productivity solution that bridges intelligent management and personalized insight.
            </p>
            <div className="flex gap-3 mt-4">
              {["𝕏", "in", "⊖", "◉"].map((s) => (
                <button key={s} className="w-8 h-8 rounded-full border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 flex items-center justify-center transition">
                  {s}
                </button>
              ))}
            </div>
          </div>

          {[
            { title: "Features", items: ["Task Management", "Team Collaboration", "Reporting", "AI Predictions"] },
            { title: "Solutions", items: ["Project Management", "Budget Dashboard", "Delegation", "Recurring Jobs"] },
            { title: "Resources", items: ["Documentation", "API Reference", "Change Log", "Status Page"] },
            { title: "Company", items: ["About", "Careers", "Open Source", "Contact Us"] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2026 SpendWise, All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-700 transition">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-700 transition">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
