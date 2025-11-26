export interface NavLink {
  name: string;
  link: string;
}

export interface Word {
  text: string;
  imgPath: string;
}

export interface ExpCard {
  review: string;
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
