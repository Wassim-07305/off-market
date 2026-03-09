#!/usr/bin/env python3
"""
Off-Market — Preview Produit PDF Generator
Generates a professional PDF showcasing all app features for CSM recruitment.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, Image, Flowable
)
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ── Colors ──────────────────────────────────────────────
RED = HexColor("#AF0000")
RED_LIGHT = HexColor("#D42B2B")
RED_BG = HexColor("#FDF2F2")
RED_SUBTLE = HexColor("#FAE8E8")
BLACK = HexColor("#1A1714")
DARK = HexColor("#2D2926")
GREY = HexColor("#6B6560")
GREY_LIGHT = HexColor("#9B9590")
GREY_BG = HexColor("#F5F4F2")
WHITE = HexColor("#FFFFFF")
BORDER = HexColor("#E8E5E1")

W, H = A4  # 595.28 x 841.89 pts

# ── Try to register Montserrat font ─────────────────────
FONT = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_OBLIQUE = "Helvetica-Oblique"

# Check for Montserrat in common locations
font_dirs = [
    os.path.expanduser("~/Library/Fonts"),
    "/Library/Fonts",
    "/System/Library/Fonts",
]
for d in font_dirs:
    regular = os.path.join(d, "Montserrat-Regular.ttf")
    bold = os.path.join(d, "Montserrat-Bold.ttf")
    semi = os.path.join(d, "Montserrat-SemiBold.ttf")
    medium = os.path.join(d, "Montserrat-Medium.ttf")
    if os.path.exists(regular) and os.path.exists(bold):
        try:
            pdfmetrics.registerFont(TTFont("Montserrat", regular))
            pdfmetrics.registerFont(TTFont("Montserrat-Bold", bold))
            if os.path.exists(semi):
                pdfmetrics.registerFont(TTFont("Montserrat-Semi", semi))
            if os.path.exists(medium):
                pdfmetrics.registerFont(TTFont("Montserrat-Medium", medium))
            FONT = "Montserrat"
            FONT_BOLD = "Montserrat-Bold"
            break
        except Exception:
            pass

# ── Styles ──────────────────────────────────────────────
styles = {
    "cover_title": ParagraphStyle(
        "cover_title", fontName=FONT_BOLD, fontSize=42, leading=48,
        textColor=BLACK, alignment=TA_LEFT, spaceAfter=8,
    ),
    "cover_subtitle": ParagraphStyle(
        "cover_subtitle", fontName=FONT, fontSize=16, leading=22,
        textColor=GREY, alignment=TA_LEFT, spaceAfter=20,
    ),
    "section_title": ParagraphStyle(
        "section_title", fontName=FONT_BOLD, fontSize=22, leading=28,
        textColor=BLACK, spaceBefore=0, spaceAfter=6,
    ),
    "section_desc": ParagraphStyle(
        "section_desc", fontName=FONT, fontSize=10, leading=14,
        textColor=GREY, spaceBefore=0, spaceAfter=16,
    ),
    "feature_title": ParagraphStyle(
        "feature_title", fontName=FONT_BOLD, fontSize=11, leading=14,
        textColor=BLACK, spaceBefore=0, spaceAfter=2,
    ),
    "feature_desc": ParagraphStyle(
        "feature_desc", fontName=FONT, fontSize=9.5, leading=13,
        textColor=GREY, spaceBefore=0, spaceAfter=0,
    ),
    "footer": ParagraphStyle(
        "footer", fontName=FONT, fontSize=7.5, leading=10,
        textColor=GREY_LIGHT, alignment=TA_CENTER,
    ),
    "roadmap_title": ParagraphStyle(
        "roadmap_title", fontName=FONT_BOLD, fontSize=11, leading=14,
        textColor=RED, spaceBefore=0, spaceAfter=2,
    ),
    "roadmap_desc": ParagraphStyle(
        "roadmap_desc", fontName=FONT, fontSize=9.5, leading=13,
        textColor=GREY, spaceBefore=0, spaceAfter=0,
    ),
    "stat_number": ParagraphStyle(
        "stat_number", fontName=FONT_BOLD, fontSize=28, leading=32,
        textColor=RED, alignment=TA_CENTER,
    ),
    "stat_label": ParagraphStyle(
        "stat_label", fontName=FONT, fontSize=9, leading=12,
        textColor=GREY, alignment=TA_CENTER,
    ),
}

# ── Custom Flowables ────────────────────────────────────

class RedBar(Flowable):
    """A thin red accent bar."""
    def __init__(self, width=50, height=3):
        Flowable.__init__(self)
        self.width = width
        self.height = height

    def draw(self):
        self.canv.setFillColor(RED)
        self.canv.roundRect(0, 0, self.width, self.height, 1.5, fill=1, stroke=0)

    def wrap(self, aW, aH):
        return (self.width, self.height)


class FeatureCard(Flowable):
    """A single feature card with icon dot, title and description."""
    def __init__(self, icon, title, desc, card_width=240, accent=RED):
        Flowable.__init__(self)
        self.icon_char = icon
        self.title = title
        self.desc = desc
        self.card_width = card_width
        self.accent = accent
        self._height = 0

    def wrap(self, aW, aH):
        # Calculate height based on text
        self.card_width = min(self.card_width, aW)
        text_w = self.card_width - 28
        # Approximate height
        title_lines = max(1, len(self.title) / (text_w / 5.5))
        desc_lines = max(1, len(self.desc) / (text_w / 5))
        self._height = max(44, 14 + title_lines * 14 + desc_lines * 13 + 10)
        return (self.card_width, self._height)

    def draw(self):
        c = self.canv
        # Icon dot
        c.setFillColor(self.accent)
        c.circle(8, self._height - 18, 4, fill=1, stroke=0)
        # Icon character
        c.setFillColor(WHITE)
        c.setFont(FONT_BOLD, 5.5)
        c.drawCentredString(8, self._height - 20, self.icon_char)
        # Title
        c.setFillColor(BLACK)
        c.setFont(FONT_BOLD, 10.5)
        c.drawString(22, self._height - 18, self.title[:50])
        # Description
        c.setFillColor(GREY)
        c.setFont(FONT, 9)
        words = self.desc.split()
        line = ""
        y = self._height - 32
        max_chars = int((self.card_width - 28) / 4.5)
        for word in words:
            test = line + " " + word if line else word
            if len(test) > max_chars:
                c.drawString(22, y, line)
                y -= 12
                line = word
            else:
                line = test
        if line:
            c.drawString(22, y, line)


class SectionHeader(Flowable):
    """Section header with icon, title and optional subtitle."""
    def __init__(self, icon, title, subtitle=""):
        Flowable.__init__(self)
        self.icon = icon
        self.title = title
        self.subtitle = subtitle

    def wrap(self, aW, aH):
        self._width = aW
        return (aW, 56 if self.subtitle else 42)

    def draw(self):
        c = self.canv
        h = 56 if self.subtitle else 42
        # Red accent circle with icon
        c.setFillColor(RED)
        c.circle(16, h - 18, 14, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont(FONT_BOLD, 14)
        c.drawCentredString(16, h - 23, self.icon)
        # Title
        c.setFillColor(BLACK)
        c.setFont(FONT_BOLD, 20)
        c.drawString(40, h - 22, self.title)
        # Red underline
        c.setFillColor(RED)
        c.roundRect(40, h - 30, 50, 2.5, 1, fill=1, stroke=0)
        # Subtitle
        if self.subtitle:
            c.setFillColor(GREY)
            c.setFont(FONT, 10)
            c.drawString(40, h - 48, self.subtitle)


class StatBox(Flowable):
    """A stat highlight box."""
    def __init__(self, number, label, w=120):
        Flowable.__init__(self)
        self.number = number
        self.label = label
        self.w = w

    def wrap(self, aW, aH):
        return (self.w, 60)

    def draw(self):
        c = self.canv
        # Background
        c.setFillColor(GREY_BG)
        c.roundRect(0, 0, self.w, 58, 8, fill=1, stroke=0)
        # Number
        c.setFillColor(RED)
        c.setFont(FONT_BOLD, 24)
        c.drawCentredString(self.w / 2, 28, self.number)
        # Label
        c.setFillColor(GREY)
        c.setFont(FONT, 8)
        c.drawCentredString(self.w / 2, 12, self.label)


class DividerLine(Flowable):
    """A subtle divider line."""
    def __init__(self):
        Flowable.__init__(self)

    def wrap(self, aW, aH):
        self._width = aW
        return (aW, 1)

    def draw(self):
        self.canv.setStrokeColor(BORDER)
        self.canv.setLineWidth(0.5)
        self.canv.line(0, 0, self._width, 0)


# ── Page Templates ──────────────────────────────────────

LOGO_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "logo.png")

def header_footer(canvas_obj, doc):
    """Draw header and footer on every page (except cover)."""
    if doc.page == 1:
        return
    c = canvas_obj
    c.saveState()
    # Header line
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(30, H - 35, W - 30, H - 35)
    # Header text
    c.setFillColor(RED)
    c.setFont(FONT_BOLD, 9)
    c.drawString(30, H - 28, "OFF-MARKET")
    # Page number
    c.setFillColor(GREY_LIGHT)
    c.setFont(FONT, 8)
    c.drawRightString(W - 30, H - 28, f"{doc.page}")
    # Footer line
    c.setStrokeColor(BORDER)
    c.line(30, 32, W - 30, 32)
    # Footer text
    c.setFillColor(GREY_LIGHT)
    c.setFont(FONT, 7)
    c.drawCentredString(W / 2, 20, "Document confidentiel — Preview produit")
    c.restoreState()


def cover_page(canvas_obj, doc):
    """Draw the cover page."""
    c = canvas_obj
    c.saveState()

    # Full white background
    c.setFillColor(WHITE)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Large red accent shape (top-right corner)
    c.setFillColor(RED)
    c.rect(W - 180, H - 180, 180, 180, fill=1, stroke=0)

    # Smaller red accent (bottom-left)
    c.setFillColor(RED_SUBTLE)
    c.rect(0, 0, 120, 8, fill=1, stroke=0)

    # Logo
    if os.path.exists(LOGO_PATH):
        try:
            c.drawImage(LOGO_PATH, 50, H - 160, width=80, height=80,
                       preserveAspectRatio=True, mask='auto')
        except Exception:
            pass

    # Title
    c.setFillColor(BLACK)
    c.setFont(FONT_BOLD, 48)
    c.drawString(50, H - 280, "Off-Market")

    # Red bar under title
    c.setFillColor(RED)
    c.roundRect(50, H - 295, 80, 4, 2, fill=1, stroke=0)

    # Tagline
    c.setFillColor(GREY)
    c.setFont(FONT, 16)
    c.drawString(50, H - 330, "La plateforme tout-en-un pour")
    c.drawString(50, H - 352, "accompagner les freelances")
    c.setFillColor(RED)
    c.setFont(FONT_BOLD, 16)
    c.drawString(50, H - 378, "vers les 10 000\u20ac / mois")

    # Description
    c.setFillColor(GREY)
    c.setFont(FONT, 11)
    y = H - 430
    lines = [
        "Formation, coaching, messagerie, CRM, gamification,",
        "facturation et intelligence artificielle — r\u00e9unis",
        "dans une seule application premium.",
    ]
    for line in lines:
        c.drawString(50, y, line)
        y -= 18

    # Stats row
    stat_y = 180
    stats = [
        ("4 mois", "d'accompagnement"),
        ("10K\u20ac+", "objectif mensuel"),
        ("30+", "clients actifs"),
        ("4", "portails d\u00e9di\u00e9s"),
    ]
    x = 50
    for num, label in stats:
        c.setFillColor(GREY_BG)
        c.roundRect(x, stat_y, 110, 65, 8, fill=1, stroke=0)
        c.setFillColor(RED)
        c.setFont(FONT_BOLD, 22)
        c.drawCentredString(x + 55, stat_y + 35, num)
        c.setFillColor(GREY)
        c.setFont(FONT, 8)
        c.drawCentredString(x + 55, stat_y + 14, label)
        x += 125

    # Footer
    c.setFillColor(GREY_LIGHT)
    c.setFont(FONT, 8)
    c.drawCentredString(W / 2, 40, "Document confidentiel \u2014 Preview produit \u2014 Mars 2026")

    # Bottom red bar
    c.setFillColor(RED)
    c.rect(0, 0, W, 5, fill=1, stroke=0)

    c.restoreState()


# ── Features Data ───────────────────────────────────────

SECTIONS = [
    {
        "icon": "\u2302",  # house
        "title": "Dashboard & Pilotage",
        "subtitle": "Toutes vos m\u00e9triques business en un coup d'oeil",
        "features": [
            ("\u25cf", "Chiffre d'affaires en temps r\u00e9el",
             "Visualisez votre CA factur\u00e9 et encaiss\u00e9, par mois, trimestre ou ann\u00e9e, avec graphiques d'\u00e9volution."),
            ("\u25cf", "Acquisition par canal",
             "Identifiez instantan\u00e9ment quel canal (LinkedIn, Instagram, upsell) g\u00e9n\u00e8re le plus de clients."),
            ("\u25cf", "Taux de recouvrement",
             "Suivez en direct le cash collect\u00e9 vs factur\u00e9 et identifiez les retards de paiement."),
            ("\u25cf", "LTV & m\u00e9triques clients",
             "Lifetime Value moyenne, taux de r\u00e9tention, NPS et taux de churn \u2014 tout est mesur\u00e9."),
            ("\u25cf", "Taux de closing",
             "Chaque vente est trac\u00e9e avec sa source, son segment et ses commentaires pour optimiser le process."),
            ("\u25cf", "Rapports automatiques",
             "G\u00e9n\u00e9rez des rapports hebdomadaires et mensuels exportables en PDF ou CSV."),
        ]
    },
    {
        "icon": "\u2605",  # star
        "title": "Coaching & Suivi Client",
        "subtitle": "Accompagnez chaque freelance de mani\u00e8re personnalis\u00e9e",
        "features": [
            ("\u25cf", "Syst\u00e8me Green / Orange / Red Flag",
             "Rep\u00e9rez en un clin d'oeil les clients en difficult\u00e9 gr\u00e2ce \u00e0 un code couleur. Notification imm\u00e9diate en cas d'alerte."),
            ("\u25cf", "Workbooks interactifs",
             "Vos exercices (march\u00e9, offre, communication) int\u00e9gr\u00e9s directement dans l'app avec sauvegarde automatique."),
            ("\u25cf", "Transcription d'appels en direct",
             "Chaque call est transcrit en temps r\u00e9el. Plus besoin de Fathom \u2014 tout est dans l'app."),
            ("\u25cf", "Fusion automatique Workbook + Transcript",
             "En fin de call, l'IA g\u00e9n\u00e8re automatiquement le document de synth\u00e8se en fusionnant les r\u00e9ponses et l'\u00e9change."),
            ("\u25cf", "Check-in hebdomadaire",
             "Chaque semaine, le client reporte son CA, ses actions et ses blocages. Alerte si 2 semaines sans check-in."),
            ("\u25cf", "Journal de bord personnel",
             "Espace de notes priv\u00e9 entre les s\u00e9ances, visible uniquement par le client et son coach."),
            ("\u25cf", "Objectifs de coaching",
             "Fixez des objectifs \u00e0 chaque s\u00e9ance avec suivi : En cours / Atteint / Non atteint."),
        ]
    },
    {
        "icon": "\u25B6",  # play
        "title": "Formation (LMS)",
        "subtitle": "Remplacez Skool par votre propre plateforme de cours premium",
        "features": [
            ("\u25cf", "Parcours structur\u00e9s",
             "Organisez vos contenus en Parcours > Modules > Le\u00e7ons avec d\u00e9blocage progressif configurable."),
            ("\u25cf", "Multi-formats",
             "Vid\u00e9o, texte riche, PDF t\u00e9l\u00e9chargeable, images et liens externes dans chaque le\u00e7on."),
            ("\u25cf", "Progression visuelle",
             "Barre de progression par module et parcours global. L'\u00e9l\u00e8ve voit exactement o\u00f9 il en est."),
            ("\u25cf", "Checklist d'actions",
             "Chaque le\u00e7on propose des actions concr\u00e8tes \u00e0 cocher pour passer \u00e0 la suite."),
            ("\u25cf", "Biblioth\u00e8que de replays",
             "Tous les replays de calls de groupe tagg\u00e9s par th\u00e8me, avec recherche et favoris."),
            ("\u25cf", "Templates & Ressources",
             "Scripts de vente, mod\u00e8les d'offres, templates de DM \u2014 le tout t\u00e9l\u00e9chargeable en un clic."),
        ]
    },
    {
        "icon": "\u2709",  # envelope
        "title": "Messagerie & Communication",
        "subtitle": "Simplicite et efficacite \u2014 fini la dispersion sur Slack",
        "features": [
            ("\u25cf", "Messagerie ultra-simple",
             "Un canal par client + channels de groupe. Pas de gadgets inutiles \u2014 vos clients communiquent, point."),
            ("\u25cf", "Notifications intelligentes",
             "Soyez alert\u00e9 d\u00e8s qu'un workbook est rempli, qu'un message arrive ou qu'un flag change."),
            ("\u25cf", "Retours vid\u00e9o",
             "Quand un appel n'est pas n\u00e9cessaire, envoyez un retour vid\u00e9o directement dans la conversation."),
            ("\u25cf", "Feed communautaire",
             "Vos clients partagent leurs victoires, posent des questions et s'entraident. Likes, commentaires, posts \u00e9pingl\u00e9s."),
            ("\u25cf", "Recherche dans l'historique",
             "Retrouvez n'importe quel message, fichier ou conversation en quelques secondes."),
        ]
    },
    {
        "icon": "\u2726",  # sparkle
        "title": "Assistant IA Int\u00e9gr\u00e9",
        "subtitle": "Un coach virtuel disponible 24h/24 pour vos clients",
        "features": [
            ("\u25cf", "R\u00e9ponses instantan\u00e9es",
             "L'IA r\u00e9pond imm\u00e9diatement aux questions des clients en s'appuyant sur votre m\u00e9thodologie."),
            ("\u25cf", "Escalade intelligente",
             "Si le client juge la r\u00e9ponse insuffisante, le coach est notifi\u00e9 avec tout le contexte pour intervenir."),
            ("\u25cf", "G\u00e9n\u00e9ration de documents",
             "L'IA fusionne transcripts et workbooks pour cr\u00e9er automatiquement les synth\u00e8ses de s\u00e9ances."),
            ("\u25cf", "Base de connaissances \u00e9volutive",
             "Enrichissez la base de l'IA depuis le back-office : FAQ, m\u00e9thodologie, contenus de formation."),
            ("\u25cf", "Statistiques IA",
             "Taux de validation des r\u00e9ponses, questions fr\u00e9quentes, temps de r\u00e9ponse \u2014 am\u00e9liorez en continu."),
        ]
    },
    {
        "icon": "\u2192",  # arrow
        "title": "Onboarding Automatis\u00e9",
        "subtitle": "Du closing a l'acces membre en quelques clics",
        "features": [
            ("\u25cf", "Invitation en un clic",
             "Cr\u00e9ez une invitation, envoyez le lien \u2014 le client cr\u00e9e son compte et arrive sur un onboarding guid\u00e9."),
            ("\u25cf", "Vid\u00e9o de bienvenue",
             "Le client est accueilli par votre vid\u00e9o personnalis\u00e9e, aux couleurs de votre marque."),
            ("\u25cf", "Questionnaire de profil",
             "Comp\u00e9tences, niche, exp\u00e9rience, CA actuel, objectifs \u2014 toutes les infos collect\u00e9es automatiquement."),
            ("\u25cf", "\u00c9tapes valid\u00e9es une par une",
             "Le client avance \u00e9tape par \u00e9tape. Vous voyez en temps r\u00e9el o\u00f9 il en est dans l'onboarding."),
            ("\u25cf", "Activation automatique",
             "Une fois l'onboarding termin\u00e9 : acc\u00e8s formation, messagerie, dashboard \u2014 tout est pr\u00eat."),
        ]
    },
    {
        "icon": "\u20ac",  # euro
        "title": "Facturation & Contrats",
        "subtitle": "Generez contrats et factures sans quitter l'application",
        "features": [
            ("\u25cf", "G\u00e9n\u00e9ration automatique de contrats",
             "Le client remplit un formulaire, le contrat est g\u00e9n\u00e9r\u00e9 avec ses infos pr\u00e9-remplies. Fini le copier-coller sur Google Docs."),
            ("\u25cf", "Signature \u00e9lectronique int\u00e9gr\u00e9e",
             "Le client signe directement dans l'app. Horodat\u00e9, archiv\u00e9, conforme."),
            ("\u25cf", "Factures aux normes",
             "Num\u00e9rotation chronologique, mentions l\u00e9gales, branding \u2014 tout est automatis\u00e9 et t\u00e9l\u00e9chargeable en PDF."),
            ("\u25cf", "Paiements \u00e9chelonn\u00e9s",
             "G\u00e9rez les paiements en 1x \u00e0 12x avec calendrier de pr\u00e9l\u00e8vement automatique (Stripe)."),
            ("\u25cf", "Relances automatiques",
             "Rappels progressifs avant et apr\u00e8s \u00e9ch\u00e9ance. Plus aucun impay\u00e9 ne passe entre les mailles."),
            ("\u25cf", "Calcul de commissions prestataires",
             "Entrez une vente \u2014 le syst\u00e8me calcule automatiquement ce que vous devez \u00e0 chaque prestataire."),
        ]
    },
    {
        "icon": "\u260E",  # phone
        "title": "CRM & Equipe Commerciale",
        "subtitle": "Pilotez vos setters et closeurs avec precision",
        "features": [
            ("\u25cf", "Pipeline CRM complet",
             "Chaque setter suit ses leads dans un pipeline visuel : Contact\u00e9 \u2192 Appel book\u00e9 \u2192 Appel r\u00e9alis\u00e9 \u2192 Clos\u00e9."),
            ("\u25cf", "Saisie rapide quotidienne",
             "En 2 minutes, chaque commercial log ses DMs envoy\u00e9s, r\u00e9ponses, appels et deals du jour."),
            ("\u25cf", "Dashboard de performance",
             "Taux de r\u00e9ponse, de booking, de show et de closing en temps r\u00e9el avec comparaison semaine/semaine."),
            ("\u25cf", "Calcul auto des r\u00e9mun\u00e9rations",
             "Commissions en %, bonus de palier, d\u00e9duction Stripe \u2014 tout est calcul\u00e9 automatiquement."),
            ("\u25cf", "Int\u00e9gration LinkedIn (API)",
             "Les actions de prospection LinkedIn sont track\u00e9es automatiquement. Fini les mythos."),
            ("\u25cf", "Classement & comp\u00e9tition",
             "Leaderboard entre setters et entre closeurs pour stimuler la performance collective."),
        ]
    },
    {
        "icon": "\u2691",  # flag
        "title": "Appels & Planning",
        "subtitle": "Un appel par semaine, structure et efficace",
        "features": [
            ("\u25cf", "Booking int\u00e9gr\u00e9 + Google Agenda",
             "Le client choisit parmi vos disponibilit\u00e9s. Synchronisation bidirectionnelle avec Google Calendar."),
            ("\u25cf", "Questions pr\u00e9-appel",
             "Avant chaque call : quel est l'objectif ? Quelle probl\u00e9matique ? Quelles solutions d\u00e9j\u00e0 essay\u00e9es ?"),
            ("\u25cf", "Rappels automatiques",
             "Notifications J-1 et 1h avant chaque s\u00e9ance. Plus de no-shows."),
            ("\u25cf", "Notes de s\u00e9ance",
             "Le coach prend ses notes pendant le call. Partageables ou priv\u00e9es, selon le choix."),
            ("\u25cf", "Replays accessibles",
             "Chaque s\u00e9ance peut \u00eatre enregistr\u00e9e et mise \u00e0 disposition du client en replay."),
        ]
    },
    {
        "icon": "\u2764",  # heart
        "title": "Gamification & Engagement",
        "subtitle": "Transformez la progression en jeu pour maximiser l'engagement",
        "features": [
            ("\u25cf", "Syst\u00e8me de points XP",
             "Chaque action cl\u00e9 rapporte des points : check-in, module compl\u00e9t\u00e9, prospect contact\u00e9, client sign\u00e9."),
            ("\u25cf", "Niveaux et progression",
             "De D\u00e9butant \u00e0 L\u00e9gende des 10K — les clients grimpent les niveaux et affichent leur rang."),
            ("\u25cf", "Badges & Troph\u00e9es",
             "Offre Cr\u00e9\u00e9e, Premier Client Sign\u00e9, 10K Mois, Streak 30 jours \u2014 des badges qui motivent."),
            ("\u25cf", "D\u00e9fis hebdomadaires",
             "Lancez des challenges : 50 DMs cette semaine, 3 clients ce mois. Bonus XP pour les participants."),
            ("\u25cf", "D\u00e9fis communautaires",
             "Objectif collectif avec barre de progression commune. L'union fait la force."),
            ("\u25cf", "Leaderboard mensuel",
             "Classement par XP, progression, r\u00e9gularit\u00e9 et contribution. Top 3 mis en avant dans le feed."),
            ("\u25cf", "Mur des dipl\u00f4m\u00e9s",
             "Les clients qui atteignent 10K\u20ac/mois acc\u00e8dent au cercle VIP alumni. Preuve sociale puissante."),
        ]
    },
    {
        "icon": "\u2706",  # magnet
        "title": "Lead Magnets & Acquisition",
        "subtitle": "Utilisez l'app elle-meme comme outil de conversion",
        "features": [
            ("\u25cf", "Quiz interactif public",
             "8-12 questions engageantes, score personnalis\u00e9 et diagnostic. Le prospect d\u00e9couvre l'app avant d'acheter."),
            ("\u25cf", "Effet teasing",
             "Le prospect voit des sections flout\u00e9es de l'app. \u00ab Cet espace est r\u00e9serv\u00e9 aux membres \u00bb \u2014 cr\u00e9ez le d\u00e9sir."),
            ("\u25cf", "Calculateur de tarif gratuit",
             "Le freelance entre ses param\u00e8tres et obtient une suggestion de tarif. Capture de l'email incluse."),
            ("\u25cf", "Mini-challenge 5 jours",
             "Le prospect go\u00fbte \u00e0 l'exp\u00e9rience (contenu, communaut\u00e9, gamification) avant d'acheter."),
            ("\u25cf", "CRM int\u00e9gr\u00e9 pour les leads",
             "Chaque lead captur\u00e9 alimente automatiquement le pipeline des setters avec tout le contexte."),
        ]
    },
]


# ── Build PDF ───────────────────────────────────────────

def build_pdf():
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                               "Off-Market-Preview.pdf")

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        topMargin=45,
        bottomMargin=45,
        leftMargin=40,
        rightMargin=40,
    )

    story = []

    # ── Page 1: Cover (drawn by page template) ──
    # Use a tiny spacer + PageBreak to trigger first page then move to second
    story.append(Spacer(1, 1))
    story.append(PageBreak())

    # ── Feature Pages ──
    for i, section in enumerate(SECTIONS):
        # Section Header
        story.append(SectionHeader(
            section["icon"],
            section["title"],
            section.get("subtitle", "")
        ))
        story.append(Spacer(1, 8))

        # Features in two-column layout
        features = section["features"]
        col_width = (W - 80 - 20) / 2  # Available width split in 2 with gap

        rows = []
        for j in range(0, len(features), 2):
            left = features[j]
            right = features[j + 1] if j + 1 < len(features) else None

            left_content = []
            left_content.append(Paragraph(
                f'<font color="#AF0000">\u25cf</font>  <b>{left[1]}</b>',
                styles["feature_title"]
            ))
            left_content.append(Paragraph(left[2], styles["feature_desc"]))

            if right:
                right_content = []
                right_content.append(Paragraph(
                    f'<font color="#AF0000">\u25cf</font>  <b>{right[1]}</b>',
                    styles["feature_title"]
                ))
                right_content.append(Paragraph(right[2], styles["feature_desc"]))
            else:
                right_content = [Paragraph("", styles["feature_desc"])]

            rows.append([left_content, right_content])

        if rows:
            t = Table(rows, colWidths=[col_width, col_width], spaceBefore=0, spaceAfter=0)
            t.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (0, -1), 16),
                ('RIGHTPADDING', (1, 0), (1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(t)

        # Add spacing or page break between sections
        if i < len(SECTIONS) - 1:
            # Group some sections on same page
            if i in [1, 3, 5, 7, 9]:  # After these sections, break
                story.append(PageBreak())
            else:
                story.append(Spacer(1, 20))
                story.append(DividerLine())
                story.append(Spacer(1, 16))

    # ── Closing statement (on last feature page) ──
    story.append(Spacer(1, 30))
    story.append(DividerLine())
    story.append(Spacer(1, 20))

    story.append(Paragraph(
        "<b>Off-Market</b> n'est pas juste une application.",
        ParagraphStyle("cl1", fontName=FONT_BOLD, fontSize=14, leading=20,
                      textColor=BLACK, alignment=TA_CENTER, spaceAfter=4)
    ))
    story.append(Paragraph(
        "C'est un <font color='#AF0000'><b>syst\u00e8me complet</b></font> "
        "qui transforme un accompagnement artisanal",
        ParagraphStyle("cl2", fontName=FONT, fontSize=12, leading=18,
                      textColor=GREY, alignment=TA_CENTER, spaceAfter=2)
    ))
    story.append(Paragraph(
        "en une <font color='#AF0000'><b>machine de coaching scalable</b></font>.",
        ParagraphStyle("cl3", fontName=FONT, fontSize=12, leading=18,
                      textColor=GREY, alignment=TA_CENTER, spaceAfter=20)
    ))

    # Build
    doc.build(story, onFirstPage=cover_page, onLaterPages=header_footer)
    print(f"\n\u2705 PDF g\u00e9n\u00e9r\u00e9 : {output_path}")
    print(f"   Nombre de pages : ~{doc.page}")
    return output_path


if __name__ == "__main__":
    path = build_pdf()
