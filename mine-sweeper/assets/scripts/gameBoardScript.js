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
        tilePrefab: cc.Prefab,
        _collumn: 6,
        _tileList: [],
    },

    // LIFE-CYCLE CALLBACKS:


    onLoad() {
        // for (let i = 0; i < 16; i++) cc.log(i % 4)
        Emitter.instance.registerEvent('gameStart', this._start.bind(this));
        Emitter.instance.registerEvent('gameStop', this._reset.bind(this));

        //show all the tile for debug

        // cc.log(this._collumn);
    },

    _start: function (data) {
        Emitter.instance.emit('playing');

        this.node.getComponent(cc.Layout).cellSize.height = data.cellSize;
        this.node.getComponent(cc.Layout).cellSize.width = data.cellSize;
        this._row = data.cellNumber / 6;
        cc.log(this.node.getComponent(cc.Layout).cellSize.height, this.node.getComponent(cc.Layout).cellSize.width);

        for (let index = 0; index < data.cellNumber; index++) {
            this.tile = cc.instantiate(this.tilePrefab);
            this.script = this.tile.getComponent('prefabScript');
            this.tile.name = `tile ${index}`;
            this.node.addChild(this.tile);
            this._tileList.push(this.tile);
            this.script._index = index;
            this.tile.on('mousedown', this._onClick, this.tile);
        }
        for (let i = 0; i < data.cellNumber / 2 / 2; i++) this._tileList[Math.floor(Math.random() * data.cellNumber)].getComponent('prefabScript')._isBomb = true;

        this._tileList.forEach((element, index, array) => {
            this.collumn = 6;
            this.script = element.getComponent('prefabScript');
            this.info = getInfo(this.collumn);

            //check the number of bombs in 'this.info'
            this.script._bombCount = checkBomb(this.info);

            //check the number of safe spot in 'this.info'
            this.script._safeList = checkSafe(this.info);

            function getInfo(collumn) {
                let info = [];
                info.push(
                    array[index - collumn], //top
                    array[index + collumn], //bottom
                );

                //check if this tile at the right border
                // cc.log(index % (collumn));
                if (index % (collumn) !== (collumn - 1)) {
                    info.push(
                        array[index + 1], //right
                        array[index - collumn - 1], //top-right
                        array[index + collumn + 1], //bottom-right
                    );
                }

                //check if this tile at the left border
                // cc.log(index % (collumn));
                if (index % (collumn) !== 0) {
                    info.push(
                        array[index - 1], //left
                        array[index - collumn + 1], //top-left
                        array[index + collumn - 1], //bottom-left
                    );
                }
                return info;
            }

            function checkBomb(array) {
                let bombList = array.filter(element => {
                    if (element === undefined) return false;
                    return element.getComponent('prefabScript')._isBomb;
                });
                // cc.log(bombList);
                return bombList.length;
            }

            function checkSafe(array) {
                let safeList = array.filter(element => {
                    if (element === undefined) return false;
                    return !element.getComponent('prefabScript')._isBomb;
                });
                // cc.log(safeList);
                return safeList;
            }
        })
    },

    _reset: function () {
        Emitter.instance.emit('notPlaying');

        // this._tileList.forEach(element => element.destroy());
        this.node.destroyAllChildren(true);
        cc.log(this.node.children);
        this._tileList = [];
    },

    _onClick: function (tile) {

        Emitter.instance.emit('showTile');

    },

    start() {

    },

    // update (dt) {},
});
