/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-teaser. Base block: carousel.
 * Source: https://www.ikea.com/in/en/ (IKEA India homepage teaser showcase carousels)
 * Generated: 2026-08-26
 *
 * Structure (from source.html): the carousel wrapper contains repeated
 * `.hri-carousel-slide` items. Each slide holds a `.hri-compact-card` with a
 * title (`.hri-compact-card__title`), an image (`.hri-aspect-ratio-box img`),
 * an optional commercial message add-on (`.hri-commercial-message`), and a
 * card link wrapping the content.
 *
 * Output (carousel, 2 columns per slide): cell1 = image, cell2 = title +
 * optional message + CTA link.
 */
export default function parse(element, { document }) {
  // Repeated slide items.
  let slides = Array.from(element.querySelectorAll('.hri-carousel-slide'));
  if (!slides.length) slides = Array.from(element.querySelectorAll('[class*="carousel-slide"], [class*="carousel__content"] > div'));

  const cells = [];

  slides.forEach((slide) => {
    // Real (non data-uri) product/teaser image.
    const image = Array.from(slide.querySelectorAll('img'))
      .find((img) => {
        const src = img.getAttribute('src') || '';
        return src && !src.startsWith('data:');
      });

    // Title / heading of the teaser.
    const titleEl = slide.querySelector(
      '.hri-compact-card__title, .hri-content-card__title, [class*="card__title"], [class*="title"], h1, h2, h3, h4',
    );
    const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';

    // Slide link.
    const anchor = slide.querySelector('a[href]:not([href^="#"])');
    const href = anchor ? anchor.getAttribute('href') : '';

    // Collect all distinct text lines from the slide (title, description,
    // commercial message, product-count label, etc.) so no supporting copy is
    // dropped. Only keep leaf-ish elements to avoid duplicating parent text.
    const textLines = [];
    const seen = new Set();
    const addLine = (t) => {
      const norm = (t || '').replace(/\s+/g, ' ').trim();
      if (!norm || seen.has(norm)) return;
      // Skip lines already contained within an accepted line.
      seen.add(norm);
      textLines.push(norm);
    };
    // Title first (so it leads the content cell).
    if (titleText) addLine(titleText);
    // Then other text-bearing leaf elements.
    slide.querySelectorAll('span, p, div, [class*="message"], [class*="label"], [class*="description"]').forEach((el) => {
      if (el.querySelector('span, p, div')) return; // leaf-ish only
      addLine(el.textContent);
    });

    if (!image && !textLines.length) return;

    const imageCell = image || '';

    const contentCell = [];
    textLines.forEach((line, idx) => {
      // First line (title) becomes the linked CTA when a slide link exists.
      if (idx === 0 && href) {
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

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-teaser', cells });
  element.replaceWith(block);
}
