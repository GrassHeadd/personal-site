import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/* Comma-separated allowlist; only these Google accounts can sign in at all. */
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      return !!email && adminEmails.includes(email);
    },
  },
});

/* Server-side gate for write endpoints. */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  return !!email && adminEmails.includes(email);
}
