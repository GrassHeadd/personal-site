export interface NavLink {
  name: string;
  link: string;
}

export interface ExpCard {
  title: string;
  company: string;
  date: string;
  responsibilities: string[];
}

export interface ButtonProps {
  text: string;
  className?: string;
  id?: string;
}

export interface TitleHeaderProps {
  title: string;
  sub: string;
}
