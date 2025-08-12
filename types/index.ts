export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'co_teacher' | 'admin';
}

export interface Course {
  id: string;
  teacherId: string;
  name: string;
  subject: string;
  schoolYear: string;
  settings: CourseSettings;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseSettings {
  colors: ColorConfig[];
  levelSystem: LevelSystem;
  actions: QuickAction[];
  autoRules: AutoRule[];
  boardMode: BoardModeSettings;
}

export interface ColorConfig {
  id: string;
  label: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
  emoji: string;
  order: number;
  minXP?: number;
  maxXP?: number;
}

export interface LevelSystem {
  startXP: number;
  levelThreshold: number;
  maxLevel: number;
  enableLevels: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  xpChange: number;
  colorChange?: 'up' | 'down';
  hotkey?: string;
}

export interface AutoRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  active: boolean;
}

export interface BoardModeSettings {
  layout: 'grid' | 'list' | 'seatmap';
  showNames: boolean;
  showLevels: boolean;
  theme: 'light' | 'dark' | 'contrast';
  fontSize: 'small' | 'medium' | 'large';
}

export interface Student {
  id: string;
  courseId: string;
  displayName: string;
  internalCode: string;
  avatarEmoji?: string;
  currentColor: 'blue' | 'green' | 'yellow' | 'red';
  currentLevel: number;
  currentXP: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BehaviorEvent {
  id: string;
  studentId: string;
  courseId: string;
  type: 'color_change' | 'level_change' | 'reward' | 'consequence' | 'auto_rule';
  payload: any;
  createdBy: string;
  createdAt: Date;
  notes?: string;
}

export interface Reward {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  costXP?: number;
  costLevel?: number;
  weeklyLimit?: number;
  category: string;
  active: boolean;
  emoji?: string;
}

export interface Consequence {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  severity: 'minor' | 'moderate' | 'major';
  notesRequired: boolean;
  active: boolean;
  emoji?: string;
}

export interface RewardRedemption {
  id: string;
  studentId: string;
  rewardId: string;
  courseId: string;
  redeemedAt: Date;
  approvedBy: string;
}

export interface ConsequenceApplication {
  id: string;
  studentId: string;
  consequenceId: string;
  courseId: string;
  appliedAt: Date;
  appliedBy: string;
  notes?: string;
}

export interface StudentReport {
  student: Student;
  events: BehaviorEvent[];
  rewards: RewardRedemption[];
  consequences: ConsequenceApplication[];
  xpHistory: { date: Date; xp: number }[];
  levelHistory: { date: Date; level: number }[];
}

export interface CourseReport {
  course: Course;
  students: Student[];
  colorDistribution: { color: string; count: number }[];
  trends: { date: Date; avgXP: number; avgLevel: number }[];
  topPerformers: Student[];
  improvements: Student[];
}