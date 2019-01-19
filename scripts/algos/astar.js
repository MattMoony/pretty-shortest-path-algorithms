// --- A* SEARCH START --- //

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        if (globs.tile_size) {
            this.sx = this.x*globs.tile_size;
            this.sy = this.y*globs.tile_size;

            this.cx = this.x*globs.tile_size+globs.tile_size/2;
            this.cy = this.y*globs.tile_size+globs.tile_size/2;
        }
    }

    neighbour(grid, off_x, off_y) {
        off_x = off_x || 0;
        off_y = off_y || 0;

        let x = this.x + off_x,
            y = this.y + off_y;

        // if (x < 0)
        //     x = grid[0].length - 1;
        // else if (x >= grid[0].length)
        //     x = 0;

        // if (y < 0)
        //     y = grid.length - 1;
        // else if (y >= grid.length)
        //     y = 0;

        return grid[y] !== undefined && grid[y][x] !== undefined ? grid[y][x] : null;
    }

    neighbours(grid) {
        let ns = [];

        let n = this.neighbour(grid, -1, 0);
        if (n != null)
            ns.push(n);

        n = this.neighbour(grid, 1, 0);
        if (n != null)
            ns.push(n);



        n = this.neighbour(grid, 0, -1);
        if (n != null)
            ns.push(n);

        n = this.neighbour(grid, 0, 1);
        if (n != null)
            ns.push(n);

        return ns;
    }

    toString() {
        return "Px(" + this.x + "," + this.y + ")";
    }
}

class PriorityQueue {
    constructor() {
        this.els = [];
    }

    empty() {
        return this.els.length == 0;
    }

    put(item, pri) {
        for (let i = 0; i < this.els.length; i++) {
            if (this.els[i][0] > pri) {
                this.els.splice(i, 0, [pri, item]);
                return;
            }
        }
        this.els.push([pri, item]);
    }

    get() {
        return this.els.splice(0, 1)[0][1];
    }
}

function x_dist(n, g, grid) {
    return Math.min(Math.abs(n.x - g.x), Math.abs(n.x - grid[0].length) + g.x, n.x + Math.abs(g.x - grid[0].length));
}

function y_dist(n, g, grid) {
    return Math.min(Math.abs(n.y - g.y), Math.abs(n.y - grid.length) + g.y, n.y + Math.abs(g.y - grid.length));
}

function h_est(n, g, grid) {
    return x_dist(n, g, grid) + y_dist(n, g, grid); // 4 directions
    // return Math.max(x_dist(n, g, grid), y_dist(n, g, grid)); // 8 directions
    // return Math.sqrt(Math.pow(x_dist(n, g, grid), 2) + Math.pow(y_dist(n, g, grid), 2)); // All directions
}

function reversed(arr) {
    let x = arr;
    x.reverse();
    return x;
}

function recon_path(n, start, past) {
    let nodes = [n];

    while (!nodes.includes(start)) {
        nodes.push(past[nodes[nodes.length - 1]]);
    }

    return reversed(nodes);
}

function directions(past_path) {
    // Directions: 0, 1, 2, 3
    //             right, left, bottom, top

    let dpath = [];

    for (let i = 0; i < past_path.length - 1; i++) {
        if (past_path[i + 1].x - past_path[i].x != 0) {
            if (past_path[i + 1].x - past_path[i].x > 0) {
                dpath.push(0);
            } else {
                dpath.push(1);
            }
        } else {
            if (past_path[i + 1].y - past_path[i].y > 0) {
                dpath.push(2);
            } else {
                dpath.push(3);
            }
        }
    }

    return dpath;
}


async function astar_search(grid, start, goal, callback) {
    let open = new PriorityQueue(),
        closed = [],
        open_contains = {};

    open.put(start, 0);
    let g = {},
        past = {};
    g[start] = 0;

    while (!open.empty()) {
        let cu = open.get();

        if (cu.x == goal.x && cu.y == goal.y) {
            await callback(recon_path(cu, start, past));
            return;
        }

        closed.push(cu);

        // let ns = await cu.neighbours(grid);
        (await cu.neighbours(grid)).forEach(n => {
            ctx.fillStyle = "rgba(126, 73, 232, 0.05)";
            ctx.fillRect(n.x * globs.tile_size, n.y * globs.tile_size, globs.tile_size, globs.tile_size);


            if (closed.includes(n))
                return;

            d_score = g[cu] + 1;

            if (!open_contains[n.toString()]) {
                open_contains[n.toString()] = true;
            } else if (d_score >= g[n]) {
                return;
            }

            past[n] = cu;
            g[n] = d_score;

            open.put(n, d_score + h_est(n, goal, grid));
        });
    }

    await callback([]);
    return;
}

// --- A* SEARCH DONE --- //