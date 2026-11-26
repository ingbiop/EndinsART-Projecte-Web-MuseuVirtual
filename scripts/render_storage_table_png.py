from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "taula-emmagatzematge-endinsart.png"


ROWS = [
    ("Ressenyes", "MySQL", "INSERT INTO reviews ..."),
    ("Permis del llibre de visites", "Sessio PHP (servidor)", "$_SESSION['visites_access']"),
    ("Sales visitades", "localStorage", "localStorage.setItem(...)"),
    ("Temps de la musica", "sessionStorage", "sessionStorage.setItem(...)"),
    ("Obres de Sala 1 i 2", "JSON locals", "data/expo1.json"),
    ("Obres de Sala 3", "API externa + cache JSON", "file_put_contents($cacheFile, ...)"),
    ("Imatges i musica", "Carpetes del projecte (assets/)", "assets/imgs/... · assets/music/..."),
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for font_path in candidates:
        if Path(font_path).exists():
            return ImageFont.truetype(font_path, size=size)
    return ImageFont.load_default()


def rounded(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def fit_text(draw, text, font, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        trial = word if not current else f"{current} {word}"
        if draw.textlength(trial, font=font) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_multiline(draw, lines, xy, font, fill, line_gap=8):
    x, y = xy
    bbox = draw.textbbox((0, 0), "Ag", font=font)
    line_height = bbox[3] - bbox[1]
    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        y += line_height + line_gap
    return y


img = Image.new("RGB", (1600, 900), "#F4F7FD")
draw = ImageDraw.Draw(img)

title_font = load_font(64, bold=True)
head_font = load_font(26, bold=True)
body_font = load_font(24)
strong_font = load_font(24, bold=True)
code_font = load_font(18, bold=True)
note_font = load_font(24, bold=True)

# Background
draw.rectangle((0, 0, 1600, 900), fill="#F6F8FD")

# Title
draw.text((72, 72), "Resum de com guardem la informacio", font=title_font, fill="#1A2958")

# Card shadow + card
rounded(draw, (76, 174, 1528, 748), 28, "#E6EBF7")
rounded(draw, (72, 168, 1524, 742), 28, "#FFFFFF", outline="#DFE5F0", width=2)

header_top = 168
header_bottom = 246
draw.rectangle((72, header_top, 1524, header_bottom), fill="#FBFCFF")

# Column positions
x0, x1, x2, x3 = 72, 518, 984, 1524

for x in (x1, x2):
    draw.line((x, 168, x, 742), fill="#DFE5F0", width=2)

draw.line((72, header_bottom, 1524, header_bottom), fill="#DFE5F0", width=2)

# Headers
draw.text((102, 194), "Que guardem", font=head_font, fill="#243F82")
draw.text((548, 194), "On es guarda", font=head_font, fill="#243F82")
draw.text((1014, 194), "Exemple", font=head_font, fill="#243F82")

row_top = header_bottom
row_height = 71

for index, (left, middle, right) in enumerate(ROWS):
    top = row_top + index * row_height
    bottom = top + row_height
    if index > 0:
        draw.line((72, top, 1524, top), fill="#DFE5F0", width=2)

    draw.text((102, top + 20), left, font=strong_font, fill="#1A2958")
    draw.text((548, top + 20), middle, font=body_font, fill="#53648E")

    pill_x = 1014
    pill_y = top + 15
    code_lines = fit_text(draw, right, code_font, 450)
    pill_height = 40 if len(code_lines) == 1 else 66
    pill_width = max(int(draw.textlength(line, font=code_font)) for line in code_lines) + 28
    rounded(draw, (pill_x, pill_y, pill_x + pill_width, pill_y + pill_height), 20, "#EEF3FF")
    draw_multiline(draw, code_lines, (pill_x + 14, pill_y + 9), code_font, "#2E5CFF", line_gap=2)

# Note
rounded(draw, (72, 782, 1524, 868), 24, "#DCFCE7")
draw.text(
    (102, 796),
    "Idea clau: MySQL guarda dades permanents; sessio PHP, localStorage",
    font=note_font,
    fill="#166534",
)
draw.text(
    (102, 828),
    "i sessionStorage guarden estat temporal o de navegacio.",
    font=note_font,
    fill="#166534",
)

img.save(OUTPUT)
print(OUTPUT)
