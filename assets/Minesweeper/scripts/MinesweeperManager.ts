import { UITransform } from 'cc';
import { Prefab } from 'cc';
import { Sprite } from 'cc';
import { Color } from 'cc';
import { instantiate } from 'cc';
import { Intersection2D } from 'cc';
import { EventTouch } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { BoxManager } from './BoxManager';
import { Toggle } from 'cc';
import { Layout } from 'cc';
const { ccclass, property } = _decorator;

const NUMS_COL = 20;
const NUMS_ROW = 20;
// const NUMS_MINE = 40;
const NUMS_MINE = 4;
const DIM_COLOR = new Color(100, 100, 100);

@ccclass('MinesweeperManager')
export class MinesweeperManager extends Component {

    @property(Node) table: Node;

    @property(Prefab) boxPrefab: Prefab;
    @property(Toggle) flagToggle: Toggle;
    @property(Node) winScene: Node;

    grid: number[][];
    boxGrid: BoxManager[][];
    isFirstTouch: boolean = true;

    flagCount: number = 0;

    start() {

        this.initGrid();
    }

    initGrid() {
        this.boxGrid = [];
        let index = 0;
        for (let col = 0; col < NUMS_COL; col++) {
            this.boxGrid[col] = [];
            for (let row = 0; row < NUMS_ROW; row++) {
                const box = instantiate(this.boxPrefab);

                this.table.addChild(box);
                box.name += index.toString();
                // box.getComponent(BoxManager).init(0, col, row);
                this.boxGrid[col][row] = box.getComponent(BoxManager);
                index++;
            }
        }
        calculatePaddingLayout(this.table.getComponent(Layout));
        this.table.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    initData(initCol?, initRow?) {
        const grid = generateMinesweeperGrid(NUMS_COL, NUMS_ROW, NUMS_MINE, initCol, initRow);
        this.grid = grid;

        for (let col = 0; col < NUMS_COL; col++) {
            for (let row = 0; row < NUMS_ROW; row++) {
                const box = this.boxGrid[col][row];
                box.init(this.grid[col][row], col, row);
            }
        }
    }

    onTouchEnd(evt: EventTouch) {
        const isUseFlag = this.flagToggle.isChecked;
        const uiPoint = evt.getUILocation();
        let touchedBox: BoxManager;

        for (let i = 0; i < this.table.children.length; i++) {
            const node = this.table.children[i];
            const boundingBox = node.getComponent(UITransform).getBoundingBoxToWorld();
            if (!node.getComponent(BoxManager).isRevealed && boundingBox.contains(uiPoint)) {
                touchedBox = node.getComponent(BoxManager);
                break;
            }
        }
        if (!touchedBox) return;
        if (this.isFirstTouch) {
            this.isFirstTouch = false;
            this.initData(touchedBox.col, touchedBox.row);
            this.revealNeighbors(touchedBox);
            return;
        }

        if (isUseFlag && !touchedBox.isRevealed) {
            touchedBox.setFlag();
            this.flagCount += !touchedBox.isFlagged || touchedBox.isFlagged && touchedBox.isMine ? 1 : -1;

            if (this.flagCount == NUMS_MINE) {
                this.winScene.active = true;
            }

        } else {
            this.revealNeighbors(touchedBox);
        }
    }

    revealNeighbors(box: BoxManager) {
        // console.log("Reveal neighbors of ", box.node.name, box.col, box.row);
        const col = box.col;
        const row = box.row;

        if (box.isRevealed || box.isFlagged) {
            return;
        } else {
            box.reveal();
            if (this.grid[col][row] !== 0) {
                return;
            }
        }

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const c = col + j;
                const r = row + i;
                const isValidBox = r >= 0 && r < NUMS_ROW && c >= 0 && c < NUMS_COL;

                if (isValidBox && this.grid[c][r] !== -1) {
                    this.revealNeighbors(this.boxGrid[c][r]);
                    // if (!this.boxGrid[c][r].isRevealed) this.boxGrid[c][r].reveal();
                }
            }
        }
    }

    onNewGame() {
        this.initData();
        this.isFirstTouch = true;
        this.winScene.active = false;
        this.flagCount = 0;
    }

}

function generateMinesweeperGrid(rows, cols, mines, exCol?, exRow?) {
    const grid = [];
    const excludes = [[exCol, exRow], [exCol + 1, exRow], [exCol - 1, exRow], [exCol, exRow + 1], [exCol, exRow + 1], [exCol + 1, exRow + 1], [exCol - 1, exRow - 1], [exCol - 1, exRow + 1], [exCol + 1, exRow - 1]];
    const mineLocations = [
        ...excludes
    ];

    // Generate an empty grid
    for (let row = 0; row < rows; row++) {
        grid.push(new Array(cols).fill(0));
    }

    // Function to check for mine clusters
    function hasMineCluster(row, col) {
        let clusterCount = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip the current cell
                const r = row + i;
                const c = col + j;
                if (r >= 0 && r < rows && c >= 0 && c < cols && mineLocations.some(([x, y]) => x === r && y === c)) {
                    clusterCount++;
                }
            }
        }
        return clusterCount > 1; // Consider a cluster if more than 1 mine is adjacent
    }

    mines = mines + excludes.length;
    // Place mines with cluster avoidance
    while (mineLocations.length < mines) {
        let attempts = 0;
        while (true) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);

            if (!mineLocations.some(([r, c]) => r === row && c === col) && !hasMineCluster(row, col)) {
                mineLocations.push([row, col]);
                grid[row][col] = -1; // Mark mine locations
                break;
            }

            attempts++;
            if (attempts > 100) { // Prevent infinite loop in rare cases
                break;
            }
        }
    }
    // console.log(mineLocations);

    // Calculate mine counts for each cell
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col] !== -1) {
                let mineCount = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const r = row + i;
                        const c = col + j;
                        if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === -1) {
                            mineCount++;
                        }
                    }
                }
                grid[row][col] = mineCount;
            }
        }
    }

    // excludes.forEach(([exCol, exRow]) => {
    //     grid[exCol][exRow] = 0;
    // });
    if (exCol && exRow) grid[exCol][exRow] = 0;

    return grid;
}

function calculatePaddingLayout(layout: Layout) {

    const cellSize = layout.cellSize.clone();
    const nodeSize = layout.node.getComponent(UITransform).contentSize.clone();

    const padding = nodeSize.width - cellSize.width * layout.constraintNum;
    layout.padding = padding / 2;
}