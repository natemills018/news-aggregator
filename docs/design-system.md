# CLE Local Design System

Practical design reference for the CLE Local platform and The CLE Brief newsletter. Everything here is intended to be directly implementable in Tailwind CSS (web) and inline styles (email).

---

## 1. Brand Identity

### Name Treatment

| Context | Name | Usage |
|---------|------|-------|
| Newsletter | **The CLE Brief** | Email subject lines, header, social media for the newsletter product |
| Platform / Web App | **CLE Local** | Domain, app chrome, meta tags, broader brand |
| Shorthand | **CLE** | Favicon, social avatars, compact contexts |

When writing "CLE" in the wordmark, the letters should always be uppercase. "Brief" and "Local" use title case.

### Logo Direction

Text-based wordmark, not an icon logo. The concept:

- **"CLE"** set in the heading typeface (DM Sans, bold/black weight), slightly tracked out, acting as the strong anchor.
- **"Brief"** or **"Local"** appended in a lighter weight or the body typeface, creating a natural hierarchy.
- No enclosing shape. No skyline, no guitar, no sports imagery.
- Works at 120px wide in an email header and still reads clearly.
- Single color (primary navy or white on dark) for simplicity. The accent coral can be used as an underline or dot accent on the "i" in Brief if extra character is needed.
- Monochrome first; a color version is secondary.

### Brand Personality

1. **Punchy** — concise, direct, no filler
2. **Local** — rooted in Cleveland, insider knowledge
3. **Modern** — clean design, not legacy-media energy
4. **Approachable** — friendly tone, not pretentious
5. **Curated** — intentional picks, not a firehose

---

## 2. Color Palette

### Core Palette

| Role | Name | Hex | Tailwind Class | Usage |
|------|------|-----|----------------|-------|
| Primary | Slate Navy | `#1B2A4A` | `bg-[#1B2A4A]` | Headers, primary text, nav background |
| Primary Light | Steel | `#2E4268` | `bg-[#2E4268]` | Hover states, secondary surfaces |
| Secondary | Warm Gray | `#F5F3F0` | `bg-[#F5F3F0]` | Page background, card backgrounds |
| Secondary Dark | Stone | `#E8E4DF` | `bg-[#E8E4DF]` | Borders, dividers, subtle backgrounds |
| Accent | Coral | `#E85D4A` | `bg-[#E85D4A]` | CTAs, links, highlights, active states |
| Accent Hover | Deep Coral | `#D14A38` | `bg-[#D14A38]` | Button hover, link hover |
| White | White | `#FFFFFF` | `bg-white` | Card surfaces, text on dark backgrounds |

### Text Colors

| Role | Hex | Usage |
|------|-----|-------|
| Primary Text | `#1B2A4A` | Headlines, body text |
| Secondary Text | `#5A6578` | Captions, metadata, timestamps |
| Muted Text | `#8E95A2` | Placeholder text, disabled states |
| Inverse Text | `#FFFFFF` | Text on dark/primary backgrounds |

### Semantic Colors

| Role | Hex | Usage |
|------|-----|-------|
| Success | `#2D8A56` | Confirmation, verified status |
| Warning | `#D4930D` | Alerts, approaching deadlines |
| Error | `#C93B3B` | Form errors, failed states |
| Info | `#3B7FC9` | Informational callouts |

### Surface Colors

| Role | Hex | Usage |
|------|-----|-------|
| Page Background | `#F5F3F0` | Main body background |
| Card Background | `#FFFFFF` | Event cards, content containers |
| Card Border | `#E8E4DF` | Subtle card borders |
| Divider | `#E0DCD7` | Horizontal rules, section separators |

---

## 3. Typography

### Font Stack

| Role | Font | Google Fonts Link | Weights |
|------|------|-------------------|---------|
| Headings | **DM Sans** | `family=DM+Sans:wght@500;700` | 500 (medium), 700 (bold) |
| Body | **Inter** | `family=Inter:wght@400;500;600` | 400 (regular), 500 (medium), 600 (semi-bold) |

**Why these fonts:** DM Sans has geometric personality without being quirky — it reads as modern and confident. Inter is the workhorse body font: extremely legible at small sizes, excellent on screens, and broadly available.

### Email-Safe Fallback Stacks

