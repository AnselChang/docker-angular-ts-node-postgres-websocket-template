import { PuzzleSubmission } from "src/app/models/puzzles/puzzle";
import { GenericPuzzle } from "src/app/shared/puzzles/generic-puzzle";
import { SerializedPuzzleSubmission, PuzzleResult, evaluatePuzzleSubmission } from "src/app/shared/puzzles/serialized-puzzle-submission";

export interface EloChange {
  eloGain: number;
  eloLoss: number;
}


export abstract class PuzzleState {

  protected currentPuzzle?: GenericPuzzle;
  private submission?: PuzzleSubmission;

  // should throw an error if not initialized properly
  abstract init(): Promise<void>;

  async fetchNextPuzzle(): Promise<GenericPuzzle> {
    this.currentPuzzle = await this._fetchNextPuzzle();
    return this.currentPuzzle;
  }

  protected abstract _fetchNextPuzzle(): Promise<GenericPuzzle>;

  abstract getPuzzleName(isRetry: boolean): string;
  abstract getEloChange(): EloChange | undefined;
  abstract isTimed(): boolean;
  abstract nextButtonText(): string | undefined; // string for button to go to next puzzle, or undefined if no button

  // by default, evaluates the puzzle submission client-side. However, this can be overridden to evaluate server-side in ranked puzzles
  async evaluatePuzzleSubmission(puzzle: GenericPuzzle, submission: SerializedPuzzleSubmission, isRetry: boolean): Promise<PuzzleResult> {
    return evaluatePuzzleSubmission(puzzle, submission);
  }

  async submitPuzzle(submission: PuzzleSubmission, isRetry: boolean): Promise<PuzzleResult> {
    this.submission = submission;

    const rawSubmission: SerializedPuzzleSubmission = {
      puzzleID: this.currentPuzzle!.id,
      username: "",
      x1: submission.firstPiece?.getTranslateX() ?? undefined,
      y1: submission.firstPiece?.getTranslateY() ?? undefined,
      r1: submission.firstPiece?.getRotation() ?? undefined,
      x2: submission.secondPiece?.getTranslateX() ?? undefined,
      y2: submission.secondPiece?.getTranslateY() ?? undefined,
      r2: submission.secondPiece?.getRotation() ?? undefined,
    }
    
    const result = await this.evaluatePuzzleSubmission(this.currentPuzzle!, rawSubmission, isRetry);
    
    return result;
  }

  getSubmission(): PuzzleSubmission | undefined {
    return this.submission;
  }
}