import { Size, UITransform } from 'cc';
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


const NUMS_MINE = 40;
// const NUMS_MINE = 4;
const TILE_SIZE = new Size(48, 48);
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
    isHoldTouch: boolean;
    touchHoldCallback: (touchedBox: BoxManager) => void;

    flagCount: number = 0;

    NUMS_COL: number = 20;
    NUMS_ROW: number = 20;

    start() {
        this.initGrid();
        // this.initData();
    }

    initGrid() {
        this.table.getComponent(Layout).cellSize = TILE_SIZE;
        const [maxCol, maxRow] = calcGrid(this.table.getComponent(Layout));
        this.NUMS_COL = maxCol; this.NUMS_ROW = maxRow;

        this.boxGrid = [];
        let index = 0;
        this.table.destroyAllChildren();
        for (let col = 0; col < this.NUMS_COL; col++) {
            this.boxGrid[col] = [];
            for (let row = 0; row < this.NUMS_ROW; row++) {
                const box = instantiate(this.boxPrefab);

                this.table.addChild(box);
                box.name += index.toString();
                this.boxGrid[col][row] = box.getComponent(BoxManager);
                index++;
            }
        }

        calculatePaddingLayout(this.NUMS_COL, this.NUMS_ROW, this.table.getComponent(Layout));
        this.table.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    initData(initCol?, initRow?) {
        const grid = generateMinesweeperGrid(this.NUMS_ROW, this.NUMS_COL, NUMS_MINE, initCol, initRow);
        this.grid = grid;

        for (let col = 0; col < this.NUMS_COL; col++) {
            for (let row = 0; row < this.NUMS_ROW; row++) {
                const box = this.boxGrid[col][row];
                box.init(this.grid[col][row], col, row);
            }
        }
        this.table.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart(evt: EventTouch) {
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

        if (touchedBox) {
            this.touchHoldCallback = this.onTouchHold.bind(this, touchedBox);
            this.scheduleOnce(this.touchHoldCallback, 0.2);
        }

    }

    onTouchHold(touchedBox: BoxManager) {
        if (touchedBox && !touchedBox.isRevealed) {
            touchedBox.setFlag();
            this.flagCount += !touchedBox.isFlagged || touchedBox.isFlagged && touchedBox.isMine ? 1 : -1;

            if (this.flagCount == NUMS_MINE) {
                this.winScene.active = true;
            }
        }
        this.touchHoldCallback = null;
        this.isHoldTouch = true;
    }

    onTouchEnd(evt: EventTouch) {
        if (this.isHoldTouch) {
            this.isHoldTouch = false;
            return;
        }
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
        if (this.touchHoldCallback) {
            this.unschedule(this.touchHoldCallback);
        }

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
                const isValidBox = r >= 0 && r < this.NUMS_ROW && c >= 0 && c < this.NUMS_COL;

                if (isValidBox && this.grid[c][r] !== -1) {
                    this.revealNeighbors(this.boxGrid[c][r]);
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
    for (let col = 0; col < cols; col++) {
        grid.push(new Array(rows).fill(0));
    }

    // Function to check for mine clusters
    function hasMineCluster(row, col) {
        let clusterCount = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue; // Skip the current cell
                const r = row + i;
                const c = col + j;
                if (r >= 0 && r < rows && c >= 0 && c < cols && mineLocations.some(([x, y]) => x === c && y === r)) {
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

            if (!mineLocations.some(([c, r]) => r === row && c === col) && !hasMineCluster(row, col)) {
                mineLocations.push([col, row]);
                grid[col][row] = -1; // Mark mine locations
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
    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            if (grid[col][row] !== -1) {
                let mineCount = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const r = row + i;
                        const c = col + j;
                        if (r >= 0 && r < rows && c >= 0 && c < cols && grid[c][r] === -1) {
                            mineCount++;
                        }
                    }
                }
                grid[col][row] = mineCount;
            }
        }
    }
    if (exCol && exRow) grid[exCol][exRow] = 0;

    return grid;
}

function calculatePaddingLayout(col, row, layout: Layout) {

    const cellSize = layout.cellSize.clone();
    const nodeSize = layout.node.getComponent(UITransform).contentSize.clone();

    const paddingLeftRight = Math.floor((nodeSize.width - cellSize.width * col) / 2);
    const paddingTopBot = Math.floor((nodeSize.height - cellSize.height * row) / 2);

    console.log("paddingLeftRight ", paddingLeftRight, "paddingTopBot ", paddingTopBot);

    // layout.paddingTop = paddingLeftRight; layout.paddingBottom = 0;
    layout.paddingBottom = paddingTopBot, layout.paddingTop = paddingTopBot;
    layout.paddingLeft = paddingLeftRight, layout.paddingRight = paddingLeftRight;

}

function calcGrid(layout: Layout) {
    const nodeTrans = layout.node.getComponent(UITransform);

    const maxCol = Math.floor(nodeTrans.width / TILE_SIZE.width) - 1;
    const maxRow = Math.floor(nodeTrans.height / TILE_SIZE.height) - 1;

    return [maxCol, maxRow];
}