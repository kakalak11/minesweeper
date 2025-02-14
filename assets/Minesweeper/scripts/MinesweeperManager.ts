import { Size, tween, UIOpacity, UITransform, Vec2 } from 'cc';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { EventTouch } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { BoxManager } from './BoxManager';
import { Toggle } from 'cc';
import { Layout } from 'cc';
import { Label } from 'cc';
const { ccclass, property } = _decorator;


const MINE_DIFF = [10, 20, 40];
const TILE_DIFF = [new Size(64, 64), new Size(48, 48), new Size(32, 32)];

@ccclass('MinesweeperManager')
export class MinesweeperManager extends Component {

    @property(Node) table: Node;

    @property(Prefab) boxPrefab: Prefab;
    @property(Toggle) flagToggle: Toggle;
    @property(Node) winScene: Node;
    @property(Node) loseScene: Node;
    @property(Node) gameIntroScene: Node;

    @property(Label) timeLabel: Label;
    @property(Label) flagLabel: Label;
    @property(Node) difficultyChoosing: Node;

    grid: number[][];
    boxGrid: BoxManager[][];
    isFirstTouch: boolean = true;
    isHoldTouch: boolean;
    touchHoldCallback: (touchedBox: BoxManager) => void;
    _updateTime: () => void;

    flagCount: number = 0;

    NUMS_COL: number = 20;
    NUMS_ROW: number = 20;
    NUMS_MINE: number = 10;
    TILE_SIZE: Size = new Size(48, 48);

    start() {
        // this.initGrid();
        // this.initData();
    }

    initGrid() {
        this.table.getComponent(Layout).cellSize = this.TILE_SIZE;
        const [maxCol, maxRow] = this.calcGrid(this.table.getComponent(Layout));
        this.NUMS_COL = maxCol; this.NUMS_ROW = maxRow;

        console.log(`col ${maxCol} row ${maxRow}`);

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
                box.getComponent(BoxManager).init(0, col, row);
                index++;
            }
        }

        calculatePaddingLayout(this.NUMS_COL, this.NUMS_ROW, this.table.getComponent(Layout));
        this.table.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.table.resumeSystemEvents(true);
    }

    initData(initCol?, initRow?) {
        const grid = generateMinesweeperGrid(this.NUMS_ROW, this.NUMS_COL, this.NUMS_MINE, initCol, initRow);
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
            this.setFlagBox(touchedBox);
        }
        this.touchHoldCallback = null;
        this.isHoldTouch = true;
    }

    onTouchEnd(evt: EventTouch) {
        if (this.isHoldTouch) {
            this.isHoldTouch = false;
            return;
        }
        if (this.touchHoldCallback) {
            this.unschedule(this.touchHoldCallback);
        }
        if (!this.isValidTouch(evt)) return;

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

        if (!touchedBox || touchedBox.isFlagged) return;

        if (this.isFirstTouch) {
            this.isFirstTouch = false;
            this.initData(touchedBox.col, touchedBox.row);
            this.revealNeighbors(touchedBox);
            return;
        }

        if (isUseFlag && !touchedBox.isRevealed) {
            this.setFlagBox(touchedBox);
        } else {
            this.revealNeighbors(touchedBox);
        }
    }

    setFlagBox(box: BoxManager) {
        box.setFlag();
        this.flagCount += !box.isFlagged || box.isFlagged && box.isMine ? 1 : -1;

        if (this.flagCount == this.NUMS_MINE) {
            this.winScene.active = true;
        }
        const countFlag = this.table.getComponentsInChildren(BoxManager).filter(box => box.isFlagged).length;
        this.flagLabel.string = `${countFlag} / ${this.NUMS_MINE}`;
    }

    revealNeighbors(box: BoxManager) {
        // console.log("Reveal neighbors of ", box.node.name, box.col, box.row);
        const col = box.col;
        const row = box.row;

        if (box.isRevealed || box.isFlagged) {
            return;
        } else {
            box.reveal();
            if (box.isMine) {
                this.loseGame();
            }
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

    loseGame() {
        this.revealAllMines();
    }

    revealAllMines() {
        this.table.pauseSystemEvents(true);

        let tweenRevealAllMines = tween(this);

        this.table.getComponentsInChildren(BoxManager)
            .filter(box => !box.isRevealed && box.value == -1)
            .forEach(box => {
                tweenRevealAllMines
                    .delay(0.2)
                    .call(() => {
                        box.revealMine();
                    });
            });

        tweenRevealAllMines
            .call(() => {
                this.loseScene.active = true;
                const uiOpacity = this.loseScene.getComponent(UIOpacity);
                uiOpacity.opacity = 0;

                tween(uiOpacity)
                    .to(0.3, { opacity: 255 })
                    .start()
            })
            .start();
    }

    onNewGame() {
        const diffIndex = this.difficultyChoosing.getComponentsInChildren(Toggle).findIndex(toggle => toggle.isChecked);
        this.NUMS_MINE = MINE_DIFF[diffIndex];
        this.TILE_SIZE = TILE_DIFF[diffIndex];

        this.initGrid();
        this.table.off(Node.EventType.TOUCH_START);
        this.isFirstTouch = true;
        this.winScene.active = false;
        this.loseScene.active = false;
        this.gameIntroScene.active = false;
        this.flagCount = 0;
        this.flagLabel.string = `0 / ${this.NUMS_MINE}`;
        this.startTimer();
    }

    startTimer() {
        let seconds = 0;
        let minutes = 0;

        this._updateTime = () => {
            seconds++;
            if (seconds >= 60) {
                seconds = 0;
                minutes++;
            }
            this.timeLabel.string = `${minutes >= 10 ? "" : "0"}${minutes}:${seconds >= 10 ? "" : "0"}${seconds}`;
        }

        this.schedule(this._updateTime, 1);
    }

    calcGrid(layout: Layout) {
        const nodeTrans = layout.node.getComponent(UITransform);

        const maxCol = Math.floor(nodeTrans.width / this.TILE_SIZE.width) - 1;
        const maxRow = Math.floor(nodeTrans.height / this.TILE_SIZE.height) - 1;

        return [maxCol, maxRow];
    }

    isValidTouch(evt: EventTouch) {
        const deltaVec = evt.getUIStartLocation().subtract(evt.getUILocation());

        return Math.abs(deltaVec.x) < this.TILE_SIZE.width / 2 && Math.abs(deltaVec.y) < this.TILE_SIZE.height / 2;
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