import { Course, Student, BehaviorEvent, Reward, Consequence, User } from '@/types';

export const mockUser: User = {
  id: '1',
  email: 'teacher@school.com',
  name: 'Maria Schmidt',
  role: 'teacher'
};

export const mockCourses: Course[] = [
  {
    id: '1',
    teacherId: '1',
    name: '7a Mathematik',
    subject: 'Mathematik',
    schoolYear: '2024/25',
    archived: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    settings: {
      colors: [
        { id: '1', label: 'Exzellent', color: 'blue', emoji: '⭐', order: 1, minXP: 80 },
        { id: '2', label: 'Gut', color: 'green', emoji: '✅', order: 2, minXP: 60, maxXP: 79 },
        { id: '3', label: 'Warnung', color: 'yellow', emoji: '⚠️', order: 3, minXP: 30, maxXP: 59 },
        { id: '4', label: 'Kritisch', color: 'red', emoji: '🚨', order: 4, maxXP: 29 }
      ],
      levelSystem: {
        startXP: 50,
        levelThreshold: 100,
        maxLevel: 10,
        enableLevels: true
      },
      actions: [
        { id: '1', label: 'Gut mitgearbeitet', icon: '👍', xpChange: 5, hotkey: '1' },
        { id: '2', label: 'Störung', icon: '⚠️', xpChange: -10, hotkey: '2' },
        { id: '3', label: 'Hilfsbereit', icon: '🤝', xpChange: 8, hotkey: '3' },
        { id: '4', label: 'Hausaufgaben vergessen', icon: '📚', xpChange: -5, hotkey: '4' }
      ],
      autoRules: [],
      boardMode: {
        layout: 'grid',
        showNames: true,
        showLevels: true,
        theme: 'light',
        fontSize: 'medium'
      }
    }
  },
  {
    id: '2',
    teacherId: '1',
    name: '8b Deutsch',
    subject: 'Deutsch',
    schoolYear: '2024/25',
    archived: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
    settings: {
      colors: [
        { id: '1', label: 'Exzellent', color: 'blue', emoji: '⭐', order: 1, minXP: 80 },
        { id: '2', label: 'Gut', color: 'green', emoji: '✅', order: 2, minXP: 60, maxXP: 79 },
        { id: '3', label: 'Warnung', color: 'yellow', emoji: '⚠️', order: 3, minXP: 30, maxXP: 59 },
        { id: '4', label: 'Kritisch', color: 'red', emoji: '🚨', order: 4, maxXP: 29 }
      ],
      levelSystem: {
        startXP: 50,
        levelThreshold: 100,
        maxLevel: 10,
        enableLevels: true
      },
      actions: [
        { id: '1', label: 'Kreative Antwort', icon: '💡', xpChange: 8, hotkey: '1' },
        { id: '2', label: 'Nicht aufgepasst', icon: '😴', xpChange: -8, hotkey: '2' },
        { id: '3', label: 'Gute Präsentation', icon: '🎭', xpChange: 12, hotkey: '3' }
      ],
      autoRules: [],
      boardMode: {
        layout: 'grid',
        showNames: true,
        showLevels: true,
        theme: 'light',
        fontSize: 'medium'
      }
    }
  }
];

export const mockStudents: Student[] = [
  {
    id: '1',
    courseId: '1',
    displayName: 'Anna M.',
    internalCode: 'AM2024',
    avatarEmoji: '👧',
    currentColor: 'blue',
    currentLevel: 3,
    currentXP: 85,
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    courseId: '1',
    displayName: 'Ben K.',
    internalCode: 'BK2024',
    avatarEmoji: '👦',
    currentColor: 'green',
    currentLevel: 2,
    currentXP: 65,
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    courseId: '1',
    displayName: 'Clara W.',
    internalCode: 'CW2024',
    avatarEmoji: '👩',
    currentColor: 'yellow',
    currentLevel: 1,
    currentXP: 45,
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '4',
    courseId: '1',
    displayName: 'David H.',
    internalCode: 'DH2024',
    avatarEmoji: '👨',
    currentColor: 'green',
    currentLevel: 2,
    currentXP: 70,
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '5',
    courseId: '1',
    displayName: 'Eva L.',
    internalCode: 'EL2024',
    avatarEmoji: '👧',
    currentColor: 'blue',
    currentLevel: 4,
    currentXP: 92,
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '6',
    courseId: '1',
    displayName: 'Felix R.',
    internalCode: 'FR2024',
    avatarEmoji: '👦',
    currentColor: 'red',
    currentLevel: 1,
    currentXP: 25,
    active: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  }
];

export const mockRewards: Reward[] = [
  {
    id: '1',
    courseId: '1',
    name: '5 Min früher Pause',
    description: 'Darf 5 Minuten früher in die Pause',
    costXP: 50,
    category: 'Privilegien',
    active: true,
    emoji: '⏰'
  },
  {
    id: '2',
    courseId: '1',
    name: 'Hausaufgaben-Joker',
    description: 'Eine Hausaufgabe auslassen',
    costXP: 80,
    weeklyLimit: 1,
    category: 'Privilegien',
    active: true,
    emoji: '🎫'
  },
  {
    id: '3',
    courseId: '1',
    name: 'Musik hören',
    description: '15 Min Musik während Stillarbeit',
    costXP: 30,
    category: 'Aktivitäten',
    active: true,
    emoji: '🎵'
  }
];

export const mockConsequences: Consequence[] = [
  {
    id: '1',
    courseId: '1',
    name: 'Ermahnung',
    description: 'Mündliche Ermahnung',
    severity: 'minor',
    notesRequired: false,
    active: true,
    emoji: '⚠️'
  },
  {
    id: '2',
    courseId: '1',
    name: 'Nacharbeit',
    description: '15 Min Nacharbeit nach dem Unterricht',
    severity: 'moderate',
    notesRequired: true,
    active: true,
    emoji: '📝'
  },
  {
    id: '3',
    courseId: '1',
    name: 'Eltern benachrichtigen',
    description: 'Eltern werden über Verhalten informiert',
    severity: 'major',
    notesRequired: true,
    active: true,
    emoji: '📞'
  }
];

export const mockBehaviorEvents: BehaviorEvent[] = [
  {
    id: '1',
    studentId: '1',
    courseId: '1',
    type: 'color_change',
    payload: { fromColor: 'green', toColor: 'blue', reason: 'Gut mitgearbeitet' },
    createdBy: '1',
    createdAt: new Date('2024-01-20T10:30:00')
  },
  {
    id: '2',
    studentId: '6',
    courseId: '1',
    type: 'color_change',
    payload: { fromColor: 'yellow', toColor: 'red', reason: 'Störung' },
    createdBy: '1',
    createdAt: new Date('2024-01-20T11:15:00')
  }
];