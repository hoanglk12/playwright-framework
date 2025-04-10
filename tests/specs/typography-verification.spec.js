const { test, expect } = require('@playwright/test');
const TypographyHelper = require('../../utils/typography.helper');
const BasePage = require('../../pages/basePage');
const Logger = require('../../utils/logger');
const allure = require('@wdio/allure-reporter').default;
const fs = require('fs');
const path = require('path');

// Environment Configuration
const env = process.env.TEST_ENV || 'dev';
const envConfig = require(`../../environments/${env}.config.js`);

// Get Figma API token from environment or configuration
const figmaApiToken = process.env.FIGMA_API_TOKEN || envConfig.figmaApiToken;
const figmaFileId = process.env.FIGMA_FILE_ID || envConfig.figmaFileId;

// Element mappings between Figma nodes and web selectors
const elementMappings = [
    {
        name: 'Page Title',
        figmaNodeId: '1:2', // Replace with actual Figma node ID
        webSelector: '.page-title'
    },
    {
        name: 'Article Heading',
        figmaNodeId: '1:3', // Replace with actual Figma node ID
        webSelector: 'article h1'
    },
    {
        name: 'Button Text',
        figmaNodeId: '1:4', // Replace with actual Figma node ID
        webSelector: '.btn-primary'
    }
    // Add more elements as needed
];

