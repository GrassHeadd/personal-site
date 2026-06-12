export interface NavLink {
  name: string;
  link: string;
}

export const navLinks: NavLink[] = [
  { name: "app hub", link: "/projects" },
  { name: "calendar", link: "/calendar" },
  { name: "to-dos", link: "/todos" },
  { name: "talkerinos", link: "/talkerinos" },
];
