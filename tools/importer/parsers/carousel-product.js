/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-product. Base block: carousel.
 * Source: https://www.ikea.com/in/en/ (IKEA India homepage "Today's best deals" product listing)
 * Generated: 2026-08-26
 *
 * Structure (from source.html): the listing carousel contains repeated
 * `.listing-carousel-slide` items. Each slide is a product master card with a
 * product image, a name link (`.listing-price-module__product-name` inside
 * `.listing-product__product-link`), a product-type description, price
 * information (`.listing-price-module`), an offer message and a rating.
 *
 * Output (carousel, 2 columns per slide): cell1 = product image, cell2 = product
 * name (CTA link) + all remaining copy as paragraphs. To let the block CSS style
 * the price group (big bold current price, struck-through original, coloured
 * discount), price/offer/rating lines are tagged with `cp-*` classes based on
 * their source ancestor. All leaf text is captured (dedup like the original) so
 * content completeness is preserved.
 */
export default function parse(element, { document }) {
  let slides = Array.from(element.querySelectorAll('.listing-carousel-slide'));
  if (!slides.length) slides = Array.from(element.querySelectorAll('[class*="carousel-slide"], [class*="shelf-item"]'));

  const cells = [];

  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  // Classify a leaf element by its source ancestor so the block CSS can style
  // the price group. Returns a class name or '' (no special styling).
  const classify = (el) => {
    if (el.closest('.listing-price-module__current-price, [class*="current-price"]')) return 'cp-price';
    if (el.closest('.listing-price--subtle')) return 'cp-was';
    if (el.closest('.listing-price-module__offer-message, [class*="offer-message"]')) return 'cp-offer';
    if (el.closest('.listing-rating, [class*="rating"]')) return 'cp-rating';
    if (el.closest('.listing-price-module__description, [class*="__description"]')) return 'cp-desc';
    return '';
  };

  slides.forEach((slide) => {
    // Primary product image (first real, non data-uri image).
    const image = Array.from(slide.querySelectorAll('img'))
      .find((img) => {
        const src = img.getAttribute('src') || '';
        return src && !src.startsWith('data:');
      });

    // Product name and its link.
    const nameEl = slide.querySelector('.listing-price-module__product-name, [class*="product-name"]');
    const nameText = nameEl ? clean(nameEl.textContent) : '';
    const nameLink = slide.querySelector('.listing-price-module__product-link, .listing-product__product-link, .listing-product__image-link, a[href]:not([href^="#"])');
    const href = nameLink ? nameLink.getAttribute('href') : '';

    const contentCell = [];
    const seen = new Set();
    // dedup like the original parser: skip empties, exact repeats, and lines
    // already contained in a previously captured line (or vice-versa).
    const isDup = (norm) => {
      if (!norm || seen.has(norm)) return true;
      for (const prev of seen) {
        if (prev.includes(norm)) return true;
      }
      return false;
    };

    // Name first (as a CTA link when we have an href).
    if (nameText && !isDup(nameText)) {
      seen.add(nameText);
      if (href) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.textContent = nameText;
        contentCell.push(link);
      } else {
        const p = document.createElement('p');
        p.textContent = nameText;
        contentCell.push(p);
      }
    }

    // Sweep leaf-level text (description, price, offer, rating, promo copy),
    // tagging each with a cp-* class based on its source ancestor.
    slide.querySelectorAll('span, p, h1, h2, h3, h4').forEach((el) => {
      // Skip action-button labels (add-to-cart / wishlist) — keep rating text.
      if (el.closest('button') && !el.closest('.listing-rating, [class*="rating"]')) return;
      if (el.querySelector('span, p, h1, h2, h3, h4')) return; // leaf-ish only
      const norm = clean(el.textContent);
      if (isDup(norm)) return;
      seen.add(norm);
      const p = document.createElement('p');
      const cls = classify(el);
      if (cls) p.className = cls;
      p.textContent = norm;
      contentCell.push(p);
    });

    // Rating fallback: full review label if not already captured.
    const ratingEl = slide.querySelector('.listing-rating, [class*="rating"]');
    if (ratingEl) {
      const norm = clean(ratingEl.textContent);
      if (!isDup(norm)) {
        seen.add(norm);
        const p = document.createElement('p');
        p.className = 'cp-rating';
        p.textContent = norm;
        contentCell.push(p);
      }
    }

    if (!image && !contentCell.length) return;
    cells.push([image || '', contentCell.length ? contentCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-product', cells });
  element.replaceWith(block);
}
