"use strict";
cc._RF.push(module, '54c11v5uNpADrXUqtD5IhOL', 'buttonScript');
// scripts/buttonScript.js

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
        _playing: null
    },

    // LIFE-CYCLE CALLBACKS:

    onClickDifficulty: function onClickDifficulty(event, data) {
        // cc.log(data);
        if (this._playing) Emitter.instance.emit('gameStop');
        if (data === 'easy') Emitter.instance.emit('gameStart', { cellNumber: 48, cellSize: 50 });
        if (data === 'medium') Emitter.instance.emit('gameStart', { row: 10, collumn: 6, cellSize: 50 });
        if (data === 'hard') Emitter.instance.emit('gameStart', { row: 18, collumn: 11, cellSize: 25 });

        return;
    },

    onLoad: function onLoad() {
        var _this = this;

        Emitter.instance.registerEvent('playing', function () {
            return _this._playing = true;
        });
        Emitter.instance.registerEvent('notPlaying', function () {
            return _this._playing = false;
        });
    },
    start: function start() {}
}

// update (dt) {},
);

cc._RF.pop();