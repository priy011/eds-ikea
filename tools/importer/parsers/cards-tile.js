/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-tile. Base block: cards.
 * Source: https://www.ikea.com/in/en/ (IKEA India homepage offer/category image tiles)
 * Generated: 2026-08-26
 *
 * Structure (from source.html): a set of image tiles. Each tile is a
 * `.hri-text-overlay-card` (or `.hri-bento-box-card`) with a background image
 * (or video poster) and an overlaid caption/title inside
 * `.hri-text-overlay-card__title`, the whole tile wrapped in a category link.
 *
 * Output (cards, 2 columns per card): cell1 = image, cell2 = linked title/caption.
 */
export default function parse(element, { document }) {
  // Each card/tile. Prefer the text-overlay card; fall back to bento cards.
  let tiles = Array.from(element.querySelectorAll('.hri-text-overlay-card'));
  if (!tiles.length) tiles = Array.from(element.querySelectorAll('.hri-bento-box-card'));
  if (!tiles.length) tiles = Array.from(element.querySelectorAll('[class*="overlay-card"], [class*="bento-box-card"]'));

  const cells = [];

  tiles.forEach((tile) => {
    // Real (non data-uri) image or video poster.
    const image = Array.from(tile.querySelectorAll('img'))
      .find((img) => {
        const src = img.getAttribute('src') || '';
        return src && !src.startsWith('data:');
      })
      || tile.querySelector('video[poster]');

    // Caption/title text.
    const titleEl = tile.querySelector(
      '.hri-text-overlay-card__title, [class*="overlay-card__title"], [class*="title"], h1, h2, h3, h4',
    );
    const captionText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';

    // Card link.
    const anchor = tile.querySelector('a[href]:not([href^="#"])');
    const href = anchor ? anchor.getAttribute('href') : '';

    if (!image && !captionText) return;

    const imageCell = image || '';

    // Content cell: linked caption when a link exists, else plain caption.
    let contentCell = '';
    if (captionText && href) {
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = captionText;
      contentCell = link;
    } else if (captionText) {
      const p = document.createElement('p');
      p.textContent = captionText;
      contentCell = p;
    }

    cells.push([imageCell, contentCell]);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tile', cells });
  element.replaceWith(block);
}
