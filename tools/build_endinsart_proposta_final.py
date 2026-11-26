from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

from build_endinsart_memoria import (
    ROOT,
    OUT_DIR,
    ACCENT,
    DARK,
    MUTED,
    LIGHT_BG,
    add_body_paragraph,
    add_bullet,
    add_callout,
    add_heading,
    add_simple_table,
    add_stats_row,
    add_text,
    set_cell_margins,
    set_cell_shading,
    set_table_borders,
)


OUT_PATH = OUT_DIR / "EndinsART_proposta_final.docx"


def add_footer(section):
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    add_text(p, "EndinsART · Proposta final del projecte", font="Aptos", size=8.5, color=MUTED)


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
    add_text(p, "PROPOSTA FINAL DEL PROJECTE", font="Aptos", size=10, bold=True, color=ACCENT)

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

    meta = doc.add_table(rows=2, cols=2)
    meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta.autofit = False
    set_table_borders(meta, color="D8C7A7", size=6)
    meta_data = [
        ("Autora", "Íngrid Palomino Pérez"),
        ("Centre", "CIFO La Violeta · Barcelona"),
        ("Projecte", "Museu virtual d'art digital, interactiu i accessible"),
        ("Data", "Maig de 2026"),
    ]
    for idx, (label, value) in enumerate(meta_data):
        row = idx // 2
        col = idx % 2
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
        "Idea central",
        "EndinsART proposa una visita museística digital en què l'usuari explora sales, activa obres, "
        "rep context cultural i participa en el recorregut. El projecte combina direcció d'art, interacció "
        "web i divulgació per transformar la visita virtual en una experiència més viva i memorable.",
    )
    doc.add_paragraph()
    add_stats_row(doc)
    doc.add_page_break()


