/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-inspiration. Base block: cards.
 * Source: https://www.ikea.com/in/en/ (IKEA India homepage "Design inspiration" image gallery)
 * Generated: 2026-08-26
 *
 * Structure (from source.html): a static gallery/masonry of image-only
 * inspiration tiles. Each tile is a shoppable image (`.crec-image` / `img`)
 * wrapped in a category link (`.crec-shoppable-image__category-link`) inside a
 * grid item. Tiles have no titles or descriptions — they are image-forward.
 *
 * Output (cards, 2 columns per card): cell1 = inspiration image, cell2 = empty
 * (image-only tiles).
 */
export default function parse(element, { document }) {
  const cells = [];
  const seenSrc = new Set();

  // Each real (non data-uri) inspiration image is one tile. Deduplicate by src
  // since a tile may carry duplicate/alt image sources.
  Array.from(element.querySelectorAll('img')).forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) return;
    if (seenSrc.has(src)) return;
    seenSrc.add(src);
    cells.push([img, '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-inspiration', cells });
  element.replaceWith(block);
}
