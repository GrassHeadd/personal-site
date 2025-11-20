export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  contact: ContactInfo;
}
