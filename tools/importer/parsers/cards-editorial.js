/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-editorial. Base block: cards.
 * Source: https://www.ikea.com/in/en/ (IKEA India homepage editorial mosaic of large image teasers)
 * Generated: 2026-08-26
 *
 * Structure (from source.html): an editorial mosaic of large image teasers.
 * Each teaser is a `.hri-bento-box-card` containing a `.hri-content-card` with
 * an optional label (`.hri-content-card__label`, e.g. "New"), a heading
 * (`.hri-content-card__title`) wrapped in a link (`.hri-content-card__headers`),
 * and a full-bleed image.
 *
 * Output (cards, 2 columns per card): cell1 = image, cell2 = optional label +
 * heading as a CTA link.
 */
export default function parse(element, { document }) {
  // Each mosaic teaser.
  let tiles = Array.from(element.querySelectorAll('.hri-bento-box-card'));
  if (!tiles.length) tiles = Array.from(element.querySelectorAll('.hri-text-overlay-card, [class*="bento-box-card"], [class*="overlay-card"]'));

  const cells = [];

  tiles.forEach((tile) => {
    // Full-bleed teaser image (real, non data-uri).
    const image = Array.from(tile.querySelectorAll('img'))
      .find((img) => {
        const src = img.getAttribute('src') || '';
        return src && !src.startsWith('data:');
      })
      || tile.querySelector('video[poster]');

    // Heading / title.
    const titleEl = tile.querySelector(
      '.hri-content-card__title, .hri-text-overlay-card__title, [class*="card__title"], [class*="title"], h1, h2, h3, h4',
    );
    const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';

    // Optional label (e.g. "New").
    const labelEl = tile.querySelector('.hri-content-card__label, [class*="card__label"]');
    const labelText = labelEl ? labelEl.textContent.replace(/\s+/g, ' ').trim() : '';

    // Teaser link.
    const anchor = tile.querySelector('a[href]:not([href^="#"])');
    const href = anchor ? anchor.getAttribute('href') : '';

    if (!image && !titleText) return;

    const imageCell = image || '';

    const contentCell = [];
    if (labelText && labelText !== titleText) {
      const p = document.createElement('p');
      p.textContent = labelText;
      contentCell.push(p);
    }
    if (titleText && href) {
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = titleText;
      contentCell.push(link);
    } else if (titleText) {
      const p = document.createElement('p');
      p.textContent = titleText;
      contentCell.push(p);
    }

    cells.push([imageCell, contentCell.length ? contentCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-editorial', cells });
  element.replaceWith(block);
}
