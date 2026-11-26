from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "deliverables"
OUT_PATH = OUT_DIR / "EndinsART_memoria_corregida.docx"

ACCENT = RGBColor(0xC9, 0xA9, 0x6E)
DARK = RGBColor(0x1A, 0x12, 0x09)
MUTED = RGBColor(0x63, 0x58, 0x4D)
LIGHT_BG = "F7F3EE"
ACCENT_BG = "EFE2C5"
LINE_BG = "1A1209"


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def set_cell_margins(cell, top=100, start=120, bottom=100, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for key, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{key}"))
        if node is None:
            node = OxmlElement(f"w:{key}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table, color="D7CEC0", size=6):
    tbl = table._tbl
    tbl_pr = tbl.tblPr
    borders = tbl_pr.first_child_found_in("w:tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for border_name in ("top", "left", "bottom", "right", "insideH", "insideV"):
        border = borders.find(qn(f"w:{border_name}"))
        if border is None:
            border = OxmlElement(f"w:{border_name}")
            borders.append(border)
        border.set(qn("w:val"), "single")
        border.set(qn("w:sz"), str(size))
        border.set(qn("w:space"), "0")
        border.set(qn("w:color"), color)


def set_paragraph_borders(paragraph, color="C9A96E", size=10):
    p_pr = paragraph._p.get_or_add_pPr()
    p_bdr = p_pr.first_child_found_in("w:pBdr")
    if p_bdr is None:
        p_bdr = OxmlElement("w:pBdr")
        p_pr.append(p_bdr)
    bottom = p_bdr.find(qn("w:bottom"))
    if bottom is None:
        bottom = OxmlElement("w:bottom")
        p_bdr.append(bottom)
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), str(size))
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), color)


def style_run(run, *, font="Aptos", size=11, bold=False, italic=False, color=None):
    run.font.name = font
    run._element.rPr.rFonts.set(qn("w:eastAsia"), font)
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    if color:
        run.font.color.rgb = color


def add_text(paragraph, text, **kwargs):
    run = paragraph.add_run(text)
    style_run(run, **kwargs)
    return run


def add_body_paragraph(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.25
    add_text(p, text, font="Aptos", size=11, color=DARK)
    return p


def add_heading(doc, text, level=1):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12 if level == 1 else 6)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    if level == 1:
        run = add_text(p, text, font="Georgia", size=17, bold=True, color=DARK)
        set_paragraph_borders(p, color="C9A96E", size=8)
    elif level == 2:
        run = add_text(p, text, font="Georgia", size=13, bold=True, color=DARK)
    else:
        run = add_text(p, text, font="Aptos", size=11, bold=True, color=MUTED)
    return p


