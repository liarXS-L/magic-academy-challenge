import { GameResult, Grade } from '@/types/game';
import { courses, characters } from '@/data/gameData';

const validCourseIds = new Set(courses.map(c => c.id));
const validCharacterIds = new Set(characters.map(ch => ch.id));

export function validateCourseId(courseId: string): boolean {
  return validCourseIds.has(courseId);
}

export function validateCharacterId(characterId: string): boolean {
  return validCharacterIds.has(characterId);
}

export function validateLevelId(courseId: string, levelId: number): boolean {
  const course = courses.find(c => c.id === courseId);
  if (!course) return false;
  return course.levels.some(l => l.id === levelId);
}

export function safeParseGameResult(paramsStr: string): GameResult | null {
  try {
    const decoded = decodeURIComponent(paramsStr);
    const parsed = JSON.parse(decoded);
    
    if (!isValidGameResult(parsed)) {
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
}

function isValidGameResult(obj: unknown): obj is GameResult {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const result = obj as GameResult;
  
  const isValidScore = typeof result.score === 'number' && result.score >= 0 && result.score <= 999999;
  const isValidTargetScore = typeof result.targetScore === 'number' && result.targetScore >= 0 && result.targetScore <= 999999;
  const isValidTimeUsed = typeof result.timeUsed === 'number' && result.timeUsed >= 0 && result.timeUsed <= 999;
  const isValidMaxCombo = typeof result.maxCombo === 'number' && result.maxCombo >= 0 && result.maxCombo <= 99;
  const isValidGrade = isGrade(result.grade);
  const isValidIsWin = typeof result.isWin === 'boolean';
  const isValidCourseId = validateCourseId(result.courseId);
  const isValidCharacterId = validateCharacterId(result.characterId);
  
  return isValidScore &&
         isValidTargetScore &&
         isValidTimeUsed &&
         isValidMaxCombo &&
         isValidGrade &&
         isValidIsWin &&
         isValidCourseId &&
         isValidCharacterId;
}

function isGrade(grade: unknown): grade is Grade {
  return grade === 'S' || grade === 'A' || grade === 'B' || grade === 'C' || grade === 'D';
}