"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: any) {
  try {
    const { email, password } = formData;

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email သို့မဟုတ် Password မှားယွင်းနေပါသည်။" };
        default:
          return { error: "အကောင့်ဝင်၍မရပါ။ အချက်အလက်များ ပြန်စစ်ပါ။" };
      }
    }

    return { error: "တစ်စုံတစ်ရာ မှားယွင်းနေပါသည်။" };
  }
}

function isRedirectError(error: any): boolean {
  return error && typeof error === "object" && "digest" in error && error.digest.startsWith("NEXT_REDIRECT");
}