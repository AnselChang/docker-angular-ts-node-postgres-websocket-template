export interface Lesson {
  title: string,
  pages: ValidPage[],
}

export interface Page {
  mode: string; // If parsing `PAGE text`, mode is `text`
  variables: Map<string, string | number>; // variable names and their values
  text: string[]; // text content of the section. Each element is a paragraph
  children: Section[]; // nested sections
}

export interface Section {
  mode: string; // If parsing `@MOVE O-90=CORRECT`, mode is `MOVE`
  variant: string | null; // If parsing `@MOVE O-90=CORRECT`, variant is `O-90=CORRECT`
  text: string[]; // text content of the section. Each element is a paragraph
}

// Parse a markdown file into sections
export function parseMarkdown(file: string): Lesson {
  const lines = file.split("\n");
  const pages: Page[] = [];

  const title = lines.shift();
  if (!title) throw new Error("Title must be defined in first line")
  
  let currentPage: Page | null = null;
  let currentSection: Section | null = null;
  for (let line of lines) {

    line = line.trim();
    if (line === "") continue;
    
    if (line.startsWith("PAGE")) {
      // New page. Format `PAGE mode`

      // Push previous finished page
      if (currentPage) {

      // if ongoing section, add to previous page and reset current section
      if (currentSection) {
        currentPage.children.push(currentSection);
        currentSection = null;
      }

        pages.push(currentPage);
      }
      
      // match for text after PAGE
      const mode = line.match(/PAGE (.*)/);
      if (!mode) {
        throw new Error(`Invalid mode at line: ${line}`);
      }

      currentPage = {
        mode: mode[1],
        variables: new Map(),
        text: [],
        children: []
      };
    } else if (line.startsWith("@")) {
      // New section. Format `@MODE variant`
      if (!currentPage) {
        throw new Error(`Section without page at line: ${line}`);
      }

      if (currentSection) {
        currentPage.children.push(currentSection);
      }

      // match for MODE and variant
      const match = line.match(/@(\w+)(.*)/);
      if (!match) {
        throw new Error(`Invalid section at line: ${line}`);
      }
      const [_, mode, variant] = match;

      currentSection = {
        mode,
        variant: variant.trim() || null,
        text: [""]
      };

    } else if (line.startsWith("$")) {
      // new variable for page. Format `$VARIABLE=value`
      if (!currentPage) {
        throw new Error(`Variable without page at line: ${line}`);
      }

      // match for VARIABLE and value, allowing for possible space before/after =
      const match = line.match(/\$([A-Z]+)\s*=\s*(.*)/);

      if (!match) {
        throw new Error(`Invalid variable at line: ${line}`);
      }

      const [_, variable, value] = match;
      const typedValue = Number.isInteger(parseInt(value)) ? parseInt(value) : value.trim();
      currentPage.variables.set(variable, typedValue);
    } else {
      // Add new paragraph to current section or page
      if (currentSection) {
        currentSection.text.push(line);
      } else if (currentPage) {
        currentPage.text.push(line);
      }
    }
  }

  // At the end, add remaining section and page
  if (currentSection) currentPage?.children.push(currentSection);
  if (currentPage) pages.push(currentPage);

  return {
    title: title,
    pages: pages.map(parseValidPage)
  }
}

export enum PageTypes {
  TEXT = 'text',
  PUZZLE = 'puzzle',
  PUZZLE_CONTINUATION = 'puzzle-continuation',
}

export interface ValidPage {
  mode: PageTypes,
}

function parseValidPage(page: Page): ValidPage {
  switch (page.mode) {
    case PageTypes.TEXT: return parseTextPage(page);
    case PageTypes.PUZZLE: return parsePuzzlePage(page);
    case PageTypes.PUZZLE_CONTINUATION: return parsePuzzleContinuationPage(page);
    default: throw new Error("Invalid page mode");
  }
}

export interface TextPage {
  mode: PageTypes.TEXT,
  text: string[],
}
function parseTextPage(page: Page): TextPage {
  if (page.mode !== "text") {
    throw new Error("Invalid page mode");
  }

  // if there are any variables, throw error
  if (page.variables.size > 0) {
    throw new Error("Text page cannot have variables");
  }

  // if there are any children, throw error
  if (page.children.length > 0) {
    throw new Error("Text page cannot have children");
  }

  return {
    mode: PageTypes.TEXT,
    text: page.text,
  }
}

export enum PuzzleMoveType {
  CORRECT = "CORRECT",
  INCORRECT = "INCORRECT",
  ALTERNATE = "ALTERNATE",
}

export interface PuzzleMove {
  placement: string | "default";
  type: PuzzleMoveType;
  text: string[];
}

export interface PuzzlePage {
  mode: PageTypes.PUZZLE,
  text: string[],
  board: string,
  score: number,
  level: number,
  lines: number,
  current: string,
  next: string,
  moves: PuzzleMove[],
}

function parsePuzzleMoves(page: Page): PuzzleMove[] {
  const moves: PuzzleMove[] = [];
  for (let child of page.children) {
    if (child.mode !== "MOVE") {
      throw new Error("Only MOVE sections are allowed in puzzle and puzzle-continuation pages");
    }

    const variant = child.variant;
    if (!variant) throw new Error("Invalid variant");

    const [placement, type] = variant.split("=");
    if (!placement || !type) throw new Error("Invalid placement or type");

    // assert type in PuzzleMoveType
    if (!Object.values(PuzzleMoveType).includes(type as PuzzleMoveType)) {
      throw new Error("Invalid move type");
    }

    moves.push({
      placement,
      type: type as PuzzleMoveType,
      text: child.text,
    });
  }
  return moves;
}

function parsePuzzlePage(page: Page): PuzzlePage {
  if (page.mode !== "puzzle") {
    throw new Error("Invalid page mode");
  }

  const board = page.variables.get("BOARD");
  if (typeof board !== "string") throw new Error("Invalid board");
  
  const score = page.variables.get("SCORE");
  if (typeof score !== "number") throw new Error("Invalid score");

  const level = page.variables.get("LEVEL");
  if (typeof level !== "number") throw new Error("Invalid level");

  const lines = page.variables.get("LINES");
  if (typeof lines !== "number") throw new Error("Invalid lines");

  const current = page.variables.get("CURRENT");
  if (typeof current !== "string") throw new Error("Invalid current");

  const next = page.variables.get("NEXT");
  if (typeof next !== "string") throw new Error("Invalid next");

  return {
    mode: PageTypes.PUZZLE,
    text: page.text,
    board,
    score,
    level,
    lines,
    current,
    next,
    moves: parsePuzzleMoves(page),
  }
}

export interface PuzzleContinuationPage {
  mode: PageTypes.PUZZLE_CONTINUATION,
  text: string[],
  next: string,
  moves: PuzzleMove[],
}

function parsePuzzleContinuationPage(page: Page): PuzzleContinuationPage {
  if (page.mode !== "puzzle-continuation") {
    throw new Error("Invalid page mode");
  }

  const next = page.variables.get("NEXT");
  if (typeof next !== "string") throw new Error("Invalid next");

  return {
    mode: PageTypes.PUZZLE_CONTINUATION,
    text: page.text,
    next,
    moves: parsePuzzleMoves(page),
  }
}