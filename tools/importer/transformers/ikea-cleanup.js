/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: IKEA India site-wide cleanup.
 *
 * Removes non-authorable IKEA chrome and injected app/SDK mount points so the
 * import contains only page-level authorable content.
 *
 * Every selector below was verified by reading migration-work/cleaned.html:
 *   #onetrust-consent-sdk                     OneTrust cookie/consent SDK
 *   #a2c-modal, #cart-agent, #wlo-modal       add-to-cart / cart / wishlist modals
 *   #nudge_root                               nudge/promo overlay root
 *   #favs-add-to-list, #favs-remove-from-list favourites (wishlist) modals
 *   #tugc-leave-review-frontend-mount-point   ratings & reviews mount points
 *   #tugc-rr-pip-frontend-mount-point
 *   .hnf-voc-feedback-modal                   voice-of-customer feedback modal
 *   .rr-leave-review-modal-wrapper            leave-a-review modal wrappers/backdrop
 *   header.hnf-header                         global site header
 *   footer.hnf-footer                         global site footer
 *   nav.hnf-menu__entrypoints,                header/utility/mobile navigation
 *     nav.hnf-navbar__icons, nav.hnf-mobile-menu
 *   iframe, link, noscript                    embedded frames / resource + script fallbacks
 *
 * (No inline <script>, <style>, or Cloudflare turnstile nodes are present in
 * cleaned.html, so none are targeted here — selectors are DOM-verified only.)
 */

const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Overlays / modals / injected app roots that would otherwise interfere
    // with block parsing. Verified in cleaned.html.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#a2c-modal',
      '#cart-agent',
      '#wlo-modal',
      '#nudge_root',
      '#favs-add-to-list',
      '#favs-remove-from-list',
      '#tugc-leave-review-frontend-mount-point',
      '#tugc-rr-pip-frontend-mount-point',
      '.hnf-voc-feedback-modal',
      '.rr-leave-review-modal-wrapper',
    ]);
  }

  if (hookName === H.after) {
    // Global site chrome (header, footer, navigation) — non-authorable.
    // Verified in cleaned.html: header.hnf-header, footer.hnf-footer,
    // nav.hnf-menu__entrypoints, nav.hnf-navbar__icons, nav.hnf-mobile-menu.
    WebImporter.DOMUtils.remove(element, [
      'header.hnf-header',
      'footer.hnf-footer',
      'nav.hnf-menu__entrypoints',
      'nav.hnf-navbar__icons',
      'nav.hnf-mobile-menu',
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
