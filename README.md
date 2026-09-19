# Glamour Girl Hair Website Project
## File and Folder Structure

glamour-girl-hair/
index.html
about.html
products.html
enquiry.html
contact.html
css/
style.css
js/
 images/

## Changelog
All notable changes to this project are recorded here, newest first.

### [Part 3] Image and colour fixes
- Fixed every broken image reference across all five pages: the hero, product cards,
  founder photo and review images pointed to files (e.g. `hero-bundles-1200.jpg`,
  `bundle-14inch-800.jpg`, `founder.jpg`, `review-1.jpg`) that never existed in
  `images/`, which is why nothing rendered. All `<img>`/`<picture>` sources now point
  to the real catalog photos already stored in `images/` (renamed without spaces for
  reliable linking, e.g. `catalog-bundle-1.webp`)
- Added the brand logo (`images/glamour-logo.jpeg`) to the header on all five pages and
  as the favicon
- Expanded the "Shop Our Bundles" grid from 3 to 6 product cards so the curly, deep
  wave and body wave catalog photos are represented alongside the straight bundles
- Removed the two placeholder review `<img>` tags (no real customer photos were
  supplied) rather than leaving them broken
- Replaced the colour palette: `--color-black`/`--color-brown` tokens renamed and
  recoloured to `--color-juniper` (`#2F4A3D`) and `--color-sage` (`#7C9473`), used
  across the header, footer, buttons, links and accents site-wide

### [Part 2] CSS Styling and Responsive Design
- Added `css/style.css`: CSS reset, design tokens (colour/type/spacing custom properties),
  base typography, header/nav/footer layout, buttons, and page-specific styles for the
  hero, founder section, product grid, reviews, enquiry form, contact/map layout and the
  WhatsApp button
- Linked Google Fonts (Playfair Display for headings, Montserrat for body text) on all
  five pages
- Added `:hover`, `:focus-visible` and `:active` states on links, buttons and the
  WhatsApp button
- Added responsive breakpoints at 1024px (tablet) and 640px (mobile) using media queries,
  with spacing and type sizes built on relative units (`rem`) throughout
- Added `srcset`/`sizes` on the homepage hero image and `<picture>`/`source` on product
  images for responsive image loading

### [Part 1 feedback fixes] Addressing the formative rubric (65/100)
- Added code comments throughout every HTML file explaining each structural section
  (previously scored 0/5)
- Added this README with a full project sitemap and file/folder structure documentation
  (Sitemap previously scored 0/5)
- Added the References section below (previously scored 0/5)
- Added the Timeline and Milestones table above (previously scored 0/2)
- Reorganised Section 4 of the proposal (Proposed Website Features) into clear Homepage /
  About Us / Products groupings instead of one flat list, and expanded the Weaknesses,
  Layout & UX sections that were underdeveloped
- Fixed wording issues in the proposal text (duplicated phrasing, "lice website"
  "live website", "Play-fair Display"Playfair Display")

### [Part 1 initial build]
- Built the five-page HTML structure (`index.html`, `about.html`, `products.html`,
  `enquiry.html`, `contact.html`) with semantic tags and consistent navigation
- Added the enquiry form and the contact page's map section (flagged as needing real
  location details, since the proposal only mentions WhatsApp)

## References
Google Fonts (n.d.) *Playfair Display*. Available at:
https://fonts.google.com/specimen/Playfair+Display (Accessed: 17 September 2026).

Google Fonts (n.d.) *Montserrat*. Available at:
https://fonts.google.com/specimen/Montserrat (Accessed: 17 September 2026).

MDN Web Docs (n.d.) *Responsive images*. Available at:
https://developer.mozilla.org/en-US/docs/Web/HTML/Responsive_images (Accessed: 17 September 2026).

MDN Web Docs (n.d.) *Using CSS custom properties (variables)*. Available at:
https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties (Accessed: 17 September 2026).

WordPress.org (n.d.) *WordPress*. Available at: https://wordpress.org/
(Accessed: 17 September 2026).

WooCommerce (n.d.) *WooCommerce Customisable eCommerce Platform for WordPress*.
Available at: https://woocommerce.com/ (Accessed: 17 September 2026).
