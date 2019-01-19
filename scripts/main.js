// -- < FUNCTIONS > -- //

function sleep(ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms));
}

function inObstacles(obs) {
    for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i][0] == obs[0] && obstacles[i][1] == obs[1])
            return true;
    }
    return false;
}

function delObstacle(obs) {
    for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i][0] == obs[0] && obstacles[i][1] == obs[1]) {
            obstacles.splice(i, 1);
            return;
        }
    }
    return -1;
}

function scrollPaused() {
    if (new Date().getTime()-globs.l_scroll_time >= globs.l_scroll_pause) {
        globs.l_scroll_time = new Date().getTime();
        return true;
    }

    return false;
}

function fieldToGrid() {
    let g = [];

    for (let y = 0; y < canvas.height/globs.tile_size; y++) {
        g.push([]);
        for (let x = 0; x < canvas.width/globs.tile_size; x++) {
            g[y].push(new Point(x, y));
        }
    }

    obstacles.forEach(o => {
        g[o[1]][o[0]] = null;
    });

    return g;
}

function drawPath(path) {
    ctx.fillStyle = "rgba(255, 134, 161, 0.25)";
    path.forEach(p => {
        ctx.fillRect(p.sx, p.sy, globs.tile_size, globs.tile_size);
    });

    ctx.beginPath();
    ctx.strokeStyle = globs.path_color;
    ctx.lineWidth = globs.path_line_width;

    for (let i = 1; i < path.length-1; i+=2) {
        ctx.moveTo(path[i-1].cx, path[i-1].cy);
        ctx.bezierCurveTo(path[i].cx, path[i].cy, path[i].cx, path[i].cy, path[i+1].cx, path[i+1].cy);
    }
    ctx.stroke();
}

function refresh_canvas() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    // -- < DRAW START > -- //

    ctx.fillStyle = "#FF736D";
    ctx.font = globs.tile_size + "px Comic Sans MS";
    ctx.fillText("♚", start.x * globs.tile_size, (start.y + 1) * globs.tile_size - 2, globs.tile_size);

    // -- </ DRAW START > -- //

    // -- < DRAW FINISH > -- //

    ctx.fillStyle = "#6D7AFF";
    ctx.fillText("⚑", finish.x * globs.tile_size + 2, (finish.y + 1) * globs.tile_size - 2, globs.tile_size);

    // -- </ DRAW FINISH > -- //

    // -- < DRAW OBSTACLES > -- //

    ctx.fillStyle = "#2D2431";
    obstacles.forEach(o => {
        ctx.fillRect(o[0]*globs.tile_size, o[1]*globs.tile_size, globs.tile_size, globs.tile_size);
    });

    // -- </ DRAW OBSTACLES > -- //

    // -- < DRAW GRID > -- //

    ctx.beginPath();
    ctx.strokeStyle = "#555";
    ctx.lineWidth = globs.grid_line_width;
    for (let y = 0; y <= canvas.clientHeight; y += globs.tile_size) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.clientWidth, y);
    }

    for (let x = 0; x <= canvas.clientWidth; x += globs.tile_size) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.clientHeight);
    }
    ctx.stroke();

    // -- </ DRAW GRID > -- //
}

// -- </ FUNCTIONS > -- //


// -- < INITIALIZATION > -- //

window.onload = e => {
    refresh_canvas();

    document.getElementById('main').onclick = function (e) {
        e.preventDefault();
        let rect = this.getBoundingClientRect(),
            x = Math.floor((e.clientX - rect.left) / globs.tile_size),
            y = Math.floor((e.clientY - rect.top) / globs.tile_size);

        switch (globs.brush_type) {
            case "start":
                {
                    start = new Point(x, y);
                }
                break;
            case "finish":
                {
                    finish = new Point(x, y);
                }
                break;
            case "obstacle":
                {
                    obstacles.push([x, y]);
                }
                break;
        }

        refresh_canvas();
    };
    document.getElementById('main').oncontextmenu = function (e) {
        e.preventDefault();
        let rect = this.getBoundingClientRect(),
            x = Math.floor((e.clientX - rect.left) / globs.tile_size),
            y = Math.floor((e.clientY - rect.top) / globs.tile_size);

        switch (globs.brush_type) {
            case "obstacle":
                {
                    if (inObstacles([x, y]))
                        delObstacle([x, y]);
                }
                break;
        }

        refresh_canvas();
    };
    document.getElementById('main').onmousemove = function (e) {
        e.preventDefault();
        let rect = this.getBoundingClientRect(),
            x = Math.floor((e.clientX - rect.left) / globs.tile_size),
            y = Math.floor((e.clientY - rect.top) / globs.tile_size);

        // -- < SHOW MOUSE COORDINATES > -- //

        let mcoords = document.getElementById('mouse_coords');

        mcoords.style.left = e.clientX + 15 + "px";
        mcoords.style.top = e.clientY + 5 + "px";

        document.getElementById('mouse_x').innerHTML = x;
        document.getElementById('mouse_y').innerHTML = y;

        mcoords.style.display = "block";

        // -- </ SHOW MOUSE COORDINATES > -- //

        if (e.buttons == 1) {
            switch (globs.brush_type) {
                case "obstacle":
                    {
                        obstacles.push([x, y]);
                    }
                    break;
            }

            refresh_canvas();
        } else if (e.buttons == 2) {
            switch (globs.brush_type) {
                case "obstacle":
                    {
                        if (inObstacles([x, y]))
                            delObstacle([x, y]);
                    }
                    break;
            }

            refresh_canvas();
        }
    };
    document.getElementById('main').onmouseleave = function (e) {
        document.getElementById('mouse_coords').style.display = "none";
    };

    window.onmousewheel = function (e) {
        if (scrollPaused()) {
            globs.brush_type = globs.brush_types[(globs.brush_types.indexOf(globs.brush_type) + 1) % globs.brush_types.length];

            document.getElementById('brush_type').innerHTML = globs.brush_type.charAt(0).toUpperCase() +
                globs.brush_type.substr(1).toLowerCase();

            document.getElementById('brush_type_back').style.display = "block";
            window.setTimeout(() => {
                document.getElementById('brush_type_back').style.display = "none";
            }, 3000);
        }
    };

    window.onkeyup = function (e) {
        switch (e.keyCode) {
            case 13:
                {
                    if (!globs.running) {
                        globs.running = true;
                        astar_search(fieldToGrid(), start, finish, path => { 
                            console.log('baum');
                            globs.running = false;
                            drawPath(path.slice(1, path.length-1)); 
                        });
                    }
                }
                break;
        }
    };
};

// -- </ INITIALIZATION > -- //