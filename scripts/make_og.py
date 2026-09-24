# Generate ScanOld OG cover image (1200x630) -> public/og-cover.png
# v2: much stronger aging — deep sepia, burnt edges, foxing, crease, coffee ring, heavy grain
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
random.seed(11)

# --- deep aged paper base ---
img = Image.new('RGB', (W, H), (228, 208, 168))

# large uneven tone patches (old paper is never uniform)
for _ in range(30):
    x, y = random.randint(0, W), random.randint(0, H)
    r = random.randint(80, 300)
    shade = random.randint(150, 195)
    layer = Image.new('L', (W, H), 0)
    ImageDraw.Draw(layer).ellipse([x - r, y - r, x + r, y + r], fill=random.randint(20, 60))
    layer = layer.filter(ImageFilter.GaussianBlur(70))
    img = Image.composite(Image.new('RGB', (W, H), (shade, shade - 25, shade - 62)), img, layer)

# --- foxing spots (age spots) ---
fox = Image.new('L', (W, H), 0)
fd = ImageDraw.Draw(fox)
for _ in range(140):
    x, y = random.randint(0, W), random.randint(0, H)
    r = random.randint(1, 6)
    fd.ellipse([x - r, y - r, x + r, y + r], fill=random.randint(35, 110))
fox = fox.filter(ImageFilter.GaussianBlur(2.2))
img = Image.composite(Image.new('RGB', (W, H), (124, 96, 58)), img, fox)

# --- burnt edges: four passes of edge darkening, borders darkest ---
edge = Image.new('L', (W, H), 0)
ed = ImageDraw.Draw(edge)
for i, inset in enumerate([0, 14, 30, 52]):
    alpha = 150 - i * 30
    ed.rectangle([inset, inset, W - inset, H - inset], outline=alpha, width=18 + i * 10)
edge = edge.filter(ImageFilter.GaussianBlur(26))
img = Image.composite(Image.new('RGB', (W, H), (108, 82, 48)), img, edge)

# --- fold crease (vertical, slightly off center) ---
cx = 622
crease = Image.new('L', (W, H), 0)
cd = ImageDraw.Draw(crease)
cd.line([cx, 0, cx - 4, H], fill=60, width=3)
cd.line([cx + 5, 0, cx + 2, H], fill=110, width=2)
cd.line([cx + 9, 0, cx + 6, H], fill=45, width=2)
crease = crease.filter(ImageFilter.GaussianBlur(1.6))
img = Image.composite(Image.new('RGB', (W, H), (110, 86, 52)), img, crease)
hl = Image.new('L', (W, H), 0)
ImageDraw.Draw(hl).line([cx - 2, 0, cx - 6, H], fill=70, width=2)
img = Image.composite(Image.new('RGB', (W, H), (243, 230, 200)), img, hl)

# --- coffee ring ---
ring = Image.new('L', (W, H), 0)
rd = ImageDraw.Draw(ring)
rx, ry, rr = 980, 470, 78
for ang in range(0, 330, 3):
    a = math.radians(ang)
    wobble = rr + random.uniform(-3, 3)
    x = rx + wobble * math.cos(a)
    y = ry + wobble * math.sin(a)
    rd.ellipse([x - 3, y - 3, x + 3, y + 3], fill=random.randint(50, 95))
ring = ring.filter(ImageFilter.GaussianBlur(2.4))
img = Image.composite(Image.new('RGB', (W, H), (128, 94, 52)), img, ring)

