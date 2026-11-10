import Phaser from "phaser";

const FRAME = 384;
const COLS = 6;
const ROWS = 4;

function polygon(
    ctx: CanvasRenderingContext2D,
    points: number[],
    fill: string,
    stroke = "#0a1420",
    lineWidth = 4
): void {
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.lineJoin = "round";
    ctx.stroke();
}

function ellipse(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, rx: number, ry: number,
    fill: string, stroke = "#0b1721", lw = 3
): void {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if (lw > 0) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lw;
        ctx.stroke();
    }
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
    const gradient = ctx.createRadialGradient(x, y, 1, x, y, r);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.24, "rgba(255,96,84,0.85)");
    gradient.addColorStop(0.55, "rgba(255,40,50,0.25)");
    gradient.addColorStop(1, "rgba(255,40,50,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function bossFrame(ctx: CanvasRenderingContext2D, row: number, step: number): void {
    const t = step / 5;
    const sway = Math.sin(t * Math.PI * 2) * 3;
    const charge = row === 3 ? t : 0;
    const deploy = row === 2 ? Math.sin(t * Math.PI) : 0;
    const shield = row === 1;

    ctx.save();
    ctx.translate(192, 210 + sway);

    ellipse(ctx, 0, 118, 147, 25, "rgba(3,8,16,0.33)", "", 0);

    for (const side of [-1, 1]) {
        const x = side * 92;
        polygon(ctx, [x - 37, 17, x + 21, 14, x + 44, 76, x + 22, 108,
            x - 39, 106, x - 58, 74], "#263442", "#09131d", 6);
        polygon(ctx, [x - 45, 90, x + 23, 92, x + 45, 122, x - 62, 122],
            "#4a5969", "#0a111c", 5);
        polygon(ctx, [x - 36, 110, x + 31, 109, x + 43, 122, x - 48, 122],
            "#a1b0bd", "#0a111c", 3);
        ellipse(ctx, x - 17, 68, 12, 12, "#ff394e");
        ellipse(ctx, x - 17, 68, 5, 5, "#ffc09c", "", 0);
    }

    polygon(ctx, [-107, 6, -91, -101, -42, -143, 73, -138,
        120, -88, 115, 13, 60, 57, -75, 51], "#344553", "#09141f", 8);
    polygon(ctx, [-89, -96, -39, -140, 70, -131, 102, -91,
        80, -52, -75, -48], "#647381", "#101c27", 5);
    polygon(ctx, [-84, -92, -48, -125, -30, -90, -74, -55], "#d0d9df", "#1c2c39", 3);
    polygon(ctx, [24, -134, 69, -130, 98, -84, 61, -72, 34, -98],
        "#adb9c2", "#162533", 3);

    polygon(ctx, [-62, -128, -52, -196, -32, -159, -12, -192, 4, -149,
        31, -173, 25, -123], "#677b8d", "#111a25", 5);
    polygon(ctx, [-41, -173, -38, -205, -21, -184, -15, -162], "#f0454d", "#1e1822", 2);
    ellipse(ctx, -25, -132, 33, 34, "#162b3a", "#070e17", 5);
    polygon(ctx, [-47, -137, -28, -156, 9, -145, 8, -132, -32, -117],
        "#f04d53", "#180f18", 3);
    polygon(ctx, [-41, -137, -24, -147, 9, -141, -31, -128], "#ffe0b9", "#b5232d", 2);

    polygon(ctx, [79, -91, 125, -128, 158, -98, 145, -22, 105, 15, 82, -28],
        "#5e3748", "#10151e", 5);
    polygon(ctx, [89, -78, 134, -100, 144, -40, 109, -4], "#a53e48", "#351421", 3);
    ellipse(ctx, 117, -59, 16, 16, "#ea5c63", "#401523", 3);
    ellipse(ctx, 117, -59, 7, 7, "#ffccd1", "", 0);

    const gunRecoil = row === 3 ? charge * 16 : 0;
    polygon(ctx, [-159 + gunRecoil, -80, -56 + gunRecoil, -103,
        -44 + gunRecoil, -32, -159 + gunRecoil, -14], "#202d3e", "#080e17", 7);
    polygon(ctx, [-182 + gunRecoil, -83, -122 + gunRecoil, -91,
        -125 + gunRecoil, -54, -182 + gunRecoil, -49], "#8e9ba9", "#111a28", 4);
    polygon(ctx, [-188 + gunRecoil, -37, -123 + gunRecoil, -40,
        -127 + gunRecoil, -12, -188 + gunRecoil, -8], "#7d8a98", "#111a28", 4);
    for (const yy of [-66, -22]) {
        ellipse(ctx, -182 + gunRecoil, yy, 12, 11, "#0d1520", "#b1b8c0", 4);
        ellipse(ctx, -184 + gunRecoil, yy, 5 + charge * 4, 5 + charge * 3,
            charge > 0.1 ? "#ffd19c" : "#ff4961", "", 0);
    }

    const armY = row === 2 ? -10 + deploy * 31 : -28;
    polygon(ctx, [34, -56, 94, -42, 94, armY + 30, 53, armY + 23,
        15, armY + 7], "#38495a", "#121c28", 5);
    ellipse(ctx, 62, -45, 17, 17, "#b4c1c9", "#151e2c", 5);
    ellipse(ctx, 62, -45, 8, 8, "#ff4054", "", 0);
    polygon(ctx, [48, armY + 12, 5 - deploy * 50, armY + 20,
        -5 - deploy * 55, armY + 38, 61, armY + 47],
        "#8796a8", "#14212d", 5);
    if (row === 2) {
        const claw = -41 - deploy * 60;
        polygon(ctx, [claw, armY + 19, claw - 25, armY + 36, claw - 11, armY + 52,
            claw + 8, armY + 44], "#d3aab0", "#291922", 3);
        glow(ctx, claw - 10, armY + 43, 36 + deploy * 10, "#ffdad0");
    }

    glow(ctx, -1, -37, 47 + t * 3, "#fff3d9");
    ellipse(ctx, -1, -37, 34, 34, "#18202b", "#f3485f", 6);
    ellipse(ctx, -1, -37, 22 + Math.sin(t * Math.PI * 2) * 2, 22, "#fc4357", "#ffd4b2", 3);
    ellipse(ctx, -1, -37, 12, 12, "#fff1d8", "", 0);

    for (let i = 0; i < 6; i++) {
        const angle = Math.PI * 2 * i / 6;
        const x = -1 + Math.cos(angle) * 54;
        const y = -37 + Math.sin(angle) * 54;
        ellipse(ctx, x, y, 4, 4, "#e84356", "", 0);
    }

    for (const x of [-63, -40, 38, 60]) {
        polygon(ctx, [x - 9, 20, x + 9, 20, x + 7, 42, x - 7, 42],
            "#162636", "#0b1220", 2);
        ctx.fillStyle = "#ff4954";
        ctx.fillRect(x - 5, 26, 10, 7);
    }

    if (shield) {
        ctx.save();
        ctx.strokeStyle = "rgba(73,229,255,0.85)";
        ctx.lineWidth = 4 + Math.sin(t * Math.PI * 2) * 1.2;
        ctx.setLineDash([17, 7]);
        ctx.beginPath();
        ctx.ellipse(-6, -31, 170, 192, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(121,221,255,0.44)";
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.ellipse(-6, -31, 160, 183, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (let n = 0; n < 6; n++) {
            const a = (n / 6 + t / 3) * Math.PI * 2;
            glow(ctx, Math.cos(a) * 161, -31 + Math.sin(a) * 177, 14, "#f4f7ff");
        }
        ctx.restore();
    }

    if (row === 2) {
        const x = -105, y = 85;
        ellipse(ctx, x, y, 42, 13, "#fc3f5a", "#ffd2c1", 3);
        ellipse(ctx, x, y, 27, 6, "#ffb2ad", "", 0);
        if (deploy > 0.3) {
            const gradient = ctx.createLinearGradient(x, y - 110, x, y);
            gradient.addColorStop(0, "rgba(255,80,75,0)");
            gradient.addColorStop(1, "rgba(255,80,75,0.68)");
            ctx.fillStyle = gradient;
            ctx.fillRect(x - 23, y - 90, 46, 88);
        }
    }

    if (row === 3 && step >= 2) {
        glow(ctx, -192 + gunRecoil, -45, 36 + step * 10, "#fff8dd");
        polygon(ctx, [-180 + gunRecoil, -56, -252 - step * 5, -68,
            -273 - step * 8, -44, -252 - step * 5, -24,
            -181 + gunRecoil, -29], "rgba(255,89,65,0.8)", "rgba(255,193,118,0.8)", 4);
        glow(ctx, -185 + gunRecoil, -45, 25, "#ffffff");
    }

    ctx.restore();
}

export function createOverlordArt(scene: Phaser.Scene): void {
    const key = "surge_overlord_mk2";
    if (scene.textures.exists(key)) return;

    const texture = scene.textures.createCanvas(key, COLS * FRAME, ROWS * FRAME);
    if (!texture) return;
    const ctx = texture.context;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const index = row * COLS + col;
            ctx.save();
            ctx.translate(col * FRAME, row * FRAME);
            bossFrame(ctx, row, col);
            ctx.restore();
            texture.add(index, 0, col * FRAME, row * FRAME, FRAME, FRAME);
        }
    }
    texture.refresh();
}
