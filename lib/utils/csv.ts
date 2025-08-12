import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export interface StudentCSVRow {
  displayName: string;
  avatarEmoji?: string;
}

export interface StudentExportRow {
  displayName: string;
  internalCode: string;
  avatarEmoji?: string;
  currentColor: string;
  currentLevel: number;
  currentXP: number;
  active: boolean;
}

/**
 * Parse CSV file content to student data
 */
export function parseStudentCSV(csvContent: string): StudentCSVRow[] {
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relaxColumnCount: true,
    });

    return records.map((record: any) => ({
      displayName: record['Name'] || record['displayName'] || record['Vorname'] || '',
      avatarEmoji: record['Emoji'] || record['avatarEmoji'] || undefined,
    })).filter((row: StudentCSVRow) => row.displayName.length > 0);
  } catch (error) {
    throw new Error('Failed to parse CSV file. Please ensure it contains a "Name" or "Vorname" column.');
  }
}

/**
 * Generate CSV content from student data
 */
export function generateStudentCSV(students: StudentExportRow[]): string {
  return stringify(students, {
    header: true,
    columns: {
      displayName: 'Name',
      internalCode: 'ID',
      avatarEmoji: 'Emoji',
      currentColor: 'Farbe',
      currentLevel: 'Level',
      currentXP: 'XP',
      active: 'Aktiv',
    },
  });
}

/**
 * Validate student names from CSV
 */
export function validateStudentNames(students: StudentCSVRow[]): {
  valid: StudentCSVRow[];
  invalid: { row: number; name: string; reason: string }[];
} {
  const valid: StudentCSVRow[] = [];
  const invalid: { row: number; name: string; reason: string }[] = [];
  const namePattern = /^[a-zA-ZäöüÄÖÜß\s\-\.]+$/;

  students.forEach((student, index) => {
    const row = index + 2; // Account for header row and 0-index

    if (!student.displayName) {
      invalid.push({ row, name: '', reason: 'Name ist erforderlich' });
    } else if (student.displayName.length > 50) {
      invalid.push({ row, name: student.displayName, reason: 'Name darf maximal 50 Zeichen lang sein' });
    } else if (!namePattern.test(student.displayName)) {
      invalid.push({ row, name: student.displayName, reason: 'Name enthält ungültige Zeichen' });
    } else {
      valid.push(student);
    }
  });

  return { valid, invalid };
}