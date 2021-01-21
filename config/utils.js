const DEFAULT = require('./DEFAULT');

function typeOf(arg) {
  return Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
}

function getValidParams(params) {
  return typeOf(params) === 'object' ? params : undefined;
}

function getBrowsersList(browsersList) {
  if (Array.isArray(browsersList) && browsersList.every(item => typeof item === 'string')) {
    return {
      browsers: browsersList,
    };
  } else if (
    typeOf(browsersList) === 'object'
    &&
    Array.isArray(browsersList[process.env.NODE_ENV])
    &&
    browsersList[process.env.NODE_ENV].every(item => typeof item === 'string')
  ) {
    return {
      browsers: browsersList[process.env.NODE_ENV],
    };
  }

  return {
    browsers: DEFAULT.BROWSERS_LIST,
  };
}

module.exports = {
  typeOf,
  getValidParams,
  getBrowsersList,
};