"use strict";
cc._RF.push(module, '29f13LTnzdLo5v6MNpC2oVn', 'gameBoardScript');
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
        _collumn: 0,
        _tileList: []
    },

    // LIFE-CYCLE CALLBACKS:


    onLoad: function onLoad() {
        var _this = this;

        // for (let i = 0; i < 16; i++) cc.log(i % 4)
        Emitter.instance.registerEvent('gameStart', this._start.bind(this));
        Emitter.instance.registerEvent('gameStop', this._reset.bind(this));
        Emitter.instance.registerEvent('showAll', function () {
            _this._tileList.forEach(function (element) {
                element.getComponent('prefabScript')._show();
                _this.gameBoardScript = element.parent.getComponent('gameBoardScript');
                element.off('mouseenter', _this.gameBoardScript._onEnter, _this);
                element.off('mouseleave', _this.gameBoardScript._onLeave, _this);
            });
        });
        //show all the tile for debug

        cc.log(this.node.children);
    },


    _start: function _start(data) {
        var _this2 = this;

        Emitter.instance.emit('playing');

        this.node.getComponent(cc.Layout).cellSize.height = data.cellSize;
        this.node.getComponent(cc.Layout).cellSize.width = data.cellSize;

        this._collumn = data.collumn;
        // cc.log(this.node.getComponent(cc.Layout).cellSize.height, this.node.getComponent(cc.Layout).cellSize.width);

        for (var index = 0; index < data.row * data.collumn; index++) {
            this.tile = cc.instantiate(this.tilePrefab);
            this.node.addChild(this.tile);
            this.script = this.tile.getComponent('prefabScript');
            this.script.background.height = data.cellSize;
            this.script.background.width = data.cellSize;
            this.script.background.opacity = 0;
            this.tile.name = 'tile ' + index;
            this._tileList.push(this.tile);
            this.script._index = index;
            this.tile.on('mousedown', this._onClick, this.tile);
            this.tile.on('mouseenter', this._onEnter, this.tile);
            this.tile.on('mouseleave', this._onLeave, this.tile);
        }
        for (var i = 0; i < data.row * data.collumn / 2 / 2; i++) {
            this._tileList[Math.floor(Math.random() * (data.row * data.collumn))].getComponent('prefabScript')._isBomb = true;
        }this._tileList.forEach(function (element, index, array) {
            _this2.script = element.getComponent('prefabScript');
            _this2.info = getInfo(_this2._collumn);

            //check the number of bombs in 'this.info'
            _this2.script._bombCount = checkBomb(_this2.info);

            //check the number of safe spot in 'this.info'
            _this2.script._safeList = checkSafe(_this2.info);

            function getInfo(collumn) {
                var info = [];
                info.push(array[index - collumn], //top
                array[index + collumn] //bottom
                );

                //check if this tile at the right border
                // cc.log(index % collumn);
                if (index % collumn !== collumn - 1) {
                    info.push(array[index + 1], //right
                    array[index - collumn + 1], //top-right
                    array[index + collumn + 1] //bottom-right
                    );
                }

                //check if this tile at the left border
                // cc.log(index % (collumn));
                if (index % collumn !== 0) {
                    info.push(array[index - 1], //left
                    array[index - collumn - 1], //top-left
                    array[index + collumn - 1] //bottom-left
                    );
                }
                return info;
            }

            function checkBomb(array) {
                var bombList = array.filter(function (element) {
                    if (element === undefined) return false;
                    return element.getComponent('prefabScript')._isBomb;
                });
                // cc.log(bombList);
                return bombList.length;
            }

            function checkSafe(array) {
                var safeList = array.filter(function (element) {
                    if (element === undefined) return false;
                    return !element.getComponent('prefabScript')._isBomb;
                });
                // cc.log(safeList);
                return safeList;
            }
        });
    },

    _reset: function _reset() {
        Emitter.instance.emit('notPlaying');

        // this._tileList.forEach(element => element.destroy());
        this.node.destroyAllChildren(true);
        cc.log(this.node.children);
        this._tileList = [];
    },

    _onClick: function _onClick() {
        // cc.log(this);
        // Emitter.instance.emit('showTile', { index: this.getComponent('prefabScript')._index });
        this.getComponent('prefabScript').background.opacity = 0;
        this.getComponent('prefabScript')._show();
        this.gameBoardScript = this.parent.getComponent('gameBoardScript');
        this.off('mouseenter', this.gameBoardScript._onEnter, this);
        this.off('mouseleave', this.gameBoardScript._onLeave, this);
    },

    _onEnter: function _onEnter() {
        this.isShow = this.getComponent('prefabScript')._isShow;
        if (this.isShow) {
            this.gameBoardScript = this.parent.getComponent('gameBoardScript');
            this.off('mouseenter', this.gameBoardScript._onEnter, this);
            this.off('mouseleave', this.gameBoardScript._onLeave, this);
            return;
        }
        // this.color = cc.color(167, 167, 167, 255);
        this.getComponent('prefabScript').background.opacity = 255 / 2;
    },

    _onLeave: function _onLeave() {
        this.isShow = this.getComponent('prefabScript')._isShow;
        if (this.isShow) {
            this.gameBoardScript = this.parent.getComponent('gameBoardScript');
            this.off('mouseenter', this.gameBoardScript._onEnter, this);
            this.off('mouseleave', this.gameBoardScript._onLeave, this);
            return;
        }
        // this.color = cc.Color.GRAY;
        this.getComponent('prefabScript').background.opacity = 0;
    },

    start: function start() {}
}

// update (dt) {},
);

cc._RF.pop();