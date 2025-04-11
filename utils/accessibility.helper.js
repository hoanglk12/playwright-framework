const fs = require('fs');
const path = require('path');
const axe = require('axe-core');

class AccessibilityHelper {
  constructor(page) {
    this.page = page;
  }

  async analyze(options = {}) {
    // Inject axe-core into the page if not already injected
    await this._injectAxe();

    // Run accessibility analysis
    return await this.page.evaluate((opts) => {
      return window.axe.run(document, opts);
    }, options);
  }

  async _injectAxe() {
    // Check if axe is already injected
    const axeAlreadyInjected = await this.page.evaluate(() => {
      return !!window.axe;
    });

    if (!axeAlreadyInjected) {
      // Path to axe-core in node_modules
      const axePath = require.resolve('axe-core');
      const axeScript = fs.readFileSync(axePath, 'utf8');
      await this.page.evaluate(axeScript);
    }
  }

  async generateHTMLReport(results, outputPath) {
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Generate HTML report
    const html = this._generateHTML(results);
    fs.writeFileSync(outputPath, html);
    
    console.log(`Accessibility report generated at: ${path.resolve(outputPath)}`);
    return outputPath;
  }

  async filterViolationsByImpact(results, impactLevels = ['critical', 'serious']) {
    return results.violations.filter(violation => 
      impactLevels.includes(violation.impact)
    );
  }

  _generateHTML(results) {
    // Categorize violations by WCAG level
    const categorizedViolations = this._categorizeViolations(results.violations);
    
    // Get summary statistics
    const summary = {
      total: results.violations.length,
      passes: results.passes.length,
      levelA: categorizedViolations.A.length,
      levelAA: categorizedViolations.AA.length,
      levelAAA: categorizedViolations.AAA.length,
      other: categorizedViolations.other.length,
      critical: results.violations.filter(v => v.impact === 'critical').length,
      serious: results.violations.filter(v => v.impact === 'serious').length,
      moderate: results.violations.filter(v => v.impact === 'moderate').length,
      minor: results.violations.filter(v => v.impact === 'minor').length
    };
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Accessibility Report</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3, h4 {
            color: #2c3e50;
          }
          .summary-section {
            background-color: #f8f9fa;
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }
          .summary-card {
            background-color: white;
            border-radius: 5px;
            padding: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            text-align: center;
          }
          .summary-number {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .summary-label {
            font-size: 14px;
            color: #666;
          }
          .level-section {
            margin-bottom: 40px;
            border-left: 5px solid;
            padding-left: 15px;
          }
          .level-A {
            border-color: #e74c3c;
          }
          .level-AA {
            border-color: #f39c12;
          }
          .level-AAA {
            border-color: #3498db;
          }
          .level-other {
            border-color: #95a5a6;
          }
          .violation {
            background-color: #fff;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            border-left: 5px solid;
          }
          .critical {
            border-color: #e74c3c;
          }
          .serious {
            border-color: #f39c12;
          }
          .moderate {
            border-color: #3498db;
          }
          .minor {
            border-color: #95a5a6;
          }
          .impact-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            text-transform: uppercase;
          }
          .badge-critical {
            background-color: #e74c3c;
          }
          .badge-serious {
            background-color: #f39c12;
          }
          .badge-moderate {
            background-color: #3498db;
          }
          .badge-minor {
            background-color: #95a5a6;
          }
          .nodes-container {
            margin-top: 10px;
          }
          .node-item {
            background-color: #f8f9fa;
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 3px;
            font-size: 14px;
          }
          .html-snippet {
            font-family: monospace;
            background-color: #f1f1f1;
            padding: 10px;
            overflow-x: auto;
            border-radius: 3px;
            font-size: 13px;
          }
          .tabs {
            display: flex;
            border-bottom: 1px solid #ddd;
            margin-bottom: 15px;
          }
          .tab {
            padding: 10px 15px;
            cursor: pointer;
            margin-right: 5px;
            border: 1px solid transparent;
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
          }
          .tab.active {
            border-color: #ddd;
            border-bottom-color: white;
            background-color: white;
            margin-bottom: -1px;
          }
          .tab-content {
            display: none;
          }
          .tab-content.active {
            display: block;
          }
          .level-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            margin-left: 10px;
          }
          .badge-A {
            background-color: #e74c3c;
          }
          .badge-AA {
            background-color: #f39c12;
          }
          .badge-AAA {
            background-color: #3498db;
          }
          .badge-other {
            background-color: #95a5a6;
          }
          .failure-summary {
            font-style: italic;
            color: #555;
            margin-top: 5px;
          }
          .help-link {
            text-decoration: none;
            color: #3498db;
            font-weight: bold;
          }
          .help-link:hover {
            text-decoration: underline;
          }
          .timestamp {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
          }
          summary {
            cursor: pointer;
            user-select: none;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 3px;
            margin-bottom: 5px;
          }
          summary:hover {
            background-color: #eaeaea;
          }// Add these CSS rules inside your style tag in _generateHTML:

.frame-node {
  border: 2px dashed #e74c3c;
  background-color: #fef9f9;
  padding: 15px;
}

.frame-warning {
  background-color: #fff3cd;
  color: #856404;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-weight: bold;
}

.element-selector {
  font-family: monospace;
  background-color: #eaeaea;
  padding: 5px 10px;
  margin: 5px 0;
  border-radius: 3px;
  font-size: 13px;
}

.no-html {
  font-style: italic;
  color: #888;
  margin: 10px 0;
}

.frame-guidance {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 10px 15px;
  margin-top: 10px;
}

.frame-guidance h5 {
  margin-top: 0;
  color: #0d47a1;
}

.frame-guidance code {
  background-color: #f5f5f5;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: monospace;
}
        </style>
      </head>
      <body>
        <h1>Accessibility Report</h1>
        <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
        
