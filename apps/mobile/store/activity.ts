import { create } from 'zustand';
import { Activity, ActivityResponse, ResponseFormat } from '../types/activity';
import { MOCK_ACTIVITIES, MOCK_RESPONSES } from '../lib/mock-data';

interface ActivityState {
  activities: Activity[];
  responses: ActivityResponse[];
  currentResponseFormat: ResponseFormat | null;
  currentResponseContent: Record<string, unknown> | null;
  selectedStudentId: string;

  setActivities: (activities: Activity[]) => void;
  loadMockData: () => void;
  setCurrentFormat: (format: ResponseFormat) => void;
  setResponseContent: (content: Record<string, unknown>) => void;
  submitResponse: (activityId: string, studentId: string, studentName: string) => void;
  clearCurrentResponse: () => void;
  setSelectedStudent: (id: string) => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: MOCK_ACTIVITIES,
  responses: MOCK_RESPONSES,
  currentResponseFormat: null,
  currentResponseContent: null,
  selectedStudentId: 'student-1',

  setActivities: (activities) => set({ activities }),
  loadMockData: () => set({ activities: MOCK_ACTIVITIES, responses: MOCK_RESPONSES }),

  setCurrentFormat: (format) => set({ currentResponseFormat: format }),

  setResponseContent: (content) => set({ currentResponseContent: content }),

  submitResponse: (activityId, studentId, studentName) => {
    const { currentResponseFormat, currentResponseContent, responses } = get();
    if (!currentResponseFormat) return;

    const newResponse: ActivityResponse = {
      id: `resp-${Date.now()}`,
      activityId,
      studentId,
      studentName,
      format: currentResponseFormat,
      content: currentResponseContent || {},
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    };
    set({ responses: [...responses, newResponse], currentResponseFormat: null, currentResponseContent: null });
  },

  clearCurrentResponse: () => set({ currentResponseFormat: null, currentResponseContent: null }),

  setSelectedStudent: (id) => set({ selectedStudentId: id }),
}));
