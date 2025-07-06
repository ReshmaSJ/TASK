const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus setup
const client = require('prom-client');
const register = new client.Registry();

// Register default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({
    app: 'nodejs-app',
    prefix: 'nodejs_', // Add a prefix to avoid name collisions
    timeout: 10000,
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    register
});

// Example custom metric: HTTP request counter
const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status'],
    registers: [register]
});

// Example custom metric: HTTP request duration histogram
const httpRequestDurationSeconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status'],
    buckets: client.Histogram.linearBuckets(0.5, 0.5, 5), // 5 buckets, starting at 0.5, with width 0.5 (0.5, 1, 1.5, 2, 2.5)
    registers: [register]
});

// Middleware to capture metrics for all routes
app.use((req, res, next) => {
    const end = httpRequestDurationSeconds.startTimer();
    res.on('finish', () => {
        const path = req.path;
        const method = req.method;
        const status = res.statusCode;

        httpRequestCounter.inc({ method, path, status });
        end({ method, path, status });
    });
    next();
});

// Basic route from your repo
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js App!');
});

// Add a route to expose Prometheus metrics
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});
