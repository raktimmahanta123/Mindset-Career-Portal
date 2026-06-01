"""
Reframe Studios — Business Reference Sheet PDF
Editorial-style single-document cheat sheet matching the Mindset demo aesthetic.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from datetime import datetime

# ----- Palette -----
PAPER   = HexColor("#F4EFE6")
PAPER_2 = HexColor("#EDE6D8")
INK     = HexColor("#14110F")
INK_SOFT= HexColor("#3B332D")
OXBLOOD = HexColor("#7A1F1A")
SIENNA  = HexColor("#C9762D")
RULE    = HexColor("#C8BDA8")
SAGE    = HexColor("#3F5D3D")

# ----- Fonts (built-in) -----
F_DISPLAY      = "Times-Roman"
F_DISPLAY_IT   = "Times-Italic"
F_DISPLAY_BOLD = "Times-Bold"
F_BODY         = "Helvetica"
F_BODY_BOLD    = "Helvetica-Bold"
F_MONO         = "Courier"
F_MONO_BOLD    = "Courier-Bold"

OUT = "/Users/raktimmahanta/mindset-demo/Reframe-Studios-Reference-Sheet.pdf"

W, H = A4
MARGIN = 18 * mm

# ------------------------------------------------------------------ helpers

def fill_paper(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)

def page_meta(c, page_no, total, title):
    """Editorial header + footer on every page."""
    c.setFillColor(INK)
    c.setFont(F_MONO, 7.5)
    # Top: brand mark
    c.drawString(MARGIN, H - 12*mm, "REFRAME STUDIOS  /  BUSINESS REFERENCE")
    c.drawRightString(W - MARGIN, H - 12*mm, title.upper())

    # Hairline
    c.setStrokeColor(RULE)
    c.setLineWidth(0.4)
    c.line(MARGIN, H - 14*mm, W - MARGIN, H - 14*mm)

    # Bottom
    c.setFont(F_MONO, 7)
    c.setFillColor(INK_SOFT)
    c.drawString(MARGIN, 10*mm, "UDYAM-AS-03-0088857  /  GUWAHATI  /  v1.0")
    c.drawRightString(W - MARGIN, 10*mm, f"PAGE {page_no:02d} / {total:02d}")

def hr(c, y, thick=0.5, color=None):
    c.setStrokeColor(color or RULE)
    c.setLineWidth(thick)
    c.line(MARGIN, y, W - MARGIN, y)

def eyebrow(c, y, text, accent=OXBLOOD):
    c.setFillColor(accent)
    c.setFont(F_MONO_BOLD, 8)
    c.drawString(MARGIN, y, text.upper())

def section_no(c, y, num, label, accent=OXBLOOD):
    c.setStrokeColor(accent)
    c.setLineWidth(1.5)
    c.line(MARGIN, y + 4*mm, MARGIN + 12*mm, y + 4*mm)
    c.setFillColor(accent)
    c.setFont(F_MONO_BOLD, 8)
    c.drawString(MARGIN, y, f"§ {num}  —  {label.upper()}")

def h_title(c, y, text_before, italic_part, text_after="", size=32):
    """Serif display title with italic segment in oxblood."""
    c.setFillColor(INK)
    c.setFont(F_DISPLAY, size)
    x = MARGIN
    if text_before:
        c.drawString(x, y, text_before)
        x += c.stringWidth(text_before, F_DISPLAY, size)
    if italic_part:
        c.setFillColor(OXBLOOD)
        c.setFont(F_DISPLAY_IT, size)
        c.drawString(x, y, italic_part)
        x += c.stringWidth(italic_part, F_DISPLAY_IT, size)
    if text_after:
        c.setFillColor(INK)
        c.setFont(F_DISPLAY, size)
        c.drawString(x, y, text_after)

def draw_kv(c, x, y, k, v, k_w=48*mm, v_font=F_BODY_BOLD, v_size=11):
    c.setFillColor(INK_SOFT)
    c.setFont(F_MONO, 7.5)
    c.drawString(x, y, k.upper())
    c.setFillColor(INK)
    c.setFont(v_font, v_size)
    c.drawString(x + k_w, y, v)

def wrap_text(c, text, x, y, width, font=F_BODY, size=10, leading=14, fill=INK):
    """Simple word-wrapped drawstring. Returns y after the block."""
    c.setFillColor(fill)
    c.setFont(font, size)
    words = text.split()
    line = ""
    for w in words:
        test = (line + " " + w).strip()
        if c.stringWidth(test, font, size) <= width:
            line = test
        else:
            c.drawString(x, y, line)
            y -= leading
            line = w
    if line:
        c.drawString(x, y, line)
        y -= leading
    return y

def boxed(c, x, y, w, h, fill=None, stroke=INK, lw=0.5, dash=None):
    c.setStrokeColor(stroke)
    c.setLineWidth(lw)
    if dash: c.setDash(dash)
    else: c.setDash()
    if fill:
        c.setFillColor(fill)
        c.rect(x, y, w, h, stroke=1, fill=1)
    else:
        c.rect(x, y, w, h, stroke=1, fill=0)
    c.setDash()

# ============================================================ PAGE 1 — IDENTITY

def page_identity(c):
    fill_paper(c)
    page_meta(c, 1, 4, "Identity")

    # Masthead
    y = H - 30*mm
    c.setFillColor(OXBLOOD)
    c.circle(MARGIN + 4, y + 4, 3, stroke=0, fill=1)
    c.setFillColor(INK)
    c.setFont(F_DISPLAY_BOLD, 22)
    c.drawString(MARGIN + 14, y, "Reframe Studios")
    c.setFillColor(INK_SOFT)
    c.setFont(F_MONO, 8)
    c.drawString(MARGIN + 14, y - 14, "EST. 2024  /  GUWAHATI, ASSAM  /  MSME REGISTERED")

    # Huge display line
    y -= 28*mm
    h_title(c, y, "A business ", "prospectus,", size=34)
    y -= 12*mm
    h_title(c, y, "", "considered.", "", size=34)

    # Lede
    y -= 16*mm
    body = ParagraphStyle(
        name="lede", fontName=F_DISPLAY_IT, fontSize=12, leading=17,
        textColor=INK_SOFT
    )
    p = Paragraph(
        "A single-page reference of business credentials, pitch numbers, invoice language, "
        "and next-action items for Reframe Studios — a sole-proprietorship web design &amp; "
        "development practice based in Guwahati.",
        body
    )
    p.wrapOn(c, W - 2*MARGIN - 40*mm, 40*mm)
    p.drawOn(c, MARGIN, y - 24*mm)

    # ------- BUSINESS CARD BLOCK -------
    y -= 48*mm
    card_x = MARGIN
    card_y = y - 78*mm
    card_w = W - 2*MARGIN
    card_h = 78*mm
    # Background
    c.setFillColor(INK)
    c.rect(card_x, card_y, card_w, card_h, stroke=0, fill=1)

    # Title row
    c.setFillColor(SIENNA)
    c.setFont(F_MONO_BOLD, 8)
    c.drawString(card_x + 10*mm, card_y + card_h - 10*mm, "§ 01  —  CREDENTIALS")
    c.setFillColor(PAPER)
    c.setFont(F_DISPLAY, 20)
    c.drawString(card_x + 10*mm, card_y + card_h - 20*mm, "Business particulars")

    # Two columns
    col1_x = card_x + 10*mm
    col2_x = card_x + card_w/2 + 4*mm

    rows_left = [
        ("Entity name",        "Reframe Studios"),
        ("Proprietor",         "Raktim Mahanta"),
        ("Business type",      "Sole Proprietorship"),
        ("MSME category",      "Micro Enterprise"),
        ("Udyam reg. no.",     "UDYAM-AS-03-0088857"),
        ("PAN",                "CCPPM7203Q"),
    ]
    rows_right = [
        ("Registered address", "Meghmallar Housing Complex,"),
        ("",                   "Sewali Path, Hatigaon,"),
        ("",                   "Guwahati, Kamrup Metropolitan,"),
        ("",                   "Assam - 781038, India"),
        ("GST status",         "Not registered (below threshold)"),
        ("Activity (NIC)",     "62013 - Web design & development"),
    ]

    yy = card_y + card_h - 32*mm
    for k, v in rows_left:
        c.setFillColor(SIENNA)
        c.setFont(F_MONO, 7)
        c.drawString(col1_x, yy, k.upper())
        c.setFillColor(PAPER)
        c.setFont(F_BODY_BOLD, 10)
        c.drawString(col1_x, yy - 4.5*mm, v)
        yy -= 10*mm

    yy = card_y + card_h - 32*mm
    for k, v in rows_right:
        if k:
            c.setFillColor(SIENNA)
            c.setFont(F_MONO, 7)
            c.drawString(col2_x, yy, k.upper())
            c.setFillColor(PAPER)
            c.setFont(F_BODY_BOLD, 10)
            c.drawString(col2_x, yy - 4.5*mm, v)
            yy -= 10*mm
        else:
            c.setFillColor(PAPER)
            c.setFont(F_BODY_BOLD, 10)
            c.drawString(col2_x, yy - 4.5*mm + 10*mm, v)  # continuation line
            yy -= 4.5*mm

    # ------- COMPLIANCE STATUS STRIP -------
    y = card_y - 14*mm
    eyebrow(c, y, "§ 02  —  COMPLIANCE STATUS AT A GLANCE")
    y -= 8*mm
    hr(c, y)

    items = [
        ("Udyam (MSME)",     "Active",  "Today",           SAGE),
        ("PAN",              "Active",  "Personal",        SAGE),
        ("ITR-3 filing",     "Filed",   "FY 2024-25",      SAGE),
        ("GST registration", "N/A",     "< Rs. 20L thresh",INK_SOFT),
        ("Tax audit review", "To-do",   "Book CA this wk", OXBLOOD),
        ("Current account",  "To-do",   "After 1st client",OXBLOOD),
    ]
    y -= 10*mm
    col_w = (W - 2*MARGIN) / 3
    for i, (label, status, note, col) in enumerate(items):
        row, col_i = i // 3, i % 3
        x = MARGIN + col_i * col_w
        yi = y - row * 16*mm
        c.setFillColor(INK_SOFT)
        c.setFont(F_MONO, 7)
        c.drawString(x, yi, label.upper())
        c.setFillColor(col)
        c.setFont(F_BODY_BOLD, 11)
        c.drawString(x, yi - 4.5*mm, status)
        c.setFillColor(INK_SOFT)
        c.setFont(F_BODY, 8)
        c.drawString(x, yi - 9*mm, note)

    c.showPage()

# ============================================================ PAGE 2 — SIGNATURE + INVOICE

def page_signature_invoice(c):
    fill_paper(c)
    page_meta(c, 2, 4, "Signature & Invoice")

    y = H - 30*mm
    section_no(c, y, "03", "Signature block")
    y -= 12*mm
    h_title(c, y, "Copy-paste ", "ready.", "", size=24)

    # Signature block box
    y -= 8*mm
    box_h = 48*mm
    boxed(c, MARGIN, y - box_h, W - 2*MARGIN, box_h, stroke=INK, lw=0.8)
    # Corner marks
    cm = 3
    c.setStrokeColor(OXBLOOD); c.setLineWidth(1.2)
    # TL
    c.line(MARGIN, y, MARGIN + cm*mm, y)
    c.line(MARGIN, y, MARGIN, y - cm*mm)
    # TR
    c.line(W - MARGIN, y, W - MARGIN - cm*mm, y)
    c.line(W - MARGIN, y, W - MARGIN, y - cm*mm)
    # BL
    c.line(MARGIN, y - box_h, MARGIN + cm*mm, y - box_h)
    c.line(MARGIN, y - box_h, MARGIN, y - box_h + cm*mm)
    # BR
    c.line(W - MARGIN, y - box_h, W - MARGIN - cm*mm, y - box_h)
    c.line(W - MARGIN, y - box_h, W - MARGIN, y - box_h + cm*mm)

    # Content inside box — monospaced for copy-paste feel
    bx = MARGIN + 8*mm
    by = y - 10*mm
    lines = [
        ("Raktim Mahanta",                       F_BODY_BOLD, 12, INK),
        ("Proprietor -- Reframe Studios",        F_BODY,      10, INK),
        ("",                                     F_BODY,      4,  INK),
        ("Udyam Reg. No.  :  UDYAM-AS-03-0088857", F_MONO,    9,  INK_SOFT),
        ("PAN             :  CCPPM7203Q",          F_MONO,    9,  INK_SOFT),
        ("Address         :  Meghmallar Housing Complex, Hatigaon, Guwahati - 781038", F_MONO, 9, INK_SOFT),
        ("Phone / Email   :  [+91 XXXXX XXXXX]  /  [you@reframestudios.in]", F_MONO, 9, INK_SOFT),
    ]
    for t, f, s, col in lines:
        c.setFillColor(col)
        c.setFont(f, s)
        c.drawString(bx, by, t)
        by -= (s + 3)

    # ============= INVOICE LANGUAGE =============
    y -= box_h + 18*mm
    section_no(c, y, "04", "Invoice language")
    y -= 12*mm
    h_title(c, y, "For every ", "invoice", " you raise.", size=22)
    y -= 10*mm

    # Header line
    c.setFillColor(INK_SOFT)
    c.setFont(F_BODY, 10)
    w = wrap_text(
        c,
        "Use these standard lines on your invoice header, body and footer. They establish legitimacy, trigger MSME payment protections, and pre-empt common accounts-team questions.",
        MARGIN, y, W - 2*MARGIN, font=F_BODY, size=10, leading=14, fill=INK_SOFT
    )
    y = w - 4*mm

    # Two-column boxes
    col_w = (W - 2*MARGIN - 6*mm) / 2
    blocks = [
        ("HEADER / MASTHEAD",
         "REFRAME STUDIOS\n"
         "A sole-proprietorship MSME\n"
         "Udyam-AS-03-0088857  /  PAN: CCPPM7203Q"),
        ("TAX / GST LINE",
         "Not registered under GST -\nturnover below Rs. 20 lakh\nthreshold for taxable services."),
        ("PAYMENT TERMS",
         "Payable within 15 days of invoice date.\nLate payments attract 2% monthly interest.\nGoverned by the MSMED Act, 2006."),
        ("BANK DETAILS",
         "Account Name   : Raktim Mahanta\nBank / Branch  : State Bank of India\nIFSC / A/C no. : SBIN0003030 / 38447117396"),
    ]

    col_h = 40*mm
    by_top = y
    for i, (title, body) in enumerate(blocks):
        row, col = i // 2, i % 2
        bx = MARGIN + col * (col_w + 6*mm)
        by = by_top - row * (col_h + 6*mm)
        # Box
        boxed(c, bx, by - col_h, col_w, col_h, stroke=RULE, lw=0.5, dash=[2,2])
        # Label
        c.setFillColor(OXBLOOD)
        c.setFont(F_MONO_BOLD, 7)
        c.drawString(bx + 5*mm, by - 6*mm, title)
        # Body (each line)
        c.setFillColor(INK)
        c.setFont(F_MONO, 8.5)
        ly = by - 13*mm
        for ln in body.split("\n"):
            c.drawString(bx + 5*mm, ly, ln)
            ly -= 10

    c.showPage()

# ============================================================ PAGE 3 — PITCH PRICING

def page_pricing(c):
    fill_paper(c)
    page_meta(c, 3, 4, "Pitch & Pricing")

    y = H - 30*mm
    section_no(c, y, "05", "Mindset pitch - three-tier pricing")
    y -= 12*mm
    h_title(c, y, "What to ", "quote.", "", size=24)
    y -= 6*mm
    wrap_text(
        c,
        "Present all three tiers. Client will self-select the middle one. Walk-away floor is Rs. 1,00,000. Deposit required before any code or source is shared: 40%.",
        MARGIN, y - 2*mm, W - 2*MARGIN, font=F_BODY, size=10, leading=14, fill=INK_SOFT
    )
    y -= 18*mm

    # Three cards
    gap = 6*mm
    card_w = (W - 2*MARGIN - 2*gap) / 3
    card_h = 86*mm
    tiers = [
        ("ESSENTIAL",    "Rs. 85,000",  INK_SOFT,
         ["Phase 1 as specced in PDF",
          "3 months hosting included",
          "2 rounds of revisions",
          "Single admin account",
          "30-day post-launch support"]),
        ("PROFESSIONAL", "Rs. 1,45,000", OXBLOOD,
         ["Everything in Essential, plus:",
          "Admin + Placement Office roles",
          "Activity log + CSV/Excel export",
          "Printable receipts",
          "Data-validation + duplicate check",
          "Future-ready schema for Phase 2",
          "Dashboard analytics",
          "4 rounds of revisions",
          "90-day post-launch support"]),
        ("SIGNATURE",    "Rs. 2,25,000", INK,
         ["Everything in Professional, plus:",
          "Custom domain + SSL setup",
          "Automated daily backups",
          "SEO setup for landing page",
          "WhatsApp Business integration",
          "Onboarding + team training",
          "6 months AMC included"]),
    ]

    for i, (name, price, accent, bullets) in enumerate(tiers):
        bx = MARGIN + i * (card_w + gap)
        # Card bg: middle one inverted
        inverted = (i == 1)
        if inverted:
            c.setFillColor(INK)
            c.rect(bx, y - card_h, card_w, card_h, stroke=0, fill=1)
            fg = PAPER
            fg_soft = SIENNA
            bullet_col = PAPER_2
        else:
            boxed(c, bx, y - card_h, card_w, card_h, stroke=RULE, lw=0.6)
            fg = INK
            fg_soft = accent
            bullet_col = INK_SOFT

        # Tier name
        c.setFillColor(fg_soft)
        c.setFont(F_MONO_BOLD, 8)
        c.drawString(bx + 5*mm, y - 8*mm, name)
        # Price
        c.setFillColor(fg)
        c.setFont(F_DISPLAY_BOLD, 17)
        c.drawString(bx + 5*mm, y - 18*mm, price)
        # Rule
        c.setStrokeColor(fg_soft)
        c.setLineWidth(0.4)
        c.line(bx + 5*mm, y - 22*mm, bx + card_w - 5*mm, y - 22*mm)
        # Bullets
        c.setFillColor(bullet_col)
        c.setFont(F_BODY, 8.5)
        by = y - 28*mm
        for bu in bullets:
            # Bullet dot
            c.setFillColor(fg_soft)
            c.circle(bx + 5.5*mm, by + 2.5, 0.8, stroke=0, fill=1)
            c.setFillColor(bullet_col)
            # wrap bullet text
            words = bu.split()
            line = ""
            maxw = card_w - 10*mm
            for w in words:
                test = (line + " " + w).strip()
                if c.stringWidth(test, F_BODY, 8.5) <= maxw:
                    line = test
                else:
                    c.drawString(bx + 8*mm, by, line)
                    by -= 11
                    line = w
            if line:
                c.drawString(bx + 8*mm, by, line)
                by -= 13

    y -= card_h + 10*mm

    # ---- Payment milestones ----
    section_no(c, y, "06", "Payment milestones (mandatory)")
    y -= 10*mm
    milestones = [
        ("40%",  "Kickoff deposit",        "Before any code or source is shared"),
        ("25%",  "Design approval",        "Landing page + admin UI approved"),
        ("25%",  "Beta delivery",          "Working staging URL, client can test"),
        ("10%",  "Go-live + handover",     "After deployment + training"),
    ]
    col1 = MARGIN
    for pct, label, note in milestones:
        c.setFillColor(OXBLOOD)
        c.setFont(F_DISPLAY_BOLD, 20)
        c.drawString(col1, y, pct)
        c.setFillColor(INK)
        c.setFont(F_BODY_BOLD, 10)
        c.drawString(col1 + 22*mm, y, label)
        c.setFillColor(INK_SOFT)
        c.setFont(F_BODY, 9)
        c.drawString(col1 + 22*mm, y - 4.5*mm, note)
        y -= 12*mm

    # ---- Extras strip ----
    y -= 4*mm
    hr(c, y); y -= 8*mm
    c.setFillColor(OXBLOOD)
    c.setFont(F_MONO_BOLD, 8)
    c.drawString(MARGIN, y, "RECURRING + ADD-ONS")
    y -= 6*mm
    extras = [
        ("AMC (annual)",              "Rs. 24,000 / yr  -  Rs. 2,000/mo"),
        ("Hourly (out of scope)",     "Rs. 1,500 / hr"),
        ("Phase 2 ceiling",           "Rs. 2,00,000 (employer + employee login, job posts, notifications)"),
        ("Volume discount",           "10% from project #2 onwards  -  ONLY with signed Preferred Partner MSA"),
    ]
    for k, v in extras:
        c.setFillColor(INK_SOFT)
        c.setFont(F_MONO, 8)
        c.drawString(MARGIN, y, k.upper())
        c.setFillColor(INK)
        c.setFont(F_BODY_BOLD, 10)
        c.drawString(MARGIN + 52*mm, y, v)
        y -= 6.5*mm

    c.showPage()

# ============================================================ PAGE 4 — NEGOTIATION + NEXT STEPS

def page_playbook(c):
    fill_paper(c)
    page_meta(c, 4, 4, "Negotiation & Next")

    y = H - 30*mm
    section_no(c, y, "07", "Scripts for the meeting")
    y -= 12*mm
    h_title(c, y, "What to ", "say.", "", size=24)
    y -= 10*mm

    scripts = [
        ('When they say: "I have many projects coming, can you discount?"',
         'My rate stays the same per project. Once we sign a Preferred Partner Agreement covering 3+ projects '
         'with defined scope and an MSA, I unlock a 10% volume discount from the second project onward and '
         'priority turnaround. That way, the discount is tied to real commitments, not verbal promises.'),

        ('When they ask: "Are you a registered company?"',
         'Reframe Studios is a registered MSME sole proprietorship under the Udyam Registration system. For this '
         'engagement scale, that is the optimal structure - payments go to a properly registered entity, and per '
         'the MSMED Act you as client get built-in legal protections. Our Udyam certificate and PAN are on the '
         'contract.'),

        ('When they push on price:',
         'I understand budget is tight. I will not lower the rate, but I can adjust scope. Which of these '
         'features in the Professional tier are not critical to you for Phase 1? We can move them to Phase 2 '
         'and bring the Phase 1 number down accordingly.'),

        ('When they ask for source code before signing:',
         'The demo is hosted on our infra for evaluation. Source code transfers on final milestone payment, '
         'as per standard practice and our contract. We can schedule a screen-share walk-through of the code '
         'at any stage you want transparency on progress.'),
    ]

    for title, body in scripts:
        c.setFillColor(OXBLOOD)
        c.setFont(F_BODY_BOLD, 9.5)
        y = wrap_text(c, title, MARGIN, y, W - 2*MARGIN, font=F_BODY_BOLD, size=9.5, leading=13, fill=OXBLOOD)
        y -= 1*mm
        # The response
        indent = MARGIN + 6*mm
        # quote mark
        c.setFillColor(SIENNA)
        c.setFont(F_DISPLAY_IT, 16)
        c.drawString(MARGIN, y + 3, '"')
        y = wrap_text(c, body, indent, y, W - MARGIN - indent, font=F_DISPLAY_IT, size=10, leading=14, fill=INK)
        y -= 5*mm

    y -= 2*mm
    hr(c, y)
    y -= 10*mm

    section_no(c, y, "08", "Your next 7 days")
    y -= 12*mm

    todos = [
        ("[x]", "Register Reframe Studios on Udyam portal",             "DONE - today"),
        ("[ ]", "Download Udyam certificate PDF + save to 3 locations", "Today"),
        ("[ ]", "Update email signature, invoice template, pitch deck", "Today"),
        ("[ ]", "Send Mindset proposal with 3-tier pricing",            "Within 24h"),
        ("[ ]", "Book 30-min call with a Guwahati CA",                  "This week"),
        ("[ ]", "Discuss: F&O ITR-3 review, Section 44AB audit need",   "With CA"),
        ("[ ]", "Prepare contract template (deposit + milestones + IP)","Before pitch"),
        ("[ ]", "Open current account for Reframe Studios",             "After 1st payment"),
    ]
    for check, item, when in todos:
        c.setFillColor(OXBLOOD if check == "[x]" else INK)
        c.setFont(F_MONO_BOLD, 10)
        c.drawString(MARGIN, y, check)
        c.setFillColor(INK)
        c.setFont(F_BODY, 10)
        c.drawString(MARGIN + 10*mm, y, item)
        c.setFillColor(INK_SOFT)
        c.setFont(F_MONO, 8)
        c.drawRightString(W - MARGIN, y, when.upper())
        y -= 7*mm

    # Final quote strip
    y -= 4*mm
    c.setFillColor(INK)
    c.rect(MARGIN, y - 20*mm, W - 2*MARGIN, 20*mm, stroke=0, fill=1)
    c.setFillColor(SIENNA)
    c.setFont(F_MONO_BOLD, 8)
    c.drawString(MARGIN + 8*mm, y - 8*mm, "REMEMBER")
    c.setFillColor(PAPER)
    c.setFont(F_DISPLAY_IT, 14)
    c.drawString(MARGIN + 8*mm, y - 15*mm,
                 "Price the first project at what you would want to earn on project #5.")

    # Footer signature
    c.setFillColor(INK_SOFT)
    c.setFont(F_MONO, 7)
    c.drawCentredString(W/2, 20*mm,
        "BUILT " + datetime.now().strftime("%d %b %Y").upper() +
        "  /  FOR INTERNAL REFERENCE  /  REFRAME STUDIOS, GUWAHATI")

    c.showPage()

# ============================================================ BUILD

def build():
    c = canvas.Canvas(OUT, pagesize=A4)
    c.setTitle("Reframe Studios - Business Reference Sheet")
    c.setAuthor("Raktim Mahanta")
    c.setSubject("Udyam + pitch + invoice + playbook")

    page_identity(c)
    page_signature_invoice(c)
    page_pricing(c)
    page_playbook(c)

    c.save()
    print("OK", OUT)

if __name__ == "__main__":
    build()