        <section class="summary-section">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-number">${summary.total}</div>
              <div class="summary-label">Total Violations</div>
            </div>
            <div class="summary-card">
              <div class="summary-number">${summary.passes}</div>
              <div class="summary-label">Passes</div>
            </div>
            <div class="summary-card">
              <div class="summary-number">${summary.critical}</div>
              <div class="summary-label">Critical</div>
            </div>
            <div class="summary-card">
              <div class="summary-number">${summary.serious}</div>
              <div class="summary-label">Serious</div>
            </div>
            <div class="summary-card">
              <div class="summary-number">${summary.moderate}</div>
              <div class="summary-label">Moderate</div>
            </div>
            <div class="summary-card">
              <div class="summary-number">${summary.minor}</div>
              <div class="summary-label">Minor</div>
            </div>
          </div>
          
          <h3>By WCAG Level</h3>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="summary-number">${summary.levelA}</div>
              <div class="summary-label">Level A</div>
            </div>
            <div class="summary-card">
              <div class="summary-number">${summary.levelAA}</div>
              <div class="summary-label">Level AA</div>
            </div>
            <div class="summary-card">
              <div class="summary-number">${summary.levelAAA}</div>
              <div class="summary-label">Level AAA</div>
            </div>
            <div class="summary-card">
              <div class="summary-number">${summary.other}</div>
              <div class="summary-label">Other</div>
            </div>
          </div>
        </section>
        
        <div class="tabs">
          <div class="tab active" onclick="showTab('violations')">Violations</div>
          <div class="tab" onclick="showTab('passes')">Passes</div>
        </div>
        
        <div id="violations" class="tab-content active">
          <h2>Violations by WCAG Level</h2>

          ${this._renderLevelSection('A', categorizedViolations.A)}
          ${this._renderLevelSection('AA', categorizedViolations.AA)}
          ${this._renderLevelSection('AAA', categorizedViolations.AAA)}
          ${categorizedViolations.other.length > 0 ? this._renderLevelSection('other', categorizedViolations.other, 'Other Violations') : ''}
        </div>
        
        <div id="passes" class="tab-content">
          <h2>Passes (${results.passes.length})</h2>
          ${results.passes.map(pass => `
            <details class="pass">
              <summary>${pass.id}: ${pass.help}</summary>
              <div>
                <p>${pass.description}</p>
                <p><a href="${pass.helpUrl}" target="_blank" class="help-link">Learn more about this rule</a></p>
              </div>
            </details>
          `).join('')}
        </div>
        
