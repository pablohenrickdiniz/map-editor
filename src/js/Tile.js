(function (root) {
    /**
     *
     * @param options
     * @constructor
     */
    var Tile = function (options) {
        var self = this;
        options = options || {};
        self.image = options.image || '';
        self.sx = options.sx || 0;
        self.sy = options.sy || 0;
        self.width = options.width || 0;
        self.height = options.height || 0;
        self.parent = options.parent || null;
    };

    /**
     *
     * @param x
     * @param y
     * @returns {{dx: (*|number), dy: (*|number), sx: (options.sx|*|number), sy: (options.sy|*|number), sWidth: (options.width|*|number), sHeight: (options.height|*|number), dWidth: *, dHeight: *}}
     */
    Tile.prototype.getBounds = function (x,y) {
        var self = this;
        var bounds = self.toJSON();
        bounds.dx = x = x || 0;
        bounds.dy = y = y || 0;
        return bounds;
    };

    /**
     *
     * @returns {{sx: (options.sx|*|number), sy: (options.sy|*|number), sWidth: (options.width|*|number), sHeight: (options.height|*|number), dWidth: *, dHeight: *}}
     */
    Tile.prototype.toJSON = function(){
        var self = this;
        return {
            sx:self.sx,
            sy:self.sy,
            sWidth:self.width,
            sHeight:self.height,
            dWidth:self.width,
            dHeight:self.height
        };
    };


    root.Tile = Tile;
})(window);