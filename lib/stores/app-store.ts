import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Course, Student, BehaviorEvent, User, Reward, Consequence } from '@/types';
import apiClient, { withRetry, dedupe } from '@/lib/api-client';
import { toast } from 'sonner';

interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Current Course
  currentCourse: Course | null;
  courses: Course[];
  coursesLoading: boolean;
  
  // Students
  students: Student[];
  studentsLoading: boolean;
  selectedStudents: string[];
  
  // Behavior Events
  events: BehaviorEvent[];
  eventsLoading: boolean;
  
  // Rewards & Consequences
  rewards: Reward[];
  consequences: Consequence[];
  rewardsLoading: boolean;
  consequencesLoading: boolean;
  
  // Real-time
  realtimeConnection: 'connected' | 'disconnected' | 'connecting';
  pendingEvents: BehaviorEvent[];
  
  // UI State
  sidebarCollapsed: boolean;
  boardMode: boolean;
  
  // Auth Actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // Course Actions  
  fetchCourses: () => Promise<void>;
  createCourse: (data: Partial<Course>) => Promise<Course | null>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  setCurrentCourse: (course: Course | null) => void;
  
  // Student Actions
  fetchStudents: (courseId?: string) => Promise<void>;
  createStudent: (data: {
    displayName: string;
    internalCode: string;
    courseId: string;
    emoji?: string;
  }) => Promise<Student | null>;
  updateStudent: (studentId: string, update: Partial<Student>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  importStudents: (file: File, courseId: string) => Promise<void>;
  exportStudents: (courseId: string) => Promise<void>;
  
  // Behavior Event Actions
  fetchEvents: (params?: {
    studentId?: string;
    courseId?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  createEvent: (data: {
    studentId: string;
    courseId: string;
    type: string;
    payload: any;
    notes?: string;
  }) => Promise<void>;
  createBulkEvents: (events: Array<{
    studentId: string;
    courseId: string;
    type: string;
    payload: any;
    notes?: string;
  }>) => Promise<void>;
  
  // Rewards Actions
  fetchRewards: (courseId: string) => Promise<void>;
  createReward: (data: Partial<Reward>) => Promise<void>;
  updateReward: (id: string, data: Partial<Reward>) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;
  redeemReward: (rewardId: string, studentId: string, quantity?: number) => Promise<void>;
  bulkRedeemReward: (rewardId: string, studentIds: string[], quantity?: number) => Promise<void>;
  
  // Consequences Actions
  fetchConsequences: (courseId: string) => Promise<void>;
  createConsequence: (data: Partial<Consequence>) => Promise<void>;
  updateConsequence: (id: string, data: Partial<Consequence>) => Promise<void>;
  deleteConsequence: (id: string) => Promise<void>;
  applyConsequence: (consequenceId: string, studentId: string, notes?: string) => Promise<void>;
  bulkApplyConsequence: (consequenceId: string, studentIds: string[], notes?: string) => Promise<void>;
  
  // SSE Event Handlers
  handleBehaviorEvent: (event: any) => void;
  handleStudentUpdate: (update: any) => void;
  handleRewardRedeemed: (redemption: any) => void;
  handleConsequenceApplied: (application: any) => void;
  
  // Pending Events Actions
  addPendingEvent: (event: BehaviorEvent) => void;
  removePendingEvent: (eventId: string) => void;
  clearPendingEvents: () => void;
  
  // Selection Actions
  setSelectedStudents: (studentIds: string[]) => void;
  addSelectedStudent: (studentId: string) => void;
  removeSelectedStudent: (studentId: string) => void;
  clearSelectedStudents: () => void;
  
  // UI Actions
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
        isLoading: false,
        currentCourse: null,
        courses: [],
        coursesLoading: false,
        students: [],
        studentsLoading: false,
        selectedStudents: [],
        events: [],
        eventsLoading: false,
        rewards: [],
        consequences: [],
        rewardsLoading: false,
        consequencesLoading: false,
        realtimeConnection: 'disconnected',
        pendingEvents: [],
        sidebarCollapsed: false,
        boardMode: false,
        
        // Auth Actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        
        login: async (email, password) => {
          set({ isLoading: true });
          try {
            const success = await apiClient.auth.login(email, password);
            if (success) {
              await get().checkAuth();
              toast.success('Successfully logged in');
              return true;
            }
            toast.error('Invalid credentials');
            return false;
          } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed');
            return false;
          } finally {
            set({ isLoading: false });
          }
        },
        
        logout: async () => {
          try {
            await apiClient.auth.logout();
            set({ 
              user: null, 
              isAuthenticated: false,
              currentCourse: null,
              courses: [],
              students: [],
              events: [],
              rewards: [],
              consequences: []
            });
            toast.success('Logged out successfully');
          } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed');
          }
        },
        
        checkAuth: async () => {
          try {
            const session = await apiClient.auth.getSession();
            if (session?.user) {
              set({ user: session.user, isAuthenticated: true });
            } else {
              set({ user: null, isAuthenticated: false });
            }
          } catch (error) {
            console.error('Auth check error:', error);
            set({ user: null, isAuthenticated: false });
          }
        },
        
        // Course Actions
        fetchCourses: async () => {
          set({ coursesLoading: true });
          try {
            const data = await dedupe('courses', () => apiClient.courses.list());
            set({ courses: data.courses, coursesLoading: false });
          } catch (error) {
            console.error('Fetch courses error:', error);
            toast.error('Failed to load courses');
            set({ coursesLoading: false });
          }
        },
        
        createCourse: async (data) => {
          try {
            const course = await apiClient.courses.create(data);
            set((state) => ({ courses: [...state.courses, course] }));
            toast.success('Course created successfully');
            return course;
          } catch (error) {
            console.error('Create course error:', error);
            toast.error('Failed to create course');
            return null;
          }
        },
        
        updateCourse: async (id, data) => {
          try {
            const updated = await apiClient.courses.update(id, data);
            set((state) => ({
              courses: state.courses.map(c => c.id === id ? updated : c),
              currentCourse: state.currentCourse?.id === id ? updated : state.currentCourse
            }));
            toast.success('Course updated successfully');
          } catch (error) {
            console.error('Update course error:', error);
            toast.error('Failed to update course');
          }
        },
        
        deleteCourse: async (id) => {
          try {
            await apiClient.courses.delete(id);
            set((state) => ({
              courses: state.courses.filter(c => c.id !== id),
              currentCourse: state.currentCourse?.id === id ? null : state.currentCourse
            }));
            toast.success('Course deleted successfully');
          } catch (error) {
            console.error('Delete course error:', error);
            toast.error('Failed to delete course');
          }
        },
        
        setCurrentCourse: (course) => {
          set({ 
            currentCourse: course,
            selectedStudents: []
          });
          if (course) {
            get().fetchStudents(course.id);
            get().fetchRewards(course.id);
            get().fetchConsequences(course.id);
          }
        },
        
        // Student Actions
        fetchStudents: async (courseId) => {
          set({ studentsLoading: true });
          try {
            const params = courseId ? { courseId } : undefined;
            const data = await dedupe(`students-${courseId}`, () => 
              apiClient.students.list(params)
            );
            set({ students: data?.students || [], studentsLoading: false });
          } catch (error) {
            console.error('Fetch students error:', error);
            toast.error('Failed to load students');
            set({ students: [], studentsLoading: false });
          }
        },
        
        createStudent: async (data) => {
          try {
            const student = await apiClient.students.create(data);
            set((state) => ({ students: [...state.students, student] }));
            toast.success('Student created successfully');
            return student;
          } catch (error) {
            console.error('Create student error:', error);
            toast.error('Failed to create student');
            return null;
          }
        },
        
        updateStudent: async (studentId, update) => {
          try {
            const updated = await apiClient.students.update(studentId, update);
            set((state) => ({
              students: state.students.map(s => s.id === studentId ? updated : s)
            }));
            toast.success('Student updated successfully');
          } catch (error) {
            console.error('Update student error:', error);
            toast.error('Failed to update student');
          }
        },
        
        deleteStudent: async (studentId) => {
          try {
            await apiClient.students.delete(studentId);
            set((state) => ({
              students: state.students.filter(s => s.id !== studentId)
            }));
            toast.success('Student deleted successfully');
          } catch (error) {
            console.error('Delete student error:', error);
            toast.error('Failed to delete student');
          }
        },
        
        importStudents: async (file, courseId) => {
          try {
            const result = await apiClient.students.import(file, courseId);
            await get().fetchStudents(courseId);
            toast.success(`Imported ${result.imported} students successfully`);
          } catch (error) {
            console.error('Import students error:', error);
            toast.error('Failed to import students');
          }
        },
        
        exportStudents: async (courseId) => {
          try {
            await apiClient.students.export(courseId);
            toast.success('Students exported successfully');
          } catch (error) {
            console.error('Export students error:', error);
            toast.error('Failed to export students');
          }
        },
        
        // Behavior Event Actions
        fetchEvents: async (params) => {
          set({ eventsLoading: true });
          try {
            const data = await apiClient.events.list(params);
            set({ events: data.events, eventsLoading: false });
          } catch (error) {
            console.error('Fetch events error:', error);
            toast.error('Failed to load events');
            set({ eventsLoading: false });
          }
        },
        
        createEvent: async (data) => {
          try {
            const event = await withRetry(() => apiClient.events.create(data));
            set((state) => ({ events: [event, ...state.events] }));
            
            // Optimistically update student XP
            if (data.payload?.xpChange) {
              set((state) => ({
                students: state.students.map(s => 
                  s.id === data.studentId 
                    ? { ...s, currentXP: s.currentXP + data.payload.xpChange }
                    : s
                )
              }));
            }
          } catch (error) {
            console.error('Create event error:', error);
            toast.error('Failed to create event');
          }
        },
        
        createBulkEvents: async (events) => {
          try {
            const result = await apiClient.events.bulkCreate(events);
            set((state) => ({ events: [...result.created, ...state.events] }));
            toast.success(`Created ${result.created.length} events`);
          } catch (error) {
            console.error('Create bulk events error:', error);
            toast.error('Failed to create events');
          }
        },
        
        // Rewards Actions
        fetchRewards: async (courseId) => {
          set({ rewardsLoading: true });
          try {
            const data = await dedupe(`rewards-${courseId}`, () => 
              apiClient.rewards.list(courseId)
            );
            set({ rewards: data.rewards, rewardsLoading: false });
          } catch (error) {
            console.error('Fetch rewards error:', error);
            set({ rewardsLoading: false });
          }
        },
        
        createReward: async (data) => {
          try {
            const reward = await apiClient.rewards.create(data);
            set((state) => ({ rewards: [...state.rewards, reward] }));
            toast.success('Reward created successfully');
          } catch (error) {
            console.error('Create reward error:', error);
            toast.error('Failed to create reward');
          }
        },
        
        updateReward: async (id, data) => {
          try {
            const updated = await apiClient.rewards.update(id, data);
            set((state) => ({
              rewards: state.rewards.map(r => r.id === id ? updated : r)
            }));
            toast.success('Reward updated successfully');
          } catch (error) {
            console.error('Update reward error:', error);
            toast.error('Failed to update reward');
          }
        },
        
        deleteReward: async (id) => {
          try {
            await apiClient.rewards.delete(id);
            set((state) => ({
              rewards: state.rewards.filter(r => r.id !== id)
            }));
            toast.success('Reward deleted successfully');
          } catch (error) {
            console.error('Delete reward error:', error);
            toast.error('Failed to delete reward');
          }
        },
        
        redeemReward: async (rewardId, studentId, quantity = 1) => {
          try {
            await apiClient.rewards.redeem({ rewardId, studentId, quantity });
            toast.success('Reward redeemed successfully');
            
            // Refresh student data to get updated XP
            const student = await apiClient.students.get(studentId);
            set((state) => ({
              students: state.students.map(s => s.id === studentId ? student : s)
            }));
          } catch (error) {
            console.error('Redeem reward error:', error);
            toast.error('Failed to redeem reward');
          }
        },
        
        bulkRedeemReward: async (rewardId, studentIds, quantity = 1) => {
          try {
            await apiClient.rewards.bulkRedeem({ rewardId, studentIds, quantity });
            toast.success(`Reward redeemed for ${studentIds.length} students`);
            
            // Refresh students data
            if (get().currentCourse) {
              await get().fetchStudents(get().currentCourse!.id);
            }
          } catch (error) {
            console.error('Bulk redeem reward error:', error);
            toast.error('Failed to redeem rewards');
          }
        },
        
        // Consequences Actions
        fetchConsequences: async (courseId) => {
          set({ consequencesLoading: true });
          try {
            const data = await dedupe(`consequences-${courseId}`, () => 
              apiClient.consequences.list(courseId)
            );
            set({ consequences: data.consequences, consequencesLoading: false });
          } catch (error) {
            console.error('Fetch consequences error:', error);
            set({ consequencesLoading: false });
          }
        },
        
        createConsequence: async (data) => {
          try {
            const consequence = await apiClient.consequences.create(data);
            set((state) => ({ consequences: [...state.consequences, consequence] }));
            toast.success('Consequence created successfully');
          } catch (error) {
            console.error('Create consequence error:', error);
            toast.error('Failed to create consequence');
          }
        },
        
        updateConsequence: async (id, data) => {
          try {
            const updated = await apiClient.consequences.update(id, data);
            set((state) => ({
              consequences: state.consequences.map(c => c.id === id ? updated : c)
            }));
            toast.success('Consequence updated successfully');
          } catch (error) {
            console.error('Update consequence error:', error);
            toast.error('Failed to update consequence');
          }
        },
        
        deleteConsequence: async (id) => {
          try {
            await apiClient.consequences.delete(id);
            set((state) => ({
              consequences: state.consequences.filter(c => c.id !== id)
            }));
            toast.success('Consequence deleted successfully');
          } catch (error) {
            console.error('Delete consequence error:', error);
            toast.error('Failed to delete consequence');
          }
        },
        
        applyConsequence: async (consequenceId, studentId, notes) => {
          try {
            await apiClient.consequences.apply({ consequenceId, studentId, notes });
            toast.success('Consequence applied successfully');
            
            // Refresh student data to get updated XP
            const student = await apiClient.students.get(studentId);
            set((state) => ({
              students: state.students.map(s => s.id === studentId ? student : s)
            }));
          } catch (error) {
            console.error('Apply consequence error:', error);
            toast.error('Failed to apply consequence');
          }
        },
        
        bulkApplyConsequence: async (consequenceId, studentIds, notes) => {
          try {
            await apiClient.consequences.bulkApply({ consequenceId, studentIds, notes });
            toast.success(`Consequence applied to ${studentIds.length} students`);
            
            // Refresh students data
            if (get().currentCourse) {
              await get().fetchStudents(get().currentCourse!.id);
            }
          } catch (error) {
            console.error('Bulk apply consequence error:', error);
            toast.error('Failed to apply consequences');
          }
        },
        
        // SSE Event Handlers
        handleBehaviorEvent: (event) => {
          set((state) => ({ 
            events: [event, ...state.events]
          }));
        },
        
        handleStudentUpdate: (update) => {
          const { studentId, ...data } = update;
          set((state) => ({
            students: state.students.map(s => 
              s.id === studentId ? { ...s, ...data } : s
            )
          }));
        },
        
        handleRewardRedeemed: (redemption) => {
          toast.info(`${redemption.studentName} redeemed ${redemption.rewardName}`);
          // Update student XP if provided
          if (redemption.studentId && redemption.newXP !== undefined) {
            set((state) => ({
              students: state.students.map(s => 
                s.id === redemption.studentId 
                  ? { ...s, currentXP: redemption.newXP }
                  : s
              )
            }));
          }
        },
        
        handleConsequenceApplied: (application) => {
          toast.warning(`${application.studentName} received ${application.consequenceName}`);
          // Update student XP if provided
          if (application.studentId && application.newXP !== undefined) {
            set((state) => ({
              students: state.students.map(s => 
                s.id === application.studentId 
                  ? { ...s, currentXP: application.newXP }
                  : s
              )
            }));
          }
        },
        
        // Pending Events Actions
        addPendingEvent: (event) => set((state) => ({
          pendingEvents: [...state.pendingEvents, event]
        })),
        
        removePendingEvent: (eventId) => set((state) => ({
          pendingEvents: state.pendingEvents.filter(e => e.id !== eventId)
        })),
        
        clearPendingEvents: () => set({ pendingEvents: [] }),
        
        // Selection Actions
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
        
        // UI Actions
        setRealtimeConnection: (status) => set({ realtimeConnection: status }),
        
        toggleSidebar: () => set((state) => ({ 
          sidebarCollapsed: !state.sidebarCollapsed 
        })),
        
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