export interface Contact {
  name: string;
  role: string;
  email?: string;
  linkedin?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  description: string;
  seeking: string[];
  contacts: Contact[];
  website: string;
  tags: string[];
  iceBreakers: string[];
  locations: string[];
  booth?: number;
  isCustom?: boolean;
}

export interface UserProfile {
  name: string;
  linkedin: string;
  portfolio: string;
  github: string;
  cvUrl: string;
  onboardingComplete: boolean;
}

export interface ScheduleEvent {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  location: string;
  description: string;
  language?: string;
  highlight?: boolean;
}

export interface StructuredNote {
  talkedTo: string;
  role: string;
  about: string;
  nextStep: string;
  followUp: string;
  extra: string;
}

export interface CompanyNotes {
  [companyId: string]: StructuredNote;
}

export interface Favorites {
  [companyId: string]: boolean;
}
