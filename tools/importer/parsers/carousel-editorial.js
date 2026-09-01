/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-editorial. Base block: carousel.
 * Source: https://www.ikea.com/in/en/ (IKEA India homepage "Explore more offers" editorial shelf)
 * Generated: 2026-08-26
 *
 * Structure (from source.html): the editorial shelf carousel contains repeated
 * `.hri-carousel-slide` items. Each slide holds a `.hri-content-card` with a
 * heading (`.hri-content-card__title`, an h2/h3) wrapped in a card link
 * (`.hri-content-card__headers`), an optional label, and a trailing media image
 * (`.hri-card__media img`).
 *
 * Output (carousel, 2 columns per slide): cell1 = image, cell2 = heading +
 * optional label/copy as a CTA link.
 */
export default function parse(element, { document }) {
  let slides = Array.from(element.querySelectorAll('.hri-carousel-slide'));
  if (!slides.length) slides = Array.from(element.querySelectorAll('[class*="carousel-slide"], [class*="carousel__content"] > div'));

  const cells = [];

  slides.forEach((slide) => {
    // Trailing media image (real, non data-uri).
    const image = Array.from(slide.querySelectorAll('img'))
      .find((img) => {
        const src = img.getAttribute('src') || '';
        return src && !src.startsWith('data:');
      });

    // Heading / title.
    const titleEl = slide.querySelector(
      '.hri-content-card__title, [class*="content-card__title"], [class*="card__title"], h1, h2, h3, h4',
    );
    const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';

    // Card link.
    const anchor = slide.querySelector('a[href]:not([href^="#"])');
    const href = anchor ? anchor.getAttribute('href') : '';

    // Collect all distinct text lines (label, title, subtitle/body copy) from
    // the content card so supporting copy is not dropped. Exclude button/media
    // areas which carry no importable text.
    const contentArea = slide.querySelector('.hri-content-card__container, .hri-content-card, [class*="content-card"]') || slide;
    const textLines = [];
    const seen = new Set();
    const addLine = (t) => {
      const norm = (t || '').replace(/\s+/g, ' ').trim();
      if (!norm || seen.has(norm)) return;
      seen.add(norm);
      textLines.push(norm);
    };
    if (titleText) addLine(titleText);
    contentArea.querySelectorAll('span, p, h1, h2, h3, h4, [class*="label"], [class*="subtitle"], [class*="body"], [class*="description"]').forEach((el) => {
      if (el.closest('button')) return; // skip button labels
      if (el.querySelector('span, p, h1, h2, h3, h4')) return; // leaf-ish only
      addLine(el.textContent);
    });

    if (!image && !textLines.length) return;

    const imageCell = image || '';

    const contentCell = [];
    textLines.forEach((line) => {
      // Link the title line when a card link exists; other lines are paragraphs.
      if (line === titleText && href) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.textContent = line;
        contentCell.push(link);
      } else {
        const p = document.createElement('p');
        p.textContent = line;
        contentCell.push(p);
      }
    });

    cells.push([imageCell, contentCell.length ? contentCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-editorial', cells });
  element.replaceWith(block);
}
