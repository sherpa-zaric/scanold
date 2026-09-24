# Generate MakeOld OG cover image (1200x630) -> public/og-cover.png
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
random.seed(7)

# --- aged paper background ---
img = Image.new('RGB', (W, H), (238, 226, 198))
d = ImageDraw.Draw(img)

# soft stains
for _ in range(26):
    x, y = random.randint(0, W), random.randint(0, H)
    r = random.randint(60, 260)
    shade = random.randint(150, 185)
    layer = Image.new('L', (W, H), 0)
    ImageDraw.Draw(layer).ellipse([x - r, y - r, x + r, y + r], fill=random.randint(14, 40))
    layer = layer.filter(ImageFilter.GaussianBlur(60))
    img = Image.composite(Image.new('RGB', (W, H), (shade, shade - 20, shade - 55)), img, layer)
d = ImageDraw.Draw(img)

# grain noise
noise = Image.effect_noise((W, H), 22).convert('L')
img = Image.composite(Image.new('RGB', (W, H), (120, 100, 70)), img, noise.point(lambda v: v // 6))
d = ImageDraw.Draw(img)

# vignette
vig = Image.new('L', (W, H), 0)
ImageDraw.Draw(vig).rectangle([30, 30, W - 30, H - 30], fill=255)
vig = vig.filter(ImageFilter.GaussianBlur(70))
img = Image.composite(Image.new('RGB', (W, H), (214, 196, 160)), img, vig.point(lambda v: 255 - v))
d = ImageDraw.Draw(img)

# --- fonts ---
FD = '/System/Library/Fonts/Supplemental/'
serif_b = ImageFont.truetype(FD + 'Georgia Bold.ttf', 128)
serif_m = ImageFont.truetype(FD + 'Georgia.ttf', 40)
serif_s = ImageFont.truetype(FD + 'Georgia Italic.ttf', 30)
songti = ImageFont.truetype(FD + 'Songti.ttc', 64, index=0)

INK = (43, 35, 24)
RED = (163, 42, 36)

# --- headline ---
d.text((90, 120), 'MakeOld', font=serif_b, fill=INK)
d.text((94, 268), 'Make any PDF look scanned.', font=serif_m, fill=INK)
d.text((94, 330), '— or conjure an old newspaper from plain text.', font=serif_s, fill=(90, 76, 56))

# --- chips ---
chips = ['Old Newspaper', 'Photocopy', 'Fax', 'Old Archive', 'Kraft Paper']
x = 94
for c in chips:
    f = ImageFont.truetype(FD + 'Georgia.ttf', 24)
    w = d.textlength(c, font=f)
    d.rounded_rectangle([x, 430, x + w + 36, 480], radius=24, outline=(120, 100, 70), width=2)
    d.text((x + 18, 441), c, font=f, fill=(90, 76, 56))
    x += int(w) + 58

# --- red seal (tilted) ---
seal = Image.new('RGBA', (200, 200), (0, 0, 0, 0))
sd = ImageDraw.Draw(seal)
sd.rounded_rectangle([10, 10, 190, 190], radius=26, fill=(163, 42, 36, 235))
try:
    songti_seal = ImageFont.truetype(FD + 'Songti.ttc', 72, index=0)
except Exception:
    songti_seal = songti
sd.text((40, 58), '造旧', font=songti_seal, fill=(243, 233, 211, 255))
seal = seal.rotate(-8, expand=True, resample=Image.BICUBIC)
img.paste(seal, (900, 90), seal)

# --- footer line ---
d.text((94, 545), 'Free  ·  No signup  ·  Files never leave your browser  ·  scanold.com', font=ImageFont.truetype(FD + 'Georgia.ttf', 26), fill=(110, 92, 66))

img.save('/Users/zhaozhenchao/codes/makeold/public/og-cover.png', optimize=True)
print('og-cover.png saved', img.size)
