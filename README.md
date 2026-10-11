# CANVAS — Art for a Bolder Tomorrow

**Production:** `https://canvas-sand-tau.vercel.app`

A concept website for a fictional digital art hall and its fourth exhibition. The page *is* the exhibition: you walk sideways through six rooms of generative artworks that are drawn live by code in the browser, redraw any work with a click, open detail views to play with its parameters, and finally make your own piece in the studio and hang it on the last wall.

> Fictional concept brand — portfolio project. CANVAS, its venue, its dates and all seven artists are invented. Prices are illustrative and nothing can be booked.

---

## Concept

Generative art is usually shown as a grid of thumbnails. CANVAS shows it the way a museum would: in rooms, at eye level, with wall labels, benches and pools of light, and with enough negative space to look properly. Because every work is code, the visitor can do what no museum allows: ask a painting to paint itself again.

| # | Section | Composition | What it does |
|---|---|---|---|
| 01 | **Exhibition** | Pinned horizontal walk through seven spaces (Entrance + Rooms I–VI), floor plan HUD | Signature interaction: walk, redraw works, open details, live works respond to the pointer |
| 02 | **Catalogue** | Salon-style hang with filters | Filter by room and palette; animated re-hang; opens detail views |
| 03 | **Artists** | Typographic index list with hover preview | Seven fictional artists; each opens a profile with their works |
| 04 | **Studio** | Large framed canvas beside a recipe panel | Six recipes, density, chaos, palette, seed, title; "Hang it in Room VI" |
| 05 | **Visit** | Facts beside a timed-entry form | Validated booking demo that prints an illustrative ticket |

## Brand & positioning

- **Name:** CANVAS: the oldest surface in art, now made of pixels and rules.
- **Line:** Art for a Bolder Tomorrow.
- **Positioning:** a calm, serious venue for art made with code, aimed at people who love painting as much as programming. Live, touchable, never twice the same.
- **Voice:** curatorial but warm; short wall-label sentences. No invented press quotes, visitor numbers or awards.

## Audience

Gallery-goers, design and creative-coding communities, schools and families who want a museum visit that responds to them.

## Art direction

A bright, quiet gallery, deliberately the opposite of the dark tech sites in the same portfolio.

- **Palette:** gallery white `#F7F6F2`, ink `#111111`, vermilion `#E8452C`, ochre `#D9A43B`; walls change per room (white, ochre, a darkened "black box", stone, and a vermilion final room).
- **Spatial cues:** oak floor and skirting, benches, ceiling spotlights, white passe-partout mats and thin black frames, side-hung wall labels.
- **Imagery:** 100% generative: ten seeded algorithms (flow field, threads, contours, Truchet tiles, composition machine, orbitals, rose-curve bloom, strata, halftone, constellation) plus the generated exhibition poster.
- **Logo:** a black frame that a vermilion sun breaks out of, with an ochre quarter-circle rising from the corner: art leaving the frame. The wordmark is drawn from the same straight lines and arcs.

## Typography

- **Display:** Rozha One for exhibition titles, room numerals and section headings: high-contrast and theatrical, like gallery vinyl lettering.
- **Text & functional labels:** Chivo (400/500/700, italic for work titles). Artist names, seeds, numbers, prices and labels all use Chivo for legibility.
- Fluid sizes with `clamp()`. Headings use `overflow-wrap: normal` and are sized to fit at 360 px.

## Motion language

- **Walking:** vertical scroll becomes sideways travel through the rooms; room titles drift at a slower parallax rate than the walls, like signage seen from a moving body.
- **Paint-on:** every artwork appears behind an uneven squeegee edge sweeping left to right, as if freshly pulled.
- **Living works:** *Orbitals* turns slowly and its outer rings lean towards the pointer; *Constellation for One* reaches out and connects to the visitor.
- **Re-hang:** catalogue filters move works to their new places (FLIP) instead of blinking.
- **Curtain reveals:** headings and blocks are uncovered from the top, like a dust sheet lifting.

## Signature interaction — how to use it

- **Walk:** scroll, drag (mouse), swipe (touch), the ← → arrow buttons, the floor plan, or the keyboard arrows while focus is in the exhibition.
- **Redraw:** click any artwork (or its **Redraw** link) to draw it again with a new seed; the seed on the label updates.
- **Details:** open **Details** for a large view with density, chaos and palette controls, a new-seed button and a link to the artist.
- **Touch the live works:** move across *Orbitals* (Room III) and *Constellation for One* (Room V).
- **Hang your own:** in the **Studio**, choose a recipe, set the dials and title, then **Hang it in Room VI**. It stays for the session.

## Tech

- Static HTML/CSS/ES modules, no build step, no libraries.
- `art.js`: seeded RNG, Perlin noise, the ten algorithms, the paint-on renderer and the shared animation loop for live works. `walk.js`: rooms built from data, pinned horizontal travel, floor plan, lazy painting, focus handling. `sections.js`: dialogs, catalogue, artists, studio, booking. `data.js`: artists, works, rooms, palettes. `main.js`: bootstrap.
- Hand-written JS ≈ 54 KB.

## Local development

```bash
npx serve .
```

## Accessibility

- Semantic landmarks, one `<h1>`, skip link, visible `:focus-visible`.
- Each room is an `article` with its own heading; every artwork is a `figure` with a full wall label as its caption. Canvases are decorative to assistive tech; the information lives in text.
- All interactions have buttons: redraw, details, previous/next room, floor-plan rooms. Tabbing into an off-screen room walks you to it.
- Detail and artist views use native `<dialog>` (focus is trapped, Escape closes, focus returns to the opener).
- Filters are toggle buttons with `aria-pressed` and a live result count; forms have inline, associated errors.
- `prefers-reduced-motion`: the walk becomes a native horizontal swipe/scroll with snap points, works appear without the paint-on sweep, *Orbitals* stands still, and CSS animation is removed. Pointer responses still work because they are user-driven.

## Performance

- Artworks are painted lazily as rooms approach the viewport and re-painted only on resize or request.
- DPR capped at 2; only one live loop runs for all live works and it pauses when they are off-screen.
- Static works render once to an offscreen canvas and are revealed by clipping, not redrawn per frame.

## Known limitations

- Very wide aspect works scale down on small phones; the wall labels drop their long text there.
- The visitor's work lives in `sessionStorage` and disappears when the tab closes.

## Credit

Designed & built by Saad Bashir — https://www.linkedin.com/in/saadbashirmarketing/
