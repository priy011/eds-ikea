/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS - one per block variant used in the homepage template
import carouselNavParser from './parsers/carousel-nav.js';
import heroPromoParser from './parsers/hero-promo.js';
import cardsTileParser from './parsers/cards-tile.js';
import carouselTeaserParser from './parsers/carousel-teaser.js';
import carouselEditorialParser from './parsers/carousel-editorial.js';
import carouselProductParser from './parsers/carousel-product.js';
import carouselGalleryParser from './parsers/carousel-gallery.js';
import cardsEditorialParser from './parsers/cards-editorial.js';
import cardsInspirationParser from './parsers/cards-inspiration.js';

// TRANSFORMER IMPORTS - site-wide DOM cleanup
import ikeaCleanupTransformer from './transformers/ikea-cleanup.js';

// PARSER REGISTRY - map block variant names to parser functions
const parsers = {
  'carousel-nav': carouselNavParser,
  'hero-promo': heroPromoParser,
  'cards-tile': cardsTileParser,
  'carousel-teaser': carouselTeaserParser,
  'carousel-editorial': carouselEditorialParser,
  'carousel-product': carouselProductParser,
  'carousel-gallery': carouselGalleryParser,
  'cards-editorial': cardsEditorialParser,
  'cards-inspiration': cardsInspirationParser,
};

// TRANSFORMER REGISTRY - executed in order per hook
const transformers = [
  ikeaCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'IKEA India homepage - hero/showcase teasers, product carousels, editorial shelves, deals, category grids, header and footer',
  urls: [
    'https://www.ikea.com/in/en/',
  ],
  blocks: [
    {
      name: 'carousel-nav',
      instances: [
        'body > main > article > div > div.hri-content-container > div > section.hri-section:nth-of-type(1)',
      ],
    },
    {
      name: 'hero-promo',
      instances: [
        'body > main > article > div > div.hri-content-container > div > section.hri-section.hri-section--homepage-content-start > div > div > div._showcase_1xsli_1 > div.hri-teaser:nth-of-type(1)',
        'section.hri-section--homepage-content-start ._showcase_1xsli_1 .hri-teaser__info-container',
        'section.hri-section--homepage-content-start .hri-bento-box .hri-bento-box-card',
        'section.hri-section--homepage-content-start .hri-teaser',
      ],
    },
    {
      name: 'cards-tile',
      instances: [
        'section.hri-section--homepage-content-start ._showcase_1xsli_1 .hri-carousel__wrapper',
        'body > main > article > div > div.hri-content-container > div > section.hri-section:nth-of-type(7)',
      ],
    },
    {
      name: 'carousel-teaser',
      instances: [
        'section.hri-section:nth-of-type(4) .hri-carousel--has-scrollbar',
        'section.hri-section:nth-of-type(6) .hri-carousel--has-scrollbar',
        'section.hri-section:nth-of-type(8) .hri-carousel--has-scrollbar',
        'section.hri-section:nth-of-type(11) .hri-carousel--has-scrollbar',
        'section.hri-section:nth-of-type(12) .hri-carousel--has-scrollbar',
      ],
    },
    {
      name: 'carousel-editorial',
      instances: [
        'section.hri-section:nth-of-type(5) .hri-editorial-shelf-carousel',
      ],
    },
    {
      name: 'carousel-product',
      instances: [
        'section.hri-section:nth-of-type(9) .listing-carousel',
      ],
    },
    {
      name: 'carousel-gallery',
      instances: [
        'section.hri-section:nth-of-type(13) .hri-carousel--has-scrollbar',
        'section.hri-section:nth-of-type(13) .crec-carousel',
        'section.hri-section:nth-of-type(13) .crec-carousel--has-scrollbar',
      ],
    },
    {
      name: 'cards-editorial',
      instances: [
        'body > main > article > div > div.hri-content-container > div > section.hri-section:nth-of-type(10)',
      ],
    },
    {
      name: 'cards-inspiration',
      instances: [
        'body > main > article > div > div.hri-content-container > div > section.hri-section:nth-of-type(14)',
      ],
    },
    {
      name: 'section-offers-tint',
      instances: [
        'section.hri-section:nth-of-type(4)',
        'section.hri-section:nth-of-type(8)',
        'section.hri-section:nth-of-type(12)',
      ],
      section: 'offers-tint',
    },
  ],
};

/**
 * Execute all page transformers for a specific hook.
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform (typically document.body)
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all block instances on the page based on the embedded template.
 * Section-style markers (name starting with "section-") are excluded — they are
 * handled by section metadata, not block parsers.
 * @param {Document} document
 * @param {Object} template
 * @returns {Array} block instances found on page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks
    .filter((blockDef) => !blockDef.name.startsWith('section-'))
    .forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          // Avoid mapping the same element to multiple selectors/blocks
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null,
          });
        });
      });
    });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup (remove overlays/modals that block parsing)
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks using the embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using its registered parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by an earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup (strip global chrome: header, footer, nav, links, iframes)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path. Map the root/homepage URL to `/index` — a pathname of
    //    `/` becomes '' after trailing-slash stripping, which crashes the bundled
    //    importer's path polyfill (`.cwd is not a function`).
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