```
Headings: 'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
Body: Inter, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

### Type Scale

Based on a 1rem = 16px root. Use `rem` units in CSS.

| Level | Size (rem) | Size (px) | Weight | Font | Line Height | Letter Spacing |
|-------|-----------|-----------|--------|------|-------------|----------------|
| Display | 2.25rem | 36px | 700 | DM Sans | 1.2 | -0.02em |
| H1 | 1.875rem | 30px | 700 | DM Sans | 1.25 | -0.015em |
| H2 | 1.5rem | 24px | 700 | DM Sans | 1.3 | -0.01em |
| H3 | 1.25rem | 20px | 600 | DM Sans | 1.35 | -0.005em |
| H4 | 1.125rem | 18px | 600 | DM Sans | 1.4 | 0 |
| Body | 1rem | 16px | 400 | Inter | 1.6 | 0 |
| Body Small | 0.875rem | 14px | 400 | Inter | 1.5 | 0.005em |
| Caption | 0.75rem | 12px | 500 | Inter | 1.4 | 0.01em |
| Overline | 0.6875rem | 11px | 600 | Inter | 1.3 | 0.08em |

**Overline** is used for category labels and metadata above headlines (always uppercase).

### Guidelines

- Body text line length: aim for 55-75 characters per line (use `max-w-prose` or `max-w-[65ch]`).
- Paragraph spacing: `1rem` (margin-bottom on `<p>` tags).
- Never go below 14px for readable body text on web; 13px minimum in email.

---

## 4. Spacing & Layout

### Base Grid

**8px base unit.** All spacing values are multiples of 8.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `space-0.5` | 4px | `p-1` | Tight inner padding (badges, tags) |
| `space-1` | 8px | `p-2` | Minimum gap between related elements |
| `space-2` | 16px | `p-4` | Standard inner padding, gap between elements |
| `space-3` | 24px | `p-6` | Card padding, section gap |
| `space-4` | 32px | `p-8` | Section spacing |
| `space-5` | 40px | `p-10` | Large section breaks |
| `space-6` | 48px | `p-12` | Page section padding |
| `space-8` | 64px | `p-16` | Hero/header vertical padding |

### Content Widths

| Context | Max Width | Notes |
|---------|-----------|-------|
| Web content area | `768px` (`max-w-3xl`) | Main content column (newsletter-style layout) |
| Web wide layout | `1024px` (`max-w-5xl`) | Card grid layouts, search results |
| Web max container | `1200px` (`max-w-7xl`) | Absolute outer limit |
| Email | `600px` | Industry standard for email rendering |
| Email content | `560px` | Content within email padding |

### Breakpoints

| Name | Min Width | Tailwind Prefix | Target |
|------|-----------|-----------------|--------|
| Mobile | 0px | (default) | Phones, portrait |
| Tablet | 640px | `sm:` | Phones landscape, small tablets |
| Desktop | 768px | `md:` | Tablets, small laptops |
| Wide | 1024px | `lg:` | Laptops, desktops |

Mobile-first approach. Design for single-column first, then expand.

### Grid

- Event card grid: single column on mobile, 2 columns at `md:`, 3 columns at `lg:`.
- Gap: `space-3` (24px) between cards.

---

## 5. Components

### Event Card

The core content unit. Two variants: web and email.

**Web Event Card:**

```
+-----------------------------------------------+
| [Category Badge]                    [Date]     |
| Event Title (H3)                               |
| Venue Name  ·  Neighborhood                    |
| Short description text, 2 lines max...         |
| [Price/Free]                [Learn More ->]    |
+-----------------------------------------------+
```

- Background: `#FFFFFF`
- Border: `1px solid #E8E4DF`
- Border radius: `0.5rem` (8px)
- Padding: `space-3` (24px)
- Hover: subtle lift with `shadow-md` and `translate-y-[-2px]` transition
- Category badge sits top-left, date top-right (secondary text color)
- Title is a link, styled in primary text color; on hover, accent coral
- Venue and neighborhood in secondary text, separated by a middle dot
- Transition: `transition-all duration-200 ease-in-out`
- Optional image: If present, full-width above the text content, 16:9 ratio, `object-cover`, border radius top corners only

**Email Event Card:**

