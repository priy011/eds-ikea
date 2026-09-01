/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-nav. Base block: carousel.
 * Source: https://www.ikea.com/in/en/ (IKEA India homepage in-page category nav)
 * Generated: 2026-08-26
 *
 * Structure (from source.html): the element contains a set of category shortcut
 * anchors `.hnf-inpage-nav__card`. Each card is a link with a small image
 * (`.hnf-inpage-nav__imagebox img` for categories, `.hnf-inpage-nav__icon img`
 * for the "Offers" entry point) and a text label (`.hnf-inpage-nav__label`).
 *
 * Output (carousel, 2 columns per slide): cell1 = image, cell2 = linked label.
 *
 * NOTE: The source section also contains a large embedded JSON data island
 * (serialized category hierarchy used to render the nav). That JSON is not
 * importable content, so automated text-similarity scoring for this instance
 * is artificially low; the parser intentionally captures only the real,
 * visible content (promo link + category tiles).
 */
export default function parse(element, { document }) {
  // Category nav container that holds the shortcut tiles.
  const nav = element.querySelector('.hnf-inpage-nav');

  // Each category shortcut tile is a single anchor card.
  let cards = Array.from(element.querySelectorAll('.hnf-inpage-nav__card'));
  // Fallback: anchors that look like nav cards.
  if (!cards.length) {
    cards = Array.from(element.querySelectorAll('a[class*="inpage-nav__card"], a[class*="nav__card"]'));
  }

  const cells = [];

  // Leading promotional link(s) that sit outside the category nav (e.g.
  // "Storage offer: up to 40% off..."). Capture them as text-only slides.
  const promoLinks = Array.from(element.querySelectorAll('a[href]')).filter((a) => {
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#')) return false;
    // Only links that are NOT part of the category nav card list.
    return !nav || !nav.contains(a);
  });
  promoLinks.forEach((a) => {
    const text = a.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const link = document.createElement('a');
    link.setAttribute('href', a.getAttribute('href'));
    link.textContent = text;
    cells.push(['', link]);
  });

  cards.forEach((card) => {
    const href = card.getAttribute('href');
    // Skip the visually-hidden "skip" control and empty anchors.
    if (!href || href.startsWith('#')) return;

    // Image: category thumbnail or offers icon.
    const img = card.querySelector('.hnf-inpage-nav__imagebox img, .hnf-inpage-nav__icon img, img');

    // Label text for the slide.
    const labelEl = card.querySelector('.hnf-inpage-nav__label, [class*="label"]');
    const labelText = (labelEl ? labelEl.textContent : card.textContent).replace(/\s+/g, ' ').trim();
    if (!img && !labelText) return;

    // Build the linked label for the content cell.
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.textContent = labelText;

    const imageCell = img || '';
    const contentCell = link;

    cells.push([imageCell, contentCell]);
  });

  // Empty-block guard: bail if no real content was captured.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-nav', cells });
  element.replaceWith(block);
}
