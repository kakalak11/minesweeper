// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const Emitter = require('mEmitter');
cc.Class({
    extends: cc.Component,

    properties: {
        bombNumber: cc.Label,
        _index: 0,
        _isBomb: null,
        _colorList: []
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.color = cc.Color.GRAY;
        this._colorList = [cc.Color.BLUE, cc.Color.RED, cc.Color.GREEN, cc.Color.BLUE, cc.Color.YELLOW, cc.Color.ORANGE, cc.Color.CYAN, cc.Color.MAGENTA, cc.Color.GRAY, cc.Color.RED];
        Emitter.instance.registerEvent('showTile', this._show.bind(this));
    },

    // Display whether this tile is bomb or not else display the number of bomb around it using the data from the Emitter
    _show: function (data) {
        if (data.index !== this._index) return;
        // cc.log(`the data index is ${data.index}, the tile index is ${this._index}`);
        cc.log(`the number of bombs is ${data.bombCount}`);
        if (this._isBomb) this.node.color = cc.Color.RED;
        else {
            this.node.color = cc.Color.WHITE;
            if(data.bombCount === 0) return;
            this.bombNumber.string = data.bombCount;
            this.bombNumber.node.active = true;
            this.bombNumber.node.color = this._colorList[data.bombCount-1];
        }
    },

    start() {
    },

    // update (dt) {},
});
