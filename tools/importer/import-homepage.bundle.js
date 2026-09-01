/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-nav.js
  function parse(element, { document }) {
    const nav = element.querySelector(".hnf-inpage-nav");
    let cards = Array.from(element.querySelectorAll(".hnf-inpage-nav__card"));
    if (!cards.length) {
      cards = Array.from(element.querySelectorAll('a[class*="inpage-nav__card"], a[class*="nav__card"]'));
    }
    const cells = [];
    const promoLinks = Array.from(element.querySelectorAll("a[href]")).filter((a) => {
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return false;
      return !nav || !nav.contains(a);
    });
    promoLinks.forEach((a) => {
      const text = a.textContent.replace(/\s+/g, " ").trim();
      if (!text) return;
      const link = document.createElement("a");
      link.setAttribute("href", a.getAttribute("href"));
      link.textContent = text;
      cells.push(["", link]);
    });
    cards.forEach((card) => {
      const href = card.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const img = card.querySelector(".hnf-inpage-nav__imagebox img, .hnf-inpage-nav__icon img, img");
      const labelEl = card.querySelector('.hnf-inpage-nav__label, [class*="label"]');
      const labelText = (labelEl ? labelEl.textContent : card.textContent).replace(/\s+/g, " ").trim();
      if (!img && !labelText) return;
      const link = document.createElement("a");
      link.setAttribute("href", href);
      link.textContent = labelText;
      const imageCell = img || "";
      const contentCell = link;
      cells.push([imageCell, contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-nav", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-promo.js
  function parse2(element, { document }) {
    const bgImage = Array.from(element.querySelectorAll("img")).find((img) => {
      const src = img.getAttribute("src") || "";
      return src && !src.startsWith("data:");
    }) || element.querySelector("picture img, video[poster]");
    const titleEl = element.querySelector(
      '.hri-text-overlay-card__title, .hri-teaser__title, h1, h2, h3, [class*="title"]'
    );
    const subheadingEl = Array.from(element.querySelectorAll('p, .hri-teaser__body, [class*="subtitle"], [class*="description"]')).find((p) => {
      const t = p.textContent.replace(/\s+/g, " ").trim();
      return t && (!titleEl || t !== titleEl.textContent.replace(/\s+/g, " ").trim());
    });
    const ctaAnchor = element.querySelector('a[href]:not([href^="#"])');
    if (!titleEl && !ctaAnchor && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
    const ctaText = ctaAnchor ? ctaAnchor.textContent.replace(/\s+/g, " ").trim() : "";
    if (titleText && titleText.toLowerCase() !== ctaText.toLowerCase()) {
      const heading = document.createElement("h2");
      heading.textContent = titleText;
      contentCell.push(heading);
    }
    if (subheadingEl) {
      const p = document.createElement("p");
      p.textContent = subheadingEl.textContent.replace(/\s+/g, " ").trim();
      contentCell.push(p);
    }
    if (ctaAnchor) {
      const link = document.createElement("a");
      link.setAttribute("href", ctaAnchor.getAttribute("href"));
      link.textContent = ctaText || "Shop now";
      contentCell.push(link);
    }
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tile.js
  function parse3(element, { document }) {
    let tiles = Array.from(element.querySelectorAll(".hri-text-overlay-card"));
    if (!tiles.length) tiles = Array.from(element.querySelectorAll(".hri-bento-box-card"));
    if (!tiles.length) tiles = Array.from(element.querySelectorAll('[class*="overlay-card"], [class*="bento-box-card"]'));
    const cells = [];
    tiles.forEach((tile) => {
      const image = Array.from(tile.querySelectorAll("img")).find((img) => {
        const src = img.getAttribute("src") || "";
        return src && !src.startsWith("data:");
      }) || tile.querySelector("video[poster]");
      const titleEl = tile.querySelector(
        '.hri-text-overlay-card__title, [class*="overlay-card__title"], [class*="title"], h1, h2, h3, h4'
      );
      const captionText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const anchor = tile.querySelector('a[href]:not([href^="#"])');
      const href = anchor ? anchor.getAttribute("href") : "";
      if (!image && !captionText) return;
      const imageCell = image || "";
      let contentCell = "";
      if (captionText && href) {
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = captionText;
        contentCell = link;
      } else if (captionText) {
        const p = document.createElement("p");
        p.textContent = captionText;
        contentCell = p;
      }
      cells.push([imageCell, contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-teaser.js
  function parse4(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".hri-carousel-slide"));
    if (!slides.length) slides = Array.from(element.querySelectorAll('[class*="carousel-slide"], [class*="carousel__content"] > div'));
    const cells = [];
    slides.forEach((slide) => {
      const image = Array.from(slide.querySelectorAll("img")).find((img) => {
        const src = img.getAttribute("src") || "";
        return src && !src.startsWith("data:");
      });
      const titleEl = slide.querySelector(
        '.hri-compact-card__title, .hri-content-card__title, [class*="card__title"], [class*="title"], h1, h2, h3, h4'
      );
      const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const anchor = slide.querySelector('a[href]:not([href^="#"])');
      const href = anchor ? anchor.getAttribute("href") : "";
      const textLines = [];
      const seen = /* @__PURE__ */ new Set();
      const addLine = (t) => {
        const norm = (t || "").replace(/\s+/g, " ").trim();
        if (!norm || seen.has(norm)) return;
        seen.add(norm);
        textLines.push(norm);
      };
      if (titleText) addLine(titleText);
      slide.querySelectorAll('span, p, div, [class*="message"], [class*="label"], [class*="description"]').forEach((el) => {
        if (el.querySelector("span, p, div")) return;
        addLine(el.textContent);
      });
      if (!image && !textLines.length) return;
      const imageCell = image || "";
      const contentCell = [];
      textLines.forEach((line, idx) => {
        if (idx === 0 && href) {
          const link = document.createElement("a");
          link.setAttribute("href", href);
          link.textContent = line;
          contentCell.push(link);
        } else {
          const p = document.createElement("p");
          p.textContent = line;
          contentCell.push(p);
        }
      });
      cells.push([imageCell, contentCell.length ? contentCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-editorial.js
  function parse5(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".hri-carousel-slide"));
    if (!slides.length) slides = Array.from(element.querySelectorAll('[class*="carousel-slide"], [class*="carousel__content"] > div'));
    const cells = [];
    slides.forEach((slide) => {
      const image = Array.from(slide.querySelectorAll("img")).find((img) => {
        const src = img.getAttribute("src") || "";
        return src && !src.startsWith("data:");
      });
      const titleEl = slide.querySelector(
        '.hri-content-card__title, [class*="content-card__title"], [class*="card__title"], h1, h2, h3, h4'
      );
      const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const anchor = slide.querySelector('a[href]:not([href^="#"])');
      const href = anchor ? anchor.getAttribute("href") : "";
      const contentArea = slide.querySelector('.hri-content-card__container, .hri-content-card, [class*="content-card"]') || slide;
      const textLines = [];
      const seen = /* @__PURE__ */ new Set();
      const addLine = (t) => {
        const norm = (t || "").replace(/\s+/g, " ").trim();
        if (!norm || seen.has(norm)) return;
        seen.add(norm);
        textLines.push(norm);
      };
      if (titleText) addLine(titleText);
      contentArea.querySelectorAll('span, p, h1, h2, h3, h4, [class*="label"], [class*="subtitle"], [class*="body"], [class*="description"]').forEach((el) => {
        if (el.closest("button")) return;
        if (el.querySelector("span, p, h1, h2, h3, h4")) return;
        addLine(el.textContent);
      });
      if (!image && !textLines.length) return;
      const imageCell = image || "";
      const contentCell = [];
      textLines.forEach((line) => {
        if (line === titleText && href) {
          const link = document.createElement("a");
          link.setAttribute("href", href);
          link.textContent = line;
          contentCell.push(link);
        } else {
          const p = document.createElement("p");
          p.textContent = line;
          contentCell.push(p);
        }
      });
      cells.push([imageCell, contentCell.length ? contentCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-editorial", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-product.js
  function parse6(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".listing-carousel-slide"));
    if (!slides.length) slides = Array.from(element.querySelectorAll('[class*="carousel-slide"], [class*="shelf-item"]'));
    const cells = [];
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const classify = (el) => {
      if (el.closest('.listing-price-module__current-price, [class*="current-price"]')) return "cp-price";
      if (el.closest(".listing-price--subtle")) return "cp-was";
      if (el.closest('.listing-price-module__offer-message, [class*="offer-message"]')) return "cp-offer";
      if (el.closest('.listing-rating, [class*="rating"]')) return "cp-rating";
      if (el.closest('.listing-price-module__description, [class*="__description"]')) return "cp-desc";
      return "";
    };
    slides.forEach((slide) => {
      const image = Array.from(slide.querySelectorAll("img")).find((img) => {
        const src = img.getAttribute("src") || "";
        return src && !src.startsWith("data:");
      });
      const nameEl = slide.querySelector('.listing-price-module__product-name, [class*="product-name"]');
      const nameText = nameEl ? clean(nameEl.textContent) : "";
      const nameLink = slide.querySelector('.listing-price-module__product-link, .listing-product__product-link, .listing-product__image-link, a[href]:not([href^="#"])');
      const href = nameLink ? nameLink.getAttribute("href") : "";
      const contentCell = [];
      const seen = /* @__PURE__ */ new Set();
      const isDup = (norm) => {
        if (!norm || seen.has(norm)) return true;
        for (const prev of seen) {
          if (prev.includes(norm)) return true;
        }
        return false;
      };
      if (nameText && !isDup(nameText)) {
        seen.add(nameText);
        if (href) {
          const link = document.createElement("a");
          link.setAttribute("href", href);
          link.textContent = nameText;
          contentCell.push(link);
        } else {
          const p = document.createElement("p");
          p.textContent = nameText;
          contentCell.push(p);
        }
      }
      slide.querySelectorAll("span, p, h1, h2, h3, h4").forEach((el) => {
        if (el.closest("button") && !el.closest('.listing-rating, [class*="rating"]')) return;
        if (el.querySelector("span, p, h1, h2, h3, h4")) return;
        const norm = clean(el.textContent);
        if (isDup(norm)) return;
        seen.add(norm);
        const p = document.createElement("p");
        const cls = classify(el);
        if (cls) p.className = cls;
        p.textContent = norm;
        contentCell.push(p);
      });
      const ratingEl = slide.querySelector('.listing-rating, [class*="rating"]');
      if (ratingEl) {
        const norm = clean(ratingEl.textContent);
        if (!isDup(norm)) {
          seen.add(norm);
          const p = document.createElement("p");
          p.className = "cp-rating";
          p.textContent = norm;
          contentCell.push(p);
        }
      }
      if (!image && !contentCell.length) return;
      cells.push([image || "", contentCell.length ? contentCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-gallery.js
  function parse7(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".crec-carousel-slide, .hri-carousel-slide"));
    if (!slides.length) slides = Array.from(element.querySelectorAll('[class*="carousel-slide"], [class*="carousel__content"] > div'));
    const cells = [];
    slides.forEach((slide) => {
      const image = Array.from(slide.querySelectorAll("img")).find((img) => {
        const src = img.getAttribute("src") || "";
        return src && !src.startsWith("data:");
      });
      if (!image) return;
      const pillTexts = [];
      const seen = /* @__PURE__ */ new Set();
      slide.querySelectorAll('.crec-pill__label, [class*="pill__label"]').forEach((el) => {
        const t = el.textContent.replace(/\s+/g, " ").trim();
        if (t && !seen.has(t)) {
          seen.add(t);
          pillTexts.push(t);
        }
      });
      let contentCell = "";
      if (pillTexts.length) {
        contentCell = pillTexts.map((t) => {
          const p = document.createElement("p");
          p.textContent = t;
          return p;
        });
      }
      cells.push([image, contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-editorial.js
  function parse8(element, { document }) {
    let tiles = Array.from(element.querySelectorAll(".hri-bento-box-card"));
    if (!tiles.length) tiles = Array.from(element.querySelectorAll('.hri-text-overlay-card, [class*="bento-box-card"], [class*="overlay-card"]'));
    const cells = [];
    tiles.forEach((tile) => {
      const image = Array.from(tile.querySelectorAll("img")).find((img) => {
        const src = img.getAttribute("src") || "";
        return src && !src.startsWith("data:");
      }) || tile.querySelector("video[poster]");
      const titleEl = tile.querySelector(
        '.hri-content-card__title, .hri-text-overlay-card__title, [class*="card__title"], [class*="title"], h1, h2, h3, h4'
      );
      const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const labelEl = tile.querySelector('.hri-content-card__label, [class*="card__label"]');
      const labelText = labelEl ? labelEl.textContent.replace(/\s+/g, " ").trim() : "";
      const anchor = tile.querySelector('a[href]:not([href^="#"])');
      const href = anchor ? anchor.getAttribute("href") : "";
      if (!image && !titleText) return;
      const imageCell = image || "";
      const contentCell = [];
      if (labelText && labelText !== titleText) {
        const p = document.createElement("p");
        p.textContent = labelText;
        contentCell.push(p);
      }
      if (titleText && href) {
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = titleText;
        contentCell.push(link);
      } else if (titleText) {
        const p = document.createElement("p");
        p.textContent = titleText;
        contentCell.push(p);
      }
      cells.push([imageCell, contentCell.length ? contentCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-editorial", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-inspiration.js
  function parse9(element, { document }) {
    const cells = [];
    const seenSrc = /* @__PURE__ */ new Set();
    Array.from(element.querySelectorAll("img")).forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!src || src.startsWith("data:")) return;
      if (seenSrc.has(src)) return;
      seenSrc.add(src);
      cells.push([img, ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-inspiration", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/ikea-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#a2c-modal",
        "#cart-agent",
        "#wlo-modal",
        "#nudge_root",
        "#favs-add-to-list",
        "#favs-remove-from-list",
        "#tugc-leave-review-frontend-mount-point",
        "#tugc-rr-pip-frontend-mount-point",
        ".hnf-voc-feedback-modal",
        ".rr-leave-review-modal-wrapper"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header.hnf-header",
        "footer.hnf-footer",
        "nav.hnf-menu__entrypoints",
        "nav.hnf-navbar__icons",
        "nav.hnf-mobile-menu",
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel-nav": parse,
    "hero-promo": parse2,
    "cards-tile": parse3,
    "carousel-teaser": parse4,
    "carousel-editorial": parse5,
    "carousel-product": parse6,
    "carousel-gallery": parse7,
    "cards-editorial": parse8,
    "cards-inspiration": parse9
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "IKEA India homepage - hero/showcase teasers, product carousels, editorial shelves, deals, category grids, header and footer",
    urls: [
      "https://www.ikea.com/in/en/"
    ],
    blocks: [
      {
        name: "carousel-nav",
        instances: [
          "body > main > article > div > div.hri-content-container > div > section.hri-section:nth-of-type(1)"
        ]
      },
      {
        name: "hero-promo",
        instances: [
          "body > main > article > div > div.hri-content-container > div > section.hri-section.hri-section--homepage-content-start > div > div > div._showcase_1xsli_1 > div.hri-teaser:nth-of-type(1)",
          "section.hri-section--homepage-content-start ._showcase_1xsli_1 .hri-teaser__info-container",
          "section.hri-section--homepage-content-start .hri-bento-box .hri-bento-box-card",
          "section.hri-section--homepage-content-start .hri-teaser"
        ]
      },
      {
        name: "cards-tile",
        instances: [
          "section.hri-section--homepage-content-start ._showcase_1xsli_1 .hri-carousel__wrapper",
          "body > main > article > div > div.hri-content-container > div > section.hri-section:nth-of-type(7)"
        ]
      },
      {
        name: "carousel-teaser",
        instances: [
          "section.hri-section:nth-of-type(4) .hri-carousel--has-scrollbar",
          "section.hri-section:nth-of-type(6) .hri-carousel--has-scrollbar",
          "section.hri-section:nth-of-type(8) .hri-carousel--has-scrollbar",
          "section.hri-section:nth-of-type(11) .hri-carousel--has-scrollbar",
          "section.hri-section:nth-of-type(12) .hri-carousel--has-scrollbar"
        ]
      },
      {
        name: "carousel-editorial",
        instances: [
          "section.hri-section:nth-of-type(5) .hri-editorial-shelf-carousel"
        ]
      },
      {
        name: "carousel-product",
        instances: [
          "section.hri-section:nth-of-type(9) .listing-carousel"
        ]
      },
      {
        name: "carousel-gallery",
        instances: [
          "section.hri-section:nth-of-type(13) .hri-carousel--has-scrollbar",
          "section.hri-section:nth-of-type(13) .crec-carousel",
          "section.hri-section:nth-of-type(13) .crec-carousel--has-scrollbar"
        ]
      },
      {
        name: "cards-editorial",
        instances: [
          "body > main > article > div > div.hri-content-container > div > section.hri-section:nth-of-type(10)"
        ]
      },
      {
        name: "cards-inspiration",
        instances: [
          "body > main > article > div > div.hri-content-container > div > section.hri-section:nth-of-type(14)"
        ]
      },
      {
        name: "section-offers-tint",
        instances: [
          "section.hri-section:nth-of-type(4)",
          "section.hri-section:nth-of-type(8)",
          "section.hri-section:nth-of-type(12)"
        ],
        section: "offers-tint"
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.filter((blockDef) => !blockDef.name.startsWith("section-")).forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
