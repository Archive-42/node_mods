import isPlainObject from 'lodash.isplainobject';

/**
 * Handles errors received from the server. Parses the error into a more useful
 * format, places it in an exception and throws it.
 * See https://www.contentful.com/developers/docs/references/errors/
 * for more details on the data received on the errorResponse.data property
 * and the expected error codes.
 * @private
 */
export default function errorHandler(errorResponse) {
  var config = errorResponse.config,
      response = errorResponse.response;
  var errorName; // Obscure the Management token

  if (config && config.headers && config.headers['Authorization']) {
    var token = "...".concat(config.headers['Authorization'].substr(-5));
    config.headers['Authorization'] = "Bearer ".concat(token);
  }

  if (!isPlainObject(response) || !isPlainObject(config)) {
    throw errorResponse;
  }

  var data = response === null || response === void 0 ? void 0 : response.data;
  var errorData = {
    status: response === null || response === void 0 ? void 0 : response.status,
    statusText: response === null || response === void 0 ? void 0 : response.statusText,
    message: '',
    details: {}
  };

  if (isPlainObject(config)) {
    errorData.request = {
      url: config.url,
      headers: config.headers,
      method: config.method,
      payloadData: config.data
    };
  }

  if (data && isPlainObject(data)) {
    if ('requestId' in data) {
      errorData.requestId = data.requestId || 'UNKNOWN';
    }

    if ('message' in data) {
      errorData.message = data.message || '';
    }

    if ('details' in data) {
      errorData.details = data.details || {};
    }

    if ('sys' in data) {
      if ('id' in data.sys) {
        errorName = data.sys.id;
      }
    }
  }

  var error = new Error();
  error.name = errorName && errorName !== 'Unknown' ? errorName : "".concat(response === null || response === void 0 ? void 0 : response.status, " ").concat(response === null || response === void 0 ? void 0 : response.statusText);

  try {
    error.message = JSON.stringify(errorData, null, '  ');
  } catch (_unused) {
    var _errorData$message;

    error.message = (_errorData$message = errorData === null || errorData === void 0 ? void 0 : errorData.message) !== null && _errorData$message !== void 0 ? _errorData$message : '';
  }

  throw error;
}