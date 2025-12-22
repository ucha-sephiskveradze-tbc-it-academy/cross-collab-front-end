export interface IEventDetails {
  id: number;
  title: string;
  category: string;
  description: string;
  fullDescription?: string;

  date: string;
  time: string;
  location: string;
  duration: string;

  capacity: number;
  registeredCount: number;
  waitlistCount: number;

  status: 'Open' | 'Registered' | 'Waitlisted';
  registrationClosesAt: string;

  agenda: {
    time: string;
    title: string;
    description: string;
    tags?: string[];
  }[];

  speakers: {
    name: string;
    role: string;
    bio: string;
    avatarUrl?: string;
  }[];

  faqs: {
    question: string;
    answer: string;
  }[];

  organizer: {
    name: string;
    department: string;
    email?: string;
  };
}
