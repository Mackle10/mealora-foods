import { useState } from "react";
import { Check, UserRound } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ProfileEditor() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const utils = trpc.useUtils();
  const update = trpc.auth.updateProfile.useMutation({ onSuccess: async () => { await utils.auth.me.invalidate(); toast.success("Profile updated"); } });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    update.mutate({ name, email: email || undefined });
  };

  return <form className="profile-editor" onSubmit={submit}><div className="profile-card-head"><div><span className="dashboard-kicker">ACCOUNT DETAILS</span><h2>Make it yours</h2></div><div className="profile-editor-icon"><UserRound size={17} /></div></div><div className="profile-editor-grid"><label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label></div><div className="profile-editor-foot"><span><Check size={13} />Securely managed by Mealora sign in</span><button disabled={update.isPending}>{update.isPending ? "Saving…" : "Save profile"}</button></div></form>;
}
