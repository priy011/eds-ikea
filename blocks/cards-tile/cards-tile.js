import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * The live "Small storage & organisers" bento renders its large left tile as a
 * looping background video (not a static image). The video is client-rendered on
 * the source, so it can't be captured during import; its URL + poster are
 * embedded here and injected into an image-less first tile at render time.
 */
const HERO_VIDEO = {
  src: 'https://www.ikea.com/ext/ingkadam/m/17f1fbd435425b2f/original/MM004456.mp4',
  poster: 'https://www.ikea.com/ext/ingkadam/m/17f1fbd435425b2f/webimage-MM004456.jpg',
};

function buildHeroVideo() {
  const wrap = document.createElement('div');
  wrap.className = 'cards-tile-card-image cards-tile-card-video';
  const video = document.createElement('video');
  video.src = HERO_VIDEO.src;
  video.poster = HERO_VIDEO.poster;
  video.muted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  wrap.append(video);
  return wrap;
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-tile-card-image';
      else div.className = 'cards-tile-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Inject the hero video into the large first tile when it has no image
  // (matches the live "Small storage & organisers" bento; other cards-tile
  // instances — e.g. the offer tiles — all have images and are unaffected).
  const firstLi = ul.querySelector(':scope > li');
  if (firstLi && !firstLi.querySelector('.cards-tile-card-image')) {
    firstLi.prepend(buildHeroVideo());
  }

  block.replaceChildren(ul);
}
