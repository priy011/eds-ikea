import enhanceCarouselScrollbar from '../../scripts/carousel-scrollbar.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-product');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-product-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-product-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-product-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-product-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-product-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-product-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

/**
 * Classify the flat list of content paragraphs produced by the parser into
 * price groups so the CSS can style them (big current price, struck-through
 * original, coloured discount, muted rating/meta). The importer's markdown
 * round-trip strips paragraph classes, so classification happens here by text
 * pattern. Runs once per slide during decoration.
 * @param {Element} content The .carousel-product-slide-content column
 */
function classifyProductContent(content) {
  const paras = [...content.querySelectorAll(':scope > p')];
  let currentPriceTagged = false;
  paras.forEach((p) => {
    const t = p.textContent.trim();
    if (p.querySelector('a')) return; // product name / CTA link — leave as-is
    if (/^(Rs\.|₹)\s*[\d,]/i.test(t)) {
      // A "Rs. 7990" style clean price line. First one = current price.
      if (!currentPriceTagged) {
        p.classList.add('cp-price');
        currentPriceTagged = true;
      } else {
        p.classList.add('cp-was'); // subsequent full-price line = original
      }
    } else if (/^Regular price/i.test(t)) {
      p.classList.add('cp-was');
    } else if (/%\s*off|save\s*Rs|save\s*₹/i.test(t)) {
      p.classList.add('cp-offer');
    } else if (/^Review:|reviews?:|^\(\d+\)$|out of \d+ stars/i.test(t)) {
      p.classList.add('cp-rating');
    } else if (/^Price valid|Top seller|Soft-closing|^Option:|Every saving/i.test(t)) {
      p.classList.add('cp-extra');
    } else if (/^(Rs\.|₹)$/i.test(t) || /^\d[\d,]*$/.test(t)) {
      // stray currency token ("Rs.") or bare number fragment ("7,990") emitted
      // alongside the clean "Rs. 7990" price — hide to avoid duplicate noise.
      p.classList.add('cp-fragment');
    } else {
      p.classList.add('cp-desc');
    }
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-product-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-product-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-product-slide-${colIdx === 0 ? 'image' : 'content'}`);
    if (colIdx !== 0) classifyProductContent(column);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-product-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = {};

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-product-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-product-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-product-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-product-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-product-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
    enhanceCarouselScrollbar(block, 'carousel-product');
  }
}
