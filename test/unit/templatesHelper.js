var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonPromise = require('sinon-promise'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));
sinonPromise(sinon);

describe('/templatesHelper', function () {
  var templatesHelper, fs, init, options, success, fail;

  beforeEach(function () {
    fs = {
      readdir: sinon.stub(),
      readFile: sinon.stub(),
      writeFile: sinon.stub()
    };
    options = {
      templatesFolder: 'custom'
    };
    init = {
      load: sinon.promise().resolves(options)
    };
    templatesHelper = proxyquire(process.cwd() + '/lib/templatesHelper', {
      'fs': fs,
      'q': sinonPromise.Q,
      './init': init
    });
    success = sinon.spy();
    fail = sinon.spy();
  });

  describe('#listTemplates', function () {
    it('first gets the options from init', function () {
      templatesHelper.listTemplates('service');
      expect(init.load).calledOnce;
    });
    it('caches options from init', function () {
      templatesHelper.listTemplates('service');
      templatesHelper.listTemplates('service');
      expect(init.load).calledOnce;
    });
    it('starts by listing the the files of the default folder and then the customized', function () {
      templatesHelper.listTemplates('service');
      fs.readdir.firstCall.yield(null, []);
      expect(fs.readdir).calledTwice;
      expect(fs.readdir, 'default').calledWith(process.cwd() + '/templates/service');
      expect(fs.readdir, 'custom').calledWith(process.cwd() + '/custom/service');
    });
    it('filters files prioritizing customized', function () {
      templatesHelper.listTemplates('service').then(success).catch(fail);
      fs.readdir.firstCall.yield(null, ['foo.js', 'bar.js']);
      fs.readdir.secondCall.yield(null, ['bar.js', 'baz.js']);
      expect(fail).not.called;
      expect(success).calledOnce;
      var result = success.firstCall.args[0];
      expect(result).to.have.length(3);
    });
    it('works without customized folder', function () {
      templatesHelper.listTemplates('service').then(success).catch(fail);
      fs.readdir.firstCall.yield(null, ['foo.js', 'bar.js']);
      fs.readdir.secondCall.yield('ENOENT');
      expect(fail).not.called;
      expect(success).calledOnce;
      var result = success.firstCall.args[0];
      expect(result).to.have.length(2);
    });
  });

  describe('#getTemplates', function () {
    it('loads all files from listTemplates', function () {
      templatesHelper.getTemplates('service', {module: 'm', name: 'n'}).then(success).catch(fail);

      fs.readdir.firstCall.yield(null, ['foo.js', 'test.js']);
      fs.readdir.secondCall.yield(null, ['bar.js', 'test.js']);

      expect(fs.readFile).calledThrice;
      expect(fs.readFile).calledWith(process.cwd() + '/templates/service/foo.js');
      expect(fs.readFile).calledWith(process.cwd() + '/custom/service/bar.js');
      expect(fs.readFile).calledWith(process.cwd() + '/custom/service/test.js');
    });
    it('adds file and rendered content to the templates', function () {
      templatesHelper.getTemplates('service', {module: 'm', name: 'n'}).then(success).catch(fail);

      fs.readdir.firstCall.yield(null, ['foo.js', 'test.js']);
      fs.readdir.secondCall.yield(null, ['bar.js', 'test.js']);

      fs.readFile.firstCall.yield(null, '//{{module}} {{name}}');
      fs.readFile.secondCall.yield(null, '//bar');
      fs.readFile.thirdCall.yield(null, '//test');

      var expected = [
        {
          name: 'foo.js',
          path: process.cwd() + '/templates/service/foo.js',
          template: '//{{module}} {{name}}',
          content: '//m n'
        },
        {
          name: 'bar.js',
          path: process.cwd() + '/custom/service/bar.js',
          template: '//bar',
          content: '//bar'
        },
        {
          name: 'test.js',
          path: process.cwd() + '/custom/service/test.js',
          template: '//test',
          content: '//test'
        }
      ];

      expect(fail).not.call;
      expect(success).calledOnce.calledWith(expected);
    });
  });

  describe('#render', function () {
    it('replaces variables with passed in values', function () {
      var result = templatesHelper.render('Hello you {{foo}}, I {{verb}} you!', {
        foo: 'herp',
        verb: 'derp'
      });
      expect(result).to.equal('Hello you herp, I derp you!');
    });
  });
});