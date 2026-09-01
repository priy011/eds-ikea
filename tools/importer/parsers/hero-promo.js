/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-promo. Base block: hero.
 * Source: https://www.ikea.com/in/en/ (IKEA India homepage primary storage-offer banner)
 * Generated: 2026-08-26
 *
 * Structure (from source.html): the primary promotional banner is a text-overlay
 * card / teaser containing a background asset (image or video poster), an overlaid
 * heading/title, optional supporting text, and a single call-to-action link.
 *
 * Output (hero, 1 column x rows):
 *   - Row (optional): background image.
 *   - Row: title (heading) + optional subheading + CTA link.
 */
export default function parse(element, { document }) {
  // Background image: prefer a real (non data-uri) image or the video poster.
  const bgImage = Array.from(element.querySelectorAll('img'))
    .find((img) => {
      const src = img.getAttribute('src') || '';
      return src && !src.startsWith('data:');
    })
    || element.querySelector('picture img, video[poster]');

  // Title / headline text.
  const titleEl = element.querySelector(
    '.hri-text-overlay-card__title, .hri-teaser__title, h1, h2, h3, [class*="title"]',
  );

  // Supporting/subheading text (a paragraph that is not the title).
  const subheadingEl = Array.from(element.querySelectorAll('p, .hri-teaser__body, [class*="subtitle"], [class*="description"]'))
    .find((p) => {
      const t = p.textContent.replace(/\s+/g, ' ').trim();
      return t && (!titleEl || t !== titleEl.textContent.replace(/\s+/g, ' ').trim());
    });

  // Primary call-to-action link.
  const ctaAnchor = element.querySelector('a[href]:not([href^="#"])');

  // Empty-block guard.
  if (!titleEl && !ctaAnchor && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: background image (optional).
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row: content cell holding heading, subheading, and CTA.
  const contentCell = [];

  const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
  const ctaText = ctaAnchor ? ctaAnchor.textContent.replace(/\s+/g, ' ').trim() : '';

  // Normalize the headline to a proper heading element. Skip when the only
  // "title" is really just the CTA label (avoids a redundant heading == CTA).
  if (titleText && titleText.toLowerCase() !== ctaText.toLowerCase()) {
    const heading = document.createElement('h2');
    heading.textContent = titleText;
    contentCell.push(heading);
  }

  if (subheadingEl) {
    const p = document.createElement('p');
    p.textContent = subheadingEl.textContent.replace(/\s+/g, ' ').trim();
    contentCell.push(p);
  }

  if (ctaAnchor) {
    const link = document.createElement('a');
    link.setAttribute('href', ctaAnchor.getAttribute('href'));
    link.textContent = ctaText || 'Shop now';
    contentCell.push(link);
  }

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
