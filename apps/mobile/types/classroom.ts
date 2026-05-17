interface Classroom {
  id: string;
  title: string;
  description: string | null;
  teacherId: string;
  teacherName: string | null;
  createdAt: string;
  subjects: Subject[];
}

interface Subject {
  id: string;
  classroomId: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
}

interface Exam {
  id: string;
  classroomId: string;
  title: string;
  description: string | null;
  questionCount: number;
  createdAt: string;
}

interface QuestionOption {
  id: string;
  orderIndex: number;
  text: string;
}

interface Question {
  id: string;
  orderIndex: number;
  text: string;
  options: QuestionOption[];
}

interface ExamDetail {
  id: string;
  subjectId: string | null;
  classroomId: string;
  title: string;
  description: string | null;
  questions: Question[];
  createdAt: string;
}

interface AttemptResponse {
  id: string;
  examId: string;
  studentId: string;
  status: 'InProgress' | 'Submitted' | 'Graded';
  startedAt: string;
  submittedAt: string | null;
}

export type { Classroom, Subject, Exam, ExamDetail, Question, QuestionOption, AttemptResponse };