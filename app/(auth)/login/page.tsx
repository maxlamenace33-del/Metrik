"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  loginWithPasswordAction,
  loginWithMagicLinkAction,
} from "@/actions/auth.actions";

export default function LoginPage() {
  const router = useRouter();
  const [isMagicLink, setIsMagicLink] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Formulaire Email + Mot de passe
  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await loginWithPasswordAction(formData);

      if (!res.success) {
        toast.error("Erreur de connexion", {
          description: res.error,
        });
        return;
      }

      toast.success("Connexion réussie !", {
        description: "Ravi de vous revoir sur Metrik.",
      });
      router.push(res.data.redirectUrl);
      router.refresh();
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  // Formulaire Magic Link
  async function handleMagicLinkSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("magicEmail") as string;
      const res = await loginWithMagicLinkAction(email);

      if (!res.success) {
        toast.error("Échec de l'envoi", {
          description: res.error,
        });
        return;
      }

      toast.success("Lien magique envoyé !", {
        description: res.data.message,
        duration: 8000,
      });
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-xl shadow-black/5 dark:shadow-black/20">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Connexion à Metrik
        </CardTitle>
        <CardDescription>
          {isMagicLink
            ? "Connectez-vous instantanément sans mot de passe grâce à votre email."
            : "Accédez à votre suivi sportif, pesées et nutrition."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Toggle Mode de connexion */}
        <div className="mb-6 flex rounded-xl bg-secondary p-1">
          <button
            type="button"
            onClick={() => setIsMagicLink(false)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
              !isMagicLink
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mot de passe
          </button>
          <button
            type="button"
            onClick={() => setIsMagicLink(true)}
            className={`flex items-center justify-center gap-1.5 flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
              isMagicLink
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3 w-3 text-primary" />
            Magic Link
          </button>
        </div>

        {/* Mode Classique : Email + MDP */}
        {!isMagicLink ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-medium text-foreground flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Adresse email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="alex@exemple.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-foreground flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Mot de passe
                </label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full gap-2 h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        ) : (
          /* Mode Magic Link */
          <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="magicEmail"
                className="text-xs font-medium text-foreground flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Adresse email
              </label>
              <Input
                id="magicEmail"
                name="magicEmail"
                type="email"
                placeholder="alex@exemple.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full gap-2 h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi du lien magique...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Recevoir mon lien de connexion
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t border-border/50 pt-4 text-center text-xs text-muted-foreground">
        <div>
          Vous n&apos;avez pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Créer un compte
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
