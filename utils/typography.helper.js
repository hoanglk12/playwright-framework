const axios = require('axios');
const Logger = require('./logger');
const allure = require('@wdio/allure-reporter').default;

class TypographyHelper {
    constructor(figmaApiToken) {
        this.figmaApiToken = figmaApiToken;
        this.logger = Logger;
    }

    /**
     * Get typography styles from Figma design
     * @param {string} fileId - Figma file ID
     * @param {string} nodeId - Figma node ID
     * @returns {Promise<Object>} Typography styles from Figma
     */
    async getFigmaTypography(fileId, nodeId) {
        allure.startStep(`Getting typography from Figma for node: ${nodeId}`);
        try {
            this.logger.info(`Getting typography from Figma for node: ${nodeId}`);
            
            const response = await axios.get(`https://api.figma.com/v1/files/${fileId}/nodes?ids=${nodeId}`, {
                headers: {
                    'X-Figma-Token': this.figmaApiToken
                }
            });
            
            const node = response.data.nodes[nodeId];
            if (!node || !node.document) {
                throw new Error(`Node ${nodeId} not found in Figma file ${fileId}`);
            }
            
            // Extract typography styles from the node
            const styles = this._extractTypographyStyles(node.document);
            
            this.logger.info(`Typography retrieved from Figma successfully for node: ${nodeId}`);
            allure.endStep('passed');
            
            // Attach Figma data to Allure report
            allure.addAttachment('Figma Typography Data', JSON.stringify(styles, null, 2), 'application/json');
            
            return styles;
        } catch (error) {
            this.logger.error('Failed to get typography from Figma', { 
                fileId, 
                nodeId, 
                error: error.message 
            });
            allure.endStep('failed');
            throw error;
        }
    }

    /**
     * Extract comprehensive typography styles from Figma node
     * @private
     */
    _extractTypographyStyles(document) {
        if (document.type === 'TEXT') {
            const textStyle = document.style || {};
            const typographyStyles = {
                // Font properties
                fontFamily: textStyle.fontFamily,
                fontSize: textStyle.fontSize ? `${textStyle.fontSize}px` : undefined,
                fontWeight: textStyle.fontWeight?.toString(),
                fontStyle: textStyle.italic ? 'italic' : 'normal',
                fontVariant: textStyle.fontVariant,
                
                // Text layout
                lineHeight: textStyle.lineHeightPx ? 
                    (textStyle.lineHeightPx / textStyle.fontSize).toFixed(2) : 
                    (textStyle.lineHeightPercentFontSize ? `${textStyle.lineHeightPercentFontSize}%` : undefined),
                letterSpacing: textStyle.letterSpacing ? 
                    `${textStyle.letterSpacing}px` : undefined,
                textAlign: textStyle.textAlignHorizontal?.toLowerCase(),
                textDecoration: this._extractTextDecoration(textStyle),
                textTransform: this._extractTextTransform(textStyle),
                textIndent: textStyle.paragraphIndent ? 
                    `${textStyle.paragraphIndent}px` : undefined,
                
                // Color and appearance
                color: document.fills?.[0]?.color ? 
                    this._rgbToHex(document.fills[0].color) : undefined,
                opacity: document.opacity,
                
                // Background
                backgroundColor: document.backgroundColor ? 
                    this._rgbToHex(document.backgroundColor) : undefined,
                
                // Border and outline
                borderStyle: this._extractBorderStyle(document),
                borderWidth: this._extractBorderWidth(document),
                borderColor: this._extractBorderColor(document),
                borderRadius: document.cornerRadius ? 
                    `${document.cornerRadius}px` : undefined,
                
                // Spacing
                padding: this._extractSpacing(document.paddingTop, document.paddingRight, 
                    document.paddingBottom, document.paddingLeft),
                margin: this._extractSpacing(document.marginTop, document.marginRight, 
                    document.marginBottom, document.marginLeft),
                
                // Effects
                textShadow: this._extractTextShadow(document.effects),
            };
            
            // Remove undefined values
            return Object.fromEntries(
                Object.entries(typographyStyles)
                    .filter(([_, value]) => value !== undefined)
            );
        }
        
        return {};
    }

    /**
     * Extract text decoration from Figma style
     * @private
     */
    _extractTextDecoration(style) {
        const decorations = [];
        if (style.textDecoration === 'UNDERLINE') decorations.push('underline');
        if (style.textDecoration === 'STRIKETHROUGH') decorations.push('line-through');
        return decorations.length ? decorations.join(' ') : undefined;
    }

