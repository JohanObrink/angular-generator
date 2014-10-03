var q = require('q');

module.exports = function (name) {
  return q.fcall(console.log.bind(console, 'filter', name));
};