"use strict";
cc._RF.push(module, 'ec497tQZJdGar1eXHKPa5PM', 'prefabScript');
// scripts/prefabScript.js

'use strict';

// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var Emitter = require('mEmitter');
cc.Class({
    extends: cc.Component,

    properties: {
        bombNumber: cc.Label,
        _index: 0,
        _isBomb: false,
        _safeList: [],
        _bombCount: 0
    },

    ctor: function ctor() {
        this._colorList = [cc.Color.BLUE, cc.Color.RED, cc.Color.GREEN, cc.Color.BLUE, cc.Color.YELLOW, cc.Color.ORANGE, cc.Color.CYAN, cc.Color.MAGENTA, cc.Color.GRAY, cc.Color.RED];
    },


    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        this.node.color = cc.Color.GRAY;
        this._noBombList = this._safeList.filter(function (element) {
            return !element.getComponent('prefabScript')._isBomb && !element.getComponent('prefabScript')._bombCount;
        });
        Emitter.instance.registerEvent('showTile', this._show.bind(this));
    },


    // Display whether this tile is bomb or not else display the number of bomb around it using the data from the Emitter
    _show: function _show(data) {
        if (this._index !== data.index) return;
        // cc.log(`the number of bombs is ${this._bombCount}`);
        if (this._isBomb) this.node.color = cc.Color.RED;else if (!this._bombCount) {
            this.node.color = cc.Color.WHITE;
            this._noBombList.forEach(function (element) {
                return element.getComponent('prefabScript')._show({ index: element.getComponent('prefabScript')._index });
            });
        } else {
            // cc.log(this.node);
            this.node.color = cc.Color.WHITE;
            if (this._bombCount === 0) return;
            this.bombNumber.string = this._bombCount;
            this.bombNumber.node.active = true;
            this.bombNumber.node.color = this._colorList[this._bombCount - 1];
        }
    },

    start: function start() {},


    // update (dt) {},

    onDestroy: function onDestroy() {
        cc.log('event Emitter remove');
        Emitter.instance.removeEvent('showTile', this._show.bind(this));
    }
});

cc._RF.pop();