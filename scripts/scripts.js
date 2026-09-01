import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Replaces the "Handpicked bundles for your home" carousel-teaser block with the
 * interactive `bundles` block. The bundle/product data (4-image grid, hover
 * lifestyle image, and the click-popup product list with prices) is client-
 * rendered and click-gated on the source site, so it cannot be captured by the
 * import pipeline; the bundles block renders it from embedded data instead.
 * @param {Element} main The container element
 */
function buildBundlesBlock(main) {
  const heading = [...main.querySelectorAll('h2, h3')]
    .find((h) => /handpicked bundles/i.test(h.textContent));
  if (!heading) return;
  // The whole homepage is one section, so scope to the wrapper that follows the
  // heading: walk forward from the heading's block wrapper to the next
  // carousel-teaser wrapper (the imported bundles showcase).
  const headingWrapper = heading.closest('div');
  let node = headingWrapper ? headingWrapper.nextElementSibling : null;
  let placeholder = null;
  while (node) {
    if (node.classList.contains('carousel-teaser')
      || node.querySelector?.('.carousel-teaser')) {
      placeholder = node.classList.contains('carousel-teaser')
        ? node : node.querySelector('.carousel-teaser');
      break;
    }
    // stop if we hit the next section heading (another showcase begins)
    if (node.querySelector?.('h2, h3')) break;
    node = node.nextElementSibling;
  }
  if (!placeholder) return;
  const bundles = buildBlock('bundles', { elems: [] });
  placeholder.replaceWith(bundles);
}

/**
 * Injects the "Looks by you" (carousel-gallery) and "Design inspiration"
 * (cards-inspiration) gallery blocks after their headings. Both are lazy-loaded,
 * Turnstile-gated feeds on the source that the import pipeline can't capture, so
 * they arrive as heading-only sections. Each injected block self-seeds its tiles
 * from embedded harvested data (see the block's *-data.js).
 * @param {Element} main The container element
 */
function buildGalleryBlocks(main) {
  const galleries = [
    { re: /looks by you/i, name: 'carousel-gallery' },
    { re: /design inspiration/i, name: 'cards-inspiration' },
  ];
  galleries.forEach(({ re, name }) => {
    if (main.querySelector(`.${name}`)) return; // already present
    const heading = [...main.querySelectorAll('h2, h3')].find((h) => re.test(h.textContent));
    if (!heading) return;
    // Both gallery headings live in the same default-content wrapper, so insert
    // the block directly after its own heading (not after the shared wrapper) to
    // keep each gallery under the correct title. The block stays a section-level
    // child, so decorateBlocks still picks it up.
    const block = buildBlock(name, { elems: [] });
    heading.after(block);
  });
}

/**
 * Tags the "What's hot & trending?" carousel-teaser as a static full-width grid.
 * On the source this row is not a scrolling carousel -- its four cards spread
 * evenly across the full content width. The imported block is a generic
 * carousel-teaser, so we mark just this instance with `teaser-grid`; CSS then
 * lays the cards out as a grid and hides the carousel arrows/indicators.
 * @param {Element} main The container element
 */
function buildHotTrendingGrid(main) {
  const heading = [...main.querySelectorAll('h2, h3')]
    .find((h) => /hot\s*&?\s*trending/i.test(h.textContent));
  if (!heading) return;
  const headingWrapper = heading.closest('div');
  let node = headingWrapper ? headingWrapper.nextElementSibling : null;
  while (node) {
    const teaser = node.classList.contains('carousel-teaser')
      ? node : node.querySelector?.('.carousel-teaser');
    if (teaser) { teaser.classList.add('teaser-grid'); return; }
    // stop if we reach the next section heading
    if (node.querySelector?.('h2, h3')) return;
    node = node.nextElementSibling;
  }
}

/**
 * Groups runs of consecutive hero-promo blocks into a bento layout container.
 * The IKEA homepage "Storage offer" bento is authored as one large hero followed
 * by four offer tiles; each is a separate hero-promo block. Wrapping them in a
 * `.bento` container lets CSS arrange them as a grid (hero left, 2x2 tiles right)
 * instead of five full-width bands stacked vertically.
 * @param {Element} main The main container element
 */
function buildBentoLayout(main) {
  const wrappers = [...main.querySelectorAll('.hero-promo-wrapper')];
  let run = [];
  const flush = () => {
    if (run.length >= 2) {
      const bento = document.createElement('div');
      bento.className = 'bento';
      run[0].parentElement.insertBefore(bento, run[0]);
      run.forEach((w) => bento.append(w));
    }
    run = [];
  };
  wrappers.forEach((w) => {
    if (run.length === 0 || run[run.length - 1].nextElementSibling === w) {
      run.push(w);
    } else {
      flush();
      run.push(w);
    }
  });
  flush();
}

/**
 * Removes stray text lines the importer captured that don't appear on the live
 * site: the "Skip to main content" / "Skip listing" a11y links, section headings
 * the live layout has no visible title for (Welcome / Explore more offers), the
 * "IKEA Family offers" sub-labels above the deals carousel, the feed helper line
 * ("Ideas based on your recently viewed products"), and the "IKEA Family offers"
 * promo blurb + image cluster before the editorial mosaic. Runs on section-level
 * default content only, so block markup is never touched.
 * @param {Element} main The container element
 */
function removeStrayHeadings(main) {
  // Exact section-level text lines to drop (whole element removed).
  const dropExact = [
    /^skip to main content$/i,
    /^skip listing$/i,
    /^welcome to ikea india$/i,
    /^explore more offers$/i,
    /^ideas based on your recently viewed products$/i,
    /^ikea family offers$/i,
    /^ikea family offers\s*our lowest price\s*last chance$/i,
  ];
  main.querySelectorAll('.default-content-wrapper > h1, .default-content-wrapper > h2, .default-content-wrapper > h3, .default-content-wrapper > p')
    .forEach((el) => {
      const txt = el.textContent.replace(/\s+/g, ' ').trim();
      if (dropExact.some((re) => re.test(txt))) el.remove();
    });

  // The "IKEA Family offers / Every saving helps..." cluster is a whole wrapper
  // (heading + blurb + image) that the live editorial mosaic doesn't show.
  const blurb = [...main.querySelectorAll('.default-content-wrapper > p')]
    .find((p) => /^every saving helps/i.test(p.textContent.trim()));
  if (blurb) {
    const wrap = blurb.closest('.default-content-wrapper');
    // only strip the blurb + its trailing image, and the now-empty heading above
    const img = wrap.querySelector('p:has(picture, img), picture, img');
    if (img) (img.closest('p') || img).remove();
    blurb.remove();
  }

  // Drop any content wrapper left empty by the removals above (else its section
  // margin leaves a blank gap).
  main.querySelectorAll('.default-content-wrapper').forEach((wrap) => {
    if (!wrap.textContent.trim() && !wrap.querySelector('picture, img, .block')) wrap.remove();
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  removeStrayHeadings(main);
  buildBundlesBlock(main);
  buildGalleryBlocks(main);
  buildHotTrendingGrid(main);
  decorateBlocks(main);
  buildBentoLayout(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  import('./consent-check.js');
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