test.describe('Typography Verification Tests', () => {
    let typographyHelper, logger, basePage;
    let allResults = [];

    test.beforeAll(async () => {
        allure.epic('Visual Regression Testing');
        allure.feature('Typography Verification');
        allure.story('Figma to Web Typography Comparison');
        
        try {
            // Initialize logger
            logger = Logger || console;
            logger.info('Initializing Typography Verification Tests');
            
            // Verify Figma API token
            if (!figmaApiToken) {
                throw new Error('FIGMA_API_TOKEN is not set');
            }
            
            // Initialize typography helper
            typographyHelper = new TypographyHelper(figmaApiToken);
            
            logger.info('Typography Verification Tests initialized successfully');
            allure.addDescription('This test verifies that typography styles on the website match the specifications from Figma designs.');
        } catch (error) {
            logger.error('Failed to initialize Typography Verification Tests', {
                error: error.message
            });
            throw error;
        }
    });

    test.beforeEach(async ({ page }) => {
        basePage = new BasePage(page);
    });

    test.afterAll(async ({}, testInfo) => {
        try {
            // Generate reports
            const summaryReport = generateSummaryReport(allResults);
            const htmlReport = generateHtmlReport(allResults);
            
            // Log summary
            logger.info('Typography Verification Summary', {
                totalElements: allResults.length,
                matchingElements: allResults.filter(r => r.matches).length,
                mismatchedElements: allResults.filter(r => !r.matches).length
            });
            
            // Save reports to disk
            const reportsDir = path.join(process.cwd(), 'test-results', 'typography-reports');
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }
            
            const jsonReportPath = path.join(reportsDir, 'typography-comparison-summary.json');
            const htmlReportPath = path.join(reportsDir, 'typography-comparison-report.html');
            
            fs.writeFileSync(jsonReportPath, JSON.stringify(summaryReport, null, 2));
            fs.writeFileSync(htmlReportPath, htmlReport);
            
            // Attach reports to Allure
            allure.addAttachment(
                'Typography Comparison Summary', 
                JSON.stringify(summaryReport, null, 2), 
                'application/json'
            );
            
            allure.addAttachment(
                'Typography HTML Report', 
                htmlReport, 
                'text/html'
            );
            
            // Add environment info to Allure report
            allure.addArgument('Environment', env);
            allure.addArgument('Figma File ID', figmaFileId);
            allure.addArgument('Total Elements', allResults.length.toString());
            allure.addArgument('Matching Elements', allResults.filter(r => r.matches).length.toString());
            allure.addArgument('Mismatched Elements', allResults.filter(r => !r.matches).length.toString());
        } catch (error) {
            logger.error('Failed to generate summary report', {
                error: error.message
            });
        }
    });

    test('Verify typography consistency with Figma designs', async ({ page }) => {
        allure.severity('critical');
        
        try {
            // Navigate to the page
            logger.info(`Navigating to: ${envConfig.liveSiteUrl}`);
            allure.startStep(`Navigating to: ${envConfig.liveSiteUrl}`);
            await basePage.navigate(envConfig.liveSiteUrl);
            await page.waitForLoadState('networkidle');
            allure.endStep('passed');
            
            // Test each element mapping
            for (const mapping of elementMappings) {
                allure.startStep(`Checking typography for element: ${mapping.name}`);
                logger.info(`Checking typography for element: ${mapping.name}`);
                
                try {
                    // Get typography from Figma
                    const figmaTypography = await typographyHelper.getFigmaTypography(
                        figmaFileId, 
                        mapping.figmaNodeId
                    );
                    
                    // Get typography from web
                    await basePage.waitForElementVisible(mapping.webSelector);
                    const element = page.locator(mapping.webSelector);
                    const webTypography = await typographyHelper.getWebTypography(element);
                    
                    // Compare typography
                    const comparisonResult = typographyHelper.compareTypography(
                        figmaTypography, 
                        webStyles,
                        { tolerance: 1 } // 1px tolerance for numeric values
                    );
                    
                    // Generate report for this element
                    const report = typographyHelper.generateReport(mapping.name, comparisonResult);
                    allResults.push(report);
                    
                    // Log result
                    if (comparisonResult.matches) {
                        logger.info(`Typography matches for ${mapping.name}`);
                    } else {
                        logger.warn(`Typography discrepancies found for ${mapping.name}`, {
                            discrepancies: comparisonResult.discrepancies
                        });
                    }
                    
                    // Highlight element for screenshot
                    await basePage.highlightElement(mapping.webSelector);
                    
                    // Take a screenshot of the element
                    const screenshotBuffer = await element.screenshot();
                    
                    // Save screenshot to disk
                    const screenshotPath = `./test-results/screenshots/typography-${mapping.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
                    fs.writeFileSync(screenshotPath, screenshotBuffer);
                    
                    // Attach screenshot to Allure report
                    allure.addAttachment(
                        `${mapping.name} Screenshot`, 
                        screenshotBuffer, 
                        'image/png'
                    );
                    
                    // Assert that typography matches
                    expect(comparisonResult.matches, 
                        `Typography for ${mapping.name} should match Figma design`).toBeTruthy();
                    
                    allure.endStep('passed');
                } catch (elementError) {
                    logger.error(`Error checking typography for ${mapping.name}`, {
                        error: elementError.message,
                        stack: elementError.stack
                    });
                    
                    allure.endStep('failed');
                    allure.addAttachment(
                        `Error checking ${mapping.name}`, 
                        elementError.stack, 
                        'text/plain'
                    );
                    
                    // Continue with next element
                    continue;
                }
            }
        } catch (error) {
            logger.error('Failed to verify typography', {
                error: error.message,
                stack: error.stack
            });
            
            allure.addAttachment(
                'Error verifying typography', 
                error.stack, 
                'text/plain'
            );
            
            throw error;
        }
    });
});

/**
 * Generate a summary report from all comparison results
 * @param {Array<Object>} results - All comparison results
 * @returns {Object} Summary report
 */
function generateSummaryReport(results) {
    const summary = {
        totalElements: results.length,
        matchingElements: results.filter(r => r.matches).length,
        mismatchedElements: results.filter(r => !r.matches).length,
        overallMatch: results.every(r => r.matches),
        timestamp: new Date().toISOString(),
        elements: results.map(result => ({
            element: result.element,
            matches: result.matches,
            discrepancyCount: result.discrepancies.length,
            discrepancies: result.discrepancies.map(d => ({
                property: d.property,
                figma: d.figma,
                web: d.web,
                reason: d.reason
            }))
        }))
    };
    
    return summary;
}

/**
 * Generate an HTML report for better visualization
 * @param {Array<Object>} results - All comparison results
 * @returns {string} HTML report
 */
function generateHtmlReport(results) {
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Typography Verification Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .element { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
            .element-header { display: flex; justify-content: space-between; align-items: center; }
            .element-name { font-size: 18px; font-weight: bold; }
            .element-status { padding: 5px 10px; border-radius: 3px; color: white; }
            .match { background: #4CAF50; }
            .mismatch { background: #F44336; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .discrepancy { color: #F44336; font-weight: bold; }
            .reason { font-style: italic; color: #666; font-size: 0.9em; padding-top: 5px; }
            .progress-container { width: 100%; background-color: #f3f3f3; border-radius: 5px; margin: 10px 0; }
            .progress-bar { text-align: center; color: white; border-radius: 5px; }
            .collapse-btn { cursor: pointer; background: #eee; border: none; padding: 5px 10px; margin: 5px 0; }
            .property-group { border-left: 3px solid #ddd; padding-left: 10px; margin: 10px 0; }
            .property-group h4 { margin: 5px 0; }
        </style>
        <script>
            function toggleSection(id) {
                const section = document.getElementById(id);
                section.style.display = section.style.display === 'none' ? 'block' : 'none';
            }
        </script>
    </head>
    <body>
        <h1>Typography Verification Report</h1>
        
        <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Elements:</strong> ${results.length}</p>
            <p><strong>Matching Elements:</strong> ${results.filter(r => r.matches).length}</p>
            <p><strong>Mismatched Elements:</strong> ${results.filter(r => !r.matches).length}</p>
            <p><strong>Overall Match:</strong> ${results.every(r => r.matches) ? 'Yes ✓' : 'No ✗'}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            
            <div class="progress-container">
                <div class="progress-bar" style="width:${(results.filter(r => r.matches).length / results.length) * 100}%; background-color:${results.every(r => r.matches) ? '#4CAF50' : '#FF9800'}">
                    ${Math.round((results.filter(r => r.matches).length / results.length) * 100)}%
                </div>
            </div>
        </div>
        
        <h2>Element Details</h2>
    `;
    
    for (const result of results) {
        html += `
        <div class="element">
            <div class="element-header">
                <div class="element-name">${result.element}</div>
                <div class="element-status ${result.matches ? 'match' : 'mismatch'}">
                    ${result.matches ? 'Match ✓' : 'Mismatch ✗'}
                </div>
            </div>
            
            <button class="collapse-btn" onclick="toggleSection('props-${result.element.replace(/\s+/g, '-')}')">
                ${result.matches ? 'Show Details' : 'Show Discrepancies (' + result.discrepancies.length + ')'}
            </button>
            
            <div id="props-${result.element.replace(/\s+/g, '-')}" style="display:${result.matches ? 'none' : 'block'}">
        `;
        
        // Group properties by category
        const propertyGroups = {
            'Font Properties': ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant'],
            'Text Layout': ['lineHeight', 'letterSpacing', 'textAlign', 'textDecoration', 'textTransform', 'textIndent'],
            'Colors and Appearance': ['color', 'opacity', 'backgroundColor'],
            'Border and Outline': ['borderStyle', 'borderWidth', 'borderColor', 'borderRadius'],
            'Spacing': ['padding', 'margin'],
            'Effects': ['textShadow']
        };
        
        // Create function to check if a property belongs to a group
        const getPropertyGroup = (prop) => {
            for (const [group, props] of Object.entries(propertyGroups)) {
                if (props.includes(prop)) return group;
            }
            return 'Other';
        };
        
        // Get all properties from both figma and web
        const allProperties = new Set([
            ...Object.keys(result.figma || {}), 
            ...Object.keys(result.web || {})
        ]);
        
        // Check if a property is in the discrepancies list
        const isDiscrepancy = (prop) => {
            return result.discrepancies.some(d => d.property === prop);
        };
        
        // Group properties
        const groupedProperties = {};
        allProperties.forEach(prop => {
            const group = getPropertyGroup(prop);
            if (!groupedProperties[group]) {
                groupedProperties[group] = [];
            }
            groupedProperties[group].push(prop);
        });
        
        // Generate tables for each group
        for (const [group, props] of Object.entries(groupedProperties)) {
            // Skip empty groups
            if (!props.length) continue;
            
            // If no discrepancies in this group and element matches, skip
            if (result.matches && !props.some(isDiscrepancy)) continue;
            
            html += `
                <div class="property-group">
                    <h4>${group}</h4>
                    <table>
                        <tr>
                            <th>Property</th>
                            <th>Figma</th>
                            <th>Web</th>
                            <th>Status</th>
                        </tr>
            `;
            
            for (const prop of props) {
                const figmaValue = result.figma?.[prop] || 'N/A';
                const webValue = result.web?.[prop] || 'N/A';
                const hasDiscrepancy = isDiscrepancy(prop);
                const discrepancy = result.discrepancies.find(d => d.property === prop);
                
                html += `
                    <tr>
                        <td>${prop}</td>
                        <td class="${hasDiscrepancy ? 'discrepancy' : ''}">${figmaValue}</td>
                        <td class="${hasDiscrepancy ? 'discrepancy' : ''}">${webValue}</td>
                        <td>${hasDiscrepancy ? '✗' : '✓'}</td>
                    </tr>
                `;
                
                if (hasDiscrepancy && discrepancy.reason) {
                    html += `
                        <tr>
                            <td colspan="4" class="reason">${discrepancy.reason}</td>
                        </tr>
                    `;
                }
            }
            
            html += `
                    </table>
                </div>
            `;
        }
        
        html += `
            </div>
        </div>
        `;
    }
    
    html += `
    </body>
    </html>
    `;
    
    return html;
}