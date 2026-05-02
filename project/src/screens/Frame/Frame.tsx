import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, Lock as LockIcon, Mail as MailIcon, ShieldCheck as ShieldCheckIcon, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { login, register } from "../../services/auth";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const isValidEmailDomain = (domain: string) => {
  if (!domain || domain.length > 253 || domain.includes("..")) return false;
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1];
  if (!/^[A-Za-z]{2,}$/.test(tld)) return false;

  return labels.every((label) =>
    Boolean(label) &&
    label.length <= 63 &&
    /^[A-Za-z0-9-]+$/.test(label) &&
    !label.startsWith("-") &&
    !label.endsWith("-")
  );
};

export const Frame = (): JSX.Element => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [rememberMe, setRememberMe] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const setToken = (token: string) => {
    localStorage.setItem("token", token);
    if (rememberMe) localStorage.setItem("remember", "true");
    else localStorage.removeItem("remember");
  };

  const validateEmail = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Email is required.");
      return null;
    }
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return null;
    }
    const [, domain = ""] = normalizedEmail.split("@");
    if (!isValidEmailDomain(domain)) {
      setError("Please enter an email with a valid domain.");
      return null;
    }
    return normalizedEmail;
  };

  const handleLogin = async () => {
    const normalizedEmail = validateEmail();
    if (!normalizedEmail) return;

    try {
      setError(null);
      const res = await login({ email: normalizedEmail, password });
      setToken(res.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid login");
    }
  };

  const handleRegister = async () => {
    const normalizedEmail = validateEmail();
    if (!normalizedEmail) return;

    try {
      setError(null);
      await register({ name, email: normalizedEmail, password });
      const loginRes = await login({ email: normalizedEmail, password });
      setToken(loginRes.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a1a]">
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        {/* Background gradients */}
        <div className="absolute w-full h-full top-0 left-0 [background:radial-gradient(50%_50%_at_100%_0%,rgba(26,11,46,1)_0%,rgba(10,10,26,1)_100%)]">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#7919e6] rounded-[128px] blur-sm opacity-15" />
          <div className="absolute top-[50.00%] -right-32 w-96 h-96 bg-[#7919e6] rounded-[192px] blur-sm opacity-15" />
          <div className="left-80 bottom-10 w-48 h-48 rounded-[96px] opacity-15 absolute bg-[#7919e6] blur-sm" />
          <div className="absolute w-full h-full top-0 left-0 [background:radial-gradient(50%_50%_at_50%_50%,rgba(121,25,230,0.1)_0%,rgba(121,25,230,0)_50%)]" />
        </div>

        {/* Floating particles */}
        <div className="absolute w-full h-full top-0 left-0">
          <div className="top-[233px] left-[427px] w-2 h-2 rounded opacity-30 absolute bg-[#7919e6] blur-sm" />
          <div className="top-[698px] left-80 w-3 h-3 rounded-md opacity-20 absolute bg-[#7919e6] blur-sm" />
          <div className="top-[50.00%] right-80 w-1 h-1 rounded-sm opacity-40 absolute bg-[#7919e6] blur-sm" />
          <div className="top-[310px] right-[427px] w-4 h-4 rounded-lg opacity-10 absolute bg-[#7919e6] blur-sm" />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex w-full max-w-[460px] flex-col items-center gap-7">
          {/* Header */}
          <div className="flex w-full flex-col items-center text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#33415580] bg-[#ffffff08] px-4 py-2 text-sm text-slate-300 transition-colors hover:border-[#7919e6] hover:text-white"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to home
            </button>
            <div className="pb-3">
              <h1 className="[font-family:'Dancing_Script',Helvetica] text-5xl font-normal leading-none text-[#8d37ff] sm:text-[3.8rem]">
                {mode === "login" ? "Secure Entry" : "Create Vault"}
              </h1>
            </div>
            <div>
              <p className="[font-family:'Plus_Jakarta_Sans',Helvetica] text-sm font-light tracking-[0.35px] text-slate-400 sm:text-base">
                {mode === "login" ? "Enter your digital sanctuary" : "Join the memory capsule community"}
              </p>
            </div>
            <div className="mt-5 inline-flex rounded-full border border-[#33415580] bg-[#ffffff08] p-1">
              <button type="button" className={mode === "login" ? "rounded-full bg-[#7919e6] px-4 py-2 text-sm text-white" : "rounded-full px-4 py-2 text-sm text-slate-300"} onClick={() => setMode("login")}>Login</button>
              <button type="button" className={mode === "register" ? "rounded-full bg-[#7919e6] px-4 py-2 text-sm text-white" : "rounded-full px-4 py-2 text-sm text-slate-300"} onClick={() => setMode("register")}>Register</button>
            </div>
          </div>

          {/* Card */}
          <div className="relative flex w-full flex-col overflow-hidden rounded-[30px] border border-solid border-[#7919e633] bg-[#ffffff08] px-6 pb-10 pt-8 shadow-[0px_25px_50px_-12px_#00000040] backdrop-blur-md backdrop-brightness-[100%] sm:px-8 [-webkit-backdrop-filter:blur(12px)_brightness(100%)]">
            {/* Card glow */}
            <div className="absolute top-[-39px] right-[-39px] w-32 h-32 bg-[#7919e61a] rounded-full blur-[32px]" />

            <div className="relative flex w-full flex-col gap-6">
              {mode === "register" && (
                <div className="flex flex-col items-end gap-2 relative self-stretch w-full">
                  <div className="flex flex-col w-full items-start relative">
                    <span className="flex items-center h-4 [font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-[#7919e6cc] text-xs tracking-[1.20px] leading-4 whitespace-nowrap relative mt-[-1.00px]">
                      VAULT NAME
                    </span>
                  </div>
                  <div className="flex flex-col items-start relative self-stretch w-full">
                    <div className="relative self-stretch w-full bg-[#0f172a80] rounded-2xl border border-solid border-[#33415580] overflow-hidden">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500" />
                      <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 pt-[13px] pb-3.5 bg-transparent border-none outline-none text-white text-base placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email field - FIXED: Now editable */}
              <div className="flex flex-col items-end gap-2 relative self-stretch w-full">
                <div className="flex flex-col w-full items-start relative">
                  <span className="flex items-center h-4 [font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-[#7919e6cc] text-xs tracking-[1.20px] leading-4 whitespace-nowrap relative mt-[-1.00px]">
                    VAULT IDENTITY
                  </span>
                </div>
                <div className="flex flex-col items-start relative self-stretch w-full">
                  <div className="relative self-stretch w-full bg-[#0f172a80] rounded-2xl border border-solid border-[#33415580] overflow-hidden">
                    <MailIcon
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500"
                      strokeWidth={1.5}
                    />
                    <input
                      type="email"
                      placeholder="email@vault.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 pt-[13px] pb-3.5 bg-transparent border-none outline-none text-white text-base placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password field - FIXED: Now editable */}
              <div className="flex flex-col items-end gap-2 relative self-stretch w-full">
                <div className="flex w-full items-center justify-between relative">
                  <span className="flex items-center h-4 [font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-[#7919e6cc] text-xs tracking-[1.20px] leading-4 whitespace-nowrap relative mt-[-1.00px]">
                    ACCESS KEY
                  </span>
                  <button className="flex items-center h-[15px] [font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-[#7919e699] text-[10px] tracking-[-0.50px] leading-[15px] whitespace-nowrap relative mt-[-1.00px] bg-transparent border-none cursor-pointer">
                    LOST KEY?
                  </button>
                </div>
                <div className="flex flex-col items-start relative self-stretch w-full">
                  <div className="relative self-stretch w-full bg-[#0f172a80] rounded-2xl border border-solid border-[#33415580] overflow-hidden">
                    <LockIcon
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500"
                      strokeWidth={1.5}
                    />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 pt-[13px] pb-3.5 bg-transparent border-none outline-none text-white text-base placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center px-1 py-0 relative self-stretch w-full">
                <div className="items-center inline-flex relative gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                    className="w-4 h-4 bg-[#0f172a80] rounded-lg border border-solid border-slate-700 data-[state=checked]:bg-[#7919e6] data-[state=checked]:border-[#7919e6]"
                  />
                  <Label
                    htmlFor="remember"
                    className="[font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-slate-400 text-xs tracking-[0] leading-4 whitespace-nowrap cursor-pointer"
                  >
                    Remember sanctuary access
                  </Label>
                </div>
              </div>

              {/* Unlock button */}
              <Button onClick={mode === "login" ? handleLogin : handleRegister} className="flex items-center justify-center px-0 py-4 relative self-stretch w-full bg-[#7919e6] rounded-2xl overflow-hidden shadow-[0px_4px_6px_-4px_#7919e633,0px_10px_15px_-3px_#7919e633] hover:bg-[#6a15cc] border-none h-auto">
                <span className="[font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-white text-base text-center tracking-[0] leading-6 whitespace-nowrap">
                  {mode === "login" ? "Unlock Vault" : "Create Account"}
                </span>
                <ArrowRightIcon
                  className="ml-2 w-4 h-4 text-white"
                  strokeWidth={2}
                />
              </Button>

              {error && (
                <div className="w-full rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

            </div>
          </div>

          {/* Sign up link */}
          <div className="flex w-full flex-col items-center">
            <p className="flex items-center justify-center h-5 [font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-sm text-center tracking-[0] leading-5 relative mt-[-1.00px]">
              {mode === "login" ? (
                <>
                  <span className="text-slate-500">New to the Sanctuary? </span>
                  <button onClick={() => setMode("register")} className="text-[#7919e6] bg-transparent border-none cursor-pointer p-0 [font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-sm">
                    Register here
                  </button>
                </>
              ) : (
                <>
                  <span className="text-slate-500">Already have an account? </span>
                  <button onClick={() => setMode("login")} className="text-[#7919e6] bg-transparent border-none cursor-pointer p-0 [font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-sm">
                    Login
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Footer */}
          <div className="flex w-full flex-col items-center px-0 pb-0 pt-4 opacity-40">
            <div className="inline-flex items-center gap-1">
              <ShieldCheckIcon
                className="w-2.5 h-2.5 text-slate-100"
                strokeWidth={1.5}
              />
              <span className="flex items-center h-[15px] [font-family:'Plus_Jakarta_Sans',Helvetica] font-normal text-slate-100 text-[10px] tracking-[2.00px] leading-[15px] whitespace-nowrap relative mt-[-1.00px]">
                END-TO-END ENCRYPTED
              </span>
            </div>
            <div className="inline-flex max-w-[220px] flex-col items-center px-0 pb-0 pt-2">
              <p className="[font-family:'Plus_Jakarta_Sans',Helvetica] text-center text-[10px] font-normal leading-[15px] text-slate-100">
                Preserving memories across time through
                <br />
                distributed vault technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