def add_bullet(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.left_indent = Cm(0.45)
    p.paragraph_format.first_line_indent = Cm(-0.3)
    add_text(p, "• ", font="Aptos", size=10.8, bold=True, color=ACCENT)
    add_text(p, text, font="Aptos", size=10.8, color=DARK)
    return p


def add_callout(doc, title, text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    set_table_borders(table, color="D8C7A7", size=6)
    cell = table.cell(0, 0)
    set_cell_shading(cell, ACCENT_BG)
    set_cell_margins(cell, top=140, start=160, bottom=140, end=160)
    p1 = cell.paragraphs[0]
    p1.paragraph_format.space_after = Pt(2)
    add_text(p1, title, font="Aptos", size=10, bold=True, color=DARK)
    p2 = cell.add_paragraph()
    p2.paragraph_format.space_after = Pt(0)
    p2.paragraph_format.line_spacing = 1.15
    add_text(p2, text, font="Aptos", size=10.5, color=DARK)


def add_simple_table(doc, headers, rows, widths_cm=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)
    header_cells = table.rows[0].cells
    for i, header in enumerate(headers):
        if widths_cm:
            header_cells[i].width = Cm(widths_cm[i])
        set_cell_shading(header_cells[i], LINE_BG)
        set_cell_margins(header_cells[i], top=120, start=120, bottom=120, end=120)
        p = header_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(header)
        style_run(run, font="Aptos", size=10, bold=True, color=RGBColor(0xFF, 0xFF, 0xFF))
        header_cells[i].vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    for row in rows:
        cells = table.add_row().cells
        for i, value in enumerate(row):
            if widths_cm:
                cells[i].width = Cm(widths_cm[i])
            set_cell_shading(cells[i], LIGHT_BG)
            set_cell_margins(cells[i], top=110, start=120, bottom=110, end=120)
            p = cells[i].paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if len(str(value)) > 16 else WD_ALIGN_PARAGRAPH.CENTER
            add_text(p, str(value), font="Aptos", size=10, color=DARK)
            cells[i].vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    return table


def add_stats_row(doc):
    table = doc.add_table(rows=2, cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table, color="D8C7A7", size=6)
    stats = [
        ("3", "sales"),
        ("26", "obres per visita"),
        ("18", "peces locals"),
        ("8", "obres via API"),
        ("7", "mòduls JS"),
    ]
    for i, (value, label) in enumerate(stats):
        for row_idx in (0, 1):
            set_cell_shading(table.cell(row_idx, i), "FBF8F3")
            set_cell_margins(table.cell(row_idx, i), top=100, start=120, bottom=100, end=120)
            table.cell(row_idx, i).width = Cm(3.1)
        p1 = table.cell(0, i).paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_text(p1, value, font="Georgia", size=18, bold=True, color=DARK)
        p2 = table.cell(1, i).paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        add_text(p2, label, font="Aptos", size=9.5, color=MUTED)


def add_footer(section):
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    add_text(p, "EndinsART · Memòria corregida del projecte final", font="Aptos", size=8.5, color=MUTED)


def configure_document(doc):
    section = doc.sections[0]
    section.top_margin = Cm(2.0)
    section.bottom_margin = Cm(1.8)
    section.left_margin = Cm(2.0)
    section.right_margin = Cm(2.0)
    add_footer(section)
    normal = doc.styles["Normal"]
    normal.font.name = "Aptos"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Aptos")
    normal.font.size = Pt(11)


def build_cover(doc):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(6)
    add_text(p, "MEMÒRIA DEL PROJECTE FINAL", font="Aptos", size=10, bold=True, color=ACCENT)

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_after = Pt(2)
    add_text(title, "EndinsART", font="Georgia", size=28, bold=True, color=DARK)

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.paragraph_format.space_after = Pt(12)
    add_text(
        subtitle,
        "Museu virtual d'art digital i interactiu",
        font="Georgia",
        size=15,
        italic=True,
        color=MUTED,
    )

    rule = doc.add_table(rows=1, cols=1)
    rule.alignment = WD_TABLE_ALIGNMENT.CENTER
    rule.autofit = False
    set_table_borders(rule, color="1A1209", size=4)
    cell = rule.cell(0, 0)
    set_cell_shading(cell, "1A1209")
    cell.width = Cm(16.5)
    cell.paragraphs[0].add_run(" ")

    doc.add_paragraph()

    meta = doc.add_table(rows=2, cols=2)
    meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta.autofit = False
    set_table_borders(meta, color="D8C7A7", size=6)
    meta_data = [
        ("Autora", "Íngrid Palomino Pérez"),
        ("Centre", "CIFO La Violeta · Barcelona"),
        ("Curs", "Confecció i Publicació de Pàgines Web 2025–2026"),
        ("Data", "Maig de 2026"),
    ]
    for idx, (label, value) in enumerate(meta_data):
        row = idx // 2
        col = (idx % 2) * 1
        cell = meta.cell(row, col)
        set_cell_shading(cell, LIGHT_BG)
        set_cell_margins(cell, top=140, start=180, bottom=140, end=180)
        p1 = cell.paragraphs[0]
        p1.paragraph_format.space_after = Pt(2)
        add_text(p1, label, font="Aptos", size=9.5, bold=True, color=MUTED)
        p2 = cell.add_paragraph()
        add_text(p2, value, font="Aptos", size=10.5, color=DARK)

    doc.add_paragraph()
    add_callout(
        doc,
        "Síntesi",
        "Aquest document refà i actualitza el contingut del PDF inicial de proposta perquè descrigui "
        "el projecte tal com s'ha desenvolupat finalment: una experiència web modular, sense frameworks, "
        "amb tres sales, obres interactives, audioguies en català, exposició temporal connectada a una API "
        "externa i llibre de visites amb persistència en MySQL.",
    )
    doc.add_paragraph()
    add_stats_row(doc)
    doc.add_page_break()


def add_content(doc):
    add_heading(doc, "1. Presentació del projecte", level=1)
    add_body_paragraph(
        doc,
        "EndinsART és un museu virtual d'art digital i interactiu desenvolupat com a projecte final del "
        "curs de Confecció i Publicació de Pàgines Web. El projecte proposa una experiència de visita web "
        "amb estructura museística: entrada, mapa, sales d'exposició, fitxes informatives, audioguies i "
        "llibre de visites. L'usuari no es limita a mirar imatges, sinó que explora, activa i interpreta "
        "cada obra a través d'interaccions específiques.",
    )
    add_body_paragraph(
        doc,
        "El nom EndinsART reforça aquesta idea d'entrada i immersió. La visita està pensada com un recorregut "
        "cultural amb ritme propi, una identitat visual coherent i una capa pedagògica que acompanya "
        "l'experiència sense convertir-la en una lectura passiva.",
    )
    add_heading(doc, "Objectius del projecte", level=2)
    for bullet in [
        "Apropar l'art al públic digital mitjançant una experiència atractiva, navegable i memorable.",
        "Combinar contemplació, experimentació i divulgació en un únic producte web.",
        "Demostrar que és possible construir una experiència expositiva sòlida sense frameworks, amb codi modular i escalable.",
        "Integrar recursos d'accessibilitat i de participació perquè la visita sigui més inclusiva i activa.",
    ]:
        add_bullet(doc, bullet)

    add_heading(doc, "2. Necessitat detectada i proposta de valor", level=1)
    add_body_paragraph(
        doc,
        "Moltes visites virtuals existents permeten accedir a col·leccions, però no aconsegueixen convertir "
        "l'usuari en participant. Sovint reprodueixen el model de galeria d'imatges o recorregut 360° sense "
        "interacció significativa. EndinsART neix com a resposta a aquesta mancança: una proposta que utilitza "
        "la web no només com a aparador, sinó com a espai de mediació cultural.",
    )
    add_body_paragraph(
        doc,
        "La proposta de valor del projecte es basa en tres capes que es reforcen mútuament. D'una banda, la "
        "capa artística, amb obres animades o manipulables. De l'altra, la capa expositiva, amb recorregut, "
        "ritme i senyalització pròpia d'un museu. Finalment, la capa educativa, que aporta context mitjançant "
        "plaques, modals i audioguies sense frenar la navegació.",
    )
    add_callout(
        doc,
        "Diferenciador clau",
        "A EndinsART les obres no es presenten com a peces estàtiques: s'activen, es comparen, es desplacen, "
        "es revelen o es transformen. L'experiència està pensada perquè l'usuari descobreixi l'obra fent-hi alguna cosa.",
    )

    add_heading(doc, "3. Evolució respecte a la proposta inicial", level=1)
    add_body_paragraph(
        doc,
        "El PDF original descrivia una proposta de projecte. En el desenvolupament final, diverses decisions "
        "han evolucionat per ajustar-se millor a la viabilitat tècnica i a la qualitat de l'experiència. "
        "La versió acabada és més madura, més modular i més propera a un producte real.",
    )
    add_simple_table(
        doc,
        ["Àmbit", "Proposta inicial", "Versió final implementada"],
        [
            ("API externa", "Metropolitan Museum of Art API", "Art Institute of Chicago API amb selecció per pools i caché local de 24 h"),
            ("Arquitectura", "Frontend gairebé exclusiu", "Frontend modular + backend PHP per APIs, normalització i llibre de visites"),
            ("Persistència", "Només localStorage", "localStorage per progrés, sessionStorage per música i MySQL per ressenyes"),
            ("Recorregut", "MVP amb 2 sales operatives", "3 sales completes i llibre de visites al tancament de la visita"),
            ("Mediació", "Micro-panells activats per interacció", "Placa informativa, modal ampliat i audioguia amb síntesi de veu"),
        ],
        widths_cm=[3.0, 6.0, 8.0],
    )

    add_heading(doc, "4. Públic objectiu", level=1)
    add_body_paragraph(
        doc,
        "El públic principal és ampli, però comparteix un mateix tret: busca una experiència cultural digital "
        "que no sigui plana ni purament contemplativa. EndinsART s'adreça especialment a estudiants, públic jove, "
        "persones interessades en art, disseny o cultura digital, i usuaris que valoren experiències interactives "
        "accessibles des del navegador.",
    )
    for bullet in [
        "Públic educatiu: alumnat de secundària, batxillerat artístic o estudis superiors vinculats a l'art, el disseny i les humanitats.",
        "Públic cultural i general: visitants virtuals de museus, persones curioses i usuaris que consumeixen contingut cultural en format digital.",
        "Àmbit institucional: museus, centres educatius o projectes culturals que podrien adaptar un model similar per divulgar contingut propi.",
    ]:
        add_bullet(doc, bullet)

    add_heading(doc, "5. Solució final implementada", level=1)
    add_body_paragraph(
        doc,
        "La visita es construeix com un recorregut seqüenciat. La pàgina inicial introdueix el projecte amb una "
        "estètica immersiva i una entrada animada en forma de tiquet. Des d'allà s'accedeix al mapa, que funciona "
        "com a nucli de navegació entre sales i com a sistema de memòria del progrés de visita.",
    )
    add_heading(doc, "Flux principal de navegació", level=2)
    add_simple_table(
        doc,
        ["Pantalla", "Funció dins del recorregut"],
        [
            ("index.php", "Portada immersiva, tiquet animat d'entrada i continuïtat musical cap al mapa"),
            ("mapa.php", "Plànol interactiu del museu, cerca d'obres i resum del progrés"),
            ("expo1.php", "Sala 1 · Art interactiu amb 10 peces locals"),
            ("expo2.php", "Sala 2 · Objectes animats i generatius amb 8 peces locals"),
            ("expo3.php", "Sala 3 · Exposició temporal amb 8 obres per visita obtingudes per API"),
            ("llibre-visites.php", "Tancament del recorregut amb ressenyes persistides a base de dades"),
            ("about.php", "Pàgina tècnica de contextualització del projecte"),
        ],
        widths_cm=[4.0, 13.0],
    )

    add_heading(doc, "Sales i continguts", level=2)
    add_simple_table(
        doc,
        ["Sala", "Descripció", "Font de dades", "Interaccions destacades"],
        [
            (
                "Sala 1",
                "Art interactiu amb obres reinterpretades i manipulables.",
                "JSON local",
                "Color picker, comparador dia/nit, parallax, zoom, puzzle, seguiment visual i vidre revelador",
            ),
            (
                "Sala 2",
                "Objectes animats, peces generatives i experiments visuals.",
                "JSON local",
                "Canvas 2D, SVG, animació procedural, engranatges, gotes, remolins i topografies abstractes",
            ),
            (
                "Sala 3",
                "Exposició temporal de pintura en domini públic.",
                "Art Institute of Chicago API",
                "Selecció aleatòria per pools, metadades normalitzades i audioguies en català",
            ),
        ],
        widths_cm=[2.4, 5.4, 3.8, 6.4],
    )

    add_heading(doc, "Funcionalitats principals implementades", level=2)
    for bullet in [
        "Mapa interactiu amb record de sales visitades mitjançant localStorage.",
        "Cerca d'obres per títol o artista amb entrada directa a la sala corresponent.",
        "Motor comú d'exposició per a les tres sales: navegació, punts de progrés, placa, modal i audioguia.",
        "Audioguies amb Web Speech API, prioritzant veu catalana i amb fallback a veu espanyola.",
        "Llibre de visites amb formulari validat, persistència a MySQL i vista pública de ressenyes.",
        "Continuïtat de la música entre portada i mapa amb sessionStorage.",
        "Modals accessibles amb focus trap, tancament per Escape i navegació per teclat.",
    ]:
        add_bullet(doc, bullet)

    add_heading(doc, "6. Tecnologies i arquitectura", level=1)
    add_body_paragraph(
        doc,
        "El projecte s'ha desenvolupat sense frameworks, amb una arquitectura basada en HTML, CSS, JavaScript "
        "modular, PHP i MySQL. Aquesta decisió dona més valor pedagògic al projecte i obliga a resoldre "
        "manualment aspectes de navegació, interacció, persistència i organització de codi.",
    )
    add_heading(doc, "Stack tecnològic", level=2)
    add_simple_table(
        doc,
        ["Tecnologia", "Paper dins del projecte"],
        [
            ("HTML5", "Estructura semàntica de pàgines, sales, plaques i formularis"),
            ("CSS3", "Sistema visual, maquetació responsive, animacions, estats i variables de tema"),
            ("JavaScript ES Modules", "Lògica de navegació, interaccions, renderitzat d'obres i consum de dades"),
            ("Canvas 2D API", "Obres interactives i peces generatives"),
            ("SVG", "Elements animats, mapes i composicions visuals"),
            ("Web Speech API", "Síntesi de veu per a les audioguies"),
            ("PHP 8", "Plantilles reutilitzables, endpoints JSON, normalització de dades i caché"),
            ("MySQL + PDO", "Persistència del llibre de visites i accés segur a dades"),
            ("Art Institute of Chicago API", "Obtenció d'obres públiques per a la sala temporal"),
            ("MyMemory API", "Suport a la traducció i normalització de metadades al català"),
        ],
        widths_cm=[5.0, 12.0],
    )

    add_heading(doc, "Arquitectura JavaScript", level=2)
    add_simple_table(
        doc,
        ["Fitxer", "Responsabilitat"],
        [
            ("main.js", "Capçalera global, menú mòbil i gestió de la continuïtat musical"),
            ("home.js", "Mural d'art dinàmic, parallax i animació del tiquet d'entrada"),
            ("mapa.js", "Plànol del museu, memòria de sales visitades i cerca d'obres"),
            ("expo.js", "Motor compartit per a totes les exposicions"),
            ("visites.js", "Càrrega, validació i renderitzat del llibre de ressenyes"),
            ("js/modules/*", "Mòduls especialitzats per API, àudio, modals, validació, storage i renderers"),
        ],
        widths_cm=[4.0, 13.0],
    )

    add_heading(doc, "7. Disseny, branding i experiència d'usuari", level=1)
    add_body_paragraph(
        doc,
        "La identitat visual final del projecte no depèn d'un logotip gràfic aplicat a la interfície. La marca "
        "es construeix sobretot a partir del nom EndinsART, d'una direcció d'art coherent i d'un tractament "
        "tipogràfic i cromàtic que combina atmosfera museística i llenguatge digital contemporani.",
    )
    add_simple_table(
        doc,
        ["Element", "Decisió final"],
        [
            ("Identitat", "Wordmark tipogràfic i ús prominent del nom EndinsART"),
            ("Paleta", "Fons foscos, marfil clar, acents daurats i detalls càlids en CTA"),
            ("Tipografia", "Contrast entre serif editorial per a títols i sans contemporània per a interfície"),
            ("Tò visual", "Immersiu, sobri, elegant i orientat a posar l'obra al centre"),
            ("Responsive", "Disseny mobile-first amb adaptacions específiques per a sala, mapa i formularis"),
        ],
        widths_cm=[4.0, 13.0],
    )
    add_heading(doc, "Accessibilitat i usabilitat", level=2)
    for bullet in [
        "HTML semàntic, etiquetes ARIA i estructura clara de navegació.",
        "Suport de teclat a galeries i modals.",
        "Audioguies per facilitar l'accés al contingut de les obres.",
        "Ús de prefers-reduced-motion per reduir càrrega visual quan el sistema ho demana.",
        "Formulari de ressenyes validat tant al client com al servidor.",
    ]:
        add_bullet(doc, bullet)

    add_heading(doc, "8. Gestió de dades i integracions", level=1)
    add_body_paragraph(
        doc,
        "Un dels canvis més rellevants respecte a la proposta inicial és la incorporació d'una gestió de dades "
        "més rica. El projecte combina dades locals, dades externes i persistència en base de dades. Això permet "
        "que la visita mantingui un recorregut consistent i, alhora, incorpori una capa dinàmica en la tercera sala.",
    )
    add_simple_table(
        doc,
        ["Dada", "Emmagatzematge / origen", "Finalitat"],
        [
            ("Sales visitades", "localStorage", "Recordar el progrés de visita al mapa"),
            ("Temps de música", "sessionStorage + paràmetre URL", "Mantenir continuïtat sonora entre portada i mapa"),
            ("Obres de les sales 1 i 2", "JSON local", "Separar contingut de la lògica d'interacció"),
            ("Obres de la sala 3", "ARTIC API + fitxers de caché per pool", "Servir 8 obres per visita i reduir dependència de xarxa"),
            ("Ressenyes", "MySQL via PDO", "Permetre participació final del visitant"),
        ],
        widths_cm=[4.0, 6.3, 6.7],
    )
    add_body_paragraph(
        doc,
        "La sala 3 utilitza una estratègia de pools i caché local de 24 hores. Això minimitza peticions externes, "
        "millora la fiabilitat i permet mantenir varietat entre visites. Les metadades es normalitzen al català "
        "i es netegen abans de mostrar-se a la interfície o de generar el text de l'audioguia.",
    )

    add_heading(doc, "9. Reptes tècnics i decisions de desenvolupament", level=1)
    add_simple_table(
        doc,
        ["Repte", "Solució aplicada"],
        [
            ("Unificar tres sales diferents", "Creació d'un motor compartit d'exposicions amb dades carregades per font i tipus"),
            ("Fer sostenible l'ús d'una API externa", "Caché local per pools, selecció aleatòria i normalització de camps"),
            ("Mantenir una audioguia usable", "Selecció de la millor veu disponible i fallback a veu espanyola"),
            ("Evitar dispersió de codi", "Organització en mòduls ES i plantilles PHP reutilitzables"),
            ("Integrar participació real d'usuari", "Llibre de visites amb sessió d'accés i persistència a base de dades"),
        ],
        widths_cm=[5.0, 12.0],
    )

    add_heading(doc, "10. Resultats obtinguts", level=1)
    add_body_paragraph(
        doc,
        "El projecte final compleix l'objectiu principal de convertir una idea de museu virtual en una experiència "
        "web funcional, coherent i amb identitat pròpia. La navegació és clara, les sales tenen personalitat "
        "diferenciada i el conjunt combina art, interactivitat i contextualització sense dependre de frameworks externs.",
    )
    for bullet in [
        "3 sales operatives amb una estructura de recorregut clara.",
        "26 obres per visita, de les quals 18 són locals i 8 provenen de l'API externa.",
        "Arquitectura modular amb 7 mòduls JavaScript especialitzats.",
        "Backend lleuger però útil, amb endpoints, caché i persistència de ressenyes.",
        "Experiència accessible, responsive i pensada per a l'ús real des de navegador.",
    ]:
        add_bullet(doc, bullet)

    add_heading(doc, "11. Millores futures", level=1)
    add_body_paragraph(
        doc,
        "El README del projecte ja apunta diverses línies d'evolució que encaixen bé amb el plantejament actual. "
        "No es tracta de canviar la base del projecte, sinó d'ampliar-la de manera coherent i sostenible.",
    )
    for bullet in [
        "Afegir més profunditat immersiva a la navegació entre sales i passadissos.",
        "Crear un taller creatiu on l'usuari pugui generar composicions o aplicar filtres propis.",
        "Incorporar una botiga virtual o espai de marxandatge inspirat en les obres.",
        "Desenvolupar un sistema d'usuaris, rols i moderació per al llibre de visites.",
        "Explorar una capa administrativa per gestionar sales, obres i continguts sense tocar el codi.",
    ]:
        add_bullet(doc, bullet)

    add_heading(doc, "12. Conclusió", level=1)
    add_body_paragraph(
        doc,
        "EndinsART demostra que un projecte web acadèmic pot anar més enllà de la pàgina informativa i construir "
        "una experiència cultural amb personalitat, estructura i valor educatiu. La versió final és més sòlida que "
        "la proposta inicial perquè ha convertit idees aspiracionals en decisions concretes: un mapa útil, una "
        "arquitectura modular, un ús justificat de la tecnologia i una proposta estètica coherent.",
    )
    add_body_paragraph(
        doc,
        "En conjunt, el projecte funciona com a prova de concepte d'un museu digital interactiu i, alhora, com a "
        "evidència d'un procés de desenvolupament madur: s'han revisat objectius, s'han ajustat expectatives i "
        "s'ha arribat a un resultat final molt més complet, realista i presentable.",
    )


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = Document()
    configure_document(doc)
    build_cover(doc)
    add_content(doc)
    doc.save(OUT_PATH)
    print(OUT_PATH)


if __name__ == "__main__":
    main()
