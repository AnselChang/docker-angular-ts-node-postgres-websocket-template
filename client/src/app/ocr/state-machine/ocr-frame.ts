import { BoardOCRBox } from "../calibration/board-ocr-box";
import { Calibration } from "../util/calibration";
import { Frame } from "../util/frame";
import { ColorType, TetrisBoard } from "../../shared/tetris/tetris-board";

/**
 * An OCRFrame stores a single RGB frame of a video, and provides methods to extract information from the frame
 * through lazy-loaded properties, such that extractable features are only computed when requested.
 */
export class OCRFrame {

    readonly boardOCRBox: BoardOCRBox;

    private _boardUncolored: TetrisBoard | undefined;

    /**
     * @param frame The singular frame to extract OCR information from
     * @param calibration The calibration data for the frame to use for OCR
     */
    constructor(
        public readonly frame: Frame,
        public readonly calibration: Calibration
    ) {
        this.boardOCRBox = new BoardOCRBox(calibration.rects.board);
    }

    /**
     * Gets the extracted tetris board without color assignment from this frame with lazy loading. Uses
     * block shine to determine if block exists, then uses the mino points to determine the color of the block.
     * 
     * @param loadIfNotLoaded If true, the property will be computed if it has not been loaded yet
     * @returns The extracted tetris board
     */
    getBoardUncolored(loadIfNotLoaded: boolean = true): TetrisBoard | undefined {
        if (loadIfNotLoaded && !this._boardUncolored) {

            // Iterate through each mino on the board and determine the block's color if it exists
            this._boardUncolored = new TetrisBoard();
            for (let point of this._boardUncolored.iterateMinos()) {

                // We use the block shine to determine if a block exists at this point
                const blockShinePosition = this.boardOCRBox.getBlockShine(point);
                const blockShineColor = this.frame.getPixelAt(blockShinePosition);
                if (!blockShineColor) throw new Error(`Block shine color not found at ${blockShinePosition.x}, ${blockShinePosition.y}`);

                if (blockShineColor.average > 130) {
                    // If block shine detected, we use the mino points to determine the color of the block
                    // TODO: Implement color detection
                    this._boardUncolored.setAt(point.x, point.y, ColorType.WHITE);
                } else {
                    // If block shine not detected, no mino exists at this point
                    this._boardUncolored.setAt(point.x, point.y, ColorType.EMPTY);
                }
            }
        }
        return this._boardUncolored;
    }

}