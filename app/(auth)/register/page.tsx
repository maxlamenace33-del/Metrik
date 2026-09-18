"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
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
import { signUpAction } from "@/actions/auth.actions";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (password !== confirmPassword) {
        toast.error("Les mots de passe ne correspondent pas.");
        setLoading(false);
        return;
      }

      const res = await signUpAction(formData);

      if (!res.success) {
        toast.error("Échec de l'inscription", {
          description: res.error,
        });
        return;
      }

      if (res.data.emailNeedsConfirmation) {
        setEmailSent(true);
      } else {
        toast.success("Compte créé avec succès !");
        router.push("/profile");
        router.refresh();
      }
    } catch {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <Card className="border-border/60 shadow-xl shadow-black/5 text-center p-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <CardTitle className="text-xl font-bold">Vérifiez vos emails</CardTitle>
        <CardDescription className="mt-2 text-sm leading-relaxed">
          Un email de confirmation vient d&apos;être envoyé. Cliquez sur le lien pour
          activer votre compte Metrik et configurer votre profil.
        </CardDescription>
        <div className="mt-6">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Retour à la page de connexion
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-xl shadow-black/5 dark:shadow-black/20">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Créer un compte Metrik
        </CardTitle>
        <CardDescription>
          Prenez en main votre santé sans publicités ni abonnements obligatoires.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="text-xs font-medium text-foreground flex items-center gap-1.5"
            >
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              Nom complet ou prénom
            </label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Alex Dupont"
              required
              disabled={loading}
            />
          </div>

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
            <label
              htmlFor="password"
              className="text-xs font-medium text-foreground flex items-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Mot de passe (6 caractères min.)
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-medium text-foreground flex items-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Confirmer le mot de passe
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full gap-2 h-11" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                Rejoindre Metrik
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t border-border/50 pt-4 text-center text-xs text-muted-foreground">
        <div>
          Vous avez déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Se connecter
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
