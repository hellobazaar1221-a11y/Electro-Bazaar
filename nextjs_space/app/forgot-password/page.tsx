"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Shield, Lock, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/site/auth-shell";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const requestQuestion = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ step: "question", email }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? "Failed"); return; }
      setQuestion(data.securityQuestion);
      setStep(2);
    } finally { setLoading(false); }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ step: "reset", email, answer, newPassword }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? "Failed"); return; }
      setStep(3);
      toast.success("Password reset successfully");
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Reset Password" subtitle={step === 1 ? "Enter your email to begin" : step === 2 ? "Answer your security question" : "All done!"}>
      {step === 1 && (
        <form onSubmit={requestQuestion} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full h-11 rounded-lg bg-white/10 border border-white/20 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-sky-400 focus:bg-white/15" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4 ml-1" /></>}
          </Button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={resetPassword} className="space-y-4">
          <div className="glass rounded-lg p-3 text-sm text-white/90">
            <p className="text-xs text-white/60 mb-1">Security Question</p>
            <p>{question}</p>
          </div>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input required value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Your Answer" className="w-full h-11 rounded-lg bg-white/10 border border-white/20 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-sky-400" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" className="w-full h-11 rounded-lg bg-white/10 border border-white/20 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-sky-400" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" className="w-full h-11 rounded-lg bg-white/10 border border-white/20 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-sky-400" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
          </Button>
        </form>
      )}
      {step === 3 && (
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-300" />
          </div>
          <p className="text-white/90">Your password has been reset successfully.</p>
          <Button onClick={() => router.push("/login")} className="w-full h-11 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold">Back to Login</Button>
        </div>
      )}
      <div className="text-center text-sm text-white/70 pt-3">
        Remember it? <Link href="/login" className="text-sky-300 hover:text-sky-200 font-medium">Sign in</Link>
      </div>
    </AuthShell>
  );
}
