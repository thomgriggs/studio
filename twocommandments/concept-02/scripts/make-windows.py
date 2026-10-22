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

def cell_color(cx, cy, rng):
    d = math.hypot(cx - HEART[0], cy - HEART[1])
    if d < 88:  return rng.choice(WARM)          # halo of gold around the heart
    if d < 118: return rng.choice(ROSE + WARM)   # rose edge of the halo
    return rng.choice(BLUES)

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
                d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in s) + "Z"
                out.append(f'<path d="{d}" fill="{cell_color(scx, scy, rng)}"/>')
    return "\n".join(out)

def rays(n=20, r0=58, r1=92):
    out = []
    for i in range(n):
        a = -math.pi/2 + i * 2*math.pi/n
        w = 0.055
        x0, y0 = HEART[0] + r0*math.cos(a - w), HEART[1] + r0*math.sin(a - w)
        x1, y1 = HEART[0] + r1*math.cos(a),      HEART[1] + r1*math.sin(a)
        x2, y2 = HEART[0] + r0*math.cos(a + w), HEART[1] + r0*math.sin(a + w)
        out.append(f'<path class="ray" d="M{x0:.1f} {y0:.1f} L{x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f}Z"/>')
    return "\n".join(out)

HEART_D = "M100 300 C70 276 52 258 52 232 a24 24 0 0 1 48 -8 a24 24 0 0 1 48 8 c0 26 -18 44 -48 68Z"
FLAME_D = "M100 182 c10 10 16 20 10 32 c-2 -6 -6 -8 -10 -10 c-4 2 -8 4 -10 10 c-6 -12 0 -22 10 -32Z"
CROSS_D = "M96 150 h8 v10 h10 v8 h-10 v22 h-8 v-22 h-10 v-8 h10Z"
DOVE_D  = "M74 168 c10 -12 26 -14 38 -6 c8 -6 18 -6 26 -2 c-6 2 -10 6 -12 12 c6 2 10 6 12 12 c-10 -2 -20 -2 -28 4 c-6 10 -18 14 -30 12 c8 -4 12 -10 12 -18 c-8 -2 -14 -8 -18 -14Z"
BRANCH_D= "M118 186 c8 -2 14 -6 18 -12 M124 184 c0 -6 4 -10 8 -12 M130 180 c2 -5 6 -8 10 -9"

def window(id, seed, crown):
    crown_fill = f'<path class="motif" d="{CROSS_D}"/>' if crown == "cross" else f'<path class="motif" d="{DOVE_D}"/><path class="motif motif--line" d="{BRANCH_D}"/>'
    crown_lead = f'<path d="{CROSS_D}"/>' if crown == "cross" else f'<path d="{DOVE_D}"/>'
    return f'''<svg class="glass" viewBox="0 0 {W} {H}">
<defs>
<clipPath id="arch-{id}"><path d="{ARCH}"/></clipPath>
<radialGradient id="glow-{id}" cx="50%" cy="57%" r="55%"><stop offset="0" stop-color="#fff6d6" stop-opacity=".55"/><stop offset=".45" stop-color="#ffd27a" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<filter id="grain-{id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="{seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0"/></filter>
</defs>
<g clip-path="url(#arch-{id})">
<g class="frags">
{mosaic(seed)}
</g>
<rect width="{W}" height="{H}" fill="url(#glow-{id})"/>
<g class="sacred">
{rays()}
<path class="heart" d="{HEART_D}"/>
<path class="flame" d="{FLAME_D}"/>
{crown_fill}
</g>
<rect width="{W}" height="{H}" filter="url(#grain-{id})" opacity=".5"/>
<g class="lead"><path d="{HEART_D}"/><path d="{FLAME_D}"/>{crown_lead}<path d="M0 140 H200 M0 240 H200 M0 340 H200"/><path d="{ARCH}"/></g>
</g>
</svg>'''

html = open("index.html").read()
a = window("a", 7, "cross")
b = window("b", 11, "dove")
html = re.sub(r'(<span class="tablet tablet--a" aria-hidden="true">).*?(</span>\n\t+<span class="tablet tablet--b")', lambda m: m.group(1) + "\n" + a + "\n\t\t\t\t\t" + m.group(2), html, count=1, flags=re.S)
html = re.sub(r'(<span class="tablet tablet--b" aria-hidden="true">).*?(</span>\n\t+<span class="sr">)', lambda m: m.group(1) + "\n" + b + "\n\t\t\t\t\t" + m.group(2), html, count=1, flags=re.S)
open("index.html", "w").write(html)
print("windows written")