        <script>
          function showTab(tabId) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
              content.classList.remove('active');
            });
            
            // Deactivate all tabs
            document.querySelectorAll('.tab').forEach(tab => {
              tab.classList.remove('active');
            });
            
            // Activate selected tab and content
            document.getElementById(tabId).classList.add('active');
            document.querySelector(\`.tab[onclick="showTab('\${tabId}')"]\`).classList.add('active');
          }
          
          // Enable collapsible sections
          document.addEventListener('DOMContentLoaded', function() {
            const details = document.querySelectorAll('details');
            details.forEach((detail) => {
              detail.addEventListener('toggle', function() {
                if (this.open) {
                  // Close other details when one is opened
                  details.forEach((d) => {
                    if (d !== this && d.open) d.open = false;
                  });
                }
              });
            });
          });
        </script>
      </body>
      </html>
    `;
  }

  _renderLevelSection(level, violations, title = null) {
    if (violations.length === 0) {
      return '';
    }

    return `
      <section class="level-section level-${level}">
        <h3>${title || `WCAG ${level} Violations (${violations.length})`}</h3>
        ${violations.map(violation => this._renderViolation(violation, level)).join('')}
      </section>
    `;
  }

 // In the _renderViolation method, update how you handle iframe issues:

_renderViolation(violation, level) {
    return `
      <div class="violation ${violation.impact}">
        <h4>
          ${violation.id}: ${violation.help}
          <span class="impact-badge badge-${violation.impact}">${violation.impact}</span>
          <span class="level-badge badge-${level}">${level}</span>
        </h4>
        <p>${violation.description}</p>
        <p><a href="${violation.helpUrl}" target="_blank" class="help-link">Learn more about this rule</a></p>
        <details>
          <summary>Affected Elements (${violation.nodes.length})</summary>
          <div class="nodes-container">
            ${violation.nodes.map(node => {
              // Enhanced handling for frames and iframes
              const isFrame = node.target && (
                node.target.some(selector => selector.includes('iframe')) || 
                (node.html && node.html.toLowerCase().includes('<iframe'))
              );
              
              return `
                <div class="node-item ${isFrame ? 'frame-node' : ''}">
                  ${isFrame ? '<div class="frame-warning">⚠️ Frame element detected - limited information available</div>' : ''}
                  ${node.html ? 
                    `<div class="html-snippet">${this._escapeHtml(node.html)}</div>` : 
                    '<div class="no-html">HTML content not available</div>'
                  }
                  ${node.failureSummary ? 
                    `<p class="failure-summary">${node.failureSummary}</p>` :
                    '<p class="failure-summary">No detailed failure information available.</p>'
                  }
                  ${node.target ? 
                    `<div class="element-selector"><strong>Selector:</strong> ${node.target.join(' ')}</div>` :
                    ''
                  }
                  ${isFrame ? this._renderFrameGuidance(violation.id) : ''}
                </div>
              `;
            }).join('')}
          </div>
        </details>
      </div>
    `;
  }
  
  // Add helper method for frame-specific guidance
  _renderFrameGuidance(ruleId) {
    const frameGuidance = {
      'frame-title': `
        <div class="frame-guidance">
          <h5>How to fix this frame issue:</h5>
          <ol>
            <li>Add a title attribute to the iframe: <code>&lt;iframe title="Descriptive Frame Title" ...&gt;</code></li>
            <li>The title should be descriptive of the frame's content</li>
            <li>Each frame should have a unique title if multiple frames exist on the page</li>
          </ol>
        </div>
      `,
      // Add more frame-related rule guidance here
    };
  
    return frameGuidance[ruleId] || `
      <div class="frame-guidance">
        <h5>Tips for fixing frame-related issues:</h5>
        <ul>
          <li>Ensure all frames have proper titles and accessible content</li>
          <li>Test frames individually by navigating directly to their source URL</li>
          <li>Consider using the axe browser extension to test frame content directly</li>
        </ul>
      </div>
    `;
  }

  _categorizeViolations(violations) {
    const categories = {
      A: [],
      AA: [],
      AAA: [],
      other: []
    };

    violations.forEach(violation => {
      const tags = violation.tags || [];
      
      if (tags.includes('wcag2a') || tags.includes('wcag21a')) {
        categories.A.push(violation);
      } else if (tags.includes('wcag2aa') || tags.includes('wcag21aa')) {
        categories.AA.push(violation);
      } else if (tags.includes('wcag2aaa') || tags.includes('wcag21aaa')) {
        categories.AAA.push(violation);
      } else {
        categories.other.push(violation);
      }
    });

    return categories;
  }

  _escapeHtml(html) {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

module.exports = AccessibilityHelper;