/**
 * Load Test Configuration
 * Contains settings for different load test scenarios
 */
module.exports = {
    // Base URL for tests
    baseUrl: 'https://example.com',
    
    // Common test scenarios
    scenarios: {
      // Light load test (baseline)
      light: {
        vus: 10,
        duration: '30s',
        rampUp: '5s',
        thresholds: {
          http_req_duration: ['p(95)<500'], // 95% of requests must complete under 500ms
          http_req_failed: ['rate<0.01']    // Less than 1% of requests should fail
        }
      },
      
      // Medium load test (normal traffic)
      medium: {
        vus: 50,
        duration: '1m',
        rampUp: '10s',
        thresholds: {
          http_req_duration: ['p(95)<800'],
          http_req_failed: ['rate<0.02']
        }
      },
      
      // Heavy load test (peak traffic)
      heavy: {
        vus: 200,
        duration: '2m',
        rampUp: '30s',
        thresholds: {
          http_req_duration: ['p(95)<1500'],
          http_req_failed: ['rate<0.05']
        }
      },
      
      // Stress test (beyond expected capacity)
      stress: {
        vus: 500,
        duration: '3m',
        rampUp: '1m',
        thresholds: {
          http_req_duration: ['p(95)<3000'],
          http_req_failed: ['rate<0.10']
        }
      }
    },
    
    // Specific endpoints to test
    endpoints: {
      homepage: '/',
      login: '/login',
      articles: '/articles',
      insights: '/insights'
    }
  };
  