const {createProxyMiddleware} = require("http-proxy-middleware");

const proxy = createProxyMiddleware('/api', {
  target: resolveApiGatewayBaseUrlFromCdkOutputs(),
  logLevel: "debug",
  changeOrigin: true,
  secure: false
});

module.exports = {
  "port": 4000,
  "files": "./dist/**/*",
  "server": {
    "baseDir": "./dist/frontend",
    middleware: {
      // overrides the second middleware default with new settings
      1: require('connect-history-api-fallback')({
        index: '/index.html',
        verbose: true,
      }),
      10: proxy,
    },
  },
  "watchEvents": [
    "add",
    "change",
    "unlink",
    "addDir",
    "unlinkDir"
  ],
  "notify": false,
  "reloadDebounce": 200,
}


function resolveApiGatewayBaseUrlFromCdkOutputs() {
  const cdkOutputs = require('./../cdk/outputs.json');
  const keys = Object.keys(cdkOutputs);
  const key = keys.find(key => key.includes('rest-apis'));

  return cdkOutputs[key]['restapi'];
}
