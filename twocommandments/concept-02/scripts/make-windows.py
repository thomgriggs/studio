"""Generates the two leaded-glass windows for section 2 as inline SVG.
Victorian idiom (reference: Mobile Bay cathedral windows): many small irregular
fragments in jewel blues, a warm halo around the heart, Sacred Heart with rays."""
import random, math, re

W, H = 200, 440
ARCH = "M100 0 C150 0 200 60 200 140 V440 H0 V140 C0 60 50 0 100 0 Z"
HEART = (100, 250)   # centre of the heart
BLUES = ["#27507f", "#2b6cb0", "#3b4e9c", "#4a3f8f", "#1f6f7a", "#2f6b45", "#5a67b8", "#234a7a", "#6b4fa0"]
WARM  = ["#f2c14e", "#e8a63a", "#f6e7b8", "#f0b88a", "#e9c46a", "#f4d58d"]
ROSE  = ["#d98a8a", "#e8b4b8", "#c96a6a", "#f0c8c0"]

def shade(hexc, k):
    r, g, b = int(hexc[1:3], 16), int(hexc[3:5], 16), int(hexc[5:7], 16)
    r, g, b = [max(0, min(255, int(v * k))) for v in (r, g, b)]
    return f"#{r:02x}{g:02x}{b:02x}"

HALO_R = 104  # outside this the field is blue mosaic; inside, the petal halo

def cell_color(cx, cy, rng):
    return shade(rng.choice(BLUES), rng.uniform(.82, 1.18))  # tonal variation, like hand-blown glass

def mosaic(seed):
    rng = random.Random(seed)
    step = 30; jit = 9
    cols = W // step + 2; rows = H // step + 2
    pts = {}
    for r in range(rows + 1):
        for c in range(cols + 1):
            x = c * step - step/2 + rng.uniform(-jit, jit)
            y = r * step - step/2 + rng.uniform(-jit, jit)
            pts[(c, r)] = (x, y)
    out = []
    for r in range(rows):
        for c in range(cols):
            p = [pts[(c, r)], pts[(c+1, r)], pts[(c+1, r+1)], pts[(c, r+1)]]
            # split some quads into two triangles for more fragment variety
            cx = sum(q[0] for q in p)/4; cy = sum(q[1] for q in p)/4
            shapes = [p] if rng.random() < .6 else [[p[0], p[1], p[2]], [p[0], p[2], p[3]]]
            for s in shapes:
                scx = sum(q[0] for q in s)/len(s); scy = sum(q[1] for q in s)/len(s)
                if all(math.hypot(x - HEART[0], y - HEART[1]) < HALO_R - 2 for x, y in s): continue
                d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in s) + "Z"
                out.append(f'<path d="{d}" fill="{cell_color(scx, scy, rng)}"/>')
    return "\n".join(out)

def halo(seed):
    """Concentric rings of petal-shaped panes around the heart: gold inside, rose outside."""
    rng = random.Random(seed + 100)
    out = []
    rings = [(0, 62, 10, WARM), (62, 84, 14, WARM), (84, HALO_R, 18, ROSE + WARM)]
    for r0, r1, n, pal in rings:
        off = rng.uniform(0, 2*math.pi/n)
        for i in range(n):
            a0 = off + i * 2*math.pi/n; a1 = off + (i+1) * 2*math.pi/n; am = (a0+a1)/2
            def P(r, a): return f"{HEART[0] + r*math.cos(a):.1f} {HEART[1] + r*math.sin(a):.1f}"
            if r0 == 0:
                d = f"M{P(0, a0)} L{P(r1, a0)} Q{P(r1*1.08, am)} {P(r1, a1)}Z"
            else:
                d = f"M{P(r0, a0)} L{P(r1, a0)} Q{P(r1*1.06, am)} {P(r1, a1)} L{P(r0, a1)} Q{P(r0*1.04, am)} {P(r0, a0)}Z"
            out.append(f'<path d="{d}" fill="{shade(rng.choice(pal), rng.uniform(.9, 1.1))}"/>')
    return "\n".join(out)

def rays(n=16, r0=56, r1=86):
    out = []
    for i in range(n):
        a = -math.pi/2 + i * 2*math.pi/n
        r1 = 90 if i % 2 == 0 else 74
        w = 0.04
        x0, y0 = HEART[0] + r0*math.cos(a - w), HEART[1] + r0*math.sin(a - w)
        x1, y1 = HEART[0] + r1*math.cos(a),      HEART[1] + r1*math.sin(a)
        x2, y2 = HEART[0] + r0*math.cos(a + w), HEART[1] + r0*math.sin(a + w)
        out.append(f'<path class="ray" d="M{x0:.1f} {y0:.1f} L{x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f}Z"/>')
    return "\n".join(out)

