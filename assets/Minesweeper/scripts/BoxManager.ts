import { Sprite } from 'cc';
import { SpriteFrame } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BoxManager')
export class BoxManager extends Component {

    @property(SpriteFrame) values: SpriteFrame[] = [];
    @property(SpriteFrame) empty: SpriteFrame;
    @property(SpriteFrame) exploded: SpriteFrame;
    @property(SpriteFrame) flag: SpriteFrame;
    @property(SpriteFrame) mine: SpriteFrame;
    @property(SpriteFrame) unknown: SpriteFrame;

    value: number;
    isEmpty: boolean;
    isMine: boolean;
    isFlagged: boolean;
    isRevealed: boolean;

    col: number = 0;
    row: number = 0;

    _static: Sprite;

    protected start(): void {
        this._static = this.node.getComponent(Sprite);
    }

    init(value, col, row) {
        this.value = value;
        this.col = col;
        this.row = row;
        this.isRevealed = false;
        this.isEmpty = false;
        this.isFlagged = false;
        this.isMine = false;
        this._static.spriteFrame = this.unknown;
    }

    reveal() {
        // console.log(`=== Reveal box of col ${this.col} and row ${this.row} ===`);
        if (this.value == -1) {
            this.isMine = true;
            this._static.spriteFrame = this.mine;
        } else if (this.value == 0) {
            this.isEmpty = true;
            this._static.spriteFrame = this.empty;
        } else {
            this._static.spriteFrame = this.values[this.value - 1];
        }
        this.isRevealed = true;
    }

    setFlag() {
        this.isFlagged = !this.isFlagged;
        this.isMine = this.value == -1
        this._static.spriteFrame = this.isFlagged ? this.flag : this.unknown;
    }

}

