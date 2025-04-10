/**
 * Typography testing configuration
 * This file contains configuration for typography verification tests
 */
module.exports = {
    // Common tolerance values for numerical comparisons
    tolerances: {
        fontSize: 1, // 1px tolerance for font size
        lineHeight: 0.1, // 0.1 tolerance for line height ratio
        letterSpacing: 0.5, // 0.5px tolerance for letter spacing
        borderWidth: 1, // 1px tolerance for border width
        default: 1 // Default tolerance for other numeric values
    },
    
    // Properties to compare in typography tests
    propertyGroups: {
        'Font Properties': ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant'],
        'Text Layout': ['lineHeight', 'letterSpacing', 'textAlign', 'textDecoration', 'textTransform', 'textIndent'],
        'Colors and Appearance': ['color', 'opacity', 'backgroundColor'],
        'Border and Outline': ['borderStyle', 'borderWidth', 'borderColor', 'borderRadius'],
        'Spacing': ['padding', 'margin'],
        'Effects': ['textShadow']
    },
    
    // Optional property comparisons (won't fail if these don't match)
    optionalProperties: [
        'textShadow',
        'letterSpacing',
        'textIndent',
        'padding',
        'margin'
    ],
    
    // Element mappings between Figma nodes and web selectors
    // These can be overridden in the test file for specific tests
    elementMappings: [
        {
            name: 'Page Title',
            figmaNodeId: '1:2',
            webSelector: '.page-title',
            description: 'Main page title element'
        },
        {
            name: 'Article Heading',
            figmaNodeId: '1:3',
            webSelector: 'article h1',
            description: 'Article heading element'
        },
        {
            name: 'Button Text',
            figmaNodeId: '1:4',
            webSelector: '.btn-primary',
            description: 'Primary button text style'
        }
        // Add more elements as needed
    ]
};