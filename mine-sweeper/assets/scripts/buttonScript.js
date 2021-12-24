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
        _playing: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onClickDifficulty: function (event, data) {
        cc.log(data);
        if (this._playing) Emitter.instance.emit('gameStop');
        if (data === 'easy') Emitter.instance.emit('gameStart', { cellNumber: 48, cellSize: 50 });
        if (data === 'medium') Emitter.instance.emit('gameStart', { cellNumber: 54, cellSize: 50 });
        if (data === 'hard') Emitter.instance.emit('gameStart', { cellNumber: 60, cellSize: 50 });

        return;
    },

    onLoad() {
        Emitter.instance.registerEvent('playing', () => this._playing = true);
        Emitter.instance.registerEvent('notPlaying', () => this._playing = false);
    },

    start() {

    },

    // update (dt) {},
});
