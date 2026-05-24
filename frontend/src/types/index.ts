export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Meeting {
  _id: string;
  title: string;
  roomId: string;
  scheduledAt: string;
  durationMinutes?: number;
  type: string;
  status: string;
  summary?: string;
  sentimentScore?: number;
  transcript?: string;
  host?: { name: string; email: string };
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  dueDate?: string;
}

export interface DashboardStats {
  totalMeetings: number;
  aiInsights: number;
  hoursCollaborated: number;
  activeProjects: number;
}
