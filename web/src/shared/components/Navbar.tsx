"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { navLinks } from "../constants";
import AuthButton from "./AuthButton";

const NavBar = ({ initialAdmin }: { initialAdmin: boolean }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-100 transition-all duration-300 ${
        scrolled
          ? "bg-paper/90 backdrop-blur-sm border-b border-pencil"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-baseline justify-between px-6 py-4">
        <Link
          href="/"
          className="hand text-xl font-bold text-ink hover:-rotate-2 transition-transform duration-200"
        >
          grasshut<span className="text-forest">.</span>
        </Link>

        <nav>
          <ul className="flex items-baseline gap-5 md:gap-7">
            {navLinks.map(({ link, name }) => (
              <li key={name}>
                <Link href={link} className="hand text-sm md:text-base quiet-link">
                  {name}
                </Link>
              </li>
            ))}
            <li>
              <AuthButton initialAdmin={initialAdmin} />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
