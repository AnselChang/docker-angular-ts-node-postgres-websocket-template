/*
 A board is represented by a 20x10 grid of cells. A cell can be empty or be filled with one of two color types.
 We can efficiently encode this in 400 bits (20 rows * 10 columns * 2 bits per cell).
*/
export enum ColorType {
    EMPTY = 0,
    PRIMARY = 1,
    SECONDARY = 2,
    WHITE = 3
}

export function getRandomColorType(): ColorType {
    return Math.floor(Math.random() * 3) + 1;
}

export class TetrisBoard {

    // 20 rows, 10 columns
    private grid: ColorType[][] = [];

    // initialize the grid to be empty
    constructor() {
        for (let y = 0; y < 20; y++) {
            this.grid.push([]);
            for (let x = 0; x < 10; x++) {
                this.grid[y].push(ColorType.EMPTY);
            }
        }
    }

    // set the color of a cell at a given row and column
    setAt(x: number, y: number, color: ColorType): void {

        // fail silently if out of bounds
        if (x < 0 || x >= 10 || y < 0 || y >= 20) {
            return;
        }

        this.grid[y][x] = color;
    }

    // get the color of a cell at a given row and column
    getAt(x: number, y: number): ColorType {
        return this.grid[y][x];
    }

    // whether block at (x,y) exists
    exists(x: number, y: number): boolean {

        // out of bounds
        if (x < 0 || x >= 10 || y < 0 || y >= 20) {
            return false;
        }

        return this.getAt(x, y) != ColorType.EMPTY;
    }

    // count the number of tetrominos in the board
    count(): number {
        let count = 0;
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (this.exists(x,y)) count++;
            }
        }
        return count;
    }

    public isRowFull(y: number): boolean {
        return this.grid[y].every(cell => cell !== ColorType.EMPTY);
    }

    // modifies grid in place to delete line clears, and returns the number of lines cleared
    public processLineClears(): number {
        // remove all full rows
        let y = 19;
        let numLinesCleared = 0;
        while (y >= 0) {
            if (this.isRowFull(y)) {
                this.grid.splice(y, 1);
                numLinesCleared++;
            }
            y--;
        }

        // insert new empty rows at the top
        for (let i = 0; i < numLinesCleared; i++) {
            this.grid.unshift(new Array(10).fill(ColorType.EMPTY));
        }

        return numLinesCleared;
    }

    // make a copy of the grid
    copy(): TetrisBoard {
        const grid = new TetrisBoard();

        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                grid.setAt(x, y, this.getAt(x, y));
            }
        }

        return grid;
    }

    equals(other: TetrisBoard): boolean {
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (this.getAt(x, y) !== other.getAt(x, y)) {
                    return false;
                }
            }
        }
        return true;
    }

    // print 20x10 grid with the color numbers
    print() {
        let str = "";
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                str += "" + this.getAt(x,y) + " ";
            }
            str += "\n"
        }
        console.log(str);
    }

}