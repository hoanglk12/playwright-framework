module.exports = {
    // WCAG 2.1 Level A and AA rules
    defaultRules: [
      { id: 'area-alt', enabled: true },
      { id: 'image-alt', enabled: true },
      { id: 'input-image-alt', enabled: true },
      { id: 'label', enabled: true },
      { id: 'accesskeys', enabled: true },
      { id: 'aria-allowed-attr', enabled: true },
      { id: 'aria-required-attr', enabled: true },
      { id: 'aria-required-children', enabled: true },
      { id: 'aria-required-parent', enabled: true },
      { id: 'aria-valid-attr', enabled: true },
      { id: 'aria-valid-attr-value', enabled: true },
      { id: 'button-name', enabled: true },
      { id: 'document-title', enabled: true },
      { id: 'frame-title', enabled: true },
      { id: 'heading-order', enabled: true },
      { id: 'html-has-lang', enabled: true },
      { id: 'html-lang-valid', enabled: true },
      { id: 'link-name', enabled: true },
      { id: 'meta-viewport', enabled: true },
      { id: 'object-alt', enabled: true },
      { id: 'scope-attr-valid', enabled: true },
      { id: 'server-side-image-map', enabled: true },
      { id: 'skip-link', enabled: true },
      { id: 'valid-lang', enabled: true },
      { id: 'video-caption', enabled: true },
      { id: 'blink', enabled: false }, // Not applicable
      { id: 'marquee', enabled: false } // Not applicable
    ],
    // WCAG 2.1 Level AAA rules (use with caution)
    aaaRules: [
      { id: 'audio-caption', enabled: false }, // Requires manual review
      { id: 'bypass', enabled: false }, // Requires manual review
      { id: 'definition-list', enabled: false }, // Requires manual review
      { id: 'logical-tab-order', enabled: false }, // Requires manual review
      { id: 'no-autoplay-audio', enabled: false }, // Requires manual review
      { id: 'p-as-heading', enabled: false }, // Requires manual review
      { id: 'presentation-role-conflict', enabled: false }, // Requires manual review
      { id: 'table-orientation', enabled: false }, // Requires manual review
      { id: 'th-has-data-cells', enabled: false }, // Requires manual review
      { id: 'time-limit', enabled: false } // Requires manual review
    ],
    // Custom configuration options
    options: {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      },
      rules: 
        {// Optional: customize specific rules
      'color-contrast': { enabled: true },
      'frame-title': { enabled: true },
      'landmark-one-main': { enabled: true },
      'page-has-heading-one': { enabled: true },
      'region': { enabled: true } },
      reporter: 'html' // or 'v2' for JSON output
    }
  };
  