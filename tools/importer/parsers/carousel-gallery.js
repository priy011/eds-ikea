/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-gallery. Base block: carousel.
 * Source: https://www.ikea.com/in/en/ (IKEA India homepage "Looks by you" inspiration gallery)
 * Generated: 2026-08-26
 *
 * Structure (from source.html): the gallery is an image-forward carousel with
 * repeated slide items (`.crec-carousel-slide` in the source; `.hri-carousel-slide`
 * for the shared carousel markup). Each slide is an image-only inspiration tile
 * (`.crec-image` / `img`), optionally with pill labels (e.g. a username and a
 * product count) that are decorative UI, not primary content.
 *
 * Output (carousel, 2 columns per slide): cell1 = image, cell2 = optional
 * pill label(s) (kept when present, otherwise empty).
 */
export default function parse(element, { document }) {
  let slides = Array.from(element.querySelectorAll('.crec-carousel-slide, .hri-carousel-slide'));
  if (!slides.length) slides = Array.from(element.querySelectorAll('[class*="carousel-slide"], [class*="carousel__content"] > div'));

  const cells = [];

  slides.forEach((slide) => {
    // Inspiration image (real, non data-uri).
    const image = Array.from(slide.querySelectorAll('img'))
      .find((img) => {
        const src = img.getAttribute('src') || '';
        return src && !src.startsWith('data:');
      });

    if (!image) return;

    // Optional pill labels (username, product count) — supporting text only.
    const pillTexts = [];
    const seen = new Set();
    slide.querySelectorAll('.crec-pill__label, [class*="pill__label"]').forEach((el) => {
      const t = el.textContent.replace(/\s+/g, ' ').trim();
      if (t && !seen.has(t)) { seen.add(t); pillTexts.push(t); }
    });

    let contentCell = '';
    if (pillTexts.length) {
      contentCell = pillTexts.map((t) => {
        const p = document.createElement('p');
        p.textContent = t;
        return p;
      });
    }

    cells.push([image, contentCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
