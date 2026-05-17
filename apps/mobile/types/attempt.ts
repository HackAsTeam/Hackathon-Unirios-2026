export type AttemptStatus = 'InProgress' | 'Submitted' | 'Graded';

export interface AttemptSummary {
  id: string;
  examId: string;
  examTitle: string;
  classroomName: string;
  studentId: string;
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