HEART_D = "M100 300 C70 276 52 258 52 232 a24 24 0 0 1 48 -8 a24 24 0 0 1 48 8 c0 26 -18 44 -48 68Z"
FLAME_D = "M100 182 c10 10 16 20 10 32 c-2 -6 -6 -8 -10 -10 c-4 2 -8 4 -10 10 c-6 -12 0 -22 10 -32Z"
CROSS_D = "M94 42 h12 v16 h16 v12 h-16 v34 h-12 v-34 h-16 v-12 h16Z"
DOVE_PARTS = [
    ("M72 172 c2 -5 8 -7 14 -5 c10 0 20 2 28 6 c6 2 12 2 20 -2 c-4 6 -10 10 -18 12 c-10 2 -22 0 -32 -4 c-4 -1 -8 -3 -12 -7Z", "motif"),  # body, flying left
    ("M94 170 c-4 -12 2 -24 12 -30 c-2 10 0 20 6 28Z", "motif"),   # near wing
    ("M104 171 c0 -12 8 -22 18 -26 c-6 10 -6 18 -2 26Z", "motif"),  # far wing
    ("M73 170 l-7 2 l7 3Z", "motif motif--beak"),                   # beak
]
DOVE = '<g transform="translate(-40 -164) scale(1.4)">' + "\n".join(f'<path class="{c}" d="{d}"/>' for d, c in DOVE_PARTS) + '<circle cx="74" cy="169" r="1.3" fill="#0d0b09"/></g>'
DOVE_LEAD = '<g transform="translate(-40 -164) scale(1.4)">' + "".join(f'<path d="{d}"/>' for d, c in DOVE_PARTS[:3]) + '</g>'
DOVE_D  = "M100 190 c-6 0 -11 -3 -14 -8 c-9 1 -17 -2 -22 -8 c6 -1 11 -3 14 -6 c-7 -3 -11 -8 -12 -14 c8 4 16 5 24 3 c2 -6 6 -10 11 -11 c3 0 6 1 8 3 l7 -2 l-4 5 c2 3 3 7 3 11 c8 1 15 5 19 11 c-6 0 -11 1 -15 3 c6 3 10 7 12 12 c-9 -3 -18 -3 -26 0 c-1 1 -3 1 -5 1Z"
BRANCH_D= "M106 158 c6 -6 14 -8 22 -6 M112 156 c0 -5 2 -9 6 -11 M118 154 c3 -4 7 -6 12 -6"

def window(id, seed, crown):
    crown_fill = f'<path class="motif" d="{CROSS_D}"/>' if crown == "cross" else DOVE
    crown_lead = f'<path d="{CROSS_D}"/>' if crown == "cross" else DOVE_LEAD
    return f'''<svg class="glass" viewBox="0 0 {W} {H}">
<defs>
<clipPath id="arch-{id}"><path d="{ARCH}"/></clipPath>
<radialGradient id="glow-{id}" cx="50%" cy="57%" r="55%"><stop offset="0" stop-color="#fff6d6" stop-opacity=".55"/><stop offset=".45" stop-color="#ffd27a" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<filter id="grain-{id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="{seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0"/></filter>
</defs>
<path class="stone" d="{ARCH}"/>
<g clip-path="url(#arch-{id})">
<g class="frags">
{mosaic(seed)}
{halo(seed)}
</g>
<rect width="{W}" height="{H}" fill="url(#glow-{id})"/>
<g class="sacred">
<path class="heart" d="{HEART_D}"/>
<path class="flame" d="{FLAME_D}"/>
{crown_fill}
</g>
<rect width="{W}" height="{H}" filter="url(#grain-{id})" opacity=".5"/>
<g class="lead"><path d="{HEART_D}"/><path d="{FLAME_D}"/>{crown_lead}<circle cx="{HEART[0]}" cy="{HEART[1]}" r="{HALO_R}"/><path d="M0 128 H200 M0 372 H200"/><path d="{ARCH}"/></g>
</g>
</svg>'''

