import { GameElement, ElementType, MatchResult, Grade, GameResult } from '@/types/game';

const BOARD_SIZE = 9;

let elementIdCounter = 0;

function generateId(): string {
  return `element-${++elementIdCounter}`;
}

export function getRandomElement(allowedTypes: ElementType[]): ElementType {
  return allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
}

export function initializeBoard(allowedTypes: ElementType[]): GameElement[][] {
  const board: GameElement[][] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      let elementType = getRandomElement(allowedTypes);
      
      while (
        (col >= 2 && 
          board[row][col - 1].type === elementType && 
          board[row][col - 2].type === elementType) ||
        (row >= 2 && 
          board[row - 1][col].type === elementType && 
          board[row - 2][col].type === elementType)
      ) {
        elementType = getRandomElement(allowedTypes);
      }
      
      board[row][col] = {
        id: generateId(),
        type: elementType,
        row,
        col,
        isMatched: false,
        isNew: false,
        isSelected: false
      };
    }
  }
  
  return board;
}

export function isValidMove(
  board: GameElement[][],
  row1: number,
  col1: number,
  row2: number,
  col2: number
): boolean {
  const diffRow = Math.abs(row1 - row2);
  const diffCol = Math.abs(col1 - col2);
  
  if (!((diffRow === 1 && diffCol === 0) || (diffRow === 0 && diffCol === 1))) {
    return false;
  }
  
  const newBoard = board.map(row => row.map(el => ({ ...el })));
  
  const temp = newBoard[row1][col1];
  newBoard[row1][col1] = newBoard[row2][col2];
  newBoard[row2][col2] = temp;
  
  return findMatches(newBoard).length > 0;
}

export function swapElements(
  board: GameElement[][],
  row1: number,
  col1: number,
  row2: number,
  col2: number
): GameElement[][] {
  const newBoard = board.map(row => row.map(el => ({ ...el })));
  
  const temp = newBoard[row1][col1];
  newBoard[row1][col1] = { ...newBoard[row2][col2], row: row1, col: col1 };
  newBoard[row2][col2] = { ...temp, row: row2, col: col2 };
  
  return newBoard;
}

export function findMatches(board: GameElement[][]): { row: number; col: number }[] {
  const matches: Set<string> = new Set();
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE - 2; col++) {
      const type = board[row][col].type;
      if (
        board[row][col + 1].type === type &&
        board[row][col + 2].type === type
      ) {
        matches.add(`${row}-${col}`);
        matches.add(`${row}-${col + 1}`);
        matches.add(`${row}-${col + 2}`);
        
        let k = col + 3;
        while (k < BOARD_SIZE && board[row][k].type === type) {
          matches.add(`${row}-${k}`);
          k++;
        }
      }
    }
  }
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      const type = board[row][col].type;
      if (
        board[row + 1][col].type === type &&
        board[row + 2][col].type === type
      ) {
        matches.add(`${row}-${col}`);
        matches.add(`${row + 1}-${col}`);
        matches.add(`${row + 2}-${col}`);
        
        let k = row + 3;
        while (k < BOARD_SIZE && board[k][col].type === type) {
          matches.add(`${k}-${col}`);
          k++;
        }
      }
    }
  }
  
  return Array.from(matches).map(key => {
    const [row, col] = key.split('-').map(Number);
    return { row, col };
  });
}

export function markMatches(
  board: GameElement[][],
  matches: { row: number; col: number }[]
): GameElement[][] {
  const newBoard = board.map(row => row.map(el => ({ ...el, isMatched: false })));
  
  matches.forEach(({ row, col }) => {
    newBoard[row][col].isMatched = true;
  });
  
  return newBoard;
}

export function dropElements(board: GameElement[][]): GameElement[][] {
  const newBoard = board.map(row => row.map(el => ({ ...el })));
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    let writeIndex = BOARD_SIZE - 1;
    
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (!newBoard[row][col].isMatched) {
        if (writeIndex !== row) {
          newBoard[writeIndex][col] = { ...newBoard[row][col], row: writeIndex };
          newBoard[row][col] = {
            ...newBoard[row][col],
            isMatched: true
          };
        }
        writeIndex--;
      }
    }
  }
  
  return newBoard;
}

export function fillEmptyCells(
  board: GameElement[][],
  allowedTypes: ElementType[]
): GameElement[][] {
  const newBoard = board.map(row => row.map(el => ({ ...el })));
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (newBoard[row][col].isMatched) {
        newBoard[row][col] = {
          id: generateId(),
          type: getRandomElement(allowedTypes),
          row,
          col,
          isMatched: false,
          isNew: true,
          isSelected: false
        };
      }
    }
  }
  
  return newBoard;
}

export function calculateScore(
  matchCount: number,
  combo: number,
  characterSpecialty: ElementType | null,
  matchedElementType: ElementType,
  characterBonus: number
): number {
  let baseScore = matchCount * 10;
  
  let comboMultiplier = 1;
  if (combo >= 2) comboMultiplier = 1;
  if (combo >= 3) comboMultiplier = 1.5;
  if (combo >= 5) comboMultiplier = 2;
  
  let elementBonus = 1;
  if (characterSpecialty && characterSpecialty === matchedElementType) {
    elementBonus = 1 + characterBonus;
  }
  
  return Math.floor(baseScore * comboMultiplier * elementBonus);
}

export function getGrade(score: number, targetScore: number): Grade {
  const ratio = score / targetScore;
  if (ratio >= 2.0) return 'S';
  if (ratio >= 1.5) return 'A';
  if (ratio >= 1.0) return 'B';
  if (ratio >= 0.7) return 'C';
  return 'D';
}

export function isWin(score: number, targetScore: number): boolean {
  return score >= targetScore;
}

export function createGameResult(
  score: number,
  targetScore: number,
  timeUsed: number,
  maxCombo: number,
  courseId: string,
  characterId: string
): GameResult {
  const grade = getGrade(score, targetScore);
  return {
    score,
    targetScore,
    timeUsed,
    maxCombo,
    grade,
    isWin: isWin(score, targetScore),
    courseId,
    characterId
  };
}
