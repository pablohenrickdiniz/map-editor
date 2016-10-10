(function (w) {
    if (w.CE == undefined) {
        throw "MapEditor requires CanvasEngine";
    }

    if (w.CanvasEngineGrid == undefined) {
        throw "MapEditor requires CanvasEngineGrid";
    }

    if (w.AbstractGrid == undefined) {
        throw "MapEditor requires AbstractGrid";
    }

    if (w.SpritesetMap == undefined) {
        throw "MapEditor requires Map";
    }

    if (w.ImageLoader == undefined) {
        throw "MapEditor requires ImageLoader";
    }

    if (w.EditorUtils == undefined) {
        throw "MapEditor requires EditorUtils";
    }

    if (w.GridLayer == undefined) {
        throw "MapEditor requires GridLayer";
    }


    var img_types = [
        'image/png',
        'image/jpeg',
        'image/gif'
    ];

    /**
     *
     * @constructor
     */
    var MapEditor = function () {
        var self = this;
        initialize(self);
        self.map = null;
        self.mapCanvas = null;
        self.mapCanvasMouse = null;
        self.tilesetCanvas = null;
        self.tilesetLayer = null;
        self.selectedInterval = null;
        self.collisionLayer = null;
        self.layers = [];
        self.history = [];

        self.grid = {
            active: true
        };

        self.tileset = {
            gridColor: '#FFFFFF',
            rows: 1,
            cols: 1,
            image: null
        };

        self.selectedTool = 'pencil';
        self.modalVisible = false;
        self.loaded = false;
        self.selectedEvent = null;
        self.tilesetInput = null;
        self.map_width_input = null;
        self.map_height_input = null;
        self.tileset_rows_input = null;
        self.tileset_cols_input = null;
        self.layer_input = null;
        self.export_button = null;
        self.save_button = null;
        self.eraser_radio = null;
        self.pencil_radio = null;
        self.eyedropper_radio = null;
        self.collision_radio = null;
        self.map_radio = null;
        self.layer_checkbox = null;
        self.grid_checkbox = null;

        self.tilesetInputCallback = function () {
            if (this.files.length > 0) {
                if (img_types.indexOf(this.files[0].type) != -1) {
                    var url = URL.createObjectURL(this.files[0]);
                    self.changeTileset(url);
                }
            }
        };

        self.map_width_input_callback = function () {
            var input = this;
            var value = parseInt(input.value);
            value = isNaN(value) || value < 5 ? 5 : value > 500 ? 500 : value;
            input.value = value;
            self.mapWidth = value;
        };

        self.map_height_input_callback = function () {
            var input = this;
            var value = parseInt(input.value);
            value = isNaN(value) || value < 5 ? 5 : value > 500 ? 500 : value;
            input.value = value;
            self.mapHeight = value;
        };

        self.tileset_rows_callback = function () {
            var input = this;
            var value = parseInt(input.value);
            value = isNaN(value) || value < 1 ? 1 : value > 1000 ? 1000 : value;
            self.changeRows(value);
        };

        self.tileset_cols_callback = function () {
            var input = this;
            var value = parseInt(input.value);
            value = isNaN(value) || value < 1 ? 1 : value > 1000 ? 1000 : value;
            self.changeCols(value);
        };

        self.layer_input_callback = function () {
            var input = this;
            var value = parseInt(input.value);
            value = isNaN(value) || value < 1 ? 1 : value > 10 ? 10 : value;
            self.currentLayer = value - 1;
        };

        self.layer_checkbox_callback = function () {
            var input = this;
            var checked = input.checked;
            if (checked) {
                self.showLayers();
            }
        };

        self.grid_checkbox_callback = function () {
            var input = this;
            var checked = input.checked;
            if (checked) {
                self.showGrid();
            }
            else {
                self.hideGrid();
            }
        };

        self.tool_callback = function () {
            self.selectTool(this.value);
        };

        self.export_callback = function () {
            self.export();
        };

        self.save_callback = function () {
            self.save();
        };

        self.collision_callback = function () {
            self.mode = this.value;
        };
    };

    MapEditor.prototype.initialize = function () {
        var self = this;
        initialize_tileset(self);
        initialize_map(self);
        initialize_collision_layer(self);
    };

    /**
     *
     * @param button
     */
    MapEditor.prototype.setExportButton = function (button) {
        if (button.tagName == 'BUTTON') {
            var self = this;
            if (self.export_button !== null) {
                self.export_button.removeEventListener("click", self.export_callback);
            }
            self.export_button = button;
            self.export_button.addEventListener("click", self.export_callback);
        }
    };

    /**
     *
     * @param input
     */
    MapEditor.prototype.setMapHeightInput = function (input) {
        if (input.tagName == 'INPUT' && input.getAttribute('type') == 'number') {
            var self = this;
            if (self.map_height_input !== null) {
                self.map_height_input.removeEventListener("change", self.map_height_input_callback);
            }
            self.map_height_input = input;
            self.map_height_input.addEventListener("change", self.map_height_input_callback);
        }
    };

    /**
     *
     * @param input
     */
    MapEditor.prototype.setMapWidthInput = function (input) {
        if (input.tagName == 'INPUT' && input.getAttribute('type') == 'number') {
            var self = this;
            if (self.map_width_input !== null) {
                self.map_width_input.removeEventListener("change", self.map_width_input_callback);
            }
            self.map_width_input = input;
            self.map_width_input.addEventListener("change", self.map_width_input_callback);
        }
    };

    /**
     *
     * @param input
     */
    MapEditor.prototype.setTilesetImageInput = function (input) {
        if (input.tagName == 'INPUT' && input.getAttribute('type') == 'file') {
            var self = this;
            if (self.tilesetInput !== null) {
                self.tilesetInput.removeEventListener("change", self.tilesetInputCallback);
            }
            self.tilesetInput = input;
            self.tilesetInput.addEventListener("change", self.tilesetInputCallback);
        }
    };

    /**
     *
     * @param input
     */
    MapEditor.prototype.setTilesetRowsInput = function (input) {
        if (input.tagName == 'INPUT' && input.getAttribute('type') == 'number') {
            var self = this;
            if (self.tileset_rows_input !== null) {
                self.tileset_rows_input.removeEventListener("change", self.tileset_rows_callback);
            }
            self.tileset_rows_input = input;
            self.tileset_rows_input.addEventListener("change", self.tileset_rows_callback);
        }
    };

    /**
     *
     * @param input
     */
    MapEditor.prototype.setTilesetColsInput = function (input) {
        if (input.tagName == 'INPUT' && input.getAttribute('type') == 'number') {
            var self = this;
            if (self.tileset_cols_input !== null) {
                self.tileset_cols_input.removeEventListener("change", self.tileset_cols_callback);
            }
            self.tileset_cols_input = input;
            self.tileset_cols_input.addEventListener("change", self.tileset_cols_callback);
        }
    };

    /**
     *
     * @param input
     */
    MapEditor.prototype.setLayerInput = function (input) {
        if (input.tagName == 'SELECT' || (input.tagName == 'INPUT' && input.getAttribute('type') == 'number')) {
            var self = this;
            if (self.layer_input !== null) {
                self.layer_input.removeEventListener("change", self.layer_input_callback);
            }
            self.layer_input = input;
            self.layer_input.addEventListener("change", self.layer_input_callback);
        }
    };

    /**
     *
     * @param radio
     */
    MapEditor.prototype.setPencilRadio = function (radio) {
        if (radio.tagName == 'INPUT' && radio.getAttribute('type') == 'radio') {
            var self = this;
            if (self.pencil_radio !== null) {
                self.pencil_radio.removeEventListener("change", self.tool_callback);
            }
            self.pencil_radio = radio;
            self.pencil_radio.addEventListener("change", self.tool_callback);
        }
    };

    /**
     *
     * @param radio
     */
    MapEditor.prototype.setEraserRadio = function (radio) {
        if (radio.tagName == 'INPUT' && radio.getAttribute('type') == 'radio') {
            var self = this;
            if (self.eraser_radio !== null) {
                self.eraser_radio.removeEventListener("change", self.tool_callback);
            }
            self.eraser_radio = radio;
            self.eraser_radio.addEventListener("change", self.tool_callback);
        }
    };


    /**
     *
     * @param radio
     */
    MapEditor.prototype.setEyedropperRadio = function (radio) {
        if (radio.tagName == 'INPUT' && radio.getAttribute('type') == 'radio') {
            var self = this;
            if (self.eyedropper_radio !== null) {
                self.eyedropper_radio.removeEventListener("change", self.tool_callback);
            }
            self.eyedropper_radio = radio;
            self.eyedropper_radio.addEventListener("change", self.tool_callback);
        }
    };

    /**
     *
     * @param radio
     */
    MapEditor.prototype.setcollisionRadio = function (radio) {
        if (radio.tagName == 'INPUT' && radio.getAttribute('type') == 'radio') {
            var self = this;
            if (self.collision_radio !== null) {
                self.collision_radio.removeEventListener("change", self.collision_callback);
            }
            self.collision_radio = radio;
            self.collision_radio.addEventListener("change", self.collision_callback);
        }
    };

    /**
     *
     * @param radio
     */
    MapEditor.prototype.setMapRadio = function (radio) {
        if (radio.tagName == 'INPUT' && radio.getAttribute('type') == 'radio') {
            var self = this;
            if (self.map_radio !== null) {
                self.map_radio.removeEventListener("change", self.collision_callback);
            }
            self.map_radio = radio;
            self.map_radio.addEventListener("change", self.collision_callback);
        }
    };

    /**
     *
     * @param button
     */
    MapEditor.prototype.setSaveButton = function (button) {
        if (button.tagName == 'BUTTON') {
            var self = this;
            if (self.save_button !== null) {
                self.save_button.removeEventListener("click", self.save_callback);
            }
            self.save_button = button;
            self.save_button.addEventListener("click", self.save_callback);
        }
    };

    /**
     *
     * @param input
     */
    MapEditor.prototype.setLayerCheckbox = function (input) {
        if (input.tagName == 'INPUT' && input.getAttribute('type') == 'checkbox') {
            var self = this;
            if (self.layer_checkbox !== null) {
                self.layer_checkbox.removeEventListener("change", self.layer_checkbox_callback);
            }
            self.layer_checkbox = input;
            self.layer_checkbox.addEventListener("change", self.layer_checkbox_callback);
        }
    };

    /**
     *
     * @param input
     */
    MapEditor.prototype.setGridCheckbox = function (input) {
        if (input.tagName == 'INPUT' && input.getAttribute('type') == 'checkbox') {
            var self = this;
            if (self.grid_checkbox !== null) {
                self.grid_checkbox.removeEventListener("change", self.grid_checkbox_callback);
            }
            self.grid_checkbox = input;
            self.grid_checkbox.addEventListener("change", self.grid_checkbox_callback);
        }
    };


    /**
     *
     * @param tileset
     */
    MapEditor.prototype.changeTileset = function (tileset) {
        var self = this;
        ImageLoader.load(tileset, 0, {
            onsuccess: function (img, id) {
                self.tileset.image = img;
                var tileset_canvas = self.getTilesetCanvas();
                var tileset_grid_layer = tileset_canvas.getGridLayer();
                tileset_grid_layer.grid.width = img.width;
                tileset_grid_layer.grid.height = img.height;
                tileset_grid_layer.grid.sw = img.width;
                tileset_grid_layer.grid.sh = img.height;

                var rows = Math.floor(img.height / 32);
                var cols = Math.floor(img.width / 32);
                rows = rows < 1 ? 1 : rows;
                cols = cols < 1 ? 1 : cols;
                self.changeRows(rows);
                self.changeCols(cols);

                tileset_canvas.viewX = 0;
                tileset_canvas.viewY = 0;


                tileset_grid_layer.refresh();
                self.tilesetLayer.clear().drawImage(img, 0, 0);
            }
        });
    };

    /**
     *
     * @param data
     * @returns {Window.SpritesetMap}
     */
    MapEditor.parseMap = function (data) {
        var tileWidth = data.tileWidth || 32;
        var tileHeight = data.tileHeight || 32;
        var spriteset_map = new SpritesetMap({
            tileWidth: tileWidth,
            tileHeight: tileHeight
        });

        var tilesets = data.tilesets || [];
        var sprites = data.sprites || [];
        var tile_fields = [
            'image',
            'dWidth',
            'dHeight',
            'sWidth',
            'sHeight',
            'sx',
            'sy',
            'dx',
            'dy',
            'layer'
        ];

        ImageLoader.loadAll(tilesets, 0, function (tilesets) {
            for (var i in sprites) {
                for (var j in sprites[i]) {
                    for (var k in sprites[i][j]) {
                        var tile = sprites[i][j][k];
                        if (tile) {
                            var newtile = {};
                            tile_fields.forEach(function (name, index) {
                                if (tile[index] !== undefined) {
                                    newtile[name] = tile[index];
                                }
                            });

                            spriteset_map.set(i, j, k, newtile);
                        }
                        else {
                            spriteset_map.unset(i, j, k);
                        }
                    }
                }
            }
        });
        return spriteset_map;
    };

    /**
     *
     * @param spriteset_map
     */
    MapEditor.prototype.loadMap = function (spriteset_map) {
        var self = this;
        self.mapWidth = spriteset_map.width;
        self.mapHeight = spriteset_map.height;
        self.getTilesetCanvas().getGridLayer().refresh();
    };

    /**
     *
     * @param map
     * @param callback
     */
    MapEditor.prototype.mapAsObject = function (map, callback) {
        var sprites = [];
        var tilesets = [];

        for (var i in map.sprites) {
            for (var j in map.sprites[i]) {
                for (var k in map.sprites[i][j]) {
                    if (sprites[i] === undefined) {
                        sprites[i] = [];
                    }

                    if (sprites[i][j] === undefined) {
                        sprites[i][j] = [];
                    }

                    var tile = map.sprites[i][j][k];
                    if (tile !== null) {
                        var src = tile.image.src;
                        var id = tilesets.indexOf(src);
                        if (id === -1) {
                            tilesets.push(src);
                            id = tilesets.length - 1;
                        }

                        sprites[i][j][k] =  [
                            id,
                            tile.dWidth,
                            tile.dHeight,
                            tile.sWidth,
                            tile.sHeight,
                            tile.sx,
                            tile.sy,
                            tile.dx,
                            tile.dy,
                            tile.layer
                        ];
                    }
                }
            }
        }

        callback({
            tilesets: tilesets,
            width: map.width,
            height: map.height,
            tileWidth: map.tileWidth,
            tileHeight: map.tileHeight,
            sprites: sprites
        });
    };

    /**
     *
     * @param name
     * @param val
     */
    MapEditor.prototype.changeSize = function (name, val) {
        var self = this;
        var dim_a = '';
        var dim_b = '';
        var dim_c = '';
        if (name == 'rows') {
            dim_a = 'height';
            dim_b = 'h';
            dim_c = 'Height';
        }
        else if (name == 'cols') {
            dim_a = 'width';
            dim_b = 'w';
            dim_c = 'Width';
        }
        else {
            return;
        }

        var image = self.tileset.image;
        self.tileset[name] = val;
        self['tileset_' + name + '_input'].value = val;
        if (image !== null) {
            var map = self.map;
            var layer = self.getTilesetCanvas().getGridLayer();
            var layer2 = self.getMapCanvas().getGridLayer();
            var size = image[dim_a] / val;
            map['tile' + dim_c] = size;
            var options = {};
            options['s' + dim_b] = size;
            for (var prop in options) {
                layer.grid[prop] = options[prop];
                layer2.grid[prop] = options[prop];
            }

            layer.refresh();
            layer2.refresh();
        }
    };

    /**
     *
     * @param val
     */
    MapEditor.prototype.changeRows = function (val) {
        var self = this;
        self.changeSize('rows', val);
    };

    /**
     *
     * @param val
     */
    MapEditor.prototype.changeCols = function (val) {
        var self = this;
        self.changeSize('cols', val);
    };


    /**
     *
     */
    MapEditor.prototype.export = function () {
        var self = this;
        self.mapAsObject(self.map, function (data) {
            var json = JSON.stringify(data);
            var blob = new Blob([json], {type: "octet/stream"});
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = 'map.json';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };

    /**
     *
     * @returns {null|*}
     */
    MapEditor.prototype.getMapCanvas = function () {
        var self = this;
        if (self.mapCanvas === null) {
            var container = document.getElementById('canvas-map');
            self.mapCanvas = new CanvasEngineGrid(container, {
                width: 600,
                height: 500,
                draggable: true,
                selectable: true
            });

            var reader = self.mapCanvas.getMouseReader();


            reader.addEventListener('mousedown', function (x, y) {
                if (reader.left) {
                    var mapCanvas = self.getMapCanvas();
                    var map = self.map;
                    var pos = get_position(mapCanvas, {x: x, y: y});
                    var i = Math.floor(pos.y / map.tileHeight);
                    var j = Math.floor(pos.x / map.tileWidth);
                    if (i < map.height && j < map.width) {
                        switch (self.mode) {
                            case 'map':
                                var layer = self.layers[self.currentLayer];
                                var tile = {
                                    width: map.tileWidth,
                                    height: map.tileHeight
                                };

                                switch (self.selectedTool) {
                                    case 'pencil':
                                        if (self.selectedInterval !== null) {
                                            if (self.selectedInterval.type === 'eyedropper') {
                                                tile = Clone(self.selectedInterval);
                                                self.drawEyedropper(tile, i, j);
                                            }
                                            else {
                                                var interval = self.selectedInterval;
                                                self.drawTileMap(i, j, interval.si, interval.sj);
                                            }
                                        }
                                        break;
                                    case 'eraser':
                                        self.deleteTile(i, j);
                                        break;
                                    case 'eyedropper':
                                        tile = map.get(i, j, self.currentLayer);
                                        if (tile != null) {
                                            tile = Clone(tile);
                                            tile.type = 'eyedropper';
                                            self.selectedInterval = tile;
                                        }
                                }
                                break;
                        }
                    }
                }
            });

            self.mapCanvas.addEventListener('viewChange', function (x, y) {
                var grid_layer = self.getMapCanvas().getGridLayer();
                draw_map(self);
                grid_layer.refresh();
                var element = document.getElementById('view');
                x = Math.abs(x);
                y = Math.abs(y);
                element.innerHTML = x + ',' + y;
            });

            reader.addEventListener('mousemove', function (x, y) {
                var reader = this;
                /*start hover square*/
                var mapCanvas = self.getMapCanvas();
                var pos = get_position(mapCanvas, {
                    x: x,
                    y: y
                });

                var element = document.getElementById('mouse');
                element.innerHTML = x + ',' + y;


                /*end hover square*/
                switch (self.mode) {
                    case 'map':
                        if (reader.left) {
                            switch (self.selectedTool) {
                                case 'pencil':
                                    self.drawTile();
                                    break;
                                case 'eraser':
                                    var area_interval = get_area_interval({x: pos.x, y: pos.y, width: 1, height: 1});
                                    var i, j;
                                    for (i = area_interval.si; i < area_interval.ei; i++) {
                                        for (j = area_interval.sj; j < area_interval.ej; j++) {
                                            self.deleteTile(i, j);
                                        }
                                    }
                            }
                        }
                        break;
                }
            });
        }
        return self.mapCanvas;
    };

    /**
     *
     * @returns {*}
     */
    MapEditor.prototype.getCurrentLayer = function () {
        var self = this;
        return self.layers[self.currentLayer];
    };

    /**
     *
     * @param tile
     * @param i
     * @param j
     */
    MapEditor.prototype.drawEyedropper = function (tile, i, j) {
        var self = this;
        var map = self.map;
        var layer = self.getCurrentLayer();
        var canvasMap = self.getMapCanvas();
        tile.dx = j * map.tileWidth + canvasMap.viewX;
        tile.dy = i * map.tileHeight + canvasMap.viewY;
        tile.layer = self.currentLayer;

        layer.clear({
            x: tile.dx,
            y: tile.dy,
            width: tile.dWidth,
            height: tile.dHeight
        });

        layer.image(tile);
        map.set(i, j, self.currentLayer, tile);
    };

    /**
     *
     * @param i
     * @param j
     * @param row
     * @param col
     */
    MapEditor.prototype.drawTileMap = function (i, j, row, col) {
        var self = this;
        var spriteset_map = self.map;
        var canvasMap = self.getMapCanvas();
        var x = j * spriteset_map.tileWidth + canvasMap.viewX;
        var y = i * spriteset_map.tileHeight + canvasMap.viewY;
        var image = self.tileset.image;
        var layer = self.getCurrentLayer();

        var opt = {
            dx: x,
            dy: y
        };

        var tile = {
            image: image,
            dWidth: spriteset_map.tileWidth,
            dHeight: spriteset_map.tileHeight,
            sWidth: spriteset_map.tileWidth,
            sHeight: spriteset_map.tileHeight,
            sx: col * spriteset_map.tileWidth,
            sy: row * spriteset_map.tileHeight,
            layer: self.currentLayer,
            collision: false
        };

        layer.clear(x, y, spriteset_map.tileWidth, spriteset_map.tileHeight);

        opt = Object.assign(opt, tile);

        layer.image(image, opt);
        spriteset_map.set(i, j, self.currentLayer, tile);
    };

    /**
     *
     */
    MapEditor.prototype.drawTile = function () {
        var self = this;

        if (self.selectedInterval !== null) {
            var mapCanvas = self.getMapCanvas();
            var interval = self.selectedInterval;
            var area = mapCanvas.getDrawedArea();
            var area_interval = get_area_interval(area);
            var map = self.map;
            var i, j;
            if (self.selectedInterval.type === 'eyedropper') {
                var tile = Clone(self.selectedInterval);
                delete tile.type;
                for (i = area_interval.si; i < area_interval.ei && i < map.height; i++) {
                    for (j = area_interval.sj; j < area_interval.ej && j < map.width; j++) {
                        self.drawEyedropper(tile, i, j);
                    }
                }
            }
            else {
                var row, col;
                for (i = area_interval.si, row = interval.si; i < area_interval.ei && i < map.height; i++) {
                    for (j = area_interval.sj, col = interval.sj; j < area_interval.ej && j < map.width; j++) {
                        self.drawTileMap(i, j, row, col);
                        col++;
                        if (col > interval.ej) {
                            col = interval.sj;
                        }
                    }
                    row++;
                    if (row > interval.ei) {
                        row = interval.si;
                    }
                }
            }
        }
    };

    /**
     *
     * @param i
     * @param j
     */
    MapEditor.prototype.deleteTile = function (i, j) {
        var self = this;
        var map = self.map;
        var layer = self.layers[self.currentLayer];
        var canvasMap = self.getMapCanvas();
        var x = j * map.tileWidth + canvasMap.viewX;
        var y = i * map.tileHeight + canvasMap.viewY;
        //self.history.push({
        //    action: 'deleteTile',
        //    data: {
        //        x: x,
        //        y: y,
        //        width: map.tileWidth,
        //        height: map.tileHeight,
        //        tile: map.get(i, j, self.currentLayer)
        //    }
        //});

        layer.clear(x, y, map.tileWidth, map.tileHeight);
        map.unset(i, j, self.currentLayer);
    };

    /**
     *
     * @returns {null|*}
     */
    MapEditor.prototype.getTilesetCanvas = function () {
        var self = this;
        if (self.tilesetCanvas === null) {
            var container = document.getElementById('tileset');
            self.tilesetCanvas = new CanvasEngineGrid(container, {
                container: container,
                width: 600,
                height: 500,
                selectable: true,
                draggable: true,
                multiSelect: true
            });

            var reader = self.tilesetCanvas.getMouseReader();

            self.tilesetCanvas.addEventListener('viewChange', function (x, y) {
                self.tilesetLayer.clear();
                self.tilesetLayer.drawImage(self.tileset.image, x, y);
            });

            self.tilesetCanvas.addEventListener('areaselect', function (area, grid) {
                if (reader.left) {
                    var rectSets = grid.getRectsFromArea(area);
                    var interval = grid.getAreaInterval(area);
                    grid.apply({
                        fillStyle: 'transparent',
                        state: 0
                    });
                    rectSets.forEach(function (rectSet) {
                        rectSet.set({
                            fillStyle: 'rgba(0,0,100,0.5)',
                            state: 1
                        });
                    });
                    self.selectedInterval = interval;
                }
                else {
                    var rects = grid.getRectsFromArea(area);
                    if (rects.length > 0) {
                        var rectSet = rects[0];
                        grid.apply({
                            fillStyle: 'transparent'
                        }, function () {
                            return this.state != 1;
                        });
                        rectSet.set({
                            fillStyle: 'rgba(0,0,100,0.5)'
                        });
                    }
                }
                self.tilesetCanvas.getGridLayer().refresh();
            });
        }
        return self.tilesetCanvas;
    };

    /**
     *
     * @param tool
     */
    MapEditor.prototype.selectTool = function (tool) {
        this.selectedTool = tool;
    };

    MapEditor.prototype.showLayers = function () {
        this.layers.forEach(function (layer) {
            layer.opacity = 1;
        });
    };

    MapEditor.prototype.showGrid = function () {
        var self = this;
        var layer = self.getMapCanvas().getGridLayer();
        layer.opacity = 0.5;
    };

    MapEditor.prototype.hideGrid = function () {
        var self = this;
        var layer = self.getMapCanvas().getGridLayer();
        layer.opacity = 0;
    };

    //self.save = function(){
    //    var json = JSON.stringify(self.objectMap(self.getMap()));
    //    json = LZString.compressToUTF16(json);
    //
    //    $http({
    //        method:'POST',
    //        url:URLS.BASE_URL+'maps/update',
    //        data:{
    //            id:self.map._id,
    //            map:json
    //        },
    //        withCredentials:true
    //    }).then(function(response){
    //        if(response.data.success){
    //            console.log('mapa atualizado!');
    //        }
    //        else{
    //            console.log(response.data);
    //        }
    //    },function(error){
    //        console.log(error);
    //    });
    //};

    //self.loadMap = function(name,success,error){
    //    $http({
    //        method:'GET',
    //        url:URLS.BASE_URL+'maps/load',
    //        params:{
    //            name:name
    //        },
    //        withCredentials:true
    //    }).then(function(response){
    //        if(response.data.success){
    //            self.map = response.data.map;
    //            $timeout(function(){
    //                success();
    //            });
    //        }
    //        else{
    //            error();
    //        }
    //    },function(){
    //        error();
    //    });
    //};

    MapEditor.prototype.save = function () {
        var self = this;
        self.mapAsObject(self.map, function (data) {
            if (store.enabled) {
                store.set('map', data);
            }
        });
    };

    var initialize = function (self) {
        var map = null;
        var currentLayer = null;
        var mode = 'map';
        var mapWidth = null;
        var mapHeight = null;

        Object.defineProperty(self, 'mapWidth', {
            get: function () {
                return mapWidth;
            },
            set: function (w) {
                if (w != mapWidth) {
                    mapWidth = w;
                    var map = self.map;
                    map.width = w;
                    var mapCanvas = self.getMapCanvas();
                    var gridLayer = mapCanvas.getGridLayer();

                    gridLayer.grid.width = map.tileWidth * w;
                    mapCanvas.minViewX = Math.min(-(map.tileWidth * w - mapCanvas.width), 0);
                    gridLayer.refresh();
                    draw_map(self);
                }
            }
        });

        Object.defineProperty(self, 'mapHeight', {
            get: function () {
                return mapHeight;
            },
            set: function (h) {
                if (h != mapHeight) {
                    var map = self.map;
                    mapHeight = h;
                    map.height = h;
                    var mapCanvas = self.getMapCanvas();
                    var gridLayer = mapCanvas.getGridLayer();
                    gridLayer.grid.height = map.tileHeight * h;
                    mapCanvas.minViewY = Math.min(-(map.tileHeight * h - mapCanvas.height), 0);
                    gridLayer.refresh();
                    draw_map(self);
                }
            }
        });

        Object.defineProperty(self, 'map', {
            get: function () {
                if (map == null) {
                    map = new SpritesetMap({
                        tileWidth: 32,
                        tileHeight: 32,
                        width: 5,
                        height: 5
                    });
                }
                return map;
            }
        });

        Object.defineProperty(self, 'currentLayer', {
            get: function () {
                return currentLayer;
            },
            set: function (cl) {
                if (currentLayer != cl) {
                    currentLayer = cl;
                    if (self.layers != undefined) {
                        self.layers.forEach(function (layer, index) {
                            layer.opacity = index === cl ? 1 : 0.3;
                        });
                    }
                }
            }
        });

        Object.defineProperty(self, 'mode', {
            get: function () {
                return mode;
            },
            set: function (m) {
                if (m != mode) {
                    mode = m;
                    self.collisionLayer.opacity = mode === 'collision'?1:0;
                }
            }
        });
    };

    /**
     *
     * @param self
     * @param point
     * @returns {*}
     */
    function get_position(self, point) {
        var translate = {x: -self.viewX / self.scale, y: -self.viewY / self.scale};
        return Math.vpv(Math.sdv(self.scale, point), translate);
    }

    /**
     *
     * @param options
     * @returns {{si: Number, sj: Number, ei: Number, ej: Number}}
     */
    function get_area_interval(options) {
        var x = options.x || 0;
        var y = options.y || 0;
        var width = options.width || 0;
        var height = options.height || 0;
        var tileWidth = options.tileWidth || 32;
        var tileHeight = options.tileHeight || 32;

        var si = parseInt(Math.floor(y / tileHeight));
        var sj = parseInt(Math.floor(x / tileWidth));
        var ei = parseInt(Math.ceil((y + height) / tileHeight));
        var ej = parseInt(Math.ceil((x + width) / tileWidth));
        return {si: si, sj: sj, ei: ei, ej: ej};
    }


    /**
     *
     * @param map
     * @param editor
     */
    function draw_map(editor) {
        var map = editor.map;
        var length = editor.layers.length;
        var i;

        for (i = 0; i < length; i++) {
            editor.layers[i].clear();
        }

        var mapCanvas = editor.getMapCanvas();
        var grid = mapCanvas.getGridLayer().grid;

        var interval = get_area_interval({
            x: -mapCanvas.viewX,
            y: -mapCanvas.viewY,
            width: Math.min(grid.width, mapCanvas.width),
            height: Math.min(grid.height, mapCanvas.height),
            tileWidth: map.tileWidth,
            tileHeight: map.tileHeight
        });

        for (i = interval.si; i < interval.ei; i++) {
            for (var j = interval.sj; j < interval.ej; j++) {
                if (map.sprites[i] !== undefined && map.sprites[i][j] !== undefined) {
                    for (var k in map.sprites[i][j]) {
                        if (editor.layers[k] !== undefined) {
                            var tile = map.sprites[i][j][k];
                            var dx = j * tile.dWidth + mapCanvas.viewX;
                            var dy = i * tile.dHeight + mapCanvas.viewY;

                            editor.layers[k].clear({
                                x: dx,
                                y: dy,
                                width: tile.dWidth,
                                height: tile.dHeight
                            });

                            var opt = {
                                dx: dx,
                                dy: dy
                            };

                            opt = Object.assign(opt, tile);
                            editor.layers[k].image(tile.image, opt);
                        }
                    }
                }
            }
        }
    }


    /**
     *
     * @param editor
     */
    function initialize_map(editor) {
        if (store.enabled && store.has("map")) {
            var mapData = store.get("map");
            var map = MapEditor.parseMap(mapData);
        }

        var mapCanvas = editor.getMapCanvas();
        var layer = mapCanvas.getGridLayer();
        layer.grid = new AbstractGrid({
            sw: 32,
            sh: 32,
            width: mapCanvas.width,
            height: mapCanvas.height,
            parent: layer
        });
        layer.opacity = 0.5;

        for (var i = 0; i < 10; i++) {
            editor.layers[i] = mapCanvas.createLayer();
        }

        editor.mapWidth = 5;
        editor.mapHeight = 5;
        editor.currentLayer = 0;
    }

    var Clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    /**
     *
     * @param rect
     * @param context
     */
    var draw_collision_callback = function (rect, context) {
        if (!rect.state) {
            context.strokeStyle = 'rgba(0,0,230,0.8)';
            context.beginPath();
            context.arc(rect.x + (rect.width / 2), rect.y + (rect.height / 2), 10, 0, 2 * Math.PI);
            context.stroke();
        }
        else {
            context.strokeStyle = 'rgba(230,0,0,1)';
            context.beginPath();
            context.moveTo(rect.x + 5, rect.y + 5);
            context.lineTo(rect.x + rect.width - 5, rect.y + rect.height - 5);
            context.stroke();
            context.beginPath();
            context.moveTo(rect.x + rect.width - 5, rect.y + 5);
            context.lineTo(rect.x + 5, rect.y + rect.height - 5);
            context.stroke();
        }
    };

    /**
     *
     * @param editor
     */
    function initialize_collision_layer(editor) {
        var tilesetCanvas = editor.getTilesetCanvas();
        var layer = tilesetCanvas.createLayer({name:'collision'}, GridLayer);
        var grid = layer.grid;
        grid.sw = 32;
        grid.sh = 32;
        grid.apply({strokeStyle: 'transparent', fillStyle: 'transparent'});
        grid.ondrawcallback(draw_collision_callback);
        layer.opacity = 0;
        editor.collisionLayer = layer;
    };

    /**
     *
     * @param editor
     */
    function initialize_tileset(editor) {
        var tilesetCanvas = editor.getTilesetCanvas();
        editor.tilesetLayer = tilesetCanvas.createLayer({
            name: 'tileset-layer'
        });
        var layer = tilesetCanvas.getGridLayer();
        layer.opacity = 0.8;

        editor.changeRows(1);
        editor.changeCols(1);
        layer.refresh();
    }

    w.MapEditor = MapEditor;
})(window);