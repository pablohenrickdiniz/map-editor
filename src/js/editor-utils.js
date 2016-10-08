(function(w){
    w.EditorUtils = {
        canvas: null,
        getCanvas: function (width, height) {
            var self = this;
            if (self.canvas === null) {
                self.canvas = document.createElement('canvas');
            }
            self.canvas.width = width;
            self.canvas.height = height;
            return self.canvas;
        },
        isPixelTransparent: function (img, x, y) {
            var self = this;
            if (x >= 0 && y >= 0) {
                var canvas = self.getCanvas(1, 1);
                var ctx = canvas.getContext('2d');

                ctx.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
                var p = ctx.getImageData(0, 0, 1, 1).data;
                return p[3] === undefined || p[3] === 0;
            }

            return true;
        },
        getTrimmedBounds: function (img, bounds) {
            var self = this;
            var width = bounds.dWidth;
            var height = bounds.dHeight;
            var sx = bounds.sx;
            var sy = bounds.sy;
            var canvas = self.getCanvas(width, height);
            var ctx = canvas.getContext('2d');

            ctx.drawImage(img, sx, sy, width, height, 0, 0, width, height);

            var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height), l = pixels.data.length, i,
                bound = {
                    top: null,
                    left: null,
                    right: null,
                    bottom: null
                },
                x, y;

            for (i = 0; i < l; i += 4) {
                if (pixels.data[i + 3] !== 0) {
                    x = (i / 4) % canvas.width;
                    y = ~~((i / 4) / canvas.width);

                    if (bound.top === null) {
                        bound.top = y;
                    }

                    if (bound.left === null) {
                        bound.left = x;
                    } else if (x < bound.left) {
                        bound.left = x;
                    }

                    if (bound.right === null) {
                        bound.right = x;
                    } else if (bound.right < x) {
                        bound.right = x;
                    }

                    if (bound.bottom === null) {
                        bound.bottom = y;
                    } else if (bound.bottom < y) {
                        bound.bottom = y;
                    }
                }
            }

            var trimHeight = bound.bottom - bound.top,
                trimWidth = bound.right - bound.left;


            return {
                x: bound.left,
                y: bound.top,
                width: trimWidth,
                height: trimHeight
            };
        }
    }
})(window);


