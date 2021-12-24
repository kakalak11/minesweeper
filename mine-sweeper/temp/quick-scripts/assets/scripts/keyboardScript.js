(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/keyboardScript.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '23b65NXOO5LYbYxh+uh0Uy2', 'keyboardScript', __filename);
// scripts/keyboardScript.js

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

var Emitter = require("./mEmitter");

cc.Class({
    extends: cc.Component,

    properties: {},

    ctor: function ctor() {
        this._playing = false;
    },


    // LIFE-CYCLE CALLBACKS:

    onLoad: function onLoad() {
        var _this = this;

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        // cc.log('this is playing state ', this._playing);

        //get set for playing state
        Emitter.instance.registerEvent('playing', function () {
            return _this._playing = true;
        });
        Emitter.instance.registerEvent('notPlaying', function () {
            return _this._playing = false;
        });
    },


    _onKeyDown: function _onKeyDown(event) {
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

    start: function start() {}
}

// update (dt) {},
);

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=keyboardScript.js.map
        