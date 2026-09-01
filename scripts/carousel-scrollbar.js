/*
 * Replaces a carousel's dot indicators with a horizontal scroll-progress bar,
 * matching the live IKEA India carousels: a 2px grey track with a dark thumb
 * whose width reflects the visible fraction of the row and whose position tracks
 * the scroll offset. Shared by every carousel-* block (imported from /scripts/).
 *
 * @param {Element} block   the carousel block element
 * @param {string}  prefix  the block's class prefix, e.g. 'carousel-product'
 */
export default function enhanceCarouselScrollbar(block, prefix) {
  const scroller = block.querySelector(`.${prefix}-slides`);
  if (!scroller) return;

  const track = document.createElement('div');
  track.className = 'carousel-scrollbar';
  const thumb = document.createElement('div');
  thumb.className = 'carousel-scrollbar-thumb';
  track.append(thumb);

  // Replace the dot-indicator nav if present; otherwise append the bar.
  const indicators = block.querySelector(`.${prefix}-slide-indicators`);
  const indicatorNav = indicators ? (indicators.closest('nav') || indicators) : null;
  if (indicatorNav && indicatorNav.parentElement) {
    indicatorNav.replaceWith(track);
  } else {
    block.append(track);
  }

  const update = () => {
    const { scrollWidth, clientWidth, scrollLeft } = scroller;
    const max = scrollWidth - clientWidth;
    if (max <= 1) {
      track.style.display = 'none';
      return;
    }
    track.style.display = '';
    const thumbWidth = Math.max((clientWidth / scrollWidth) * 100, 8);
    thumb.style.width = `${thumbWidth}%`;
    thumb.style.left = `${(scrollLeft / max) * (100 - thumbWidth)}%`;
  };

  scroller.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  // Recompute when the scroller's content size changes (lazy images/videos load
  // after decoration and grow scrollWidth, so an initial run alone misses it).
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(update);
    ro.observe(scroller);
    [...scroller.children].forEach((child) => ro.observe(child));
  }
  scroller.querySelectorAll('img, video').forEach((media) => {
    media.addEventListener('load', update);
    media.addEventListener('loadeddata', update);
  });

  update();
  window.requestAnimationFrame(update);
}
