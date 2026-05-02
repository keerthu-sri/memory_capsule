import {
  Camera,
  Hourglass,
  Lock,
  MoonStar,
  MoveRight,
  Sparkles,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const featureCards = [
  {
    icon: Lock,
    title: "Private by design",
    text: "Seal heartfelt notes, photos, and voice fragments in one encrypted capsule.",
  },
  {
    icon: Hourglass,
    title: "Time-locked memories",
    text: "Pick the exact date your future self can reopen each story.",
  },
  {
    icon: Sparkles,
    title: "A softer timeline",
    text: "Revisit moments through a visual calendar and a shared memory stream.",
  },
];

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0717] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.26),transparent_28%),radial-gradient(circle_at_bottom,rgba(79,70,229,0.14),transparent_30%),linear-gradient(180deg,#24103f_0%,#140a2a_52%,#090513_100%)]" />
      <div className="absolute inset-0 opacity-80">
        <div className="absolute left-1/2 top-[16%] h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-16 left-[14%] h-40 w-40 rounded-full bg-indigo-500/12 blur-3xl" />
        <div className="absolute right-[12%] top-[28%] h-52 w-52 rounded-full bg-purple-500/14 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1360px] flex-col px-4 pb-10 pt-6 md:px-8">
        <header className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-3 bg-transparent text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7919e6] to-[#a855f7] shadow-[0_10px_30px_rgba(121,25,230,0.35)]">
                <Hourglass className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#d7b8ff]">
                MEMORY CAPSULE
              </span>
            </button>

            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-violet-100/70">
              <a href="#how-it-works" className="hover:text-white">
                How it works
              </a>
              <a href="#vault" className="hover:text-white">
                The Vault
              </a>
              <a href="#pricing" className="hover:text-white">
                Pricing
              </a>
            </nav>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="flex h-11 w-20 items-center justify-end rounded-full border border-white/10 bg-white/5 px-2"
                aria-label="Theme preview"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#d7b8ff] to-[#8b5cf6] text-[#1f1138] shadow-lg">
                  <MoonStar className="h-4 w-4" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-full bg-gradient-to-r from-[#7919e6] to-[#a855f7] px-7 py-3 text-base font-semibold text-white shadow-[0_16px_40px_rgba(121,25,230,0.35)] transition-transform hover:-translate-y-0.5"
              >
                Enter Sanctuary
              </button>
              <button
                type="button"
                onClick={() => navigate("/team")}
                className="rounded-full border border-white/10 bg-white/5 px-7 py-3 text-base font-semibold text-violet-100 backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:text-white"
              >
                Manage Team
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-2 py-16 text-center md:px-10">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-400/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-200">
            <span className="h-2 w-2 rounded-full bg-violet-300" />
            Digital eternity awaits
          </div>

          <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl md:text-8xl">
            Seal your memories.
            <span className="block bg-gradient-to-r from-[#d7b8ff] via-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
              Open them later.
            </span>
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-violet-50/65 md:text-[2rem] md:leading-[1.35]">
            A digital sanctuary for the moments that matter most. Secure, private,
            and time-locked until you are ready to look back in full bloom.
          </p>

          <div id="vault" className="relative mt-16 flex items-center justify-center">
            <div className="absolute inset-x-0 top-10 h-72 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="absolute -left-10 top-24 rotate-[-14deg] rounded-[28px] border border-white/8 bg-white/5 p-5 text-violet-300/80 shadow-2xl backdrop-blur-xl">
              <Camera className="h-7 w-7" />
            </div>
            <div className="absolute -right-12 bottom-16 rotate-[12deg] rounded-[28px] border border-white/8 bg-white/5 p-5 text-violet-300/80 shadow-2xl backdrop-blur-xl">
              <Video className="h-7 w-7" />
            </div>

            <div className="relative h-[420px] w-[260px] overflow-hidden rounded-t-[130px] rounded-b-[110px] border border-white/10 bg-gradient-to-b from-violet-300/15 via-purple-500/10 to-indigo-400/25 shadow-[0_30px_80px_rgba(121,25,230,0.25)]">
              <div className="absolute inset-x-0 top-0 h-[68%] bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.18),transparent_24%),radial-gradient(circle_at_28%_42%,rgba(168,85,247,0.4),transparent_24%),radial-gradient(circle_at_70%_33%,rgba(99,102,241,0.32),transparent_22%),radial-gradient(circle_at_40%_66%,rgba(139,92,246,0.3),transparent_20%),linear-gradient(180deg,rgba(167,139,250,0.16),rgba(35,12,62,0.18))]" />
              <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-b from-[#4c2d73]/70 to-[#3b2a68]/90" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="rounded-[28px] bg-white/10 p-5 backdrop-blur-sm">
                  <Lock className="h-14 w-14 text-white/90" />
                </div>
                <div className="mt-6 flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#7919e6] via-[#8b5cf6] to-[#6366f1] px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_45px_rgba(121,25,230,0.28)]"
            >
              Start your capsule
              <MoveRight className="h-4 w-4" />
            </button>
            <a
              href="#how-it-works"
              className="rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-base font-medium text-violet-100/85 backdrop-blur-sm"
            >
              See how it works
            </a>
          </div>

          <section className="mt-10 w-full max-w-4xl rounded-[28px] border border-white/10 bg-white/[0.06] px-6 py-6 text-left backdrop-blur-xl md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200">
                Meet the team
              </p>
              <h2 className="mt-3 text-2xl font-bold text-white">Built by a focused student team</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-50/65">
                Our team shaped Memory Capsule as a full-stack project that blends secure personal archives,
                time-locked storytelling, and a calm visual experience for preserving meaningful moments.
              </p>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-0 md:shrink-0 md:flex-col">
              <button
                type="button"
                onClick={() => navigate("/team/add")}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#7919e6] to-[#a855f7] px-7 py-3.5 text-base font-semibold text-white shadow-[0_14px_35px_rgba(121,25,230,0.24)]"
              >
                Add Member
              </button>
              <button
                type="button"
                onClick={() => navigate("/team")}
                className="inline-flex items-center justify-center rounded-full border border-violet-200/15 bg-violet-400/10 px-7 py-3.5 text-base font-semibold text-violet-100/90 backdrop-blur-sm hover:text-white"
              >
                View Members
              </button>
            </div>
          </section>

          <section
            id="how-it-works"
            className="mt-20 grid w-full max-w-5xl gap-5 text-left md:grid-cols-3"
          >
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{card.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-violet-50/65">{card.text}</p>
                </div>
              );
            })}
          </section>

          <section
            id="pricing"
            className="mt-10 rounded-[32px] border border-white/10 bg-white/[0.05] px-6 py-5 text-sm text-violet-50/65 backdrop-blur-xl"
          >
            Start free, create your first capsule, and unlock the full sanctuary when you want deeper archives.
          </section>
        </main>
      </div>
    </div>
  );
};