def add_content(doc):
    add_heading(doc, "1. Concepte del projecte", level=1)
    add_body_paragraph(
        doc,
        "EndinsART és un museu virtual d'art digital i interactiu concebut com una experiència web completa. "
        "No es limita a mostrar obres en format galeria, sinó que estructura la visita com un recorregut amb "
        "entrada, mapa, sales, informació contextual, audioguies i tancament participatiu.",
    )
    add_body_paragraph(
        doc,
        "La proposta parteix d'una idea simple: a la web l'art no només es pot contemplar, també es pot activar, "
        "comparar, descobrir i experimentar. Per això cada sala té una funció pròpia i cada obra aporta una "
        "interacció concreta que dona sentit al format digital.",
    )

    add_heading(doc, "2. Objectiu general", level=1)
    add_body_paragraph(
        doc,
        "L'objectiu principal del projecte és apropar l'art a l'usuari a través d'una experiència immersiva, "
        "interactiva i accessible des del navegador. EndinsART vol demostrar que es pot construir una proposta "
        "cultural atractiva sense recórrer a tecnologies excessivament pesades, mantenint un bon equilibri "
        "entre experiència visual, valor pedagògic i viabilitat tècnica.",
    )
    for bullet in [
        "Fer que la visita artística sigui més activa i participativa.",
        "Unir divulgació cultural i experiència digital en un mateix entorn.",
        "Construir una arquitectura web clara, modular i escalable.",
        "Incorporar recursos d'accessibilitat perquè el contingut sigui més inclusiu.",
    ]:
        add_bullet(doc, bullet)

    add_heading(doc, "3. Públic objectiu", level=1)
    add_body_paragraph(
        doc,
        "El projecte s'adreça principalment a persones interessades en art, cultura visual, educació i experiències "
        "digitals interactives. El format web elimina barreres d'accés i el fa especialment adequat per a públic jove, "
        "estudiants i usuaris acostumats a consumir contingut cultural en dispositius digitals.",
    )
    add_simple_table(
        doc,
        ["Perfil", "Necessitat o interès"],
        [
            ("Estudiants", "Aprendre art d'una manera menys passiva i més experimental"),
            ("Públic cultural", "Descobrir obres i artistes en un entorn digital atractiu"),
            ("Centres educatius", "Disposar d'un recurs complementari per treballar continguts artístics"),
            ("Museus o projectes culturals", "Inspirar noves formes de mediació i visita virtual"),
        ],
        widths_cm=[5.0, 12.0],
    )

    add_heading(doc, "4. Proposta de valor", level=1)
    add_body_paragraph(
        doc,
        "EndinsART es diferencia perquè combina tres dimensions que sovint apareixen separades: experiència visual, "
        "interacció real i mediació cultural. La visita no es basa en desplaçar-se per una col·lecció estàtica, "
        "sinó en avançar per un espai digital amb ritme, identitat i accions significatives.",
    )
    add_callout(
        doc,
        "Valor diferencial",
        "Les obres no actuen com a simples imatges. Cada peça incorpora un comportament propi —comparar, arrossegar, "
        "pintar, revelar, escoltar o completar— que converteix l'usuari en part activa de l'experiència.",
    )

    add_heading(doc, "5. Estructura de l'experiència", level=1)
    add_simple_table(
        doc,
        ["Pantalla", "Funció dins del recorregut"],
        [
            ("Portada", "Presentació del projecte, ambientació i entrada animada al museu"),
            ("Mapa", "Punt central de navegació i consulta del progrés de visita"),
            ("Sala 1", "Art interactiu amb reinterpretacions i peces manipulables"),
            ("Sala 2", "Objectes animats, generatius i experiments visuals"),
            ("Sala 3", "Exposició temporal amb obres servides des d'una API externa"),
            ("Llibre de visites", "Tancament de la visita amb participació de l'usuari"),
        ],
        widths_cm=[4.0, 13.0],
    )
    add_body_paragraph(
        doc,
        "Aquest recorregut permet que la visita tingui una progressió clara. La portada crea l'atmosfera, el mapa "
        "ordena l'experiència, les sales aporten varietat i el llibre de visites tanca el trajecte amb una acció "
        "de retorn per part del públic.",
    )

    add_heading(doc, "6. Sales i continguts", level=1)
    add_simple_table(
        doc,
        ["Sala", "Tema", "Contingut", "Recurs principal"],
        [
            ("Sala 1", "Art interactiu", "10 obres locals amb diferents comportaments interactius", "JSON local + renderers propis"),
            ("Sala 2", "Objectes animats", "8 peces digitals, animades i generatives", "Canvas 2D, SVG i animació procedural"),
            ("Sala 3", "Exposició temporal", "8 obres per visita en domini públic", "Art Institute of Chicago API + caché"),
        ],
        widths_cm=[2.2, 3.6, 6.0, 5.2],
    )
    add_heading(doc, "Interaccions destacades", level=2)
    for bullet in [
        "Comparador dia/nit i efectes de revelació d'imatge.",
        "Parallax, zoom, puzzle, seguiment visual i elements arrossegables.",
        "Escenes generatives amb Canvas 2D i peces animades amb SVG i CSS.",
        "Audioguies, plaques informatives i modal ampliat per aprofundir en cada obra.",
    ]:
        add_bullet(doc, bullet)

    add_heading(doc, "7. Funcionalitats clau", level=1)
    add_simple_table(
        doc,
        ["Funcionalitat", "Aportació a l'experiència"],
        [
            ("Mapa interactiu", "Organitza la visita i fa visible el progrés per sales"),
            ("Cerca d'obres", "Permet localitzar peces per títol o artista"),
            ("Motor expositiu compartit", "Unifica navegació, placa, modal, punts de progrés i àudio"),
            ("Audioguies en català", "Afegeixen accessibilitat i mediació cultural"),
            ("Llibre de visites", "Converteix la visita en una experiència participativa"),
            ("Continuïtat musical", "Reforça la immersió entre portada i mapa"),
        ],
        widths_cm=[5.0, 12.0],
    )

    add_heading(doc, "8. Branding i direcció visual", level=1)
    add_body_paragraph(
        doc,
        "La identitat d'EndinsART es construeix sobretot de manera tipogràfica i atmosfèrica. El projecte no depèn "
        "d'un logotip gràfic aplicat constantment, sinó del pes del nom, de la composició visual i d'una paleta que "
        "evoca alhora espai museístic i entorn digital contemporani.",
    )
    add_simple_table(
        doc,
        ["Element", "Decisió visual"],
        [
            ("Nom de marca", "EndinsART com a wordmark central de la identitat"),
            ("Paleta", "Fons foscos, marfil clar, accent daurat i detalls càlids"),
            ("Tipografia", "Serif editorial per a títols i sans neta per a interfície"),
            ("To visual", "Elegant, immersiu i orientat a posar l'obra al centre"),
            ("Experiència", "Combinació de sobrietat museística i gestos digitals més expressius"),
        ],
        widths_cm=[4.0, 13.0],
    )

    add_heading(doc, "9. Tecnologies utilitzades", level=1)
    add_simple_table(
        doc,
        ["Tecnologia", "Funció dins del projecte"],
        [
            ("HTML5", "Estructura semàntica i base accessible de les pàgines"),
            ("CSS3", "Sistema visual, responsive, animacions i components"),
            ("JavaScript ES Modules", "Lògica d'interacció, navegació i renderitzat"),
            ("Canvas 2D i SVG", "Obres interactives, generatives i elements gràfics"),
            ("Web Speech API", "Audioguies amb síntesi de veu"),
            ("PHP 8", "Plantilles, endpoints, normalització i caché"),
            ("MySQL + PDO", "Persistència del llibre de visites"),
            ("Art Institute of Chicago API", "Alimentació dinàmica de la sala temporal"),
        ],
        widths_cm=[5.0, 12.0],
    )

    add_heading(doc, "10. Arquitectura i gestió de dades", level=1)
    add_body_paragraph(
        doc,
        "L'arquitectura del projecte combina dades locals, dades externes i persistència en base de dades. "
        "Les sales 1 i 2 es basen en fitxers JSON locals, cosa que facilita la modularitat i l'edició de continguts. "
        "La sala 3 utilitza una API externa amb una capa de caché per garantir estabilitat i varietat entre visites.",
    )
    add_simple_table(
        doc,
        ["Dada", "Origen o emmagatzematge", "Utilitat"],
        [
            ("Progressió de sales", "localStorage", "Recordar el recorregut del visitant"),
            ("Temps de música", "sessionStorage", "Mantenir la continuïtat sonora"),
            ("Continguts expositius locals", "JSON", "Separar contingut i comportament"),
            ("Exposició temporal", "ARTIC API + caché local", "Servir obres externes de forma fiable"),
            ("Ressenyes", "MySQL via PDO", "Recollir participació final del visitant"),
        ],
        widths_cm=[4.6, 6.0, 6.4],
    )

    add_heading(doc, "11. Accessibilitat i experiència d'ús", level=1)
    for bullet in [
        "Estructura HTML semàntica i ús d'etiquetes ARIA.",
        "Navegació per teclat en elements clau de la visita.",
        "Audioguies com a recurs de suport a la comprensió.",
        "Modals accessibles amb focus trap i tancament per Escape.",
        "Responsive design perquè l'experiència funcioni en escriptori i mòbil.",
    ]:
        add_bullet(doc, bullet)

    add_heading(doc, "12. Resultat i projecció", level=1)
    add_body_paragraph(
        doc,
        "La proposta final d'EndinsART funciona com una experiència coherent, tancada i plenament presentable. "
        "Demostra capacitat per unir disseny visual, lògica interactiva, arquitectura web i mediació cultural dins "
        "d'un mateix projecte. Alhora, obre línies de continuïtat clares com l'ampliació de sales, eines creatives "
        "per a l'usuari, espais administrables o noves capes d'immersió.",
    )
    add_callout(
        doc,
        "Síntesi final",
        "EndinsART és una proposta digital que transforma la visita virtual en una experiència activa: l'usuari "
        "entra, explora, interactua, aprèn i participa. Aquesta és la força principal del projecte.",
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
