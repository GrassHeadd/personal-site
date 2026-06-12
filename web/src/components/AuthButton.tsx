"use client";
import { useEffect, useState } from "react";
import { getSession, signIn, signOut } from "next-auth/react";

const AuthButton = () => {
  /* null = still checking; render nothing so the navbar doesn't flash */
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    getSession().then((s) => setSignedIn(!!s?.user?.email));
  }, []);

  if (signedIn === null) return null;

  return (
    <button
      onClick={() => (signedIn ? signOut() : signIn("google"))}
      className="hand text-sm md:text-base quiet-link cursor-pointer"
    >
      {signedIn ? "sign out" : "sign in"}
    </button>
  );
};

export default AuthButton;
