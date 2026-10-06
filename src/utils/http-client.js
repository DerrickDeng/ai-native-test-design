const https = require('https');

class HttpClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || '';
    this.defaultHeaders = config.headers || {};
    this.timeout = config.timeout || 30000;
  }

  request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const fullUrl = this.baseUrl ? `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}` : path;

      const headers = {
        ...this.defaultHeaders,
        ...options.headers
      };

      const requestOptions = {
        method: options.method || 'GET',
        headers,
        timeout: options.timeout || this.timeout
      };

      const req = https.request(fullUrl, requestOptions, (res) => {
        let rawData = '';

        res.on('data', (chunk) => {
          rawData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const error = new Error(`HTTP Error ${res.statusCode} on ${requestOptions.method} ${fullUrl}`);
            error.statusCode = res.statusCode;
            error.body = rawData;
            return reject(error);
          }

          const contentType = res.headers['content-type'] || '';
          if (options.json !== false && contentType.includes('application/json')) {
            try {
              resolve(JSON.parse(rawData));
            } catch (e) {
              reject(new Error(`Failed to parse response JSON from ${fullUrl}: ${e.message}\nBody: ${rawData}`));
            }
          } else {
            resolve(rawData);
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        const error = new Error(`Request timeout after ${requestOptions.timeout}ms on ${fullUrl}`);
        error.code = 'ETIMEDOUT';
        reject(error);
      });

      if (options.body) {
        const bodyData = typeof options.body === 'object' ? JSON.stringify(options.body) : options.body;
        req.write(bodyData);
      }

      req.end();
    });
  }

  get(path, options = {}) {
    return this.request(path, { ...options, method: 'GET' });
  }

  put(path, body, options = {}) {
    return this.request(path, { ...options, method: 'PUT', body });
  }

  post(path, body, options = {}) {
    return this.request(path, { ...options, method: 'POST', body });
  }
}

module.exports = HttpClient;
