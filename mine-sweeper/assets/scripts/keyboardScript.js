// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const Emitter = require("./mEmitter");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    ctor() {
        this._playing = false;
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        // cc.log('this is playing state ', this._playing);

        //get set for playing state
        Emitter.instance.registerEvent('playing', () => this._playing = true);
        Emitter.instance.registerEvent('notPlaying', () => this._playing = false);
    },

    _onKeyDown: function (event) {
        //we can add different game start command to test 3 mode of gameplay
        switch (event.keyCode) {
            //easy
            case cc.macro.KEY.x:
                Emitter.instance.emit('gameStart', { cellNumber: 48, cellSize: 50 });
                break;
            //medium
            case cc.macro.KEY.c:
                Emitter.instance.emit('gameStart', { cellNumber: 54, cellSize: 50 });
                break;
            //hard
            case cc.macro.KEY.v:
                Emitter.instance.emit('gameStart', { cellNumber: 60, cellSize: 50 });
                break;
            //reset
            case cc.macro.KEY.b:
                if (this._playing) {
                    Emitter.instance.emit('gameStop');
                    // return;
                }
                break;
            case cc.macro.KEY.s:
                Emitter.instance.emit('showAll');
                break;

        }
    },

    start() {

    },

    // update (dt) {},
});
