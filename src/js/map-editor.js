'use strict';
(function (w) {
    if (w.CE === undefined) {
        throw "MapEditor requires CanvasEngine";
    }

    if (w.CanvasEngineGrid === undefined) {
        throw "MapEditor requires CanvasEngineGrid";
    }

    if (w.AbstractGrid === undefined) {
        throw "MapEditor requires AbstractGrid";
    }

    if (w.SpritesetMap === undefined) {
        throw "MapEditor requires SpritesetMap";
    }

    if (w.Graphic_Loader === undefined) {
        throw "MapEditor requires Graphic_Loader";
    }

    if (w.EditorUtils === undefined) {
        throw "MapEditor requires EditorUtils";
    }

    if (w.GridLayer === undefined) {
        throw "MapEditor requires GridLayer";
    }

    if (w.Tileset === undefined) {
        throw "MapEditor requires Tileset";
    }


    var img_types = [
        'image/png',
        'image/jpeg',
        'image/gif'
    ];
    var mapCanvas = null;
    var tilesetCanvas = null;
    var tilesetLayer = null;
    var selectedInterval = null;
    var collisionLayer = null;
    var layers = [];
    var map = null;
    var currentLayer = null;
    var mode = 'map';
    var mapWidth = null;
    var mapHeight = null;
    var selectedTool = 'pencil';
    var tilesetInput = null;
    var map_width_input = null;
    var map_height_input = null;
    var tileset_rows_input = null;
    var tileset_cols_input = null;
    var layer_input = null;
    var export_button = null;
    var export_image_button = null;
    var save_button = null;
    var eraser_radio = null;
    var pencil_radio = null;
    var eyedropper_radio = null;
    var collision_radio = null;
    var map_radio = null;
    var layer_checkbox = null;
    var grid_checkbox = null;
    var currentTileset = null;
    var show_layers = true;


    var MapEditor = {
        initialize: function () {
            initialize_tileset();
            initialize_map();
            initialize_collision_layer();
        },
        setExportImageButton: function (button) {
            if (button.tagName === 'BUTTON') {
                if (export_image_button !== null) {
                    export_image_button.removeEventListener("click", export_image);
                }
                export_image_button = button;
                export_image_button.addEventListener("click", export_image);
            }
        },
        setExportButton: function (button) {
            if (button.tagName === 'BUTTON') {
                if (export_button !== null) {
                    export_button.removeEventListener("click", export_raw);
                }
                export_button = button;
                export_button.addEventListener("click", export_raw);
            }
        },
        setMapHeightInput: function (input) {
            if (input.tagName === 'INPUT' && input.getAttribute('type') === 'number') {
                if (map_height_input !== null) {
                    map_height_input.removeEventListener("change", map_height_input_callback);
                }
                map_height_input = input;
                map_height_input.addEventListener("change", map_height_input_callback);
            }
        },
        setMapWidthInput: function (input) {
            if (input.tagName === 'INPUT' && input.getAttribute('type') === 'number') {
                if (map_width_input !== null) {
                    map_width_input.removeEventListener("change", map_width_input_callback);
                }
                map_width_input = input;
                map_width_input.addEventListener("change", map_width_input_callback);
            }
        },
        setTilesetImageInput: function (input) {
            if (input.tagName === 'INPUT' && input.getAttribute('type') === 'file') {
                if (tilesetInput !== null) {
                    tilesetInput.removeEventListener("change", tileset_input_callback);
                }
                tilesetInput = input;
                tilesetInput.addEventListener("change", tileset_input_callback);
            }
        },
        setTilesetRowsInput: function (input) {
            if (input.tagName === 'INPUT' && input.getAttribute('type') === 'number') {
                if (tileset_rows_input !== null) {
                    tileset_rows_input.removeEventListener("change", tileset_rows_callback);
                }
                tileset_rows_input = input;
                tileset_rows_input.addEventListener("change", tileset_rows_callback);
            }
        },
        setTilesetColsInput: function (input) {
            if (input.tagName === 'INPUT' && input.getAttribute('type') === 'number') {
                if (tileset_cols_input !== null) {
                    tileset_cols_input.removeEventListener("change", tileset_cols_callback);
                }
                tileset_cols_input = input;
                tileset_cols_input.addEventListener("change", tileset_cols_callback);
            }
        },
        setLayerInput: function (input) {
            if (input.tagName === 'SELECT' || (input.tagName === 'INPUT' && input.getAttribute('type') === 'number')) {
                if (layer_input !== null) {
                    layer_input.removeEventListener("change", layer_input_callback);
                }
                layer_input = input;
                layer_input.addEventListener("change", layer_input_callback);
            }
        },
        setPencilRadio: function (radio) {
            if (radio.tagName === 'INPUT' && radio.getAttribute('type') === 'radio') {
                if (pencil_radio !== null) {
                    pencil_radio.removeEventListener("change", tool_callback);
                }
                pencil_radio = radio;
                pencil_radio.addEventListener("change", tool_callback);
            }
        },
        setEraserRadio: function (radio) {
            if (radio.tagName === 'INPUT' && radio.getAttribute('type') === 'radio') {
                if (eraser_radio !== null) {
                    eraser_radio.removeEventListener("change", tool_callback);
                }
                eraser_radio = radio;
                eraser_radio.addEventListener("change", tool_callback);
            }
        },
        setEyedropperRadio: function (radio) {
            if (radio.tagName === 'INPUT' && radio.getAttribute('type') === 'radio') {
                if (eyedropper_radio !== null) {
                    eyedropper_radio.removeEventListener("change", tool_callback);
                }
                eyedropper_radio = radio;
                eyedropper_radio.addEventListener("change", tool_callback);
            }
        },
        setcollisionRadio: function (radio) {
            if (radio.tagName === 'INPUT' && radio.getAttribute('type') === 'radio') {
                if (collision_radio !== null) {
                    collision_radio.removeEventListener("change", collision_callback);
                }
                collision_radio = radio;
                collision_radio.addEventListener("change", collision_callback);
            }
        },
        setMapRadio: function (radio) {
            if (radio.tagName === 'INPUT' && radio.getAttribute('type') === 'radio') {
                if (map_radio !== null) {
                    map_radio.removeEventListener("change", collision_callback);
                }
                map_radio = radio;
                map_radio.addEventListener("change", collision_callback);
            }
        },
        setSaveButton: function (button) {
            if (button.tagName === 'BUTTON') {
                if (save_button !== null) {
                    save_button.removeEventListener("click", save_callback);
                }
                save_button = button;
                save_button.addEventListener("click", save_callback);
            }
        },
        setLayerCheckbox: function (input) {
            if (input.tagName === 'INPUT' && input.getAttribute('type') === 'checkbox') {
                if (layer_checkbox !== null) {
                    layer_checkbox.removeEventListener("change", layer_checkbox_callback);
                }
                layer_checkbox = input;
                layer_checkbox.addEventListener("change", layer_checkbox_callback);
            }
        },
        setGridCheckbox: function (input) {
            if (input.tagName === 'INPUT' && input.getAttribute('type') === 'checkbox') {
                if (grid_checkbox !== null) {
                    grid_checkbox.removeEventListener("change", grid_checkbox_callback);
                }
                grid_checkbox = input;
                grid_checkbox.addEventListener("change", grid_checkbox_callback);
            }
        }
    };

    initialize(MapEditor);

    function save_callback() {
        if (store.enabled) {
            store.set('map', JSON.stringify(map, json_replace));
        }
    }

    function grid_checkbox_callback() {
        if (this.checked) {
            showGrid();
        }
        else {
            hideGrid();
        }
    }

    function tileset_input_callback() {
        if (this.files.length > 0) {
            if (img_types.indexOf(this.files[0].type) !== -1) {
                changeTileset(URL.createObjectURL(this.files[0]));
            }
        }
    }

    function map_width_input_callback() {
        let input = this;
        let value = parseInt(input.value);
        value = isNaN(value) || value < 5 ? 5 : value > 10000 ? 10000 : value;
        input.value = value;
        MapEditor.mapWidth = value;
    }

    function map_height_input_callback() {
        let input = this;
        let value = parseInt(input.value);
        value = isNaN(value) || value < 5 ? 5 : value > 10000 ? 10000 : value;
        input.value = value;
        MapEditor.mapHeight = value;
    }

    function tileset_rows_callback() {
        let input = this;
        let value = parseInt(input.value);
        value = isNaN(value) || value < 1 ? 1 : value > 1000 ? 1000 : value;
        changeRows(value);
    }

    function tileset_cols_callback() {
        let input = this;
        let value = parseInt(input.value);
        value = isNaN(value) || value < 1 ? 1 : value > 1000 ? 1000 : value;
        changeCols(value);
    }

    function layer_input_callback() {
        let input = this;
        let value = parseInt(input.value);
        value = isNaN(value) || value < 1 ? 1 : value > 10 ? 10 : value;
        MapEditor.currentLayer = value - 1;
    }

    function layer_checkbox_callback() {
        MapEditor.showLayers = this.checked;
    }

    function tool_callback() {
        selectTool(this.value);
    }

    function collision_callback() {
        MapEditor.mode = this.value;
    }

    /**
     *
     * @param image_data_url
     * @param tilesets
     * @returns {*}
     */
    function find_tileset(image_data_url, tilesets) {
        var length = tilesets.length;
        for (var i = 0; i < length; i++) {
            if (tilesets[i].image.src === image_data_url) {
                return tilesets[i];
            }
        }
        return null;
    }


    /**
     *
     * @param tileset
     */
    function changeTileset(tileset) {
        var self = MapEditor;
        Graphic_Loader.load(tileset, 0, {
            onsuccess: function (id,img) {
                var src = img.src;
                var tileset = find_tileset(src, self.map.tilesets);
                var rows = Math.floor(img.height / 32);
                var cols = Math.floor(img.width / 32);
                if (tileset == null) {
                    tileset = new Tileset({
                        image: img,
                        rows: rows,
                        cols: cols,
                        width: img.width,
                        height: img.height
                    });
                    self.map.addTileset(tileset);
                }
                currentTileset = tileset;
                load_tileset_canvas(self);
                changeRows(rows);
                changeCols(cols);
            }
        });
    }

    /**
     *
     * @param editor
     */
    function load_tileset_canvas(editor) {
        var tileset = currentTileset;
        var img = tileset.image;
        var cols = tileset.cols;
        var rows = tileset.rows;
        var tileset_canvas = getTilesetCanvas();
        var tileset_grid_layer = tileset_canvas.getGridLayer();
        tileset_canvas.viewX = 0;
        tileset_canvas.viewY = 0;
        tileset_grid_layer.grid.width = img.width;
        tileset_grid_layer.grid.height = img.height;
        tileset_grid_layer.grid.sw = img.width / cols;
        tileset_grid_layer.grid.sh = img.height / rows;

        var collision_grid = collisionLayer.grid;
        collision_grid.width = img.width;
        collision_grid.height = img.height;
        collision_grid.sw = img.width / tileset.cols;
        collision_grid.sh = img.height / tileset.rows;
        var i;
        var j;

        for (i in tileset.collision) {
            for (j in tileset.collision[i]) {
                collision_grid.get(i, j).state = tileset.collision[i][j];
            }
        }

        tileset_grid_layer.refresh();
        collisionLayer.refresh();
        tilesetLayer.clear().drawImage(img, 0, 0);
    }


    /**
     *
     * @param key
     * @param value
     * @returns {*}
     */
    function json_replace(key, value) {
        if (value == null) {
            return 0;
        }
        return value;
    }


    /**
     *
     * @param rows
     */
    function changeRows(rows) {
        var self = MapEditor;
        var image = null;
        var tileset = currentTileset;
        if (tileset != null) {
            tileset.rows = rows;
            image = tileset.image;
        }

        tileset_rows_input.value = rows;
        if (image !== null) {
            var layer = getTilesetCanvas().getGridLayer();
            var layer2 = getMapCanvas().getGridLayer();
            var tileHeight = image.height / rows;
            self.map.tileHeight = tileHeight;
            layer.grid.sh = tileHeight;
            layer2.grid.height = tileHeight * self.map.height;
            layer2.grid.sh = tileHeight;
            collisionLayer.grid.sh = tileHeight;
            layer.refresh();
            layer2.refresh();
            collisionLayer.refresh();
        }
    }

    /**
     *
     * @param val
     */
    function changeCols(val) {
        var self = MapEditor;
        var image = null;
        var tileset = currentTileset;
        if (tileset != null) {
            image = tileset.image;
            tileset.cols = val;
        }

        tileset_cols_input.value = val;
        if (image !== null) {
            var layer = getTilesetCanvas().getGridLayer();
            var layer2 = getMapCanvas().getGridLayer();
            var tileWidth = image.width / val;
            layer.grid.sw = tileWidth;
            layer2.grid.width = tileWidth * self.map.width;
            layer2.grid.sw = tileWidth;
            self.map.tileWidth = tileWidth;
            collisionLayer.grid.sw = tileWidth;
            layer.refresh();
            layer2.refresh();
            collisionLayer.refresh();
        }
    }

    function export_image() {
        var map = MapEditor.map;
        var width = map.width * map.tileWidth;
        var height = map.height * map.tileHeight;
        var canvas = w.document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        for (var i in map.sprites) {
            for (var j in map.sprites[i]) {
                for (var k in map.sprites[i][j]) {
                    if (map.sprites[i][j][k] instanceof Tile) {
                        var tile = map.sprites[i][j][k];
                        ctx.drawImage(tile.tileset.image, tile.sx, tile.sy, tile.width, tile.height,j * map.tileWidth, i * map.tileHeight, map.tileWidth, map.tileHeight);
                    }
                }
            }
        }
        canvas.toBlob(function (blob) {
            var url = URL.createObjectURL(blob);
            w.open(url);
        });
    }

    function export_raw() {
        var string = JSON.stringify(map, json_replace);
        var blob = new Blob([string], {type: "application/json"});
        var url = w.URL.createObjectURL(blob);
        w.open(url,'__blank');
    }

    /**
     *
     * @returns {*}
     */
    function getMapCanvas() {
        var self = MapEditor;
        if (mapCanvas === null) {
            var container = document.getElementById('canvas-map');
            mapCanvas = new CanvasEngineGrid(container, {
                width: 600,
                height: 500,
                draggable: true,
                selectable: true
            });

            var reader = mapCanvas.getMouseReader();


            reader.addEventListener('mousedown', function (x, y) {
                if (reader.left && currentTileset != null) {
                    var mapCanvas = getMapCanvas();
                    var map = self.map;
                    var pos = get_position(mapCanvas, {x: x, y: y});
                    var i = Math.floor(pos.y / map.tileHeight);
                    var j = Math.floor(pos.x / map.tileWidth);
                    var tile;
                    if (i < map.height && j < map.width) {
                        switch (self.mode) {
                            case 'map':
                                switch (selectedTool) {
                                    case 'pencil':
                                        var interval = selectedInterval;
                                        if (interval !== null) {
                                            if (interval.type === 'eyedropper') {
                                                tile = interval.tile;
                                                drawEyedropper(tile, i, j);
                                            }
                                            else {
                                                drawTileMap(i, j, interval.si, interval.sj);
                                            }
                                        }
                                        break;
                                    case 'eraser':
                                        deleteTile(i, j);
                                        break;
                                    case 'eyedropper':
                                        tile = map.get(i, j, currentLayer);
                                        if (tile != null) {
                                            selectedInterval = {
                                                type: 'eyedropper',
                                                tile: tile
                                            };
                                        }
                                }
                                break;
                        }
                    }
                }
            });

            mapCanvas.addEventListener('viewChange', function (x, y) {
                var grid_layer = mapCanvas.getGridLayer();
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
                var mapCanvas = getMapCanvas();
                var pos = get_position(mapCanvas, {
                    x: x,
                    y: y
                });

                var element = document.getElementById('mouse');
                element.innerHTML = parseInt(x) + ',' + parseInt(y);
                if (currentTileset != null) {
                    /*end hover square*/
                    switch (mode) {
                        case 'map':
                            if (reader.left) {
                                switch (selectedTool) {
                                    case 'pencil':
                                        drawTile();
                                        break;
                                    case 'eraser':
                                        var area_interval = get_area_interval({
                                            x: pos.x,
                                            y: pos.y,
                                            width: 1,
                                            height: 1,
                                            tileWidth: map.tileWidth,
                                            tileHeight: map.tileHeight
                                        });
                                        var i, j;
                                        for (i = area_interval.si; i < area_interval.ei; i++) {
                                            for (j = area_interval.sj; j < area_interval.ej; j++) {
                                                deleteTile(i, j);
                                            }
                                        }
                                }
                            }
                            break;
                    }
                }
            });
        }
        return mapCanvas;
    }

    /**
     *
     * @returns {*}
     */
    function getCurrentLayer() {
        return layers[currentLayer];
    }

    /**
     *
     * @param tile
     * @param i
     * @param j
     */
    function drawEyedropper(tile, i, j) {
        var layer = getCurrentLayer();
        var cm = getMapCanvas();
        var dx = j * map.tileWidth + cm.viewX;
        var dy = i * map.tileHeight + cm.viewY;

        layer.clear({
            x: tile.dx,
            y: tile.dy,
            width: tile.dWidth,
            height: tile.dHeight
        });


        var tile_data = Object.assign({dx: dx, dy: dy}, tile.toOBJ());
        var tileset = tile.tileset;
        layer.image(tileset.image, tile_data);
        map.set(i, j, currentLayer, tile);
    }

    /**
     *
     * @param i
     * @param j
     * @param row
     * @param col
     */
    function drawTileMap(i, j, row, col) {
        var canvasMap = getMapCanvas();
        var x = j * map.tileWidth + canvasMap.viewX;
        var y = i * map.tileHeight + canvasMap.viewY;
        var tileset = currentTileset;

        var tile = tileset.get(row, col);
        var tile_data = Object.assign({
            dx: x,
            dy: y,
            dWidth:map.tileWidth,
            dHeight:map.tileHeight
        }, tile.toOBJ());

        var layer = getCurrentLayer();
        layer.clear(x, y, map.tileWidth, map.tileHeight);
        layer.image(tileset.image, tile_data);
        map.set(i, j, currentLayer, tile);
    }


    function drawTile() {
        if (selectedInterval !== null && currentTileset != null) {
            var mc = getMapCanvas();
            var interval = selectedInterval;
            var area = mc.getDrawedArea();
            area.tileWidth = map.tileWidth;
            area.tileHeight = map.tileHeight;
            var area_interval = get_area_interval(area);
            var i, j;
            if (interval.type === 'eyedropper') {
                var tile = interval.tile;
                for (i = area_interval.si; i < area_interval.ei && i < map.height; i++) {
                    for (j = area_interval.sj; j < area_interval.ej && j < map.width; j++) {
                        drawEyedropper(tile, i, j);
                    }
                }
            }
            else {
                var row, col;
                for (i = area_interval.si, row = interval.si; i < area_interval.ei && i < map.height; i++) {
                    for (j = area_interval.sj, col = interval.sj; j < area_interval.ej && j < map.width; j++) {
                        drawTileMap(i, j, row, col);
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
    }

    /**
     *
     * @param i
     * @param j
     */
    function deleteTile(i, j) {
        var layer = layers[currentLayer];
        var canvasMap = getMapCanvas();
        var x = j * map.tileWidth + canvasMap.viewX;
        var y = i * map.tileHeight + canvasMap.viewY;
        layer.clear(x, y, map.tileWidth, map.tileHeight);
        map.unset(i, j, currentLayer);
    }

    /**
     *
     * @returns {*}
     */
    function getTilesetCanvas() {
        if (tilesetCanvas === null) {
            var container = document.getElementById('tileset');
            tilesetCanvas = new CanvasEngineGrid(container, {
                container: container,
                width: 600,
                height: 500,
                selectable: true,
                draggable: true,
                multiSelect: true
            });

            var reader = tilesetCanvas.getMouseReader();


            reader.addEventListener('mousedown', function (x, y, e) {
                if (mode == 'collision' && e.which == 1) {
                    var grid = collisionLayer.grid;
                    var i = Math.floor((y - tilesetCanvas.viewY) / grid.sh);
                    var j = Math.floor((x - tilesetCanvas.viewX) / grid.sw);
                    var rect = grid.get(i, j);
                    if (rect != null) {
                        rect.state = !rect.state;
                        var tileset = currentTileset;
                        tileset.setCollision(i, j, rect.state);
                        collisionLayer.refresh();
                    }
                }
            });

            tilesetCanvas.addEventListener('viewChange', function (x, y) {
                var tileset = currentTileset;
                tilesetLayer.clear();
                tilesetLayer.drawImage(tileset.image, x, y);
                collisionLayer.refresh();
                tilesetCanvas.getGridLayer().refresh();
            });

            tilesetCanvas.addEventListener('areaselect', function (area, grid) {
                if (mode == 'map') {
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
                        selectedInterval = interval;
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
                    tilesetCanvas.getGridLayer().refresh();
                }
            });
        }
        return tilesetCanvas;
    }

    /**
     *
     * @param tool
     */
    function selectTool(tool) {
        selectedTool = tool;
    }

    function showLayers() {
        layers.forEach(function (layer) {
            layer.opacity = 1;
        });
    }

    function hideLayers(){
        layers.forEach(function (layer,index) {
            layer.opacity = index == currentLayer?1:0.5;
        });
    }

    function showGrid() {
        var layer = getMapCanvas().getGridLayer();
        layer.opacity = 0.5;
    }

    function hideGrid() {
        var layer = getMapCanvas().getGridLayer();
        layer.opacity = 0;
    }

    /**
     *
     * @param self
     */
    function initialize(self) {
        Object.defineProperty(self, 'mapWidth', {
            get: function () {
                return mapWidth;
            },
            set: function (w) {
                if (w != mapWidth) {
                    mapWidth = w;
                    map_width_input.value = w;
                    var map = self.map;
                    map.width = w;
                    var mapCanvas = getMapCanvas();
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
                    map_height_input.value = h;
                    map.height = h;
                    var mapCanvas = getMapCanvas();
                    var gridLayer = mapCanvas.getGridLayer();
                    gridLayer.grid.height = map.tileHeight * h;
                    mapCanvas.minViewY = Math.min(-(map.tileHeight * h - mapCanvas.height), 0);
                    gridLayer.refresh();
                    draw_map(self);
                }
            }
        });

        Object.defineProperty(self, 'map', {
            /**
             *
             * @returns {*}
             */
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
            },
            /**
             *
             * @param m
             */
            set: function (m) {
                if (m !== map) {
                    map = m;
                    if (map.tilesets.length > 0) {
                        currentTileset = map.tilesets[0];
                    }
                    mapWidth = map.width;
                    mapHeight = map.height;
                    map_width_input.value = mapWidth;
                    map_height_input.value = mapHeight;
                    let mapCanvas = getMapCanvas();
                    let gridLayer = mapCanvas.getGridLayer();
                    gridLayer.grid.height = map.tileHeight * map.height;
                    mapCanvas.minViewY = Math.min(-(map.tileHeight * map.height - mapCanvas.height), 0);
                    gridLayer.grid.width = map.tileWidth * map.width;
                    mapCanvas.minViewX = Math.min(-(map.tileWidth * map.width - mapCanvas.width), 0);
                    gridLayer.refresh();
                    draw_map(self);
                }
            }
        });

        Object.defineProperty(self, 'currentLayer', {
            /**
             *
             * @returns {*}
             */
            get: function () {
                return currentLayer;
            },
            /**
             *
             * @param cl
             */
            set: function (cl) {
                if (currentLayer !== cl) {
                    currentLayer = cl;
                    if(!show_layers){
                        layers.forEach(function (layer, index) {
                            layer.opacity = index === cl ? 1 : 0.3;
                        });
                    }
                }
            }
        });

        Object.defineProperty(self, 'mode', {
            /**
             *
             * @returns {string}
             */
            get: function () {
                return mode;
            },
            /**
             *
             * @param m
             */
            set: function (m) {
                if (m !== mode) {
                    mode = m;
                    if (mode === 'collision') {
                        collisionLayer.opacity = 1;
                        let layer = getTilesetCanvas().getGridLayer();
                        layer.grid.apply({
                            fillStyle: 'transparent',
                            state: 0
                        });
                        layer.refresh();
                        layers.forEach(function(layer){
                            layer.opacity = 0.5;
                        });
                        layer_checkbox.disabled = true;
                        layer_input.disabled = true;
                        pencil_radio.disabled = true;
                        eraser_radio.disabled = true;
                        eyedropper_radio.disabled = true;
                    }
                    else {
                        if(show_layers){
                            showLayers();
                        }
                        else{
                            hideLayers();
                        }
                        collisionLayer.opacity = 0;
                        layer_checkbox.disabled = false;
                        layer_input.disabled = false;
                        pencil_radio.disabled = false;
                        eraser_radio.disabled = false;
                        eyedropper_radio.disabled = false;
                    }
                }
            }
        });

        Object.defineProperty(self,'showLayers',{
            /**
             *
             * @returns {boolean}
             */
            get:function(){
                return show_layers;
            },
            /**
             *
             * @param sl
             */
            set:function(sl){
                if(sl !== show_layers){
                    show_layers = sl;
                    if(show_layers){
                        showLayers();
                    }
                    else{
                        hideLayers();
                    }
                }
            }
        });
    }

    /**
     *
     * @param self
     * @param point
     */
    function get_position(self, point) {
        return Math.vpv(Math.sdv(self.scale, point), {
            x: -self.viewX / self.scale,
            y: -self.viewY / self.scale
        });
    }

    /**
     *
     * @param options
     * @returns {{si: Number, sj: Number, ei: Number, ej: Number}}
     */
    function get_area_interval(options) {
        let x = options.x || 0;
        let y = options.y || 0;
        let width = options.width || 0;
        let height = options.height || 0;
        let tileWidth = options.tileWidth || 32;
        let tileHeight = options.tileHeight || 32;

        let si = parseInt(Math.floor(y / tileHeight));
        let sj = parseInt(Math.floor(x / tileWidth));
        let ei = parseInt(Math.ceil((y + height) / tileHeight));
        let ej = parseInt(Math.ceil((x + width) / tileWidth));
        return {si: si, sj: sj, ei: ei, ej: ej};
    }


    function draw_map() {
        var length = layers.length;
        var i;
        var j;
        var k;

        for (i = 0; i < length; i++) {
            layers[i].clear();
        }

        var mapCanvas = getMapCanvas();
        var grid_layer = mapCanvas.getGridLayer();
        var interval = get_area_interval({
            x: -mapCanvas.viewX,
            y: -mapCanvas.viewY,
            width: Math.min(grid_layer.grid.width, mapCanvas.width),
            height: Math.min(grid_layer.height, mapCanvas.height),
            tileWidth: map.tileWidth,
            tileHeight: map.tileHeight
        });

        for (i = interval.si; i < interval.ei; i++) {
            if (map.sprites[i] !== undefined) {
                for (j = interval.sj; j < interval.ej; j++) {
                    if (map.sprites[i][j] !== undefined) {
                        for (k in map.sprites[i][j]) {
                            if (layers[k] !== undefined && map.sprites[i][j][k] !== undefined) {
                                let layer = layers[k];
                                let tile = map.sprites[i][j][k];
                                let dx = map.tileWidth * j + mapCanvas.viewX;
                                let dy = map.tileHeight * i + mapCanvas.viewY;
                                let tileset = tile.tileset;

                                let tile_data = Object.assign({
                                    dx: dx,
                                    dy: dy,
                                    dWidth:map.tileWidth,
                                    dHeight:map.tileHeight
                                }, tile.toOBJ());
                                layer.image(tileset.image, tile_data);
                            }
                        }
                    }
                }
            }
        }
    }


    function initialize_map() {
        MapEditor.currentLayer = 0;

        if (store.enabled) {
            let map_json = {};

            try{
                map_json = JSON.parse(store.get('map'));
                MapEditor.map = SpritesetMap.fromJSON(map_json);
                showLayers();
            }
            catch(e){

            }
        }
        else {
            MapEditor.mapWidth = 20;
            MapEditor.mapHeight = 20;
        }

        let mc = getMapCanvas();
        for (let i = 0; i < 10; i++) {
            layers[i] = mc.createLayer();
        }

        let layer = mc.getGridLayer();
        layer.grid = new AbstractGrid({
            sw: MapEditor.map.tileWidth,
            sh: MapEditor.map.tileHeight,
            width: MapEditor.map.width * MapEditor.map.tileWidth,
            height: MapEditor.map.height * MapEditor.map.tileHeight,
            parent: layer
        });
        layer.opacity = 0.5;
        layer.refresh();
        draw_map();
    }

    /**
     *
     * @param rect
     * @param context
     */
    function draw_collision_status(rect, context) {
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
    }

    function initialize_collision_layer() {
        let tilesetCanvas = getTilesetCanvas();
        let layer = tilesetCanvas.createLayer({name: 'collision'}, GridLayer);
        let grid = layer.grid;
        grid.sw = 32;
        grid.sh = 32;
        grid.apply({strokeStyle: 'transparent', fillStyle: 'transparent'});
        grid.addEventListener('draw', draw_collision_status);
        layer.opacity = 0;
        collisionLayer = layer;
    }

    function initialize_tileset() {
        let tilesetCanvas = getTilesetCanvas();
        tilesetLayer = tilesetCanvas.createLayer({
            name: 'tileset-layer'
        });
        let layer = tilesetCanvas.getGridLayer();
        layer.opacity = 0.8;
        changeRows(1);
        changeCols(1);
        layer.refresh();
    }

    w.MapEditor = MapEditor;
})
(window);