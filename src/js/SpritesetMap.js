'use strict';
(function (root) {
    if (root.Tile === undefined) {
        throw "SpritesetMap requires Tile"
    }

    let Tile = root.Tile;

    /**
     *
     * @param options
     * @constructor
     */
    let SpritesetMap = function (options) {
        let self = this;
        options = options || {};
        self.width = options.width || 20;
        self.height = options.height || 20;
        self.tileWidth = options.tileWidth || 32;
        self.tileHeight = options.tileHeight || 32;
        self.sprites =  options.sprites || [];
        self.tilesets = options.tilesets || [];
    };

    /**
     *
     * @param tileset
     */
    SpritesetMap.prototype.addTileset = function(tileset){
        let self = this;
        if(self.tilesets.indexOf(tileset) === -1){
            self.tilesets.push(tileset);
            tileset.id = self.tilesets.length - 1;
        }
    };

    /**
     *
     * @param tileset
     */
    SpritesetMap.prototype.removeTileset = function(tileset){
        let self = this;
        let index = self.tilesets.indexOf(tileset);
        if(index !== -1){
            self.tilesets.splice(index,1);
            for(let i = index; i < self.tilesets.length;i++){
                self.tilesets[i].id = index;
            }
        }
    };

    /**
     *
     * @param id
     * @returns {*}
     */
    SpritesetMap.prototype.getTileset = function(id){
        let self = this;
        if(self.tilesets[id] !== undefined){
            return self.tilesets[id];
        }
        return null;
    };


    /**
     *
     * @param i
     * @param j
     * @param k
     * @param tile
     * @returns {SpritesetMap}
     */
    SpritesetMap.prototype.set = function (i, j, k, tile) {
        let self = this;

        if (tile instanceof Tile) {
            if (self.sprites[i] === undefined) {
                self.sprites[i] = [];
            }

            if(self.sprites[i][j] === undefined){
                self.sprites[i][j] = [];
            }

            self.sprites[i][j][k] = tile;
        }

        return self;
    };

    /**
     *
     * @param i
     * @param j
     * @param k
     * @returns {*}
     */
    SpritesetMap.prototype.get = function (i, j, k) {
        let self = this;
        if (self.sprites[i] !== undefined && self.sprites[i][j] !== undefined && self.sprites[i][j][k] !== undefined) {
            return self.sprites[i][j][k];
        }

        return null;
    };

    /**
     *
     * @param i
     * @param j
     * @param k
     */
    SpritesetMap.prototype.unset = function (i, j, k) {
        let self = this;
        if (self.sprites[i] !== undefined && self.sprites[i][j] !== undefined && self.sprites[i][j][k] !== undefined) {
            delete self.sprites[i][j][k];
        }
    };

    /**
     *
     * @returns {*[]}
     */
    SpritesetMap.prototype.toJSON = function(){
        let self = this;
        return [
            get_used_tilesets(self.sprites), //tilesets
            self.sprites,  //sprites
            self.width,    //width
            self.height,   //height
            self.tileWidth,//tileWidth
            self.tileHeight//tileHeight
        ];
    };

    /**
     *
     * @param json
     * @returns {SpritesetMap}
     */
    SpritesetMap.fromJSON = function(json){
        let tilesets = json[0];
        let length = tilesets.length;
        let tileset;
        let i;
        let j;
        let k;
        let tile;

        for(i =0; i < length;i++){
            tileset = Tileset.fromJSON(tilesets[i]);
            tileset.id = i;
            tilesets[i] = tileset;
        }


        let sprites = json[1];
        let width = parseFloat(json[2]);
        let height = parseFloat(json[3]);
        let tileWidth = parseFloat(json[4]);
        let tileHeight = parseFloat(json[5]);


        let map = new SpritesetMap({
            width:width,
            height:height,
            tileWidth:tileWidth,
            tileHeight:tileHeight
        });


        for(i in sprites){
            for(j in sprites[i]){
                for(k in sprites[i][j]){
                    let s = sprites[i][j][k];
                    if(s != 0){
                        tileset = tilesets[s[0]];
                        tile = tileset.get(s[1],s[2]);
                        map.set(i,j,k,tile);
                    }
                }
            }
        }

        let used_tilesets = get_used_tilesets(map.sprites);
        while(used_tilesets.length > 0){
            map.addTileset(used_tilesets.pop());
        }

        return map;
    };

    /**
     *
     * @param sprites
     * @returns {Array}
     */
    function get_used_tilesets(sprites){
        let tilesets = [];
        let i;
        let j;
        let k;

        for(i in sprites){
            for(j in sprites[i]){
                for(k in sprites[i][j]){
                    let tile = sprites[i][j][k];
                    if(tile instanceof Tile){
                        let index = tilesets.indexOf(tile.tileset);
                        if(index === -1){
                            tile.tileset.id = tilesets.length;
                            tilesets.push(tile.tileset);
                        }
                    }
                }
            }
        }
        return tilesets;
    }

    root.SpritesetMap = SpritesetMap;
})(window);