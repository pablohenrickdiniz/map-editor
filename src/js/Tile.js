'use strict';
(function (root) {
    /**
     *
     * @param options
     * @constructor
     */
    let Tile = function (options) {
        let self = this;
        initialize(self);
        options = options || {};
        self.i = options.i || 0;
        self.j = options.j || 0;
        self.tileset = options.tileset || null;
    };

    /**
     *
     * @returns {*[]}
     */
    Tile.prototype.toJSON = function(){
        let self = this;
        return [
            self.tileset?self.tileset.id:null, //tileset
            self.i,                            //sx
            self.j                             //sy
        ];
    };


    /**
     *
     * @returns {{tileset: (options.id|*|id|SpritesetMap.tilesets.id|Tileset.id|Section.id), sx: (options.sx|*|number), sy: (options.sy|*|number), sWidth: (options.width|*|number), sHeight: (options.height|*|number), dWidth: *, dHeight: *}}
     */
    Tile.prototype.toOBJ = function(){
        let self = this;
        return {
            tileset:self.tileset?self.tileset.id:null,
            sx:self.sx,
            sy:self.sy,
            sWidth:self.width,
            sHeight:self.height
        };
    };

    let initialize = function(self){
        Object.defineProperty(self,'sx',{
            get:function(){
                return self.j*self.tileset.tileWidth;
            }
        });

        Object.defineProperty(self,'sy',{
            get:function(){
                return self.i*self.tileset.tileHeight;
            }
        });

        Object.defineProperty(self,'width',{
            get:function(){
                return self.tileset.tileWidth;
            }
        });

        Object.defineProperty(self,'height',{
            get:function(){
                return self.tileset.tileHeight;
            }
        });
    };

    root.Tile = Tile;
})(window);