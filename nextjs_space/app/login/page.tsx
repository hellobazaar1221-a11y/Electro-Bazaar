"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callback = params?.get("callbackUrl") ?? "/home";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        if (res.error.includes("SUSPENDED:")) {
          const reason = res.error.split("SUSPENDED:")[1]?.trim();
          toast.error(`Account suspended: ${reason}`, { duration: 6000 });
        } else {
          toast.error("Invalid email or password");
        }
      } else {
        toast.success("Welcome back!");
        const sessRes = await fetch("/api/auth/session").then(r => r.json()).catch(() => null);
        const role = sessRes?.user?.role;
        if (role === "ADMIN") router.replace("/admin");
        else router.replace(callback);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthShell title="Welcome Back" subtitle="Sign in to continue shopping">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/80 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-11 rounded-lg bg-white/10 border border-white/20 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-sky-400 focus:bg-white/15 transition" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/80 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="w-full h-11 rounded-lg bg-white/10 border border-white/20 pl-10 pr-10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-sky-400 focus:bg-white/15 transition" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-white/80 cursor-pointer">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-sky-400" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-sky-300 hover:text-sky-200">Forgot password?</Link>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold shadow-lg">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </Button>
          <div className="text-center text-sm text-white/70">
            Don't have an account? <Link href="/register" className="text-sky-300 hover:text-sky-200 font-medium">Create one</Link>
          </div>
        </form>
      </AuthShell>
    </>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
