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

export type { Classroom, Subject, Exam };