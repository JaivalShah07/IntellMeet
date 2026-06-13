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
  actualDurationMinutes?: number;
  type: string;
  status: string;

  description?: string;
  participants?: string[];

  summary?: string;
  sentimentScore?: number;
  transcript?: string;

  hasRecording?: boolean;
  recordingUrl?: string;
  host?: {
    name: string;
    email: string;
  };
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

export interface DashboardStats {
  totalMeetings: number;
  aiInsights: number;
  hoursCollaborated: number;
  activeProjects: number;
}