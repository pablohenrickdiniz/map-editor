'use strict';
(function(w){
    w.EditorUtils = {
        canvas: null,
        /**
         *
         * @param width
         * @param height
         * @returns {HTMLCanvasElement | *}
         */
        getCanvas: function (width, height) {
            let self = this;
            if (self.canvas === null) {
                self.canvas = document.createElement('canvas');
            }
            self.canvas.width = width;
            self.canvas.height = height;
            return self.canvas;
        },
        /**
         *
         * @param img
         * @param x
         * @param y
         * @returns {boolean}
         */
        isPixelTransparent: function (img, x, y) {
            let self = this;
            if (x >= 0 && y >= 0) {
                let canvas = self.getCanvas(1, 1);
                let ctx = canvas.getContext('2d');

                ctx.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
                let p = ctx.getImageData(0, 0, 1, 1).data;
                return p[3] === undefined || p[3] === 0;
            }

            return true;
        },
        /**
         *
         * @param img
         * @param bounds
         * @returns {{x: number, y: number, width: number, height: number}}
         */
        getTrimmedBounds: function (img, bounds) {
            let self = this;
            let width = bounds.dWidth;
            let height = bounds.dHeight;
            let sx = bounds.sx;
            let sy = bounds.sy;
            let canvas = self.getCanvas(width, height);
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, sx, sy, width, height, 0, 0, width, height);
            let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height), l = pixels.data.length, i,
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

            let trimHeight = bound.bottom - bound.top,
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