    /**
     * Extract text transform from Figma style
     * @private
     */
    _extractTextTransform(style) {
        if (style.textCase === 'UPPER') return 'uppercase';
        if (style.textCase === 'LOWER') return 'lowercase';
        if (style.textCase === 'TITLE') return 'capitalize';
        return undefined;
    }

    /**
     * Extract border style from Figma document
     * @private
     */
    _extractBorderStyle(document) {
        if (document.strokes && document.strokes.length > 0) {
            if (document.strokeDashes && document.strokeDashes.length > 0) {
                return 'dashed';
            }
            return 'solid';
        }
        return undefined;
    }

    /**
     * Extract border width from Figma document
     * @private
     */
    _extractBorderWidth(document) {
        if (document.strokeWeight) {
            return `${document.strokeWeight}px`;
        }
        return undefined;
    }

    /**
     * Extract border color from Figma document
     * @private
     */
    _extractBorderColor(document) {
        if (document.strokes && document.strokes.length > 0 && document.strokes[0].color) {
            return this._rgbToHex(document.strokes[0].color);
        }
        return undefined;
    }

    /**
     * Extract spacing values from Figma
     * @private
     */
    _extractSpacing(top, right, bottom, left) {
        if (top === undefined && right === undefined && 
            bottom === undefined && left === undefined) {
            return undefined;
        }
        
        const values = [top, right, bottom, left].map(v => v !== undefined ? `${v}px` : '0px');
        
        // Check if all values are the same
        if (new Set(values).size === 1) {
            return values[0];
        }
        
        // Check if vertical and horizontal are the same
        if (values[0] === values[2] && values[1] === values[3]) {
            return `${values[0]} ${values[1]}`;
        }
        
        return values.join(' ');
    }

