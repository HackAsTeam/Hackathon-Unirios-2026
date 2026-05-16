export type ResponseFormat =
  | 'text'
  | 'audio'
  | 'video'
  | 'drawing'
  | 'mindmap'
  | 'presentation'
  | 'quiz'
  | 'podcast'
  | 'oral';

export type ActivityStatus = 'open' | 'in_progress' | 'submitted' | 'graded' | 'closed';

export type UserRole = 'student' | 'teacher' | 'coordinator';

export interface Activity {
  id: string;
  title: string;
  learningObjective: string;
  description: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  allowedFormats: ResponseFormat[];
  dueDate: string;
  status: ActivityStatus;
  createdAt: string;
  instructions?: string;
  supportMaterials?: string[];
  rubric?: RubricItem[];
}

export interface RubricItem {
  criterion: string;
  description: string;
  weight: number;
}

export interface ActivityResponse {
  id: string;
  activityId: string;
  studentId: string;
  studentName: string;
  format: ResponseFormat;
  content: Record<string, unknown>;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  gradedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  grade: string;
  accessibility?: AccessibilityPreferences;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  fontSizeScale: number;
  reducedMotion: boolean;
  prefersAudio: boolean;
  prefersVisual: boolean;
  screenReader: boolean;
}

export interface PrivacySettings {
  dataConsent: boolean;
  shareProgressWithPeers: boolean;
  allowTeacherContact: boolean;
  dataRetentionMonths: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  accessibility: AccessibilityPreferences;
  privacy: PrivacySettings;
  createdAt: string;
}
