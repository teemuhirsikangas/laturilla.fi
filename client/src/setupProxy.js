const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(createProxyMiddleware('/api/*', { target: process.env.REACT_APP_BASE_API_URL }));
    app.use(createProxyMiddleware('/api/plate/*', { target: process.env.REACT_APP_BASE_API_URL }));
    app.use(createProxyMiddleware('/api/user/*', { target: process.env.REACT_APP_BASE_API_URL }));
    app.use(createProxyMiddleware('/api/user/vehicle/*', { target: process.env.REACT_APP_BASE_API_URL }));
    app.use(createProxyMiddleware('/api/messages/*', { target: process.env.REACT_APP_BASE_API_URL }));
    app.use(createProxyMiddleware('/api/push/*', { target: process.env.REACT_APP_BASE_API_URL }));
    app.use(createProxyMiddleware('/api/email/*', { target: process.env.REACT_APP_BASE_API_URL })); 
}