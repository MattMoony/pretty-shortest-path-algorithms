// -- < GLOBAL VARIABLES > -- //

var canvas = document.getElementById('main'),
    ctx = canvas.getContext('2d');

var globs = {
    running: false,
    tile_size: 20,
    brush_type: "start",
    brush_types: ["start", "finish", "obstacle"],
    l_scroll_time: new Date().getTime(),
    l_scroll_pause: 500,
    sleep_time: 15,
    path_color: "#f00",
    path_line_width: 5,
    grid_line_width: 0.5
};

var start = new Point(0, 0),
    finish = new Point(1, 1),
    obstacles = [];

// -- </ GLOBAL VARIABLES > -- //