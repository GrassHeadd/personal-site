export interface NavLink {
  name: string;
  link: string;
  /* hidden from visitors; the page behind it teases for the magic word */
  adminOnly?: boolean;
}

export const navLinks: NavLink[] = [
  { name: "app hub", link: "/projects" },
  { name: "calendar", link: "/calendar", adminOnly: true },
  { name: "to-dos", link: "/todos", adminOnly: true },
  { name: "scribbles", link: "/scribbles", adminOnly: true },
  { name: "talkerinos", link: "/talkerinos" },
];