    /**
     * Extract text shadow from Figma effects
     * @private
     */
    _extractTextShadow(effects) {
        if (!effects || !effects.length) {
            return undefined;
        }
        
        const shadows = effects
            .filter(effect => effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW')
            .map(effect => {
                const color = this._rgbToHex(effect.color);
                return `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${color}`;
            });
        
        return shadows.length ? shadows.join(', ') : undefined;
    }

    /**
     * Convert RGB color to hex
     * @private
     */
    _rgbToHex(rgb) {
        if (!rgb || rgb.r === undefined) {
            return undefined;
        }
        
        const r = Math.round(rgb.r * 255).toString(16).padStart(2, '0');
        const g = Math.round(rgb.g * 255).toString(16).padStart(2, '0');
        const b = Math.round(rgb.b * 255).toString(16).padStart(2, '0');
        
        return `#${r}${g}${b}`;
    }

    /**
     * Get typography styles from web element
     * @param {Locator} element - Playwright element locator
     * @returns {Promise<Object>} Typography styles from web
     */
    async getWebTypography(element) {
        allure.startStep('Getting typography from web element');
        try {
            this.logger.info('Getting typography from web element');
            
            const styles = await element.evaluate(el => {
                const computedStyle = window.getComputedStyle(el);
                
                return {
                    // Font properties
                    fontFamily: computedStyle.fontFamily,
                    fontSize: computedStyle.fontSize,
                    fontWeight: computedStyle.fontWeight,
                    fontStyle: computedStyle.fontStyle,
                    fontVariant: computedStyle.fontVariant,
                    
                    // Text layout
                    lineHeight: computedStyle.lineHeight,
                    letterSpacing: computedStyle.letterSpacing,
                    textAlign: computedStyle.textAlign,
                    textDecoration: [
                        computedStyle.textDecorationLine,
                        computedStyle.textDecorationStyle,
                        computedStyle.textDecorationColor
                    ].filter(Boolean).join(' '),
                    textTransform: computedStyle.textTransform,
                    textIndent: computedStyle.textIndent,
                    
                    // Color and appearance
                    color: computedStyle.color,
                    opacity: computedStyle.opacity,
                    
                    // Background
                    backgroundColor: computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' ? 
                        computedStyle.backgroundColor : undefined,
                    
                    // Border and outline
                    borderStyle: [
                        computedStyle.borderTopStyle,
                        computedStyle.borderRightStyle,
                        computedStyle.borderBottomStyle,
                        computedStyle.borderLeftStyle
                    ].filter(s => s !== 'none').join(' ') || undefined,
                    
                    borderWidth: [
                        computedStyle.borderTopWidth,
                        computedStyle.borderRightWidth,
                        computedStyle.borderBottomWidth,
                        computedStyle.borderLeftWidth
                    ].join(' '),
                    
                    borderColor: [
                        computedStyle.borderTopColor,
                        computedStyle.borderRightColor,
                        computedStyle.borderBottomColor,
                        computedStyle.borderLeftColor
                    ].join(' '),
                    
                    borderRadius: computedStyle.borderRadius,
                    
                    // Spacing
                    padding: computedStyle.padding,
                    margin: computedStyle.margin,
                    
                    // Effects
                    textShadow: computedStyle.textShadow === 'none' ? undefined : computedStyle.textShadow
                };
            });
            
            // Convert RGB colors to hex
            styles.color = this._convertRgbToHex(styles.color);
            if (styles.backgroundColor) {
                styles.backgroundColor = this._convertRgbToHex(styles.backgroundColor);
            }
            if (styles.borderColor) {
                // Handle border colors - could be multiple
                styles.borderColor = styles.borderColor.split(' ')
                    .map(c => this._convertRgbToHex(c))
                    .join(' ');
            }
            
            // Remove empty properties
            Object.keys(styles).forEach(key => {
                if (styles[key] === '' || styles[key] === undefined || 
                    styles[key] === 'normal' || styles[key] === '0px' || 
                    styles[key] === 'none none none none') {
                    delete styles[key];
                }
            });
            
            this.logger.info('Typography retrieved from web element successfully');
            allure.addAttachment('Web Typography Data', JSON.stringify(styles, null, 2), 'application/json');
            allure.endStep('passed');
            
            return styles;
        } catch (error) {
            this.logger.error('Failed to get typography from web element', { error: error.message });
            allure.endStep('failed');
            throw error;
        }
    }

    /**
     * Convert RGB color string to hex
     * @private
     */
    _convertRgbToHex(rgbStr) {
        if (!rgbStr || !rgbStr.startsWith('rgb')) {
            return rgbStr;
        }
        
        const rgb = rgbStr.match(/\d+/g);
        if (!rgb || rgb.length < 3) {
            return rgbStr;
        }
        
        const r = parseInt(rgb[0]).toString(16).padStart(2, '0');
        const g = parseInt(rgb[1]).toString(16).padStart(2, '0');
        const b = parseInt(rgb[2]).toString(16).padStart(2, '0');
        
        return `#${r}${g}${b}`;
    }

    /**
     * Compare typography styles between Figma and web
     * @param {Object} figmaStyles - Typography styles from Figma
     * @param {Object} webStyles - Typography styles from web
     * @param {Object} options - Comparison options (tolerance, etc.)
     * @returns {Object} Comparison result
     */
    compareTypography(figmaStyles, webStyles, options = {}) {
        allure.startStep('Comparing typography styles');
        try {
            this.logger.info('Comparing typography styles');
            
            const result = {
                figma: figmaStyles,
                web: webStyles,
                matches: true,
                discrepancies: []
            };
            
            // Compare each property
            for (const [key, figmaValue] of Object.entries(figmaStyles)) {
                const webValue = webStyles[key];
                
                // Skip if figma value is undefined
                if (figmaValue === undefined) {
                    continue;
                }
                
                let isMatch = false;
                let reason = '';
                
                // Handle numeric values with tolerance
                if (['fontSize', 'lineHeight', 'letterSpacing', 'textIndent', 'borderWidth'].includes(key)) {
                    const figmaNum = this._extractNumber(figmaValue);
                    const webNum = this._extractNumber(webValue);
                    
                    const tolerance = options.tolerance || 0.5; // Default tolerance is 0.5px
                    isMatch = Math.abs(figmaNum - webNum) <= tolerance;
                    if (!isMatch) {
                        reason = `Difference exceeds tolerance: ${Math.abs(figmaNum - webNum)}px`;
                    }
                } else if (key === 'fontWeight') {
                    // Handle font weight normalization (web might return numeric while figma might be string)
                    isMatch = this._normalizeFontWeight(figmaValue) === this._normalizeFontWeight(webValue);
                    if (!isMatch) {
                        reason = 'Font weights do not match after normalization';
                    }
                } else if (key === 'color' || key === 'backgroundColor' || key === 'borderColor') {
                    // Handle color comparison (case-insensitive and normalized)
                    isMatch = this._compareColors(figmaValue, webValue);
                    if (!isMatch) {
                        reason = 'Colors do not match after normalization';
                    }
                } else if (key === 'fontFamily') {
                    // Handle font family comparison (could include fallbacks in web)
                    isMatch = this._compareFontFamily(figmaValue, webValue);
                    if (!isMatch) {
                        reason = 'Font families do not match or primary font is not included';
                    }
                } else {
                    // Direct comparison for other properties, case-insensitive
                    if (typeof figmaValue === 'string' && typeof webValue === 'string') {
                        isMatch = figmaValue.toLowerCase() === webValue.toLowerCase();
                    } else {
                        isMatch = figmaValue === webValue;
                    }
                    
                    if (!isMatch) {
                        reason = 'Values do not match';
                    }
                }
                
                if (!isMatch) {
                    result.matches = false;
                    result.discrepancies.push({
                        property: key,
                        figma: figmaValue,
                        web: webValue,
                        reason: reason
                    });
                }
            }
            
            this.logger.info('Typography comparison completed', { 
                matches: result.matches,
                discrepancies: result.discrepancies.length
            });
            
            // Attach comparison results to Allure report
            allure.addAttachment(
                'Typography Comparison Result', 
                JSON.stringify(result, null, 2), 
                'application/json'
            );
            allure.endStep(result.matches ? 'passed' : 'failed');
            
            return result;
        } catch (error) {
            this.logger.error('Failed to compare typography', { error: error.message });
            allure.endStep('failed');
            throw error;
        }
    }

    /**
     * Normalize and compare font weights
     * @private
     */
    _normalizeFontWeight(weight) {
        // Convert named weights to numeric
        const weightMap = {
            'thin': '100',
            'extra light': '200',
            'light': '300',
            'normal': '400',
            'regular': '400',
            'medium': '500',
            'semi bold': '600',
            'semibold': '600',
            'bold': '700',
            'extra bold': '800',
            'extrabold': '800',
            'black': '900'
        };
        
        if (typeof weight === 'string') {
            weight = weight.toLowerCase();
            if (weightMap[weight]) {
                return weightMap[weight];
            }
        }
        
        return String(weight);
    }

    /**
     * Compare colors accounting for different formats
     * @private
     */
    _compareColors(color1, color2) {
        if (!color1 || !color2) return false;
        
        // Normalize to hex
        const normalizedColor1 = color1.toLowerCase();
        const normalizedColor2 = color2.toLowerCase();
        
        return normalizedColor1 === normalizedColor2;
    }

    /**
     * Compare font families
     * @private
     */
    _compareFontFamily(figmaFont, webFont) {
        if (!figmaFont || !webFont) return false;
        
        // Clean and normalize font names
        const cleanFigmaFont = figmaFont.replace(/['"]/g, '').toLowerCase();
        const cleanWebFont = webFont.replace(/['"]/g, '').toLowerCase();
        
        // Web font might contain fallbacks, check if Figma font is included
        return cleanWebFont.includes(cleanFigmaFont);
    }

    /**
     * Extract numeric value from string
     * @private
     */
    _extractNumber(value) {
        if (typeof value === 'number') {
            return value;
        }
        
        if (!value || typeof value !== 'string') {
            return 0;
        }
        
        const match = value.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }

    /**
     * Generate a detailed report from typography comparison results
     * @param {string} elementName - Element name or selector
     * @param {Object} comparisonResult - Result from compareTypography
     * @returns {Object} Formatted report
     */
    generateReport(elementName, comparisonResult) {
        allure.startStep(`Generating report for element: ${elementName}`);
        try {
            this.logger.info(`Generating report for element: ${elementName}`);
            
            const report = {
                element: elementName,
                figma: comparisonResult.figma,
                web: comparisonResult.web,
                matches: comparisonResult.matches,
                discrepancies: comparisonResult.discrepancies
            };
            
            this.logger.info('Report generated successfully');
            allure.endStep('passed');
            return report;
        } catch (error) {
            this.logger.error('Failed to generate report', { 
                elementName, 
                error: error.message 
            });
            allure.endStep('failed');
            throw error;
        }
    }
}

module.exports = TypographyHelper;