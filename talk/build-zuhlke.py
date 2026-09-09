#!/usr/bin/env python3
"""Build the Zuhlke-branded edition of the deck.

    python talk/build-zuhlke.py [--skill <path-to-zuhlke-slides>] [-o <out.pptx>]

Same content as deck.js, rebuilt on the Zuhlke master template so it inherits
the real theme, footers and slide masters. Colours come from the template's own
custom palette; typography follows references/design-guidelines.md (headlines
AA Zuehlke Medium, body AA Zuehlke).

The Zuhlke skill is not vendored into this repo — pass --skill, or set
ZUHLKE_SKILL, pointing at a checkout of
https://codehub.zuehlke.com/ai-sdlc/zapac-agent-skills (zuhlke-slides/).
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Inches, Pt

HERE = Path(__file__).resolve().parent
ASSETS = HERE / "assets"

# ── Zuhlke palette, straight from the template's custom colour list ──────────
INK = RGBColor.from_string("000000")   # headlines on light
BODY = RGBColor.from_string("4D4D4D")  # body copy
MUTED = RGBColor.from_string("8C8C8C")
LINE = RGBColor.from_string("D9D9D9")
WASH = RGBColor.from_string("F2F2F2")
WHITE = RGBColor.from_string("FFFFFF")
PURPLE = RGBColor.from_string("985B9C")
BLUE = RGBColor.from_string("0099CC")
GREEN = RGBColor.from_string("00CC66")
ORANGE = RGBColor.from_string("FF9900")
GREEN_25 = RGBColor.from_string("BFF2D9")
ORANGE_25 = RGBColor.from_string("FFE5BF")
PURPLE_25 = RGBColor.from_string("E5D6E6")
GREEN_DEEP = RGBColor.from_string("00804D")   # accent green is too light for small text
ORANGE_DEEP = RGBColor.from_string("B35F00")  # ditto for orange

HEAD = "AA Zuehlke Medium"
TEXT = "AA Zuehlke"
MONO = "Consolas"  # no Zuhlke monospace exists; code needs one

SPEAKER = "Vladimir Radzivil"
ROLE = "Principal Consultant & Partner, Zuhlke"
HANDLE = "linkedin.com/in/vladimirradzivil"
REPO = "github.com/radzivil/nx-scaling-e2e-tests-with-atomizer"

W, H = 13.33, 7.5
M = 0.68           # the template's own left margin
CONTENT_TOP = 1.75  # first free y under the title block


# ── primitives ───────────────────────────────────────────────────────────────
def layout(prs, name):
    return next(l for l in prs.slide_masters[0].slide_layouts if l.name == name)


def add(prs, name):
    return prs.slides.add_slide(layout(prs, name))


def drop(slide, *names):
    """Remove placeholders by name fragment (e.g. 'Picture', 'Inhalt')."""
    for ph in list(slide.placeholders):
        if any(n.lower() in ph.name.lower() for n in names):
            ph._element.getparent().remove(ph._element)


def textbox(slide, x, y, w, h, *, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    tf.paragraphs[0].alignment = align
    return tf


def write(tf, runs, *, size=14, font=TEXT, color=BODY, space_after=0, line=None):
    """runs: str, or list of str / (text, {overrides}) — one paragraph each."""
    if isinstance(runs, str):
        runs = [runs]
    for i, item in enumerate(runs):
        text, over = item if isinstance(item, tuple) else (item, {})
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = tf.paragraphs[0].alignment
        if space_after:
            p.space_after = Pt(space_after)
        if line:
            p.line_spacing = line
        r = p.add_run()
        r.text = text
        f = r.font
        f.name = over.get("font", font)
        f.size = Pt(over.get("size", size))
        f.bold = over.get("bold", False)
        f.italic = over.get("italic", False)
        f.color.rgb = over.get("color", color)
    return tf


def rect(slide, x, y, w, h, *, fill=None, outline=None, radius=True, width=1.0):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE,
        Inches(x), Inches(y), Inches(w), Inches(h),
    )
    if radius:
        # python-pptx exposes the corner radius as adjustment 0 (fraction of the
        # short side); the template's own cards are barely rounded.
        shape.adjustments[0] = min(0.08 / max(h, 0.01), 0.5)
    if fill is None:
        shape.fill.background()
    else:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill
    if outline is None:
        shape.line.fill.background()
    else:
        shape.line.color.rgb = outline
        shape.line.width = Pt(width)
    shape.shadow.inherit = False
    tf = shape.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    return shape


def ellipse(slide, x, y, d, *, fill, outline=None):
    s = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(d), Inches(d))
    s.fill.solid()
    s.fill.fore_color.rgb = fill
    if outline is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = outline
    s.shadow.inherit = False
    return s


def connector(slide, x1, y1, x2, y2, *, color=MUTED, width=1.25):
    from pptx.enum.shapes import MSO_CONNECTOR
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = color
    c.line.width = Pt(width)
    return c


def heading(slide, kicker_text, title_text, *, kicker_color=PURPLE):
    """Fill the template's own kicker / title / subtitle placeholders."""
    for ph in slide.placeholders:
        idx = ph.placeholder_format.idx
        if idx == 15:      # small text above the title
            write(ph.text_frame, kicker_text.upper(), size=11, font=HEAD, color=kicker_color)
        elif idx == 0:     # title
            write(ph.text_frame, title_text, size=24, font=HEAD, color=INK)
        elif idx == 17:    # subtitle — unused, keep the deck clean
            ph._element.getparent().remove(ph._element)


def page_number(slide):
    """Add the master's slide-number field, which add_slide does not clone."""
    import uuid
    from pptx.oxml.ns import nsdecls
    from pptx.oxml import parse_xml

    tf = textbox(slide, 11.9, 6.94, 0.75, 0.22, align=PP_ALIGN.RIGHT)
    fld = parse_xml(
        f'<a:fld {nsdecls("a")} id="{{{uuid.uuid4()}}}" type="slidenum">'
        f'<a:rPr lang="en-US" sz="800"><a:solidFill><a:srgbClr val="8C8C8C"/></a:solidFill>'
        f'<a:latin typeface="{TEXT}"/></a:rPr><a:t>1</a:t></a:fld>'
    )
    tf.paragraphs[0]._p.append(fld)


def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def picture(slide, path, x, y, w, h):
    if not Path(path).exists():
        rect(slide, x, y, w, h, fill=WASH, outline=ORANGE)
        write(textbox(slide, x, y + h / 2 - 0.15, w, 0.3, align=PP_ALIGN.CENTER),
              "asset missing", size=11, color=ORANGE)
        return None
    return slide.shapes.add_picture(str(path), Inches(x), Inches(y), Inches(w), Inches(h))


def qr(slide, name, x, y, size, caption):
    f = ASSETS / f"qr-{name}.png"
    rect(slide, x, y, size, size, fill=WHITE, outline=LINE)
    picture(slide, f, x + 0.1, y + 0.1, size - 0.2, size - 0.2)
    write(textbox(slide, x, y + size + 0.1, size, 0.3, align=PP_ALIGN.CENTER),
          caption, size=11, color=MUTED)