# --- heavy grain ---
noise = Image.effect_noise((W, H), 34).convert('L')
img = Image.composite(Image.new('RGB', (W, H), (112, 92, 62)), img, noise.point(lambda v: v // 5))

d = ImageDraw.Draw(img)

# --- fonts ---
FD = '/System/Library/Fonts/Supplemental/'
serif_b = ImageFont.truetype(FD + 'Georgia Bold.ttf', 128)
serif_m = ImageFont.truetype(FD + 'Georgia.ttf', 40)
serif_s = ImageFont.truetype(FD + 'Georgia Italic.ttf', 30)

INK = (38, 30, 20)
RED = (158, 40, 34)

# --- headline: Scan + worn red seal-ring O + ld (brand logo, concept A) ---
HX, HY = 90, 119
d.text((HX + 3, HY + 3), 'Scan', font=serif_b, fill=(96, 78, 52))
d.text((HX, HY), 'Scan', font=serif_b, fill=INK)
w_scan = d.textlength('Scan', font=serif_b)
bb = d.textbbox((HX, HY), 'Scan', font=serif_b)
ocy = (bb[1] + bb[3]) // 2
orad = 46
rcx = int(HX + w_scan + orad * 0.72)

# ghost ring (letterpress double-print)
d.ellipse([rcx - orad + 3, ocy - orad + 3, rcx + orad + 3, ocy + orad + 3], outline=(96, 78, 52), width=19)

# main seal ring on its own layer: rotated + worn notches
ring = Image.new('RGBA', (orad * 2 + 24, orad * 2 + 24), (0, 0, 0, 0))
rd2 = ImageDraw.Draw(ring)
rc = orad + 12
rd2.ellipse([rc - orad, rc - orad, rc + orad, rc + orad], outline=RED + (255,), width=19)
for _ in range(9):
    ang = random.uniform(0, 6.283)
    dist = random.uniform(orad - 10, orad + 10)
    px, py = rc + dist * math.cos(ang), rc + dist * math.sin(ang)
    pr = random.uniform(2, 4.5)
    rd2.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(228, 208, 168, 255))
ring = ring.rotate(-6, resample=Image.BICUBIC)
img.paste(ring, (rcx - rc, ocy - rc), ring)

ld_x = rcx + orad + 10
d.text((ld_x + 3, HY + 3), 'ld', font=serif_b, fill=(96, 78, 52))
d.text((ld_x, HY), 'ld', font=serif_b, fill=INK)
d.text((94, 268), 'Make any PDF look scanned.', font=serif_m, fill=INK)
d.text((94, 330), '— or conjure an old newspaper from plain text.', font=serif_s, fill=(84, 68, 46))

# --- style chips ---
chips = ['Old Newspaper', 'Photocopy', 'Fax', 'Old Archive', 'Kraft Paper']
x = 94
for c in chips:
    f = ImageFont.truetype(FD + 'Georgia.ttf', 24)
    w = d.textlength(c, font=f)
    d.rounded_rectangle([x, 430, x + w + 36, 480], radius=24, outline=(104, 84, 56), width=2)
    d.text((x + 18, 441), c, font=f, fill=(84, 68, 46))
    x += int(w) + 58

# --- red seal (tilted, worn) ---
seal = Image.new('RGBA', (200, 200), (0, 0, 0, 0))
sd = ImageDraw.Draw(seal)
sd.rounded_rectangle([10, 10, 190, 190], radius=26, fill=(158, 40, 34, 230))
songti_seal = ImageFont.truetype(FD + 'Songti.ttc', 72, index=0)
sd.text((40, 58), '造旧', font=songti_seal, fill=(240, 228, 202, 255))
for _ in range(26):
    px, py = random.randint(16, 184), random.randint(16, 184)
    pr = random.randint(1, 4)
    sd.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(0, 0, 0, 0))
seal = seal.rotate(-8, expand=True, resample=Image.BICUBIC)
img.paste(seal, (880, 80), seal)

# --- footer line ---
d.text((94, 545), 'Free  ·  No signup  ·  Files never leave your browser  ·  scanold.com', font=ImageFont.truetype(FD + 'Georgia.ttf', 26), fill=(96, 78, 52))

img.save('/Users/zhaozhenchao/codes/scanold/public/og-cover.png', optimize=True)
print('og-cover.png v2 saved', img.size)
