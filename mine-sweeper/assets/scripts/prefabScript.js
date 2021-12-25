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
        background: cc.Node,
        _index: 0,
        _isBomb: false,
        _safeList: [],
        _bombCount: 0,
        _isShow: null,
    },

    ctor() {
        this._colorList = [cc.Color.BLUE, cc.Color.RED, cc.Color.GREEN, cc.Color.BLUE, cc.Color.YELLOW, cc.Color.ORANGE, cc.Color.CYAN, cc.Color.MAGENTA, cc.Color.GRAY, cc.Color.RED];
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // this.background.width = this.node.width;
        // this.background.height = this.node.height;
        // cc.log(this.node.width, this.node.height);
        this.node.color = cc.Color.GRAY;
        Emitter.instance.registerEvent('showTile', this._show.bind(this));
    },

    // Display whether this tile is bomb or not else display the number of bomb around it using the data from the Emitter
    _show: function () {
        // cc.log(this.node._contentSize);
        if (this._isShow) return;
        this._isShow = true;
        // if (this._index !== data.index) return;
        // cc.log(`the number of bombs is ${this._bombCount}`);
        if (this._isBomb) this.node.color = cc.Color.RED;
        else if (!this._bombCount) {
            this.node.color = cc.Color.WHITE;
            // cc.log(this._noBombList);
            this._safeList.forEach(element => element.getComponent('prefabScript')._show());
            this._noBombList.forEach(element => element.getComponent('prefabScript')._show());
        } else {
            // cc.log(this.node);
            this.node.color = cc.Color.WHITE;
            // if (this._bombCount === 0) return;
            this.bombNumber.string = this._bombCount;
            this.bombNumber.node.active = true;
            this.bombNumber.node.color = this._colorList[this._bombCount - 1];
        }
    },

    start() {
        // cc.log(this._safeList);
        this._noBombList = this._safeList.filter(element => !element.getComponent('prefabScript')._isBomb && !element.getComponent('prefabScript')._bombCount);
        cc.log(this._noBombList);
        // cc.log(this.node._contentSize);
    },

    // update (dt) {},

    onDestroy() {
        cc.log('event Emitter remove');
        Emitter.instance.removeEvent('showTile', this._show.bind(this));
    }
});