def code(slide, x, y, w, lines, *, size=12):
    h = 0.26 * len(lines) + 0.44
    rect(slide, x, y, w, h, fill=WASH, outline=LINE)
    tf = textbox(slide, x + 0.22, y + 0.2, w - 0.44, h - 0.4)
    write(tf, [(t, {"color": c}) for t, c in lines], size=size, font=MONO, line=1.25)
    return y + h


def card(slide, x, y, w, h, title, body, *, accent=None, title_size=15, body_size=12):
    rect(slide, x, y, w, h, fill=WHITE, outline=LINE)
    if accent is not None:
        rect(slide, x, y, 0.05, h, fill=accent, radius=False)
    write(textbox(slide, x + 0.28, y + 0.22, w - 0.5, 0.4), title, size=title_size, font=HEAD, color=INK)
    if body:
        write(textbox(slide, x + 0.28, y + 0.72, w - 0.5, h - 0.9), body, size=body_size, color=BODY)


def stat(slide, x, y, w, value, label, *, color=INK, sub=None):
    h = 1.3 if not sub else 1.55
    rect(slide, x, y, w, h, fill=WHITE, outline=LINE)
    write(textbox(slide, x + 0.25, y + 0.16, w - 0.5, 0.62), value, size=28, font=HEAD, color=color)
    write(textbox(slide, x + 0.25, y + 0.8, w - 0.5, 0.32), label, size=12, color=BODY)
    if sub:
        write(textbox(slide, x + 0.25, y + 1.12, w - 0.5, 0.32), sub, size=10, color=MUTED)


def bars(slide, x, y, rows, *, label_w=4.2, bar_w=5.2, gap=0.68, unit="s"):
    top = max(v for _, v, _ in rows)
    for i, (label, value, color) in enumerate(rows):
        yy = y + i * gap
        write(textbox(slide, x, yy, label_w, 0.4, anchor=MSO_ANCHOR.MIDDLE), label, size=12, color=BODY)
        wpx = max(0.06, (value / top) * bar_w)
        rect(slide, x + label_w + 0.2, yy + 0.06, wpx, 0.28, fill=color, radius=False)
        if unit == "s":
            mins, secs = divmod(int(value), 60)
            shown = f"{mins}m {secs:02d}s" if mins else f"{secs}s"
        else:
            shown = f"{value:g}{unit}"
        write(textbox(slide, x + label_w + 0.35 + wpx, yy, 1.5, 0.4, anchor=MSO_ANCHOR.MIDDLE),
              shown, size=12, font=HEAD, color=INK)


def bullets(slide, x, y, w, items, *, size=13, gap=0.42, color=BODY):
    for i, item in enumerate(items):
        text, over = item if isinstance(item, tuple) else (item, {})
        ellipse(slide, x, y + i * gap + 0.09, 0.075, fill=over.get("color", PURPLE))
        write(textbox(slide, x + 0.25, y + i * gap, w - 0.25, gap),
              text, size=size, color=over.get("color", color),
              font=HEAD if over.get("bold") else TEXT)


