import { createOptimizedPicture } from '../../scripts/aem.js';
import galleryData, { categories } from './cards-inspiration-data.js';

/*
 * When the block has no authored image rows (the "Design inspiration" feed is
 * lazy-loaded on the source and can't be captured by the importer), build the
 * rows from the embedded harvested data so the gallery still renders. Each row
 * carries its category on a data attribute so the filter tabs can show/hide it.
 */
function seedFromData(block) {
  const hasImage = block.querySelector('picture, img');
  if (hasImage) return;
  block.textContent = '';
  galleryData.forEach((item) => {
    const row = document.createElement('div');
    if (item.category) row.dataset.category = item.category;
    const cell = document.createElement('div');
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt || '';
    img.loading = 'lazy';
    cell.append(img);
    row.append(cell);
    block.append(row);
  });
}

/*
 * Builds the filter tab row shown above the grid (matches the live site's
 * All / Bedroom / Living room / ... tablist) and wires up client-side filtering.
 */
function buildFilters(block, ul) {
  if (!categories || !categories.length) return;
  const nav = document.createElement('div');
  nav.className = 'cards-inspiration-filters';
  nav.setAttribute('role', 'tablist');

  const items = [...ul.children];
  // Only show tabs that actually have tiles behind them ("All" always shown), so
  // selecting a category never lands on an empty grid.
  const present = new Set(items.map((li) => li.dataset.category).filter(Boolean));
  const shown = categories.filter((c) => c === 'All' || present.has(c));

  const applyFilter = (category) => {
    items.forEach((li) => {
      const match = category === 'All' || li.dataset.category === category;
      li.hidden = !match;
    });
  };

  shown.forEach((category, idx) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'cards-inspiration-filter';
    tab.textContent = category;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    tab.addEventListener('click', () => {
      nav.querySelectorAll('.cards-inspiration-filter').forEach((b) => b.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      applyFilter(category);
    });
    nav.append(tab);
  });

  block.prepend(nav);
}

export default function decorate(block) {
  seedFromData(block);

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    if (row.dataset.category) li.dataset.category = row.dataset.category;
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture, img')) div.className = 'cards-inspiration-card-image';
      else div.className = 'cards-inspiration-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => {
    const pic = img.closest('picture');
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    if (pic) pic.replaceWith(optimized);
    else img.replaceWith(optimized);
  });
  block.replaceChildren(ul);
  buildFilters(block, ul);
}
