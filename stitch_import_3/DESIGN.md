# Design System Specification: The Organic Ledger

## 1. Overview & Creative North Star
This design system is a high-end, editorial approach to SaaS, specifically tailored for the intersection of modern commerce and agricultural warmth. Moving away from the rigid, sterile grids of typical management software, our **Creative North Star** is **"The Organic Ledger."** 

We prioritize a tactile, premium experience that feels like a boutique editorial spread rather than a database. We achieve this by breaking the "template" look through intentional asymmetry, massive rounded corners (`xl` scale), and a "depth-over-lines" philosophy. The system feels professional enough for enterprise use but warm enough to feel human, using organic, egg-inspired shapes and fluid glassmorphism to create a sophisticated digital atmosphere.

---

## 2. Colors & Tonal Depth
The palette is rooted in Earth tones—warm oranges and soft stones—elevated by high-contrast functional accents.

### The "No-Line" Rule
To achieve a signature premium look, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through background color shifts. For example, a `surface_container_low` section should sit against a `surface` background to define its territory. This creates a softer, more modern aesthetic that reduces visual noise.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the Material surface-container tiers to define importance:
- **Surface (Background):** `#f9f9f8` – The base canvas.
- **Surface Container Lowest:** `#ffffff` – Reserved for the most important interactive cards (e.g., active orders).
- **Surface Container Low:** `#f3f4f3` – Standard layout grouping.
- **Surface Container Highest:** `#e2e2e2` – Subtle accents or navigation sidebars.

### The "Glass & Gradient" Rule
For login screens and floating overlays, utilize **Glassmorphism**. Use `surface_container_lowest` at 60% opacity with a `24px` backdrop-blur. 
- **Signature Textures:** Main CTAs should not be flat. Apply a subtle linear gradient from `primary` (#9d4300) to `primary_container` (#f97316) at a 135-degree angle to provide a "soulful" glow that flat hex codes cannot replicate.

---

## 3. Typography: Editorial Authority
We use a dual-font system to balance high-end brand identity with functional data density.

- **The Voice (Plus Jakarta Sans):** Used for `display` and `headline` scales. Its wide apertures and modern geometric forms provide the "Editorial" feel.
- **The Utility (Inter):** Used for `title`, `body`, and `label` scales. Inter provides the rhythmic precision required for management systems and complex tables.

**Scale Philosophy:**
- **Hero Headers (`display-lg`):** Use for dashboard welcomes or empty-state titles. 
- **Data Labels (`label-md`):** Use for technical poultry metrics, set in `on_surface_variant` (#584237) to ensure they feel grounded and professional.

---

## 4. Elevation & Depth
Elevation is achieved through **Tonal Layering** rather than traditional structural lines.

- **The Layering Principle:** Depth is "stacked." Place a `surface_container_lowest` card on a `surface_container_low` section to create a soft, natural lift.
- **Ambient Shadows:** When a floating effect is required (e.g., a "New Sale" modal), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(140, 113, 100, 0.08)`. The shadow color must be a tinted version of `outline`, never a generic black or gray.
- **The "Ghost Border":** If a border is required for accessibility, use the `outline_variant` token at **15% opacity**. This creates a "suggestion" of a container without breaking the organic flow.

---

## 5. Components

### Cards & Containers
- **Corner Radius:** All primary cards must use `xl` (3rem/48px) for a soft, egg-inspired aesthetic. Secondary elements use `md` (1.5rem/24px).
- **Styling:** No borders. Use `surface_container_lowest` for the card body against a `surface` background.

### Buttons
- **Primary:** Gradient-filled (Primary to Primary-Container), `full` (pill) or `xl` radius.
- **Secondary:** `surface_container_high` background with `on_surface` text. No border.
- **Tertiary/Ghost:** No background. Use `primary` text and a subtle chicken line-art icon.

### Modern Tables
- **Layout:** Tables must use horizontal scroll on mobile with a sticky first column.
- **Separation:** Forbid the use of vertical or horizontal divider lines. Use alternating row colors (`surface` and `surface_container_low`) or 16px vertical spacing between "row-cards."
- **Headers:** Set in `label-md` using `secondary` color, all-caps with 0.05em letter spacing.

### Thematic Elements
- **Dividers:** Instead of lines, use "feather-like" separators—subtle, repeating organic paths using the `outline_variant` color at 20% opacity.
- **Decor:** Use organic, egg-shaped masks for profile pictures or status indicators to reinforce the brand's friendly nature.

---

## 6. Do's and Don'ts

### Do:
- **Do** embrace white space. Treat a management system like a luxury magazine layout.
- **Do** use `primary_container` (#f97316) for primary actions to keep the interface warm and inviting.
- **Do** use `tertiary` (#006398) for analytical data or "Cold" metrics (e.g., refrigeration temps).

### Don't:
- **Don't** use 100% opaque, high-contrast borders. It shatters the "Organic" feel.
- **Don't** use standard "drop shadows" with high opacity. They look dated and heavy.
- **Don't** cram data. If a table has 12 columns, use a "Detail View" pattern or a horizontal scroll to maintain the `xl` card padding.
- **Don't** use sharp corners (0px-8px). The system must feel "soft" and "friendly" to the touch.

---

## 7. Interaction Patterns
- **Hover States:** Elements should subtly scale (1.02x) and transition their background from `surface_container_low` to `surface_container_highest`. 
- **Loading States:** Use a custom "Pulse" animation on an organic egg shape instead of a generic circular spinner.
- **Empty States:** Utilize minimal chicken line-art icons centered with `headline-sm` text to guide the user warmly through the setup.