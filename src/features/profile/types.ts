import type { Profile, Service, Skill, SocialLink } from "@/db/schema";

export interface ProfileWithAuxiliary {
  profile: Profile;
  services: Service[];
  skills: Skill[];
  socialLinks: SocialLink[];
}

export interface ServiceInputItem {
  id?: string;
  name: string;
}

export interface SkillInputItem {
  id?: string;
  name: string;
}

export interface SocialLinkInputItem {
  id?: string;
  platform: "instagram" | "youtube" | "linkedin" | "x" | "whatsapp" | "website";
  url: string;
}