- Simplified: no hover, no border-radius in some clients
- White background with a 1px `#E0DCD7` border (use `border` shorthand for email)
- Padding: 20px
- Title as a styled link (coral color, no underline; underline on hover if supported)
- Inline styles only; no class-based styling

### CTA Buttons

| Variant | Background | Text | Border | Padding | Border Radius |
|---------|-----------|------|--------|---------|---------------|
| Primary | `#E85D4A` | `#FFFFFF` | none | `12px 24px` | `6px` |
| Primary Hover | `#D14A38` | `#FFFFFF` | none | — | — |
| Secondary | transparent | `#1B2A4A` | `1px solid #1B2A4A` | `12px 24px` | `6px` |
| Secondary Hover | `#1B2A4A` | `#FFFFFF` | `1px solid #1B2A4A` | — | — |
| Ghost | transparent | `#E85D4A` | none | `12px 24px` | `6px` |
| Ghost Hover | `rgba(232,93,74,0.08)` | `#D14A38` | none | — | — |

- Font: Inter, 600 weight, 0.875rem (14px)
- Text transform: none (sentence case)
- Letter spacing: `0.01em`
- Cursor: pointer
- Transition: `background-color 150ms ease, color 150ms ease`
- All buttons should have min-height of 44px for touch targets

### Email Header

```
+--------------------------------------------------+
|  [Logo: THE CLE BRIEF]          [View in Browser] |
|                                                    |
|  Week of April 6, 2026                            |
|  "Your weekly hit of what's happening in CLE"     |
+--------------------------------------------------+
```

- Background: `#1B2A4A` (primary navy)
- Text: `#FFFFFF`
- Logo: white wordmark, max 200px wide
- Tagline: Inter, 14px, `rgba(255,255,255,0.65)`
- Padding: 32px horizontal, 24px vertical
- "View in Browser" link: small, right-aligned, `rgba(255,255,255,0.5)`, 12px

### Email Footer

- Background: `#1B2A4A`
- Text: `rgba(255,255,255,0.6)`, Inter 12px
- Content: unsubscribe link, social links (text-based, not icons for compatibility), copyright
- Unsubscribe link must be clearly visible (required by law)
- Padding: 24px horizontal, 20px vertical
- Divider: `1px solid rgba(255,255,255,0.15)` between content and footer

### Navigation (Web)

Minimal top nav, sticky on scroll.

- Background: `#FFFFFF` with `border-bottom: 1px solid #E8E4DF`
- Height: 64px
- Layout: logo left, nav links center-right, CTA (subscribe) far right
- Nav links: Inter 500, 14px, `#5A6578`; active/hover: `#1B2A4A`
- Active indicator: 2px bottom border in accent coral on active link
- Mobile: hamburger menu at `md:` breakpoint and below
- Subscribe button: primary CTA style, compact (`8px 16px` padding)
- Max width: full bleed, content constrained to `max-w-7xl` and centered

### Signup Form

- Single email input + submit button, inline on desktop, stacked on mobile
- Input: `border: 1px solid #E8E4DF`, `border-radius: 6px`, `padding: 12px 16px`, Inter 16px
- Input focus: `border-color: #1B2A4A`, `ring: 2px #1B2A4A / 20%`
- Submit button: primary CTA style
- Error state: `border-color: #C93B3B`, error message in 14px error color below input
- Success state: input and button replaced with confirmation text in success color
- Helper text below: "Free. Weekly. No spam." in caption style, muted text

### Category Tags / Badges

- Display: inline-block pill shape
- Padding: `4px 10px`
- Border radius: `9999px` (full pill)
- Font: Inter, 600 weight, 11px, uppercase
- Letter spacing: `0.06em`
- Background: category color at 12% opacity
- Text: category color at full strength
- No border

---

## 6. Category Color Map

Each category gets a distinct color used for its badge and any category-specific accents.

