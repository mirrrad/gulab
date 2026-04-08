# Gulab — Project Brief

*Summary of the initial planning conversation. Use this as the source of truth when building or briefing anyone on this project.*

---

## The Business

**Owner:** Roos (based in the Netherlands)
**What:** A one-person curation business — handcrafted Indian jewelry (and potentially other items)
**Where:** Netherlands for now; EU and beyond later
**Brand name:** **Gulab** (گلاب / गुलाब) — Hindi for "rose", chosen because Roos means rose in Dutch. The name bridges her identity and the Indian origin of the pieces.

---

## Current Selling Setup

- Sells on **Vinted** today
- No plans to move off Vinted immediately — the website links *to* Vinted, not replacing it
- Future: may move to Shopify or WooCommerce when volume warrants it

---

## Website Goal

Create a **brand presence / landing page** whose job is:

1. Give Gulab a credible, beautiful home on the web
2. Act as the destination when people click through from Instagram or other social channels
3. Convert visitors into Vinted shoppers or direct inquirers (WhatsApp / email)

**It is not an e-commerce store.** No cart, no checkout. It showcases pieces and routes people to Vinted or direct contact.

---

## Site Sections (in scroll order)

1. **Hero** — Full-screen mood image, brand name "Gulab", tagline, one CTA scrolling to collection
2. **Collection Preview** — 3–6 featured pieces, each linking to its Vinted listing + "View all on Vinted" button
3. **How to Buy** — Simple 3-step explainer (Browse → Reserve → Receive). Warm, reassuring tone.
4. **About Roos** — Personal story. Why India, what curation means to her.
5. **Contact / Footer** — WhatsApp, Instagram, email form, Vinted link

---

## Contact Methods

| Method | Purpose |
|--------|---------|
| WhatsApp | +31 6 14 29 57 97 → `https://wa.me/31614295797` |
| Instagram | @lijkesnijer → `https://www.instagram.com/lijkesnijer` |
| Email form | Netlify Forms — no backend needed |
| Vinted | `https://www.vinted.nl/member/27795555-roos123456` |

---

## Tech Stack

- **Vanilla HTML/CSS/JS** — no build step, no framework
- Single `index.html` file with embedded styles and scripts
- CSS variables (design tokens) for color/type consistency
- Deployed to **Netlify** (same as Rasa Collective)
- Netlify Forms for the contact form

---

## Design Direction

| Token | Value | Notes |
|-------|-------|-------|
| Background | `#1C1410` | Very dark warm brown — intimate, luxe |
| Text | `#F5EDE0` | Warm cream |
| Accent | `#C9763D` | Saffron / terracotta — CTAs |
| Gold | `#C9A16B` | Decorative accents |
| Headline font | Cormorant Garamond | Elegant, high-craft serif |
| Body font | Inter | Clean, readable |

**Feel:** Warm luxury. Not cold minimalism. Rich, intimate, handcrafted.
**Tagline:** *"Handpicked from India. Worn in Nederland."*

---

## Brand Name Notes

- **Gulab** works as a domain (`gulabcurates.com`, `gulab.nl`) and social handle
- Devanagari/Urdu script sub-mark: `گلاب` or `गुलाब` — can be used decoratively
- Do NOT over-explain the name on the site — let it breathe, let people discover it

---

## Future Roadmap

| Phase | Change |
|-------|--------|
| Now | Static site → Vinted |
| 3–6 months | Newsletter (Mailchimp / Buttondown) |
| 6–12 months | Shopify Lite — replace Vinted links |
| 1+ year | Dutch/English toggle, EU shipping, journal/blog |

---

## Reference Sites (same owner, same patterns to follow)

- **Rasa Collective:** `/Users/mrk/Documents/Projects/Rasa Collective/rasa-collective/index.html` — closest structural model (single file, embedded styles, fullscreen hero)
- **Bamberg Global:** `/Users/mrk/Documents/Projects/Bamberg Global/` — design token approach, CSS variable patterns to borrow

---

*Created: April 2026*
