// auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }, // Space တွေ၊ စာလုံးကြီးသေးတွေ ညှိပစ်တာပါ
          });

          if (!user || !user.password) {
            console.log("❌ အဆိုပါ Email ဖြင့် အသုံးပြုသူ ရှာမတွေ့ပါ");
            return null;
          }

          // 2. Password ကို တိုက်စစ်မယ်
          const isPasswordMatch = await bcrypt.compare(password, user.password);

          if (!isPasswordMatch) {
            console.log("❌ Password မှားယွင်းနေပါသည်");
            return null;
          }

          // 3. အကုန်မှန်ရင် ဒါလေးပဲ return ပြန်ပါ (id ကို string ပြောင်းဖို့ မမေ့ပါနဲ့)
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("🔒 Authorize Error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET, // 🌟 ဤနေရာတွင် explicit သတ်မှတ်ပေးလိုက်ပါ
  pages: {
    signIn: "/login",
    error: "/login", // Auth error တက်ရင် api/auth/error ဆီ မသွားဘဲ login ဆီပဲ ပြန်လာခိုင်းတာပါ
  },
});