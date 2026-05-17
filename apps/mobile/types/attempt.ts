export type AttemptStatus = 'InProgress' | 'Submitted' | 'Graded';

export interface AttemptSummary {
  id: string;
  examId: string;
  examTitle: string;
  classroomName: string;
  startedAt: string;
  submittedAt: string | null;
  status: AttemptStatus;
  answeredCount: number;
  totalQuestions: number;
  score: number | null;
}

export interface AttemptDetail extends Omit<AttemptSummary, 'answeredCount' | 'totalQuestions'> {
  answers: AnswerDetail[];
}

export interface AnswerDetail {
  id: string;
  questionId: string;
  questionText: string;
  answerText: string | null;
  format: 'Text' | 'Audio' | 'Oral' | 'Video' | null;
  selectedOptionId: string | null;
  score: number | null;
  feedback: string | null;
  answeredAt: string;
}

export interface ActivityAttemptSummary {
  id: string;
  studentId: string;
  studentName: string | null;
  avatarUrl: string | null;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
}
