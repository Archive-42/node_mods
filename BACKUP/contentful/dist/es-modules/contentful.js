"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createClient = createClient;

var _axios = _interopRequireDefault(require("axios"));

var _contentfulSdkCore = require("contentful-sdk-core");

var _createContentfulApi = _interopRequireDefault(require("./create-contentful-api"));

var _createGlobalOptions = _interopRequireDefault(require("./create-global-options"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Create a client instance
 * @func
 * @name createClient
 * @memberof contentful
 * @param {Object} params - Client initialization parameters
 * @prop {string} params.space - Space ID
 * @prop {string} params.accessToken - Contentful CDA Access Token
 * @prop {string} [params.environment="master"] - Contentful Environment ID
 * @prop {boolean=} params.insecure - Requests will be made over http instead of the default https (default: true)
 * @prop {string=} params.host - API host (default: cdn.contentful.com). Also usable with preview.contentful.com.
 * @prop {string=} params.basePath - Path appended to the host to support gateways/proxies with custom urls.
 * @prop {Object=} params.httpAgent - Optional Node.js HTTP agent for proxying (see <a href="https://nodejs.org/api/http.html#http_class_http_agent">Node.js docs</a> and <a href="https://www.npmjs.com/package/https-proxy-agent">https-proxy-agent</a>)
 * @prop {Object=} params.httpsAgent - Optional Node.js HTTP agent for proxying (see <a href="https://nodejs.org/api/http.html#http_class_http_agent">Node.js docs</a> and <a href="https://www.npmjs.com/package/https-proxy-agent">https-proxy-agent</a>)
 * @prop {Object=} params.proxy - Optional Axios proxy (see <a href="https://github.com/mzabriskie/axios#request-config"> axios docs </a>)
 * @prop {Object=} params.headers - Optional additional headers
 * @prop {function=} params.adapter - Optional axios request adapter (see <a href="https://github.com/mzabriskie/axios#request-config"> axios docs </a>)
 * @prop {boolean=?} params.resolveLinks - If we should resolve links between entries (default: true)
 * @prop {boolean=?} params.removeUnresolved - If we should remove links to entries which could not be resolved (default: false)
 * @prop {boolean=?} params.retryOnError - If we should retry on errors and 429 rate limit exceptions (default: true)
 * @prop {function=} params.logHandler - A log handler function to process given log messages & errors. Receives the log level (error, warning & info) and the actual log data (Error object or string). (The default can be found at: https://github.com/contentful/contentful-sdk-core/blob/master/src/create-http-client.ts)
 * @prop {string=?} params.application - Application name and version e.g myApp/version
 * @prop {string=?} params.integration - Integration name and version e.g react/version
 * @prop {number=} params.timeout in milliseconds - connection timeout (default:30000)
 * @prop {number=} params.retryLimit - Optional number of retries before failure. Default is 5
 * @returns {ContentfulClientAPI.ClientAPI}
 * @example
 * const contentful = require('contentful')
 * const client = contentful.createClient({
 *  accessToken: 'myAccessToken',
 *  space: 'mySpaceId'
 * })
 */
function createClient(params) {
  if (!params.accessToken) {
    throw new TypeError('Expected parameter accessToken');
  }

  if (!params.space) {
    throw new TypeError('Expected parameter space');
  }

  const defaultConfig = {
    resolveLinks: true,
    removeUnresolved: false,
    defaultHostname: 'cdn.contentful.com',
    environment: 'master'
  };

  const config = _objectSpread(_objectSpread({}, defaultConfig), params);

  const userAgentHeader = (0, _contentfulSdkCore.getUserAgentHeader)(`contentful.js/${"8.4.2"}`, config.application, config.integration);
  config.headers = _objectSpread(_objectSpread({}, config.headers), {}, {
    'Content-Type': 'application/vnd.contentful.delivery.v1+json',
    'X-Contentful-User-Agent': userAgentHeader
  });
  const http = (0, _contentfulSdkCore.createHttpClient)(_axios.default, config);
  const getGlobalOptions = (0, _createGlobalOptions.default)({
    resolveLinks: config.resolveLinks,
    environment: config.environment,
    removeUnresolved: config.removeUnresolved,
    spaceBaseUrl: http.defaults.baseURL,
    environmentBaseUrl: `${http.defaults.baseURL}environments/${config.environment}`
  }); // Append environment to baseURL

  http.defaults.baseURL = getGlobalOptions().environmentBaseUrl; // Intercepts response and obscure the token

  obscureAuthTokenInResponse(http);
  return (0, _createContentfulApi.default)({
    http,
    getGlobalOptions
  });
}

function obscureAuthTokenInResponse(http) {
  http.interceptors.response.use(response => {
    return response;
  }, error => {
    if (error.response && error.response.config.headers.Authorization) {
      const token = error.response.config.headers.Authorization;
      error.response.config.headers.Authorization = error.response.config.headers.Authorization.replace(token, `Bearer...${token.substr(-5)}`);

      if (error.response.request._headers && error.response.request._headers.authorization) {
        error.response.request._headers.authorization = error.response.request._headers.authorization.replace(token, `Bearer...${token.substr(-5)}`);
      }

      if (error.response.request._header) {
        error.response.request._header = error.response.request._header.replace(token, `Bearer...${token.substr(-5)}`);
      }
    }

    return Promise.reject(error);
  });
}