# ── the deck ─────────────────────────────────────────────────────────────────
def build(prs):
    # 01 cover ---------------------------------------------------------------
    s = add(prs, "Title slide | big picture & gradient")
    drop(s, "Picture Placeholder")

    # The logo lives on the layout, not the slide, so it can only be resized
    # there. Only the cover uses this layout, so nothing else is affected.
    logo_w = 1.7
    logo_mid = 10.43                      # horizontal centre of the white panel
    for sh in layout(prs, "Title slide | big picture & gradient").shapes:
        if sh.name == "Grafik 10":
            sh.width = sh.height = Inches(logo_w)
            sh.left = Inches(logo_mid - logo_w / 2)
            sh.top = Inches(3.75 - logo_w / 2)   # vertical centre of the panel

    for ph in s.placeholders:
        idx = ph.placeholder_format.idx
        if idx == 0:
            write(ph.text_frame, "Scaling E2E Tests the Smart Way with Nx", size=28, font=HEAD, color=WHITE)
        elif idx == 1:
            write(ph.text_frame, "Making your slowest quality gate fast enough to actually use and trust on every pull request",
                  size=14, color=WHITE)
        elif idx == 15:
            ph._element.getparent().remove(ph._element)

    # Photo and QR sit as matching white cards in the gradient's empty top-left,
    # which the template otherwise leaves blank. The plate behind the photo keeps
    # it from floating on the gradient and matches the QR's treatment.
    tile = 1.55
    qr_x = 5.5

    rect(s, M, 0.85, tile, tile, fill=WHITE, outline=None)
    picture(s, ASSETS / "avatar.jpg", M + 0.08, 0.93, tile - 0.16, tile - 0.16)

    # name and role sit beside the photo, optically centred against the card
    write(textbox(s, M + tile + 0.3, 1.2, 2.8, 0.42), SPEAKER, size=18, font=HEAD, color=WHITE)
    # "Zuhlke" is redundant with the logo on the same slide, and dropping it keeps one line
    write(textbox(s, M + tile + 0.3, 1.66, 2.8, 0.4), "Principal Consultant & Partner",
          size=12, color=WHITE)

    rect(s, qr_x, 0.85, tile, tile, fill=WHITE, outline=None)
    picture(s, ASSETS / "qr-linkedin.png", qr_x + 0.08, 0.93, tile - 0.16, tile - 0.16)
    write(textbox(s, qr_x, 2.52, 3.0, 0.3), "Connect on LinkedIn", size=11, color=WHITE)

    notes(s, "Thirty seconds on who you are, then move. Every command this talk runs is in demo.md at the repo root, in slide order — keep it open on a second screen.")

    # 02 why this topic ------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Why this topic", "This one is not about AI")
    items = [
        ("It is engineering", "Configuration and a task graph. No model, no prompt, no vendor."),
        ("It is from a real project", "Fifteen applications and a suite that outgrew one machine."),
        ("It applies to most teams", "E2E tests plus a monorepo is the only precondition."),
        ("You can use it today", "It is in the open-source plugin you already depend on."),
    ]
    for i, (h, b) in enumerate(items):
        y = CONTENT_TOP + i * 1.12
        rect(s, M, y + 0.04, 0.05, 0.82, fill=PURPLE, radius=False)
        write(textbox(s, M + 0.28, y, 11.6, 0.4), h, size=17, font=HEAD, color=INK)
        write(textbox(s, M + 0.28, y + 0.42, 11.6, 0.4), b, size=12, color=BODY)
    write(textbox(s, M, 6.45, 11.9, 0.4), "Unglamorous, free, and sitting in a plugin you already depend on.",
          size=14, font=HEAD, color=PURPLE)
    notes(s, "Every other talk today has AI in the title. This one is the unglamorous thing that "
             "makes the glamorous thing safe. The last line sets up the next slide.")

    # 03 agenda --------------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Agenda", "Where this goes")
    rows = [
        ("01", "The problem", "E2E is the slowest signal you have"),
        ("02", "The atomizer", "One target per spec file, generated for you"),
        ("03", "The catch", "Nx 23 gates the wrapper behind Nx Cloud"),
        ("04", "Parallel, no cloud", "The same command locally and on CI"),
        ("05", "The cache", "Why a re-run only executes the failures"),
        ("06", "Scale", "Three apps, 30 targets, and a real project"),
    ]
    for i, (n, h, sub) in enumerate(rows):
        col, row = i % 2, i // 2
        x = M + col * 6.1
        y = CONTENT_TOP + row * 1.3
        write(textbox(s, x, y, 0.7, 0.4), n, size=17, font=HEAD, color=BLUE)
        write(textbox(s, x + 0.7, y, 5.1, 0.35), h, size=15, font=HEAD, color=INK)
        write(textbox(s, x + 0.7, y + 0.38, 5.1, 0.5), sub, size=11, color=MUTED)
    notes(s, "Twenty seconds. Point at 05 and 06 as the parts worth staying for.")

    # 04-06 three questions, one at a time -----------------------------------
    qs = [
        "Who is using E2E tests?",
        "Whose suite is green right now?",
        "Who blocks a PR on it?",
    ]
    asides = [
        "Ask it and actually wait. Expect nearly every hand — this is not a niche problem.",
        "Expect far fewer hands, and a laugh. Do not rush past the laugh.",
        "Expect almost none. Nobody gates a merge on a suite they cannot trust. Reveal the line and move on.",
    ]
    for shown in range(1, 4):
        s = add(prs, "Only title")
        heading(s, "Section 01 · The problem", "A few questions for the room", kicker_color=ORANGE)
        for i, q in enumerate(qs):
            x = M + i * 4.05
            live = i < shown
            rect(s, x, CONTENT_TOP + 0.25, 3.75, 2.0,
                 fill=WHITE if live else WASH, outline=LINE)
            if not live:
                write(textbox(s, x, CONTENT_TOP + 0.25, 3.75, 2.0,
                              align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE),
                      str(i + 1), size=30, font=HEAD, color=RGBColor.from_string("D9D9D9"))
                continue
            tone = ORANGE_25 if i == 2 else GREEN_25
            ellipse(s, x + 0.25, CONTENT_TOP + 0.5, 0.55, fill=tone)
            write(textbox(s, x + 0.25, CONTENT_TOP + 0.5, 0.55, 0.55,
                          align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE),
                  str(i + 1), size=16, font=HEAD, color=INK)
            write(textbox(s, x + 0.25, CONTENT_TOP + 1.15, 3.25, 0.85), q, size=16, font=HEAD, color=INK)
        if shown == 3:
            rect(s, M, 5.0, 11.97, 1.0, fill=ORANGE_25, outline=ORANGE)
            write(textbox(s, M + 0.28, 5.2, 11.4, 0.7),
                  "The distance between the first hand and the last one is this talk. Nobody blocks a "
                  "merge on a suite that takes an hour and fails for reasons nobody trusts.",
                  size=13, color=INK)
        notes(s, asides[shown - 1])

    # 07 why now -------------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 01 · Why now", "Change got cheap. Confidence did not.", kicker_color=ORANGE)
    for i, (h, badge, b, col) in enumerate([
        ("Writing the change", "MINUTES", "AI writes it, reviews it, refactors it. That cost collapsed.", GREEN),
        ("Trusting the change", "AN HOUR", "Same suite, same nightly run, same shrug. That cost did not.", ORANGE),
    ]):
        x = M + i * 6.1
        rect(s, x, CONTENT_TOP, 5.85, 1.9, fill=WHITE, outline=col, width=1.25)
        write(textbox(s, x + 0.3, CONTENT_TOP + 0.2, 5.2, 0.4), h, size=16, font=HEAD, color=INK)
        write(textbox(s, x + 0.3, CONTENT_TOP + 0.62, 5.2, 0.45), badge, size=22, font=HEAD, color=col)
        write(textbox(s, x + 0.3, CONTENT_TOP + 1.16, 5.2, 0.6), b, size=12, color=BODY)
    write(textbox(s, M, 4.0, 11.9, 0.35), "What it should cost instead", size=14, font=HEAD, color=PURPLE)
    bars(s, M, 4.5, [
        ("Today — every change runs everything", 60, ORANGE),
        ("Target — an isolated change", 10, GREEN),
    ], unit="m", label_w=4.3, bar_w=5.0)
    write(textbox(s, M, 6.1, 11.9, 0.6),
          "Ten minutes is a coffee. An hour is a context switch — so the suite moves to nightly, "
          "and nightly means nobody is gating on it.", size=12, color=MUTED)
    notes(s, "Do not oversell AI. The only claim is that the ratio moved: generation got cheap, "
             "verification did not, so verification is where the leverage is now.")

    # 08 the example repo ----------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 01 · The example", "One repo, three apps, one graph")
    rect(s, M, 1.62, 11.97, 0.82, fill=WASH, outline=LINE)
    write(textbox(s, M + 0.28, 1.74, 11.4, 0.3),
          [("“A build system with smart caching and task orchestration.”", {"font": HEAD, "color": INK}),
           ], size=14)
    write(textbox(s, M + 0.28, 2.04, 11.4, 0.3),
          "nx.dev  ·  It knows what depends on what, so it can skip work. It does not run your "
          "tests — Cypress still does that.", size=11, color=MUTED)
    apps = [("shop", 0.9), ("admin", 5.2), ("docs", 9.5)]
    libs = [("formatting", 3.05), ("ui", 7.35)]
    for x1, x2 in [(2.35, 4.5), (6.65, 4.5), (6.65, 8.8), (10.95, 8.8)]:
        connector(s, x1, 3.4, x2, 4.15)
    for name, x in apps:
        write(textbox(s, x, 2.62, 2.9, 0.28, align=PP_ALIGN.CENTER), "10 specs", size=11, color=MUTED)
        rect(s, x, 2.9, 2.9, 0.5, fill=INK, outline=INK)
        write(textbox(s, x, 2.9, 2.9, 0.5, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE),
              name, size=15, font=MONO, color=WHITE)
    for name, x in libs:
        rect(s, x, 4.15, 2.9, 0.5, fill=WHITE, outline=GREEN, width=1.25)
        write(textbox(s, x, 4.15, 2.9, 0.5, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE),
              name, size=13, font=MONO, color=GREEN_DEEP)
    write(textbox(s, 0.9, 4.15, 1.95, 0.5, align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE),
          "shared libs", size=11, color=MUTED)
    for i, (v, l, c) in enumerate([("30", "spec files", GREEN), ("202", "tests", INK),
                                   ("3", "tasks that can run them", ORANGE)]):
        stat(s, M + i * 4.05, 5.0, 3.75, v, l, color=c)
    write(textbox(s, M, 6.45, 11.9, 0.4),
          "Thirty files, but only three things you can actually run — one e2e task per app.",
          size=12, color=MUTED)
    notes(s, "Orientation, not content. Point at the uneven lib sharing — it is what makes the affected demo land later.")

    # 09 the baseline --------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 01 · The baseline", "So how fast is the feedback?", kicker_color=ORANGE)
    code(s, M, CONTENT_TOP, 7.1, [
        ("$ nx run-many -t e2e --parallel=1", INK),
        ("", INK),
        ("  shop-e2e    10 specs ....... 1m 33s", BODY),
        ("  admin-e2e   10 specs ....... 1m 20s", BODY),
        ("  docs-e2e    10 specs ....... 1m 27s", BODY),
        ("  ─────────────────────────────────────", MUTED),
        ("  Run duration:              4m 20s", ORANGE),
    ], size=12)
    rect(s, 8.3, CONTENT_TOP, 4.35, 2.6, fill=WHITE, outline=ORANGE, width=1.25)
    write(textbox(s, 8.6, CONTENT_TOP + 0.3, 3.8, 0.8), "4m 20s", size=36, font=HEAD, color=ORANGE)
    write(textbox(s, 8.6, CONTENT_TOP + 1.15, 3.8, 0.7),
          "for one opinion on whether your change is safe", size=12, color=BODY)
    write(textbox(s, 8.6, CONTENT_TOP + 1.9, 3.8, 0.5),
          "Three apps. One process each.", size=11, color=MUTED)
    write(textbox(s, M, 5.2, 11.9, 0.6),
          "And this is the small version. Fifteen apps and 1,500 tests is the project this came "
          "from — same shape, different number.", size=12, color=BODY)
    notes(s, "Run it live if the timing works.")

    # 10 the wish list -------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 01 · The wish list", "Imagine you could run only…")
    wishes = [
        ("…what the change touched", "Not the whole suite. The apps the diff can actually break."),
        ("…several specs at once", "On the cores you already paid for."),
        ("…the same way everywhere", "One command, identical locally and on CI."),
        ("…only what failed last time", "A retry that skips the 28 specs that already passed."),
    ]
    for i, (h, b) in enumerate(wishes):
        x = M + (i % 2) * 6.1
        y = CONTENT_TOP + (i // 2) * 2.0
        card(s, x, y, 5.85, 1.7, h, b, accent=PURPLE, title_size=16)
    write(textbox(s, M, 6.1, 11.9, 0.4, align=PP_ALIGN.CENTER),
          "All four are configuration. None of them need a subscription.",
          size=14, font=HEAD, color=PURPLE)
    notes(s, "The promise slide — the four map onto the rest of the talk, in order.")

    # 11 the atomizer --------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 02 · The atomizer", "One task becomes one task per file")
    rect(s, M, CONTENT_TOP, 3.4, 1.0, fill=WHITE, outline=ORANGE, width=1.25)
    write(textbox(s, M, CONTENT_TOP, 3.4, 1.0, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE),
          "e2e", size=18, font=MONO, color=ORANGE)
    write(textbox(s, M, CONTENT_TOP + 1.1, 3.4, 0.4, align=PP_ALIGN.CENTER),
          "one task, ten specs", size=11, color=MUTED)
    write(textbox(s, 4.35, CONTENT_TOP + 0.3, 1.2, 0.4, align=PP_ALIGN.CENTER),
          "→", size=22, font=HEAD, color=PURPLE)
    for i, name in enumerate(["catalog.cy.ts", "search.cy.ts", "cart-add.cy.ts",
                              "checkout.cy.ts", "…"]):
        y = CONTENT_TOP + i * 0.62
        rect(s, 5.75, y, 6.9, 0.5, fill=WASH, outline=LINE)
        write(textbox(s, 5.95, y, 6.5, 0.5, anchor=MSO_ANCHOR.MIDDLE),
              f"e2e-ci--src/e2e/{name}" if name != "…" else "…", size=12, font=MONO, color=BLUE)
    write(textbox(s, M, 5.1, 4.9, 1.4),
          "Nx globs the spec files and generates one cacheable target per file. Nobody maintains "
          "this list.", size=12, color=BODY)
    notes(s, "Stress 'generated'. That is the difference from hand-rolled spec sharding.")

    # 12 turning it on -------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 02 · Setup", "Turning it on")
    write(textbox(s, M, CONTENT_TOP, 5.6, 0.3), "1 · Add the plugin", size=13, font=HEAD, color=INK)
    code(s, M, CONTENT_TOP + 0.35, 5.6, [("nx add @nx/cypress", GREEN)], size=13)
    write(textbox(s, M, CONTENT_TOP + 1.35, 5.6, 0.3), "2 · It registers this in nx.json",
          size=13, font=HEAD, color=INK)
    code(s, M, CONTENT_TOP + 1.7, 5.6, [
        ("{", BODY), ('  "plugin": "@nx/cypress/plugin",', BLUE), ('  "options": {', BODY),
        ('    "targetName": "e2e",', GREEN), ('    "ciTargetName": "e2e-ci"', GREEN),
        ("  }", BODY), ("}", BODY),
    ], size=12)
    write(textbox(s, 6.9, CONTENT_TOP, 5.75, 0.3), "3 · Ask what you got", size=13, font=HEAD, color=INK)
    code(s, 6.9, CONTENT_TOP + 0.35, 5.75, [
        ("nx show project shop-e2e --json", INK), ("", INK),
        ("e2e", MUTED), ("e2e-ci", ORANGE),
        ("e2e-ci--src/e2e/catalog.cy.ts", BLUE),
        ("e2e-ci--src/e2e/search.cy.ts", BLUE),
        ("…", MUTED),
    ], size=12)
    write(textbox(s, 6.9, 5.4, 5.75, 0.5),
          "One target per file path — not spec1, spec2, spec3.", size=12, color=MUTED)
    notes(s, "Commands for this slide are in demo.md at the repo root.")

    # 13 the catch -----------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 03 · The catch", "Then Nx 23 tells you no", kicker_color=ORANGE)
    code(s, M, CONTENT_TOP, 11.97, [("nx run-many -t e2e-ci --parallel=5", INK)], size=14)
    rect(s, M, CONTENT_TOP + 1.0, 11.97, 1.75, fill=ORANGE_25, outline=ORANGE)
    write(textbox(s, M + 0.3, CONTENT_TOP + 1.18, 11.4, 1.5), [
        ("NX   The following tasks should only be run with Nx Cloud:", {"font": HEAD, "color": INK}),
        ("       - admin-e2e:e2e-ci", {}), ("       - docs-e2e:e2e-ci", {}),
        ("       - shop-e2e:e2e-ci", {}),
        ('Please enable Nx Cloud or use the slower "e2e" task.', {}),
    ], size=11, font=MONO, color=INK, line=1.2)
    write(textbox(s, M, 4.85, 11.9, 0.45), "So now it is a procurement question.",
          size=18, font=HEAD, color=ORANGE_DEEP)
    bullets(s, M, 5.4, 11.9, [
        "Nx Cloud is a premium service from Nx",
        "Is it approved in your organisation?",
        ("If not approved — you are blocked", {"color": ORANGE_DEEP, "bold": True}),
    ], size=13, gap=0.45)
    notes(s, "Sit on the third bullet — for much of the room this is a purchase order, not a technical problem. The good news is the next slide.")

    # 14 parallel locally ----------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 04 · Parallel, no cloud", "Ask for the list yourself")
    code(s, M, CONTENT_TOP, 7.1, [
        ("# the wrapper is gated — the leaves are not", MUTED),
        ("nx show project shop-e2e --json", INK),
        ("  → e2e-ci--src/e2e/catalog.cy.ts", BLUE),
        ("  → e2e-ci--src/e2e/search.cy.ts  …", BLUE),
        ("", INK),
        ("nx run-many --targets=<that list> --parallel=5", GREEN),
    ], size=11)
    rect(s, 8.3, CONTENT_TOP, 4.35, 2.3, fill=WHITE, outline=GREEN, width=1.25)
    write(textbox(s, 8.6, CONTENT_TOP + 0.2, 3.8, 0.5), "4m 20s", size=20, font=HEAD, color=MUTED)
    write(textbox(s, 8.6, CONTENT_TOP + 0.65, 3.8, 0.3), "↓", size=13, color=MUTED)
    write(textbox(s, 8.6, CONTENT_TOP + 0.98, 3.8, 0.8), "2m 20s", size=34, font=HEAD, color=GREEN)
    write(textbox(s, 8.6, CONTENT_TOP + 1.8, 3.8, 0.4), "same laptop, one flag", size=12, color=BODY)
    rect(s, M, 4.7, 11.97, 1.45, fill=ORANGE_25, outline=ORANGE)
    write(textbox(s, M + 0.28, 4.88, 11.4, 0.3), "The part people skip", size=13, font=HEAD, color=INK)
    write(textbox(s, M + 0.28, 5.24, 11.4, 0.8),
          "Atomize and run them serially and you get 5m 40s — 31% SLOWER than not splitting at all, "
          "because every spec now boots its own Cypress. Splitting is not a speedup. It is the "
          "precondition for one.", size=12, color=INK)
    notes(s, "The script does two things: ask Nx for the list, hand it to run-many.")

    # 15 parallel on CI ------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 04 · Distribution", "One runner per app, not per shard")
    code(s, M, CONTENT_TOP, 7.1, [
        ("- id: list", BLUE),
        ('  run: echo "projects=$(node tools/e2e-targets.mjs', GREEN),
        ("        --projects-json)\" >> \"$GITHUB_OUTPUT\"", GREEN),
        ("", INK),
        ("strategy:", BLUE),
        ("  matrix:", INK),
        ("    project: ${{ fromJson(needs.discover.outputs.projects) }}", INK),
    ], size=10)
    bullets(s, 8.3, CONTENT_TOP + 0.05, 4.4, [
        "The matrix comes from the graph — a 4th app adds a runner by itself",
        "One preview server per runner, nothing to balance",
        ("Costs ~40s up front: discovery needs npm ci first", {"color": ORANGE_DEEP}),
        ("3m 44s on one machine → 1m 53s across three", {"color": GREEN_DEEP, "bold": True}),
    ], size=11, gap=0.62)
    write(textbox(s, M, 4.5, 11.9, 0.35), "Why not shard by index?", size=14, font=HEAD, color=PURPLE)
    for i, (h, b) in enumerate([
        ("Three servers, not one", "A shard spanning apps builds and boots every app on that runner."),
        ("Nothing to rebalance", "Similar-sized apps are already even."),
        ("run-many is a cross product", "shop and admin both have login.cy.ts. A cross-app shard runs the wrong one."),
    ]):
        card(s, M + i * 4.05, 4.95, 3.75, 1.5, h, b, title_size=13, body_size=11)
    notes(s, "Sharding by index is what people expect — say why it is the wrong default here.")

    # 16 CI, for real ---------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 04 · Proof", "That run, on this repo")
    img_w = 9.2
    img_h = img_w * (1245 / 2660)
    img_x = (W - img_w) / 2
    picture(s, ASSETS / "ci-parallel-run.png", img_x, 1.72, img_w, img_h)
    rect(s, img_x, 1.72, img_w, img_h, fill=None, outline=LINE, radius=False)
    for i, (v, l, c) in enumerate([
        ("1m 24s", "end to end, including npm ci", GREEN_DEEP),
        ("41-45s", "per app, all three at once", GREEN_DEEP),
        ("32s", "discover, before anything starts", ORANGE_DEEP),
    ]):
        x = M + i * 4.05
        write(textbox(s, x, 6.12, 3.75, 0.42), v, size=20, font=HEAD, color=c)
        write(textbox(s, x, 6.54, 3.75, 0.3), l, size=11, color=BODY)
    notes(s, "Real run on the public repo — offer the link if anyone wants to check it. The "
             "per-app matrix is generated from the graph, so those three jobs appeared without "
             "anyone editing the workflow, and they finish within four seconds of each other. "
             "discover costs 32s before any test starts: the honest price of a dynamic matrix.")

    # 16 the cache -----------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 05 · The cache", "Run it again. Nothing runs.")
    code(s, M, CONTENT_TOP, 11.97, [
        ("$ node tools/run-e2e.mjs --project=shop-e2e --parallel=5", INK),
        ("", INK),
        ("  Run duration:      134ms", GREEN),
        ("  Cache:             11/12 hit (92%)", GREEN),
    ], size=14)
    write(textbox(s, M, 4.2, 11.9, 0.9),
          "Nothing changed, so nothing ran. Nx hashed each task's inputs — the spec file, the app "
          "source it depends on, the Cypress version — and replayed the stored result.",
          size=14, color=BODY)
    stat(s, M, 5.3, 3.75, "134ms", "instead of 41 seconds", color=GREEN)
    stat(s, M + 4.05, 5.3, 3.75, "11/12", "tasks replayed", color=GREEN)
    stat(s, M + 8.1, 5.3, 3.75, "0", "Cypress processes started", color=INK)
    notes(s, "Hit up-arrow and enter. It returns before you finish the sentence.")

    # 17 rerun only failures -------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 05 · The payoff", "A retry only runs what failed", kicker_color=ORANGE)
    code(s, M, CONTENT_TOP, 11.97, [
        ("$ npm run demo:break && node tools/run-e2e.mjs --project=shop-e2e --parallel=5", INK),
        ("  2 failed  ·  Run duration: 39s", ORANGE),
        ("", INK),
        ("$ node tools/run-e2e.mjs --project=shop-e2e --parallel=5     # nothing changed", INK),
        ("  Cache: 9/10 hit  ·  Run duration: 28s", GREEN),
        ("  Failed: cart-totals.cy.ts, checkout-happy-path.cy.ts", ORANGE),
    ], size=12)
    write(textbox(s, M, 4.45, 11.9, 0.8),
          "The eight that passed are cache hits. Only the two that failed re-execute — because Nx "
          "never caches a failed task. No test-name bookkeeping, no --only-failures flag.",
          size=13, color=BODY)
    stat(s, M, 5.4, 3.75, "39s", "First run, 2 specs fail", color=ORANGE)
    stat(s, M + 4.05, 5.4, 3.75, "28s", "Retry: 9 of 10 replayed", color=GREEN)
    stat(s, M + 8.1, 5.4, 3.75, "2", "Specs that actually ran", color=INK)
    notes(s, "Be honest about 39→28: the two seeded failures are the slowest specs and each still boots Cypress. The saving scales with how many pass.")

    # 18 content addressed ---------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 05 · The bit that surprises people", "The cache is content-addressed")
    for i, (n, h, hash_, res, col) in enumerate([
        ("1", "Green suite", "hash A", "cached", GREEN),
        ("2", "Seed the bug", "hash B", "2 fail, 8 cached at B", ORANGE),
        ("3", "Revert the bug", "hash A again", "all 10 replay — 206ms", GREEN),
    ]):
        x = M + i * 4.05
        rect(s, x, CONTENT_TOP, 3.75, 2.3, fill=WHITE, outline=LINE)
        write(textbox(s, x + 0.28, CONTENT_TOP + 0.2, 3.2, 0.35), n, size=16, font=HEAD, color=col)
        write(textbox(s, x + 0.28, CONTENT_TOP + 0.62, 3.2, 0.35), h, size=14, font=HEAD, color=INK)
        write(textbox(s, x + 0.28, CONTENT_TOP + 1.05, 3.2, 0.35), hash_, size=12, font=MONO, color=MUTED)
        write(textbox(s, x + 0.28, CONTENT_TOP + 1.6, 3.2, 0.5), res, size=12, font=HEAD, color=col)
    write(textbox(s, M, 4.4, 11.9, 0.5),
          "Undoing a change gives you your old results back. Nx already knows the answer for that "
          "exact input.", size=14, color=BODY)
    rect(s, M, 5.1, 11.97, 1.15, fill=RGBColor.from_string("D9F2FF"), outline=BLUE)
    write(textbox(s, M + 0.28, 5.3, 11.4, 0.8),
          "The key is built from inputs, not from the commit. A commit that touched only this deck "
          "restored the previous commit's cache: 33/36 hits, 119ms, and the CI job went from "
          "3m 44s to 35s.", size=12, color=INK)
    notes(s, "Best real example from this repo — nobody planned it.")

    # 19 the ladder ----------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 06 · The numbers", "Climb only as far as you need")
    # Bars are the laptop the live demo runs on; the M5 column is for contrast.
    rungs = [
        ("1 · Un-atomized, one process per app", 260, 196, ORANGE),
        ("2 · Atomized, but still serial", 340, 240, ORANGE_DEEP),
        ("3 · Atomized, half your cores at once", 140, 48, GREEN),
        ("4 · One runner per app", 55, 55, GREEN),
        ("— · Re-run, nothing changed", 5, 5, GREEN),
    ]
    bar_x, bar_w, m5_x = M + 4.3, 4.3, 10.9

    def clock(v):
        return f"{v // 60}m {v % 60:02d}s" if v >= 60 else f"{v}s"

    write(textbox(s, bar_x, CONTENT_TOP - 0.02, 4.6, 0.28),
          "M1 PRO · 10 CORES · LIVE DEMO", size=10, font=HEAD, color=GREEN_DEEP)
    write(textbox(s, m5_x, CONTENT_TOP - 0.02, 2.0, 0.28),
          "M5 · 18 CORES", size=10, font=HEAD, color=MUTED)
    rect(s, m5_x - 0.3, CONTENT_TOP - 0.06, 0.012, 4.0, fill=LINE, radius=False)

    for i, (label, v, m5, colour) in enumerate(rungs):
        y = CONTENT_TOP + 0.42 + i * 0.72
        write(textbox(s, M, y, 4.1, 0.4, anchor=MSO_ANCHOR.MIDDLE), label, size=12, color=BODY)
        w = max(0.06, (v / 340) * bar_w)
        rect(s, bar_x, y + 0.06, w, 0.28, fill=colour, radius=False)
        write(textbox(s, bar_x + 0.12 + w, y, 1.4, 0.4, anchor=MSO_ANCHOR.MIDDLE),
              clock(v), size=12, font=HEAD, color=INK)
        write(textbox(s, m5_x, y, 1.6, 0.4, anchor=MSO_ANCHOR.MIDDLE),
              clock(m5), size=12, font=HEAD if i == 2 else TEXT,
              color=GREEN_DEEP if i == 2 else BODY)

    rect(s, M, 5.85, 11.97, 1.15, fill=ORANGE_25, outline=ORANGE)
    write(textbox(s, M + 0.28, 5.98, 11.4, 0.3),
          "Rung 2 is the honest one — atomizing without parallelism is slower than not atomizing "
          "at all. On both machines.", size=11, color=INK)
    write(textbox(s, M + 0.28, 6.3, 11.4, 0.3),
          "Rung 4 is not always a rung — on 18 cores, nine local processes beat three runners.",
          size=11, color=INK)
    write(textbox(s, M + 0.28, 6.62, 11.4, 0.3),
          "And the ceiling moves — the M5 at all 18 cores reached 34s, while the M1 got slower "
          "past 5. Measure your own.", size=11, color=INK)
    notes(s, "Headline is 4m20s to 55s, but do not skip rung 2. Rung 3 is one flag and gets most of the win.")

    # 20 affected ------------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 06 · The graph earns its keep", "Let the graph pick the work")
    write(textbox(s, M, CONTENT_TOP, 4.0, 0.3), "YOU TOUCH", size=11, font=HEAD, color=MUTED)
    write(textbox(s, M + 4.2, CONTENT_TOP, 4.0, 0.3), "NX RUNS", size=11, font=HEAD, color=MUTED)
    for i, (touch, runs, count, col, bg) in enumerate([
        ("libs/formatting", "shop + admin", "20 targets", ORANGE, ORANGE_25),
        ("libs/ui", "admin + docs", "20 targets", ORANGE, ORANGE_25),
        ("apps/docs/**", "docs", "10 targets", GREEN, GREEN_25),
        ("a README typo", "nothing at all", "0 targets", GREEN, GREEN_25),
    ]):
        y = CONTENT_TOP + 0.45 + i * 0.75
        write(textbox(s, M, y, 4.0, 0.45, anchor=MSO_ANCHOR.MIDDLE), touch, size=14, font=MONO, color=INK)
        write(textbox(s, M + 4.2, y, 4.0, 0.45, anchor=MSO_ANCHOR.MIDDLE), runs, size=14, color=INK)
        rect(s, M + 8.6, y + 0.04, 1.9, 0.37, fill=bg, outline=None)
        write(textbox(s, M + 8.6, y + 0.04, 1.9, 0.37, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE),
              count, size=11, font=HEAD, color=INK)
    write(textbox(s, M, 5.9, 11.9, 0.5),
          "This is the argument for keeping e2e in the monorepo: the graph already knows which apps "
          "a shared component can break.", size=13, color=BODY)
    notes(s, "Run it live — clean tree exits instantly, then touch libs/ui.")

    # 21 the real project ----------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Section 06 · From a real project", "Fifteen apps, and what changed")
    stat(s, M, CONTENT_TOP, 3.75, "15", "applications", color=INK, sub="every E2E suite reviewed")
    stat(s, M + 4.05, CONTENT_TOP, 3.75, "1K → 1.5K", "tests", color=GREEN, sub="deleted a lot, added more")
    stat(s, M + 8.1, CONTENT_TOP, 3.75, "85%", "code coverage", color=GREEN, sub='and stable, not "mostly"')
    write(textbox(s, M, 3.65, 5.0, 0.35), "CI build time", size=14, font=HEAD, color=INK)
    bars(s, M, 4.1, [
        ("Before — whole repo", 48, ORANGE),
        ("After — whole repo", 25, GREEN),
        ("After — one app changed", 10, GREEN),
    ], unit="m", label_w=3.3, bar_w=4.0)
    rect(s, 9.3, 4.05, 3.35, 1.85, fill=GREEN_25, outline=GREEN)
    write(textbox(s, 9.55, 4.3, 2.9, 0.6), "Half the Actions bill", size=15, font=HEAD, color=INK)
    write(textbox(s, 9.55, 4.95, 2.9, 0.8), "Minutes are billed. Cache hits are not.", size=12, color=BODY)
    notes(s, "The suite was already stable-ish at ~1,000 tests. We read all of them, deleted a lot "
             "that tested nothing, added more that tested something. 48→25 is a full rebuild; the "
             "number people feel day to day is under ten minutes for a single-app change.")

    # 22 call to action ------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Your turn", "Same problem? Start here.")
    for i, (n, h, b) in enumerate([
        ("01", "Clone the repo", "Everything in this talk, measured and reproducible."),
        ("02", "Point your agent at it", '"Apply this Nx atomizer + cache setup to my repo."'),
        ("03", "Measure before you believe it", "npm run e2e:benchmark, on your machine, on your suite."),
    ]):
        y = CONTENT_TOP + 0.1 + i * 1.25
        write(textbox(s, M, y, 0.85, 0.4), n, size=18, font=HEAD, color=BLUE)
        write(textbox(s, M + 0.9, y, 7.0, 0.4), h, size=16, font=HEAD, color=INK)
        write(textbox(s, M + 0.9, y + 0.42, 7.0, 0.5), b, size=12, color=BODY)
    rect(s, M, 5.85, 8.0, 0.6, fill=WASH, outline=LINE)
    write(textbox(s, M + 0.25, 5.85, 7.6, 0.6, anchor=MSO_ANCHOR.MIDDLE), REPO, size=12, font=MONO, color=BLUE)
    qr(s, "repo", 9.6, CONTENT_TOP, 2.5, "Clone the demo repo")
    notes(s, "The ask is not 'rebuild your CI this week'. It is clone it, let your agent read it, "
             "and run the benchmark on your own suite.")

    # 23 feedback & Q&A ------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Thank you", "Feedback & Q&A")
    write(textbox(s, M, CONTENT_TOP, 7.6, 0.5),
          "Take a minute to give your feedback — it makes the next session better.",
          size=16, color=INK)
    write(textbox(s, M, CONTENT_TOP + 0.8, 7.6, 0.3), "WHAT TO TAKE BACK", size=11, font=HEAD, color=MUTED)
    bullets(s, M, CONTENT_TOP + 1.2, 7.6, [
        "Splitting is generated, not maintained",
        "Splitting alone is not a speedup — concurrency is",
        "The cache is the retry story: failures are never cached",
        "Distribute by app before you distribute by index",
        "None of it needs Nx Cloud",
    ], size=13, gap=0.45)
    qr(s, "feedback", 9.3, CONTENT_TOP, 2.8, "Session feedback")
    write(textbox(s, M, 6.15, 11.9, 0.3), REPO, size=11, font=MONO, color=MUTED)
    write(textbox(s, M, 6.5, 11.9, 0.3), HANDLE, size=11, color=MUTED)
    notes(s, "Put this up before the first question so the QR is on screen for the whole Q&A.")

    # 24 appendix divider ----------------------------------------------------
    s = add(prs, "Divider")
    drop(s, "Picture Placeholder")
    for ph in s.placeholders:
        idx = ph.placeholder_format.idx
        if idx == 0:
            write(ph.text_frame, "Appendix", size=26, font=HEAD, color=WHITE)
        elif idx == 1:
            write(ph.text_frame, "Kept back for questions.", size=14, color=WHITE)
        elif idx == 18:
            ph._element.getparent().remove(ph._element)
    write(textbox(s, 7.1, 3.2, 5.4, 0.4), "WHAT IS BACK HERE", size=11, font=HEAD, color=MUTED)
    bullets(s, 7.1, 3.7, 5.4, [
        "Six things that will bite you",
        "The Nx 23 cache-location trap",
        "Xvfb collisions when Cypress runs in parallel",
    ], size=13, gap=0.45)
    notes(s, "Skip past unless someone asks.")

    # 25 gotchas -------------------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Before you try this at work", "Seven things that will bite you", kicker_color=ORANGE)
    items = [
        ("Per-task startup tax", "Each atomized target boots Cypress. Parallelism has to beat it."),
        ("Parallelism has a ceiling — find yours", "10-core M1: 8 was no faster than 5 and went red 2 runs in 5. 18-core M5: 18 beat 9 by 29%."),
        ("e2e-ci is gated on Nx 23", "The wrapper needs Nx Cloud. The leaf targets do not."),
        ("The cache is not in .nx/cache", "Nx 23 puts it in ~/.nx/<hash>/cache. Most CI recipes cache the wrong path."),
        ("Parallel Cypress fights over :99", "Each process spawns its own Xvfb. Start one and export DISPLAY."),
        ("Cache the Cypress binary in CI", "Otherwise every shard re-downloads ~200 MB."),
        ("App changes invalidate everything", "Correct, but it limits when failure-only retries help."),
    ]
    for i, (h, b) in enumerate(items):
        y = CONTENT_TOP + i * 0.72
        ellipse(s, M, y + 0.06, 0.28, fill=ORANGE_25)
        write(textbox(s, M, y + 0.06, 0.28, 0.28, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE),
              str(i + 1), size=11, font=HEAD, color=INK)
        write(textbox(s, M + 0.45, y, 4.6, 0.4), h, size=13, font=HEAD, color=INK)
        write(textbox(s, M + 5.3, y, 7.3, 0.5), b, size=12, color=BODY)
    notes(s, "Leave this up during questions — it is the slide people photograph. On item 2: on this laptop five and eight tied at 141s but eight went red twice in five runs, while an 18-core M5 reached 34s at 18 and stayed green. Not memory — 8 concurrent needs 8 GB of this machine's 32. The limit here is the 8 performance cores, and a Cypress target wants about 1.5 of them, which puts the ceiling near 5.")



    # 26 appendix · playwright ------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Appendix · The question that always comes", "What about Playwright?",
            kicker_color=ORANGE)
    for x, head, tone, wash, items in [
        (M, "Carries over unchanged", GREEN_DEEP, GREEN_25, [
            "@nx/playwright has the same atomizer — one target per spec file",
            "Same names: e2e-ci--src/e2e/checkout.spec.ts",
            "Same Nx Cloud gate on the e2e-ci wrapper",
            "run-e2e.mjs needs no changes — it only reads the graph",
        ]),
        (M + 6.15, "What changes", ORANGE_DEEP, ORANGE_25, [
            "Playwright already runs spec files across worker processes. Cypress does not — "
            "that gap is most of the win here",
            "Atomizing swaps that warm pool for one cold browser launch per target",
            "Playwright ships native --shard, so rung 4 needs no Nx either",
        ]),
    ]:
        rect(s, x, CONTENT_TOP + 0.1, 5.85, 3.35, fill=wash, outline=tone)
        write(textbox(s, x + 0.3, CONTENT_TOP + 0.28, 5.25, 0.35), head, size=15, font=HEAD, color=tone)
        for i, t in enumerate(items):
            y = CONTENT_TOP + 0.78 + i * 0.64
            ellipse(s, x + 0.32, y + 0.06, 0.09, fill=tone)
            write(textbox(s, x + 0.56, y, 4.95, 0.6), t, size=11, color=INK)

    rect(s, M, 5.6, 11.97, 1.15, fill=WHITE, outline=LINE)
    write(textbox(s, M + 0.28, 5.76, 11.4, 0.32),
          "The short answer — on Cypress the atomizer buys parallelism and caching. On Playwright "
          "it mostly buys caching, because the parallelism was already there.", size=12, color=INK)
    write(textbox(s, M + 0.28, 6.12, 11.4, 0.5),
          "Still worth it: the cache and failure-only retries have no Playwright equivalent, and "
          "affected does not care which runner you use. Measure before you trade away the pool.",
          size=12, color=BODY)
    notes(s, "Checked against @nx/playwright 23.2.0, not from memory: the plugin names targets "
             "`${ciTargetName}--${relativeSpecFilePath}` and sets the same nonAtomizedTarget marker "
             "that triggers the Nx Cloud refusal. It also emits an extra e2e-ci--wait-for-webserver "
             "target, because it coordinates the shared dev server differently. If the questioner "
             "owns a Playwright suite: take section 05, skip section 04.")


    # 27 appendix · q&a bank ---------------------------------------------------
    s = add(prs, "Only title")
    heading(s, "Appendix · Prepared answers", "Ten questions you will probably get",
            kicker_color=ORANGE)
    qa = [
        ("Why not just pay for Nx Cloud?",
         "Often the right call. It adds distribution by measured duration, a shared cache and "
         "flaky detection. This is the free half of the same idea."),
        ("Does the cache fix flaky tests?",
         "No. It makes retries cheap. A flake fails, is never cached, and re-runs on its own "
         "while everything else replays."),
        ("Can the cache hand back a wrong result?",
         "Only if a task has inputs Nx cannot see — a live API, the clock, a shared database. "
         "Declare them as inputs or mark the task uncacheable."),
        ("Can the team share one cache?",
         "Not on the free tier: it is per-machine and per-CI-job. A shared remote cache is the "
         "main thing Nx Cloud actually sells."),
        ("Do I need a monorepo for this?",
         "No. The atomizer works on a single project. It is affected that needs several projects "
         "before it earns its keep."),
        ("One app has 200 specs, the others have 5?",
         "That is exactly when sharding beats a per-app matrix. Shard the big one; leave the "
         "small ones a runner each."),
        ("Will 30 targets cost more CI minutes?",
         "It went 48m to 25m on the real project, and a replayed job bills almost nothing. More "
         "runners does mean more concurrency — measure yours."),
        ("What about shared test data?",
         "The real blocker, and it is not an Nx problem. Specs must be independent before you can "
         "run them at once. Usually more work than the config."),
        ("Does this work with Playwright?",
         "Same atomizer, same gate. But Playwright already parallelises, so you mostly gain the "
         "cache. Previous slide has the detail."),
        ("How long did this take to set up?",
         "The config is minutes. Reviewing a thousand tests took months. The tooling was never "
         "the hard part."),
    ]
    for i, (q, a) in enumerate(qa):
        x = M + (0 if i < 5 else 1) * 6.15
        y = 1.72 + (i % 5) * 1.02
        write(textbox(s, x, y, 0.4, 0.3), f"{i + 1:02d}", size=10, font=MONO, color=ORANGE_DEEP)
        write(textbox(s, x + 0.45, y, 5.4, 0.3), q, size=12, font=HEAD, color=INK)
        write(textbox(s, x + 0.45, y + 0.3, 5.4, 0.64), a, size=10, color=BODY)
    notes(s, "Reference only — do not present this, it is for you when a question lands. "
             "Numbers 1, 4 and 8 are the ones that actually come up. On 1: do not be defensive, "
             "Nx Cloud is a good product and the talk only claims the free tier is unclaimed. "
             "On 8: this is the answer that separates people who have done it from people who "
             "have read about it — parallel-safe test data is the real project.")


