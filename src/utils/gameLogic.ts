import { GameElement, ElementType, MatchResult, Grade, GameResult, MatchGroup, MatchCell } from '@/types/game';

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
        isSelected: false,
        special: null
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

export function findMatchGroups(board: GameElement[][]): MatchGroup[] {
  const groups: MatchGroup[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    let col = 0;
    while (col < BOARD_SIZE) {
      const type = board[row][col].type;
      let length = 1;
      
      while (col + length < BOARD_SIZE && board[row][col + length].type === type) {
        length++;
      }
      
      if (length >= 3) {
        const cells: MatchCell[] = [];
        for (let i = 0; i < length; i++) {
          cells.push({ row, col: col + i });
        }
        groups.push({ cells, direction: 'horizontal', length, type });
      }
      
      col += length;
    }
  }
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    let row = 0;
    while (row < BOARD_SIZE) {
      const type = board[row][col].type;
      let length = 1;
      
      while (row + length < BOARD_SIZE && board[row + length][col].type === type) {
        length++;
      }
      
      if (length >= 3) {
        const cells: MatchCell[] = [];
        for (let i = 0; i < length; i++) {
          cells.push({ row: row + i, col });
        }
        groups.push({ cells, direction: 'vertical', length, type });
      }
      
      row += length;
    }
  }
  
  return groups;
}

export function findMatches(board: GameElement[][]): { row: number; col: number }[] {
  const groups = findMatchGroups(board);
  const matches = new Set<string>();
  
  groups.forEach(group => {
    group.cells.forEach(cell => {
      matches.add(`${cell.row}-${cell.col}`);
    });
  });
  
  return Array.from(matches).map(key => {
    const [row, col] = key.split('-').map(Number);
    return { row, col };
  });
}

interface MatchClassification {
  normalMatches: { row: number; col: number }[];
  stripeHPositions: { row: number; col: number }[];
  stripeVPositions: { row: number; col: number }[];
  bombPositions: { row: number; col: number }[];
  rainbowPositions: { row: number; col: number }[];
}

export function classifyMatches(board: GameElement[][]): MatchClassification {
  const groups = findMatchGroups(board);
  const allMatches = new Set<string>();
  const stripeHPositions: { row: number; col: number }[] = [];
  const stripeVPositions: { row: number; col: number }[] = [];
  const bombPositions: { row: number; col: number }[] = [];
  const rainbowPositions: { row: number; col: number }[] = [];
  
  const hGroups = groups.filter(g => g.direction === 'horizontal');
  const vGroups = groups.filter(g => g.direction === 'vertical');
  
  const cellToGroups: Record<string, MatchGroup[]> = {};
  groups.forEach(group => {
    group.cells.forEach(cell => {
      const key = `${cell.row}-${cell.col}`;
      if (!cellToGroups[key]) cellToGroups[key] = [];
      cellToGroups[key].push(group);
    });
  });
  
  groups.forEach(group => {
    if (group.length === 4) {
      if (group.direction === 'horizontal') {
        const centerCol = group.cells[1].col;
        stripeHPositions.push({ row: group.cells[0].row, col: centerCol });
      } else {
        const centerRow = group.cells[1].row;
        stripeVPositions.push({ row: centerRow, col: group.cells[0].col });
      }
    } else if (group.length >= 5) {
      const centerIndex = Math.floor(group.length / 2);
      rainbowPositions.push(group.cells[centerIndex]);
    }
    
    group.cells.forEach(cell => {
      allMatches.add(`${cell.row}-${cell.col}`);
    });
  });
  
  Object.keys(cellToGroups).forEach(key => {
    const [row, col] = key.split('-').map(Number);
    const cellGroups = cellToGroups[key];
    
    const hasH = cellGroups.some(g => g.direction === 'horizontal');
    const hasV = cellGroups.some(g => g.direction === 'vertical');
    
    if (hasH && hasV) {
      const hLength = cellGroups.find(g => g.direction === 'horizontal')?.length || 0;
      const vLength = cellGroups.find(g => g.direction === 'vertical')?.length || 0;
      
      if (hLength >= 3 && vLength >= 3) {
        bombPositions.push({ row, col });
      }
    }
  });
  
  const normalMatches = Array.from(allMatches).map(key => {
    const [row, col] = key.split('-').map(Number);
    return { row, col };
  });
  
  return {
    normalMatches,
    stripeHPositions,
    stripeVPositions,
    bombPositions,
    rainbowPositions
  };
}

export function getBombArea(centerRow: number, centerCol: number): { row: number; col: number }[] {
  const area: { row: number; col: number }[] = [];
  
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = centerRow + dr;
      const c = centerCol + dc;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        area.push({ row: r, col: c });
      }
    }
  }
  
  return area;
}

export function getStripeHArea(row: number): { row: number; col: number }[] {
  const area: { row: number; col: number }[] = [];
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    area.push({ row, col });
  }
  
  return area;
}

export function getStripeVArea(col: number): { row: number; col: number }[] {
  const area: { row: number; col: number }[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    area.push({ row, col });
  }
  
  return area;
}

export function getRainbowArea(board: GameElement[][], targetType: ElementType): { row: number; col: number }[] {
  const area: { row: number; col: number }[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].type === targetType) {
        area.push({ row, col });
      }
    }
  }
  
  return area;
}

export function triggerSpecialEffects(
  board: GameElement[][],
  matches: { row: number; col: number }[]
): { row: number; col: number }[] {
  const additionalMatches = new Set<string>();
  
  matches.forEach(({ row, col }) => {
    const element = board[row][col];
    
    if (element.special === 'bomb') {
      const bombArea = getBombArea(row, col);
      bombArea.forEach(cell => {
        additionalMatches.add(`${cell.row}-${cell.col}`);
      });
    } else if (element.special === 'stripe-h') {
      const stripeArea = getStripeHArea(row);
      stripeArea.forEach(cell => {
        additionalMatches.add(`${cell.row}-${cell.col}`);
      });
    } else if (element.special === 'stripe-v') {
      const stripeArea = getStripeVArea(col);
      stripeArea.forEach(cell => {
        additionalMatches.add(`${cell.row}-${cell.col}`);
      });
    } else if (element.special === 'rainbow') {
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          additionalMatches.add(`${r}-${c}`);
        }
      }
    }
  });
  
  matches.forEach(({ row, col }) => {
    additionalMatches.delete(`${row}-${col}`);
  });
  
  return Array.from(additionalMatches).map(key => {
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

export function createSpecialElements(
  board: GameElement[][],
  classification: MatchClassification
): GameElement[][] {
  const newBoard = board.map(row => row.map(el => ({ ...el })));
  
  classification.stripeHPositions.forEach(({ row, col }) => {
    newBoard[row][col].special = 'stripe-h';
    newBoard[row][col].isMatched = false;
  });
  
  classification.stripeVPositions.forEach(({ row, col }) => {
    newBoard[row][col].special = 'stripe-v';
    newBoard[row][col].isMatched = false;
  });
  
  classification.bombPositions.forEach(({ row, col }) => {
    newBoard[row][col].special = 'bomb';
    newBoard[row][col].isMatched = false;
  });
  
  classification.rainbowPositions.forEach(({ row, col }) => {
    newBoard[row][col].special = 'rainbow';
    newBoard[row][col].isMatched = false;
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
          isSelected: false,
          special: null
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
