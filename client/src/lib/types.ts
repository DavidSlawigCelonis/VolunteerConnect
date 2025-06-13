export interface Project {
  id: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  startDate: string;
  duration: string;
  volunteersNeeded: number;
  status: string;
  imageUrl?: string;
}

export interface Application {
  id: string;
  projectId: string;
  name: string;
  email: string;
  phone: string;
  motivation: string;
  status: string;
  createdAt: string;
} 