# ---- Gospel windows: the field in the evangelist's colour, symbol leaded into a pale medallion ----
GOSPELS = {
    "matthew": {"field": ["#2f6b45", "#3a7d52", "#245a3a", "#4a8a5a", "#1f6f7a", "#356b4f"], "halo": ["#cfe3c9", "#e2ebe3", "#bfe0c4", "#f6e7b8"],
                "sym": "M32 16a6 6 0 1 0 .1 0ZM20 48c2-9 7-13 12-13s10 4 12 13M14 30l10 6M50 30l-10 6"},
    "mark":    {"field": ["#9c2f24", "#b3261e", "#7f1f18", "#c0392b", "#8c3a2a", "#a3362a"], "halo": ["#f0dfda", "#f3c9bd", "#e8b4a8", "#f6e7b8"],
                "sym": "M32 20a10 10 0 1 0 .1 0ZM22 22c-5-2-8 2-6 6M42 22c5-2 8 2 6 6M26 46l6 6 6-6M28 34l4 3 4-3"},
    "luke":    {"field": ["#27507f", "#2b6cb0", "#1f4470", "#3b6fa8", "#3b4e9c", "#2a5c8f"], "halo": ["#d6e2f0", "#bfd2ea", "#c9d8ee", "#f6e7b8"],
                "sym": "M20 26c-6-8-2-14 4-12M44 26c6-8 2-14-4-12M20 30c0 12 6 18 12 18s12-6 12-18c0-4-6-8-12-8s-12 4-12 8z"},
    "john":    {"field": ["#8c6a12", "#a8801a", "#6f540e", "#c9971c", "#9a7a1e", "#b08a22"], "halo": ["#f6e7b8", "#f4d58d", "#efd9a0", "#faf0cf"],
                "sym": "M32 20l-4 6h8zM8 34c10-6 18-6 24-2 6-4 14-4 24 2-8 2-14 6-16 12h-16c-2-6-8-10-16-12z"},
}

def gospel_window(gid, seed):
    g = GOSPELS[gid]
    global BLUES, WARM, ROSE
    keep = (BLUES, WARM, ROSE)
    BLUES, WARM, ROSE = g["field"], g["halo"], g["halo"]
    body = f'''<svg class="glass" viewBox="0 0 {W} {H}">
<defs>
<clipPath id="arch-{gid}"><path d="{ARCH}"/></clipPath>
<radialGradient id="glow-{gid}" cx="50%" cy="57%" r="55%"><stop offset="0" stop-color="#fff6d6" stop-opacity=".5"/><stop offset=".45" stop-color="#ffd27a" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<filter id="grain-{gid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="{seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0"/></filter>
</defs>
<path class="stone" d="{ARCH}"/>
<g clip-path="url(#arch-{gid})">
<g class="frags">
{mosaic(seed)}
{halo(seed)}
</g>
<rect width="{W}" height="{H}" fill="url(#glow-{gid})"/>
<circle class="medallion" cx="{HEART[0]}" cy="{HEART[1]}" r="60"/>
<g class="symbol" transform="translate({HEART[0]-58} {HEART[1]-58}) scale(1.8)"><path d="{g["sym"]}"/></g>
<rect width="{W}" height="{H}" filter="url(#grain-{gid})" opacity=".5"/>
<g class="lead"><circle cx="{HEART[0]}" cy="{HEART[1]}" r="60"/><circle cx="{HEART[0]}" cy="{HEART[1]}" r="{HALO_R}"/><path d="M0 128 H200 M0 372 H200"/><path d="{ARCH}"/></g>
</g>
</svg>'''
    BLUES, WARM, ROSE = keep
    return body

html = open("index.html").read()
for i, gid in enumerate(["matthew", "mark", "luke", "john"]):
    html = re.sub(rf'(<button class="gospel" data-gospel="{gid}"[^>]*>\n?)(.*?)(\n?\t+<span class="gospel__name">)', lambda m: m.group(1) + "\n" + gospel_window(gid, 20 + i) + "\n\t\t\t\t\t" + m.group(3).lstrip("\n"), html, count=1, flags=re.S)
a = window("a", 7, "cross")
b = window("b", 11, "dove")
html = re.sub(r'(<span class="tablet tablet--a" aria-hidden="true">).*?(</span>\n\t+<span class="tablet tablet--b")', lambda m: m.group(1) + "\n" + a + "\n\t\t\t\t\t" + m.group(2), html, count=1, flags=re.S)
html = re.sub(r'(<span class="tablet tablet--b" aria-hidden="true">).*?(</span>\n\t+<span class="sr">)', lambda m: m.group(1) + "\n" + b + "\n\t\t\t\t\t" + m.group(2), html, count=1, flags=re.S)
open("index.html", "w").write(html)
print("windows written")
