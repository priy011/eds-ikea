import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * The "Fall decor ideas & essentials" card is a looping autoplay video on the
 * live site (autumn doorway / falling leaves). It's client-rendered and not
 * captured by the importer, so its src is embedded here and injected into the
 * matching (image-less) card at render time.
 */
const FALL_DECOR_VIDEO = {
  match: /fall decor/i,
  src: 'https://www.ikea.com/ext/ingkadam/m/5119806f4ed79b9e/original/MM004266.mp4',
  poster: 'https://www.ikea.com/ext/ingkadam/m/5119806f4ed79b9e/thul-MM004266.jpg',
};

function buildVideoMedia() {
  const div = document.createElement('div');
  div.className = 'cards-editorial-card-image cards-editorial-card-video';
  const video = document.createElement('video');
  video.src = FALL_DECOR_VIDEO.src;
  video.poster = FALL_DECOR_VIDEO.poster;
  video.muted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  div.append(video);
  return div;
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-editorial-card-image';
      else div.className = 'cards-editorial-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Inject the Fall-decor video into its image-less card.
  [...ul.querySelectorAll(':scope > li')].forEach((li) => {
    if (li.querySelector('.cards-editorial-card-image')) return; // already has media
    if (!FALL_DECOR_VIDEO.match.test(li.textContent)) return;
    // Reuse the empty leading body cell as the media slot when present.
    const emptyCell = [...li.querySelectorAll('.cards-editorial-card-body')]
      .find((d) => !d.textContent.trim());
    const media = buildVideoMedia();
    if (emptyCell) emptyCell.replaceWith(media);
    else li.prepend(media);
  });

  block.replaceChildren(ul);
}
