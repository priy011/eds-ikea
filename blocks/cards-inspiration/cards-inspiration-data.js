/*
 * cards-inspiration-data.js
 * "Design inspiration and modern home ideas" — inspiration image grid harvested
 * from the live IKEA India homepage (https://www.ikea.com/in/en/). This is a
 * lazy-loaded feed the content-import pipeline can't capture, so the image tiles
 * are embedded here and injected into the block at render time.
 *
 * `categories` lists the filter tabs shown above the grid (matches the live site
 * tablist). Each tile carries a `category` used to filter the grid client-side.
 */
export const categories = [
  'All',
  'Bedroom',
  'Living room',
  'Kitchen',
  'Workspace',
  'Outdoor',
  'Bathroom',
  'Baby & children room',
  'Dining',
  'Hallway',
  'Laundry',
];

export default [
  { src: 'https://www.ikea.com/ext/ingkadam/m/418b6fa53ebe98cb/original/PH162650-crop002.jpg', alt: 'The solid birch, high headboard of a TYSSEDAL bed frame in white with airy spindles behind lots of white and grey pillows.', category: 'Bedroom' },
  { src: 'https://www.ikea.com/ext/ingkadam/m/42e199cbd1ff527c/original/PH156327-crop001.jpg', alt: 'A white TYSSEDAL bed frame stands on a wooden floor by a rug. By the headboard is a nightstand with a table lamp on it.', category: 'Bedroom' },
  { src: 'https://www.ikea.com/ext/ingkadam/m/117a9d9409024267/original/PH176579.jpg', alt: 'White SKUBB organisers and shoeboxes and yellow garments on hangers artfully arranged in and next to a doorless PAX wardrobe.', category: 'Bedroom' },
  { src: 'https://www.ikea.com/ext/ingkadam/m/830138192d03f46/original/PH165490-crop001.jpg', alt: 'A white MICKE desk sits between a matching drawer unit and room-divider, cubby-style storage. Two chairs are under the desk.', category: 'Workspace' },
  { src: 'https://www.ikea.com/ext/ingkadam/m/3d982d972636b093/original/PH157148-crop001.jpg', alt: 'A white SONGESAND chest of four drawers has a black table lamp on top and stands in front of a wall with patterned wallpaper.', category: 'Bedroom' },
  { src: 'https://www.ikea.com/ext/ingkadam/m/6d562ee4733ae8e8/original/PE816481-crop001.jpg', alt: 'A white KALLAX shelving unit standing against a wall in a white home office with various items and an attached desk.', category: 'Workspace' },
];
