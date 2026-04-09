# Design System Strategy: The Kinetic Professional

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Professional."** 

In an industry built on the rhythms of nature and the precision of modern logistics, we reject the "generic SaaS" look of cold, static grids. This system translates the "Smart Poultry Professional" vibe by blending high-energy, hand-crafted textures (inspired by the brush-stroke logo background) with a disciplined, editorial layout. We use intentional asymmetry—such as oversized typography overlapping organic shapes—to create a sense of movement and authority. The goal is to feel premium, industrial, and hyper-efficient, moving away from "software-as-a-tool" toward "software-as-a-command-center."

---

## 2. Colors: High-Voltage Contrast
The palette is rooted in a deep `background` (#0e0e0e) to allow the `primary` yellow-gold (#ffc965) to feel like a light source.

### The "No-Line" Rule
Standard UI relies on lines to separate content; this system prohibits them. Sections must be defined exclusively through color shifts. For instance, a side-bar using `surface_container` sits against a `background` viewport. Information density is achieved through tone, not strokes.

### Surface Hierarchy & Nesting
Treat the interface as a physical stack of materials.
*   **Base:** `surface` (#0e0e0e) for the primary application canvas.
*   **Secondary Planes:** `surface_container_low` (#131313) for secondary navigation or grouping.
*   **Active Cards:** `surface_container_highest` (#262626) to bring interactive data to the foreground.

### The "Glass & Gradient" Rule
To add "soul" to the professional UI, floating panels (modals, tooltips) should utilize Glassmorphism. Use `surface_variant` at 60% opacity with a `backdrop-blur` of 20px. 
*   **Signature Gradient:** For high-impact CTAs, use a linear gradient from `primary` (#ffc965) to `primary_container` (#feb700) at 135 degrees. This mimics the depth of the logo’s golden orb.

---

## 3. Typography: The Editorial Edge
We employ a dual-font strategy to balance character with data-heavy utility.

*   **Display & Headline (Epilogue):** This is our "Character" font. Used in bold weights for `display-lg` through `headline-sm`, it provides a modern, slightly industrial feel. Use tight letter-spacing (-2%) for headlines to create a dense, authoritative "Smart Professional" look.
*   **Body & Label (Manrope):** This is our "Efficiency" font. Manrope’s geometric clarity ensures that complex poultry data (feed ratios, count, logistics) remains legible at small scales (`body-sm`, `label-md`).
*   **Visual Hierarchy:** Titles should be significantly larger than body text. Don’t be afraid to use `display-lg` (3.5rem) for key metrics to create an editorial, "dashboard-first" hierarchy.

---

## 4. Elevation & Depth: Tonal Layering
We move away from the traditional shadow-heavy "Material" look in favor of **Tonal Layering**.

*   **The Layering Principle:** Soft lift is achieved by placing a `surface_container_lowest` (#000000) card on a `surface_container_high` (#20201f) background. The contrast in black levels creates a more sophisticated depth than a grey drop shadow.
*   **Ambient Shadows:** Where a shadow is required (e.g., a floating Action Button), use a 40px blur at 8% opacity using the `on_surface` color as the tint. It should feel like a soft glow, not a dark stain.
*   **The "Ghost Border" Fallback:** If a layout requires a container boundary for accessibility, use the `outline_variant` (#484847) at 15% opacity. Never use 100% opaque borders.

---

## 5. Components: Precision Primitives

### Buttons
*   **Primary:** `primary_container` background with `on_primary_container` text. Roundedness: `DEFAULT` (1rem). High-energy state: Use a subtle brush-stroke SVG mask on hover.
*   **Secondary:** Ghost style using the "Ghost Border" (outline-variant at 20%) with `primary` text.
*   **Tertiary:** Bold `label-md` text only, using the `primary` color.

### Input Fields
*   **Style:** No background (transparent). Use a bottom-only "Ghost Border" to anchor the text. 
*   **Focus:** Transition the bottom border to `primary` with a 2px thickness. Labels use `label-md` in `on_surface_variant`.

### Cards & Lists
*   **The Rule:** Strictly no divider lines. 
*   **Implementation:** Separate list items using `spacing-md` (vertical white space). For data grids, use alternating background tints: `surface_container` for even rows and `surface_container_low` for odd rows.

### Signature Component: The "Circular Metric"
Inspired by the logo’s orb, use a heavy-stroke circular progress indicator for key poultry stats. Use the `primary` to `secondary` (#ff7168) color spectrum to indicate health or status levels.

---

## 6. Do’s and Don’ts

### Do:
*   **Overlap Elements:** Allow a `display` heading to partially overlap an organic brush-stroke background element for a custom, high-end feel.
*   **Use High Contrast:** Place `primary` yellow text directly on `surface` black for maximum energy.
*   **Embrace the Asymmetry:** Offset your card layouts. If the left side is data-heavy, let the right side breathe with wide margins and large-scale typography.

### Don’t:
*   **Don't use 1px solid borders:** This immediately kills the "premium" feel and makes the app look like a generic template.
*   **Don't use default greys:** Use the provided charcoal tones (`surface_container` variants) to maintain the "Dark Mode" sophistication.
*   **Don't crowd the brush-stroke textures:** Textures should be used as background accents (watermarks), not active UI containers. Keep the interactive zones clean and efficient.