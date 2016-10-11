(function (root) {
    if (root.Tile == undefined) {
        throw "SpritesetMap requires Tile"
    }

    var Tile = root.Tile;

    var SpritesetMap = function (options) {
        var self = this;
        options = options || {};
        self.width = options.width || 20;
        self.height = options.height || 20;
        self.tileWidth = options.tileWidth || 32;
        self.tileHeight = options.tileHeight || 32;
        self.sprites = [];
        self.tilesets = [];
    };


    /**
     *
     * @param tileset
     */
    SpritesetMap.prototype.addTileset = function(tileset){
        var self = this;
        if(self.tilesets.indexOf(tileset) == -1){
            self.tilesets.push(tileset);
            tileset.id = self.tilesets.length - 1;
        }
    };

    /**
     *
     * @param tileset
     */
    SpritesetMap.prototype.removeTileset = function(tileset){
        var self = this;
        var index = self.tilesets.indexOf(tileset);
        if(index != -1){
            self.tilesets.splice(index,1);
            for(var i = index; i < self.tilesets.length;i++){
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
        var self = this;
        if(self.tilesets[id] != undefined){
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
        var self = this;

        if (tile instanceof Tile) {
            if (self.sprites[i] === undefined) {
                self.sprites[i] = [];
            }

            if(self.sprites[i][j] == undefined){
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
        var self = this;
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
        var self = this;
        if (self.sprites[i] !== undefined && self.sprites[i][j] !== undefined && self.sprites[i][j][k] !== undefined) {
            delete self.sprites[i][j][k];
        }
    };

    /**
     *
     * @returns {*[]}
     */
    SpritesetMap.prototype.toJSON = function(){
        var self = this;
        return [
            self.tilesets, //tilesets
            self.sprites,  //sprites
            self.width,    //width
            self.height,   //height
            self.tileWidth,//tileWidth
            self.tileHeight//tileHeight
        ];
    };



    root.SpritesetMap = SpritesetMap;
})(window);