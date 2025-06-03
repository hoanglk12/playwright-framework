/**
 * Load Testing Helper Utility
 * Provides methods for load testing and performance analysis
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const autocannon = require('autocannon');

class LoadTestHelper {
  /**
   * Run k6 load test script
   * @param {string} scriptPath - Path to k6 script
   * @param {Object} options - Test configuration options
   * @returns {Object} Test results
   */
  static async runK6Test(scriptPath, options = {}) {
    const {
      vus = 10,
      duration = '30s',
      rampUp = '5s',
      outputFile = `load-report-${Date.now()}.json`
    } = options;
    
    const outputPath = path.join(__dirname, '../tests/load/reports', outputFile);
    
    console.log(`Starting k6 load test with ${vus} virtual users for ${duration}`);
    
    try {
      execSync(
        `k6 run --vus ${vus} --duration ${duration} --ramp-up ${rampUp} --out json=${outputPath} ${scriptPath}`,
        { stdio: 'inherit' }
      );
      
      // Read and parse results
      const results = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      return results;
    } catch (error) {
      console.error('Error running k6 load test:', error);
      throw error;
    }
  }
  
  /**
   * Run autocannon HTTP benchmarking test
   * @param {string} url - Target URL
   * @param {Object} options - Test configuration
   * @returns {Promise<Object>} Test results
   */
  static runHttpBenchmark(url, options = {}) {
    const {
      connections = 10,
      duration = 30,
      method = 'GET',
      headers = {},
      body = null
    } = options;
    
    console.log(`Running HTTP benchmark against ${url} with ${connections} connections for ${duration}s`);
    
    return new Promise((resolve, reject) => {
      autocannon({
        url,
        connections,
        duration,
        method,
        headers,
        body,
        requests: options.requests || []
      }, (err, results) => {
        if (err) {
          console.error('Benchmark failed:', err);
          return reject(err);
        }
        
        // Save results to file
        const outputPath = path.join(__dirname, '../tests/load/reports', `autocannon-${Date.now()}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        
        console.log(`Benchmark complete: ${results.requests.average} req/sec`);
        resolve(results);
      });
    });
  }
  
  /**
   * Generate load test report with metrics and visualizations
   * @param {string} reportPath - Path to raw report data
   * @param {string} outputPath - Path to save generated report
   */
  static generateReport(reportPath, outputPath) {
    // Read raw report data
    const rawData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    // Extract key metrics
    const metrics = {
      totalRequests: rawData.metrics.http_reqs.values.count,
      avgResponseTime: rawData.metrics.http_req_duration.values.avg,
      p95ResponseTime: rawData.metrics.http_req_duration.values.p(95),
      errorRate: rawData.metrics.http_req_failed.values.rate,
      requestsPerSecond: rawData.metrics.http_reqs.values.rate
    };
    
    // Generate HTML report with metrics and charts
    const htmlReport = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Load Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .metric { margin-bottom: 10px; }
          .chart { margin: 20px 0; height: 300px; }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body>
        <h1>Load Test Report</h1>
        <div class="metrics">
          <div class="metric">Total Requests: ${metrics.totalRequests}</div>
          <div class="metric">Avg Response Time: ${metrics.avgResponseTime.toFixed(2)}ms</div>
          <div class="metric">P95 Response Time: ${metrics.p95ResponseTime.toFixed(2)}ms</div>
          <div class="metric">Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%</div>
          <div class="metric">Requests Per Second: ${metrics.requestsPerSecond.toFixed(2)}</div>
        </div>
        
        <div class="chart">
          <canvas id="responseTimeChart"></canvas>
        </div>
        
        <script>
          // Create charts using the metrics
          const ctx = document.getElementById('responseTimeChart').getContext('2d');
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Avg', 'P95'],
              datasets: [{
                label: 'Response Time (ms)',
                data: [${metrics.avgResponseTime}, ${metrics.p95ResponseTime}],
                backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)']
              }]
            }
          });
        </script>
      </body>
      </html>
    `;
    
    fs.writeFileSync(outputPath, htmlReport);
    console.log(`Report generated at ${outputPath}`);
  }
}

module.exports = LoadTestHelper;