def stamp_master(path: Path, *, presenter: str, date: str):
    """Replace the template's stock footer name/date across master and layouts.

    The footer is inherited, so this is the only place it can be changed —
    editing it per slide would fight the master (skill step A4).
    """
    import re
    import zipfile

    tmp = path.with_suffix(".tmp.pptx")
    with zipfile.ZipFile(path) as src, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as dst:
        for item in src.infolist():
            data = src.read(item.filename)
            if item.filename.endswith(".xml") and (
                "slideMaster" in item.filename or "slideLayout" in item.filename
            ):
                text = data.decode("utf8")
                text = text.replace("<a:t>Lin, Kevin</a:t>", f"<a:t>{presenter}</a:t>")
                text = text.replace("<a:t>28.03.26</a:t>", f"<a:t>{date}</a:t>")
                data = text.encode("utf8")
            dst.writestr(item, data)
    tmp.replace(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--skill", default=os.environ.get("ZUHLKE_SKILL", ""),
                    help="path to the zuhlke-slides skill directory")
    ap.add_argument("-o", "--out", default=str(HERE / "Scaling-E2E-Tests-with-Nx-Zuhlke.pptx"))
    args = ap.parse_args()

    if not args.skill:
        sys.exit("Need --skill <path to zuhlke-slides> (or set ZUHLKE_SKILL). "
                 "Clone https://codehub.zuehlke.com/ai-sdlc/zapac-agent-skills")
    skill = Path(args.skill)
    master = skill / "references" / "zuhlke-master-template.pptx"
    if not master.exists():
        sys.exit(f"Master template not found at {master}")

    out = Path(args.out)
    shutil.copy(master, out)

    sys.path.insert(0, str(skill / "scripts"))
    from copy_slide import delete_slides, cleanup_deck, verify_pptx  # noqa: E402

    # keep nothing: the master's 7 slides are guidelines and structural refs
    delete_slides(str(out), [0, 1, 2, 3, 4, 5, 6])

    prs = Presentation(str(out))
    build(prs)
    for slide in prs.slides:
        page_number(slide)
    prs.save(str(out))

    # A4 — the master ships with a stock presenter name and date in its footer
    stamp_master(out, presenter=SPEAKER, date="08.09.2026")

    cleanup_deck(str(out))
    errors, warnings = verify_pptx(str(out))
    for w in warnings:
        print(f"WARNING: {w}")
    if errors:
        for e in errors:
            print(f"ERROR: {e}")
        raise SystemExit(f"Verification FAILED: {len(errors)} error(s). Do not deliver.")
    print(f"Verification PASSED — {len(Presentation(str(out)).slides)} slides → {out}")


if __name__ == "__main__":
    main()
