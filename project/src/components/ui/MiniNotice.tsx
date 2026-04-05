type MiniNoticeProps = {
  open: boolean;
  message: string;
  variant?: "info" | "success" | "error";
};

const variantClasses = {
  info: "border-sky-400/40 text-sky-100 bg-sky-500/15",
  success: "border-emerald-400/40 text-emerald-100 bg-emerald-500/15",
  error: "border-rose-400/40 text-rose-100 bg-rose-500/15",
};

export const MiniNotice = ({ open, message, variant = "info" }: MiniNoticeProps) => {
  if (!open || !message) return null;

  return (
    <div className="fixed right-6 top-24 z-[90]">
      <div className={`min-w-[260px] rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${variantClasses[variant]}`}>
        {message}
      </div>
    </div>
  );
};
