/*
 * The "Welcome to IKEA" hero renders a looping autoplay video on the live site
 * (the pegboard/desk stop-motion). Its poster shares the asset id
 * IN-0016423_IN-0016422; the video itself is client-rendered and not captured by
 * the importer, so its src is embedded here and swapped in when this hero's
 * image matches that poster.
 */
const HERO_VIDEO = {
  match: /IN-0016423_IN-0016422/,
  src: 'https://www.ikea.com/ext/ingkadam/m/437bd646a182ee01/original/IN-0016423_IN-0016422.mp4',
};

function swapPosterForVideo(block) {
  const imageRow = block.querySelector(':scope > div:first-child');
  const img = imageRow ? imageRow.querySelector('img') : null;
  if (!img || !HERO_VIDEO.match.test(img.src)) return;
  const video = document.createElement('video');
  video.src = HERO_VIDEO.src;
  video.poster = img.src;
  video.muted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  const picture = img.closest('picture') || img;
  picture.replaceWith(video);
}

export default function decorate(block) {
  swapPosterForVideo(block);
  if (!block.querySelector(':scope > div:first-child picture, :scope > div:first-child video')) {
    block.classList.add('no-image');
  }
}