| Category | Color Name | Hex | Badge BG (12% opacity) | Text/Foreground |
|----------|-----------|-----|------------------------|-----------------|
| Music | Electric Blue | `#3B7FC9` | `rgba(59,127,201,0.12)` | `#3B7FC9` |
| Food & Drink | Warm Amber | `#D4930D` | `rgba(212,147,13,0.12)` | `#B07A00` |
| Family | Soft Green | `#2D8A56` | `rgba(45,138,86,0.12)` | `#2D8A56` |
| Arts & Culture | Plum | `#8B5CC2` | `rgba(139,92,194,0.12)` | `#8B5CC2` |
| Sports | Coral Red | `#E85D4A` | `rgba(232,93,74,0.12)` | `#E85D4A` |
| Outdoors | Teal | `#1A9E8F` | `rgba(26,158,143,0.12)` | `#1A9E8F` |
| Festivals | Magenta | `#C944A0` | `rgba(201,68,160,0.12)` | `#C944A0` |
| Nightlife | Indigo | `#5B5EE6` | `rgba(91,94,230,0.12)` | `#5B5EE6` |

**Guidelines:**
- Food & Drink uses a darkened text color (`#B07A00`) for accessibility against the light badge background. Apply the same treatment to any category where the base color is too light for WCAG AA contrast on white.
- In email, use solid light backgrounds instead of rgba (e.g., `#EBF2F9` for Music) since rgba support is inconsistent.
- When categories appear as filter chips (web), selected state uses full color background with white text.

---

## 7. Email-Specific Guidelines

### Layout

- Max width: **600px** table-based layout
- Content padding: **20px** on each side (560px usable)
- Use `<table>` layout with `role="presentation"` for structure
- All widths in pixels, not percentages, for Outlook compatibility
- Stack all content into a single column — no multi-column layouts in email

### Typography in Email

```css
/* Heading stack */
font-family: 'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* Body stack */
font-family: Inter, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

- Minimum font size: 14px body, 13px captions
- Use `px` not `rem` in email (rem is unreliable across clients)
- Line height in px or unitless multiplier (e.g., `line-height: 24px` or `line-height: 1.5`)
- Explicit `color` on every text element (email clients have unpredictable defaults)

### Inline Styles

All styling must be inline. No `<style>` blocks for critical styles (some clients strip `<head>`). A `<style>` block can be included as progressive enhancement for clients that support it (e.g., hover states, media queries).

```html
<!-- Example: heading in email -->
<h2 style="font-family: 'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
           font-size: 24px; line-height: 30px; font-weight: 700;
           color: #1B2A4A; margin: 0 0 8px 0;">
  Event Title Here
</h2>
```

### Images

- Always set `width`, `height`, `alt`, and `style="display: block;"` on images
- Use absolute URLs (hosted, not relative paths)
- Provide meaningful alt text (images are often blocked by default)
- Max image width: 560px (within content padding)
- Retina: serve 2x images at 1x display dimensions
- Format: JPEG for photos, PNG for graphics with transparency, avoid SVG (poor email support)

### Dark Mode Considerations

Even though the design system is light-theme only, email clients may invert colors.

- Use `color-scheme: light;` and `supported-color-schemes: light;` meta tags to request light rendering
- Avoid pure white (`#FFFFFF`) backgrounds on text containers; use `#F5F3F0` as the outer wrapper so inversion is less jarring
- For the navy header/footer: dark backgrounds survive dark mode well, no action needed
- Test with Litmus or Email on Acid to catch rendering issues

### Preheader Text

- Include a hidden preheader after the opening `<body>` tag
- Content: brief summary of the week's highlights (90-130 characters)
- Styled: `font-size: 0; line-height: 0; display: none; max-height: 0; overflow: hidden;`

### Accessibility

- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text (WCAG AA)
- Use semantic HTML where possible (`<h1>`, `<p>`, not just `<td>`)
- Links should be distinguishable by more than just color (underline or bold)
- `role="presentation"` on all layout tables
- Language attribute: `<html lang="en">`

---

## Implementation Notes

### Tailwind CSS Integration

Add these to the project's Tailwind configuration or CSS custom properties:

```css
@theme {
  --color-navy: #1B2A4A;
  --color-navy-light: #2E4268;
  --color-warm-gray: #F5F3F0;
  --color-stone: #E8E4DF;
  --color-coral: #E85D4A;
  --color-coral-dark: #D14A38;
  --color-text-primary: #1B2A4A;
  --color-text-secondary: #5A6578;
  --color-text-muted: #8E95A2;
  --color-success: #2D8A56;
  --color-warning: #D4930D;
  --color-error: #C93B3B;
  --color-info: #3B7FC9;
}
```

### Google Fonts Embed

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```
