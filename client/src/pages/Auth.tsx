import { useState } from "react";
import { ArrowRight, Check, Mail, Phone, ShieldCheck, Utensils } from "lucide-react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [contactType, setContactType] = useState<"phone" | "email">("phone");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const registerInterest = trpc.auth.registerInterest.useMutation();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "login") {
      startLogin();
      return;
    }
    try {
      await registerInterest.mutateAsync({ contactType, contact, name });
      toast.success("Your details are saved", { description: "Continue with secure sign in to finish creating your Mealora account." });
      startLogin();
    } catch (error) {
      toast.error("We could not save your details", { description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  return <div className="auth-screen"><div className="auth-art"><button className="auth-brand" onClick={() => { window.location.href = "/"; }}><span className="auth-brand-mark"><Utensils size={17} /></span>MEALORA <em>UGANDA</em></button><div className="auth-art-copy"><span className="section-kicker coral">LOCAL FOOD. SIMPLE DELIVERY.</span><h1>Your table<br /><em>starts here.</em></h1><p>Save your favourite places, keep your delivery addresses close and pay with Mobile Money when you’re ready.</p><div className="auth-benefits"><span><Check size={14} />Ugandan places, curated for you</span><span><Check size={14} />Fast, secure account access</span><span><Check size={14} />MTN MoMo & Airtel Money ready</span></div></div></div><main className="auth-card"><div className="auth-card-top"><span className="auth-eyebrow">MEALORA FOODS</span><div className="auth-toggle"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Log in</button><button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Create account</button></div></div><h2>{mode === "signup" ? "Create your account" : "Welcome back"}</h2><p className="auth-intro">{mode === "signup" ? "Start with your phone number or email. We’ll use secure sign in to protect your account." : "Use your secure Mealora sign-in to continue ordering."}</p>{mode === "signup" && <label className="auth-label">Your name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Amina Nakato" required /></label>}<div className="auth-methods"><button className={contactType === "phone" ? "active" : ""} onClick={() => setContactType("phone")}><Phone size={15} />Phone number</button><button className={contactType === "email" ? "active" : ""} onClick={() => setContactType("email")}><Mail size={15} />Email address</button></div>{mode === "signup" && <label className="auth-label">{contactType === "phone" ? "Ugandan phone number" : "Email address"}<input type={contactType === "email" ? "email" : "tel"} value={contact} onChange={(event) => setContact(event.target.value)} placeholder={contactType === "phone" ? "+256 7XX XXX XXX" : "you@example.com"} required /></label>}<button className="auth-submit" onClick={submit} disabled={registerInterest.isPending}>{registerInterest.isPending ? "Saving your details…" : mode === "signup" ? "Continue securely" : "Log in securely"}<ArrowRight size={16} /></button><div className="auth-note"><ShieldCheck size={15} /><span>Your account is protected by secure authentication. We never store passwords in MEALORA FOODS.</span></div><a className="auth-back" href="/">Back to Mealora <ArrowRight size={14} /></a></main></div>;
}
