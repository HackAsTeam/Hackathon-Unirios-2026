export interface PendingAttemptItem {
  attemptId: string;
  studentName: string;
  submittedAt: string;
  activityId: string;
  activityTitle: string;
  subjectId: string;
  subjectName: string;
  classroomId: string;
  classroomTitle: string;
}

export interface StudentActivityStatus {
  activityId: string;
  activityTitle: string;
  subjectId: string;
  subjectName: string;
  classroomId: string;
  classroomTitle: string;
  attemptStatus: string | null;
  attemptId: string | null;
  answeredCount: number;
  totalQuestions: number;
}
