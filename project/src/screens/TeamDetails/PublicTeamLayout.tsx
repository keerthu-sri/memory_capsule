import { ArrowLeft, Hourglass } from "lucide-react";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type PublicTeamLayoutProps = {
  children: ReactNode;
};

export const PublicTeamLayout = ({ children }: PublicTeamLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#090513] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(121,25,230,0.18),transparent_32%),linear-gradient(180deg,#140a2a_0%,#090513_72%)]" />
      <main className="relative mx-auto min-h-screen w-full max-w-[1360px] px-5 py-8 md:px-8">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 bg-transparent text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7919e6] to-[#a855f7] shadow-[0_10px_30px_rgba(121,25,230,0.35)]">
              <Hourglass className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#d7b8ff]">
              MEMORY CAPSULE
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-violet-100 backdrop-blur-sm hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </button>
        </div>

        {children}
      </main>
    </div>
  );
};
