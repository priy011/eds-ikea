import bundlesData from './bundles-data.js';

/**
 * "Handpicked bundles for your home" block.
 *
 * Renders a horizontally-scrollable row of bundle cards. Each card shows a 2x2
 * grid of the bundle's 4 product images and swaps to a lifestyle image on hover.
 * Clicking a card opens a popup listing the bundle's products (image, name,
 * price, link to the product page), a total, and an "Add all" action.
 *
 * The bundle/product data is client-rendered and click-gated on the source site,
 * so it cannot be captured by the content-import pipeline; it is embedded in
 * ./bundles-data.js and this block renders from it.
 */

function buildPicture(src, alt, eager) {
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || '';
  img.loading = eager ? 'eager' : 'lazy';
  picture.append(img);
  return picture;
}

function closeModal(modal) {
  modal.classList.remove('bundles-modal-open');
  document.body.classList.remove('bundles-modal-lock');
  // return focus handled by caller
  setTimeout(() => modal.remove(), 200);
}

function openModal(bundle) {
  const modal = document.createElement('div');
  modal.className = 'bundles-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', bundle.title);

  const backdrop = document.createElement('div');
  backdrop.className = 'bundles-modal-backdrop';

  const panel = document.createElement('div');
  panel.className = 'bundles-modal-panel';

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'bundles-modal-close';
  close.setAttribute('aria-label', 'Close');
  close.innerHTML = '&times;';

  const header = document.createElement('div');
  header.className = 'bundles-modal-header';
  const h = document.createElement('h2');
  h.className = 'bundles-modal-title';
  h.textContent = bundle.title;
  header.append(h);
  if (bundle.description) {
    const p = document.createElement('p');
    p.className = 'bundles-modal-desc';
    p.textContent = bundle.description;
    header.append(p);
  }

  const list = document.createElement('ul');
  list.className = 'bundles-modal-products';
  bundle.products.forEach((prod) => {
    const li = document.createElement('li');
    li.className = 'bundles-modal-product';

    const media = document.createElement('a');
    media.className = 'bundles-modal-product-media';
    media.href = prod.href;
    media.target = '_blank';
    media.rel = 'noopener';
    media.append(buildPicture(prod.image, prod.alt, false));

    const info = document.createElement('div');
    info.className = 'bundles-modal-product-info';
    const nameLink = document.createElement('a');
    nameLink.className = 'bundles-modal-product-name';
    nameLink.href = prod.href;
    nameLink.target = '_blank';
    nameLink.rel = 'noopener';
    nameLink.textContent = prod.name;
    const price = document.createElement('span');
    price.className = 'bundles-modal-product-price';
    price.textContent = prod.price || '';
    info.append(nameLink, price);

    li.append(media, info);
    list.append(li);
  });

  const footer = document.createElement('div');
  footer.className = 'bundles-modal-footer';
  const totalWrap = document.createElement('div');
  totalWrap.className = 'bundles-modal-total';
  totalWrap.innerHTML = `<span>Total price</span><strong>${bundle.total || ''}</strong>`;
  const addAll = document.createElement('a');
  addAll.className = 'bundles-modal-add-all button primary';
  addAll.href = bundle.products[0] ? bundle.products[0].href : '#';
  addAll.target = '_blank';
  addAll.rel = 'noopener';
  addAll.textContent = 'Add all to shopping bag';
  footer.append(totalWrap, addAll);

  panel.append(close, header, list, footer);
  modal.append(backdrop, panel);
  document.body.append(modal);
  document.body.classList.add('bundles-modal-lock');
  requestAnimationFrame(() => modal.classList.add('bundles-modal-open'));

  const dismiss = () => closeModal(modal);
  close.addEventListener('click', dismiss);
  backdrop.addEventListener('click', dismiss);
  modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') dismiss(); });
  close.focus();
}

function buildCard(bundle) {
  const card = document.createElement('div');
  card.className = 'bundles-card';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'bundles-card-trigger';
  trigger.setAttribute('aria-label', `${bundle.title} — view ${bundle.products.length} products`);

  const media = document.createElement('div');
  media.className = 'bundles-card-media';

  // 2x2 product image grid
  const grid = document.createElement('div');
  grid.className = 'bundles-card-grid';
  bundle.products.slice(0, 4).forEach((prod) => {
    const cell = document.createElement('div');
    cell.className = 'bundles-card-cell';
    cell.append(buildPicture(prod.image, prod.alt, false));
    grid.append(cell);
  });

  // lifestyle hover image
  const hover = document.createElement('div');
  hover.className = 'bundles-card-hover';
  if (bundle.lifestyle) {
    hover.append(buildPicture(bundle.lifestyle.src, bundle.lifestyle.alt, false));
  }

  media.append(grid, hover);

  const body = document.createElement('div');
  body.className = 'bundles-card-body';
  const title = document.createElement('p');
  title.className = 'bundles-card-title';
  title.textContent = bundle.title;
  const count = document.createElement('p');
  count.className = 'bundles-card-count';
  count.textContent = `${bundle.products.length} products`;
  body.append(title, count);

  trigger.append(media, body);
  trigger.addEventListener('click', () => openModal(bundle));
  card.append(trigger);
  return card;
}

export default function decorate(block) {
  block.textContent = '';
  const track = document.createElement('div');
  track.className = 'bundles-track';
  bundlesData.forEach((bundle) => track.append(buildCard(bundle)));
  block.append(track);
}
