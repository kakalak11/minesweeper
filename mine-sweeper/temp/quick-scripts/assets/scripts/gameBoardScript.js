(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/gameBoardScript.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '29f13LTnzdLo5v6MNpC2oVn', 'gameBoardScript', __filename);
// scripts/gameBoardScript.js

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
        tilePrefab: cc.Prefab,
        _gridSize: 3,
        _tileList: []
    },

    // LIFE-CYCLE CALLBACKS:


    onLoad: function onLoad() {
        this._setupGrid(this._gridSize * this._gridSize);

        // for (let i = 0; i < 16; i++) cc.log(i % 4)
    },


    _setupGrid: function _setupGrid(tilesNumber) {
        for (var index = 0; index < tilesNumber; index++) {
            this.tile = cc.instantiate(this.tilePrefab);
            this.script = this.tile.getComponent('prefabScript');
            this.tile.name = 'tile ' + index;
            this.node.addChild(this.tile);
            this._tileList.push(this.tile);
            this.script._index = index;
            this.tile.on('mousedown', this._onClick, this.tile);
        }
        this._tileList[Math.floor(Math.random() * 9)].getComponent('prefabScript')._isBomb = true;
        this._tileList[Math.floor(Math.random() * 9)].getComponent('prefabScript')._isBomb = true;
    },

    _onClick: function _onClick() {
        this.list = this.parent.getComponent('gameBoardScript')._tileList;
        this.gridSize = this.parent.getComponent('gameBoardScript')._gridSize;
        this.index = this.getComponent('prefabScript')._index;
        // cc.log(this.index);
        this.info = [];
        this.info.push(this.list[this.index - this.gridSize], //top
        this.list[this.index + this.gridSize] //bottom
        );

        //check if this tile at the right border
        // cc.log(this.index % (this.gridSize))
        if (this.index % this.gridSize !== this.gridSize - 1) {
            this.info.push(this.list[this.index + 1], //right
            this.list[this.index - this.gridSize - 1], //top-right
            this.list[this.index + this.gridSize + 1] //bottom-right
            );
        }

        //check if this tile at the left border
        // cc.log(this.index % (this.gridSize))
        if (this.index % this.gridSize !== 0) {
            this.info.push(this.list[this.index - 1], //left
            this.list[this.index - this.gridSize + 1], //top-left
            this.list[this.index + this.gridSize - 1] //bottom-left
            );
        }

        //check the number of bombs in 'this.info'
        this.bombCount = checkBomb(this.info);

        //emit the information about the tiles around this tile.
        Emitter.instance.emit('showTile', { index: this.index, bombCount: this.bombCount });

        function checkBomb(array) {
            var bombList = array.filter(function (element) {
                if (element === undefined) return false;
                return element.getComponent('prefabScript')._isBomb;
            });
            cc.log(bombList);
            return bombList.length;
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
        //# sourceMappingURL=gameBoardScript.js.map
        