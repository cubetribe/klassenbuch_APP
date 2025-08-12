import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Course, Student, BehaviorEvent, User } from '@/types';

interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Current Course
  currentCourse: Course | null;
  courses: Course[];
  
  // Students
  students: Student[];
  selectedStudents: string[];
  
  // Real-time
  realtimeConnection: 'connected' | 'disconnected' | 'connecting';
  pendingEvents: BehaviorEvent[];
  
  // UI State
  sidebarCollapsed: boolean;
  boardMode: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setCurrentCourse: (course: Course | null) => void;
  setCourses: (courses: Course[]) => void;
  setStudents: (students: Student[]) => void;
  updateStudent: (studentId: string, update: Partial<Student>) => void;
  addPendingEvent: (event: BehaviorEvent) => void;
  removePendingEvent: (eventId: string) => void;
  clearPendingEvents: () => void;
  setSelectedStudents: (studentIds: string[]) => void;
  addSelectedStudent: (studentId: string) => void;
  removeSelectedStudent: (studentId: string) => void;
  clearSelectedStudents: () => void;
  setRealtimeConnection: (status: 'connected' | 'disconnected' | 'connecting') => void;
  toggleSidebar: () => void;
  setBoardMode: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        currentCourse: null,
        courses: [],
        students: [],
        selectedStudents: [],
        realtimeConnection: 'disconnected',
        pendingEvents: [],
        sidebarCollapsed: false,
        boardMode: false,
        
        // Actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        
        setCurrentCourse: (course) => set({ 
          currentCourse: course,
          selectedStudents: [] // Clear selection when switching courses
        }),
        
        setCourses: (courses) => set({ courses }),
        
        setStudents: (students) => set({ students }),
        
        updateStudent: (studentId, update) => set((state) => ({
          students: state.students.map(s => 
            s.id === studentId ? { ...s, ...update } : s
          )
        })),
        
        addPendingEvent: (event) => set((state) => ({
          pendingEvents: [...state.pendingEvents, event]
        })),
        
        removePendingEvent: (eventId) => set((state) => ({
          pendingEvents: state.pendingEvents.filter(e => e.id !== eventId)
        })),
        
        clearPendingEvents: () => set({ pendingEvents: [] }),
        
        setSelectedStudents: (studentIds) => set({ selectedStudents: studentIds }),
        
        addSelectedStudent: (studentId) => set((state) => ({
          selectedStudents: state.selectedStudents.includes(studentId) 
            ? state.selectedStudents
            : [...state.selectedStudents, studentId]
        })),
        
        removeSelectedStudent: (studentId) => set((state) => ({
          selectedStudents: state.selectedStudents.filter(id => id !== studentId)
        })),
        
        clearSelectedStudents: () => set({ selectedStudents: [] }),
        
        setRealtimeConnection: (status) => set({ realtimeConnection: status }),
        
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        
        setBoardMode: (enabled) => set({ boardMode: enabled })
      }),
      {
        name: 'klassenbuch-storage',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
        })
      }
    )
  )
);