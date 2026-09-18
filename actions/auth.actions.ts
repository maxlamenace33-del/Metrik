"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/domain";

export async function loginWithPasswordAction(
  formData: FormData
): Promise<ActionResult<{ redirectUrl: string }>> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Veuillez renseigner votre email et mot de passe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let message = "Identifiants incorrects. Veuillez réessayer.";
    if (error.message.includes("Email not confirmed")) {
      message = "Veuillez confirmer votre adresse email avant de vous connecter.";
    }
    return { success: false, error: message };
  }

  revalidatePath("/", "layout");
  return { success: true, data: { redirectUrl: "/dashboard" } };
}

export async function loginWithMagicLinkAction(
  email: string
): Promise<ActionResult<{ message: string }>> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Veuillez saisir une adresse email valide." };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${appUrl}/api/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return {
      success: false,
      error: `Erreur lors de l'envoi du lien : ${error.message}`,
    };
  }

  return {
    success: true,
    data: {
      message: "Un lien magique de connexion a été envoyé par email. Vérifiez votre boîte de réception !",
    },
  };
}

export async function signUpAction(
  formData: FormData
): Promise<ActionResult<{ emailNeedsConfirmation: boolean }>> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password) {
    return { success: false, error: "L'email et le mot de passe sont requis." };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "Le mot de passe doit contenir au moins 6 caractères.",
    };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "",
      },
      emailRedirectTo: `${appUrl}/api/auth/callback?next=/profile`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Si l'utilisateur n'a pas de session immédiate, un email de confirmation a été envoyé
  const emailNeedsConfirmation = !data.session;

  revalidatePath("/", "layout");
  return { success: true, data: { emailNeedsConfirmation } };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
