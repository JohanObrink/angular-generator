var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonPromise = require('sinon-promise'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));
sinonPromise(sinon);

describe('/scriptHelper', function () {
  var scriptHelper, fs, init, options;

  beforeEach(function () {
    options = {
      module: 'generator',
      sourceFolder: 'src',
      testFolder: 'test'
    };
    init = {
      load: sinon.promise().resolves(options)
    };
    fs = {
      readFile: sinon.stub(),
      writeFile: sinon.stub()
    };
    scriptHelper = proxyquire(process.cwd() + '/lib/scriptHelper', {
      'fs': fs,
      'q': sinonPromise.Q,
      './init': init
    });
  });

  describe('#insertIn', function () {
    it('inserts text above delimiter', function () {
      var tmpl = [
        '<!-- service -->',
        '<!-- /service -->'
      ].join('\n');
      var script = '<script src="service/foo.js"></script>';
      var expected = [
        '<!-- service -->',
        '<script src="service/foo.js"></script>',
        '<!-- /service -->'
      ].join('\n');
      var result = scriptHelper.insertIn(tmpl, script, 'service');
      expect(result).to.equal(expected);
    });
  });

  describe('#insertScript', function () {
    it('tries to load app and test .html', function () {
      scriptHelper.insertScript('service', 'foo.js').catch(console.error.bind(console));
      expect(fs.readFile).calledTwice;
      expect(fs.readFile).calledWith(process.cwd() + '/index.html', {encoding:'utf8'});
      expect(fs.readFile).calledWith(process.cwd() + '/test/unit/index.html', {encoding:'utf8'});
    });
    it('loads default app html if it does not exist', function () {
      scriptHelper.insertScript('service', 'foo.js').catch(console.error.bind(console));

      fs.readFile.firstCall.yield('ENOENT');
      fs.readFile.secondCall.yield(null, '<html />');

      expect(fs.readFile).calledThrice.calledWith(process.cwd() + '/templates/app.html');
    });
    it('creates app html if it does not exist', function () {
      scriptHelper.insertScript('service', 'foo.js').catch(console.error.bind(console));

      fs.readFile.firstCall.yield('ENOENT');
      fs.readFile.secondCall.yield(null, '<html />');

      fs.readFile.thirdCall.yield(null, '<html ngApp="<%= module %>" />');

      expect(fs.writeFile).calledOnce.calledWith(process.cwd() + '/index.html', '<html ngApp="generator" />');
    });
    it('loads default test html if it does not exist', function () {
      scriptHelper.insertScript('service', 'foo.js').catch(console.error.bind(console));

      fs.readFile.firstCall.yield(null, '<html />');
      fs.readFile.secondCall.yield('ENOENT');

      expect(fs.readFile).calledThrice.calledWith(process.cwd() + '/templates/test.html');
    });
    it('creates test html if it does not exist', function () {
      scriptHelper.insertScript('service', 'foo.js').catch(console.error.bind(console));

      fs.readFile.firstCall.yield(null, '<html />');
      fs.readFile.secondCall.yield('ENOENT');

      fs.readFile.thirdCall.yield(null, '<html ngApp="<%= module %>" />');

      expect(fs.writeFile).calledOnce.calledWith(process.cwd() + '/test/unit/index.html', '<html ngApp="generator" />');
    });
    it('inserts a script tag in .html and saved it', function () {
      var tmpl = [
        '<html>',
        '  <body>',
        '    <!-- service -->',
        '    <!-- /service -->',
        '',
        '    <!-- service test -->',
        '    <!-- /service test -->',
        '  </body>',
        '</html>'
      ].join('\n');
      var expectedApp = [
        '<html>',
        '  <body>',
        '  <!-- service -->',
        '    <script src="service/foo.js"></script>',
        '    <!-- /service -->',
        '',
        '    <!-- service test -->',
        '    <!-- /service test -->',
        '  </body>',
        '</html>'
      ].join('\n');
      var expectedTest = [
        '<html>',
        '  <body>',
        '    <!-- service -->',
        '    <script src="../../service/foo.js"></script>',
        '    <!-- /service -->',
        '',
        '    <!-- service test -->',
        '    <script src="service/foo.js"></script>',
        '    <!-- /service test -->',
        '  </body>',
        '</html>'
      ].join('\n');

      fs.readFile.yields(null, tmpl);

      scriptHelper.insertScript('service', 'foo.js').catch(console.error.bind(console));

      expect(fs.writeFile).calledTwice;
      expect(fs.writeFile).calledWith(process.cwd() + '/index.html', expectedApp);
      expect(fs.writeFile).calledWith(process.cwd() + '/test/unit/index.html');
    });
  });
});