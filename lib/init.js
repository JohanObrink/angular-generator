var q = require('q');

module.exports = function () {
  return q.fcall(console.log.bind(console, 'init'));
};