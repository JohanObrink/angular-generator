var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonPromise = require('sinon-promise'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));
sinonPromise(sinon);

describe('/templatesHelper', function () {
  var templatesHelper, fs, success, fail;

  beforeEach(function () {
    fs = {
      readFile: sinon.stub()
    };
    templatesHelper = proxyquire(process.cwd() + '/lib/templatesHelper', {
      'fs': fs,
      'q': sinonPromise.Q
    });
    success = sinon.spy();
    fail = sinon.spy();
  });

  describe('#getTemplate', function () {
    it('starts by calling readFile on customized folder', function () {
      templatesHelper.getTemplate('custom', 'service', 'template.js');
      expect(fs.readFile).calledOnce.calledWith(process.cwd() + '/custom/service/template.js');
    });
    it('returns the contents of the file', function () {
      var success = sinon.spy();
      var fail = sinon.spy();
      templatesHelper.getTemplate('custom', 'service', 'template.js').then(success).catch(fail);
      fs.readFile.firstCall.yield(null, 'content');

      expect(fail).not.called;
      expect(success).calledOnce.calledWith('content');
    });
    it('falls back to default', function () {
      templatesHelper.getTemplate('custom', 'service', 'template.js');

      fs.readFile.yield('Not found');

      expect(fs.readFile).calledTwice.calledWith(process.cwd() + '/templates/service/template.js');
    });
    it('returns the contents of the fallback file', function () {
      templatesHelper.getTemplate('custom', 'service', 'template.js').then(success).catch(fail);
      fs.readFile.firstCall.yield('Not found');
      fs.readFile.secondCall.yield(null, 'content');

      expect(fail).not.called;
      expect(success).calledOnce.calledWith('content');
    });
  });

  describe('#getTemplates', function () {
    it('gets all files from custom folder', function () {
      templatesHelper.getTemplates('custom', 'service', ['template.js', 'test.js'])
        .then(success).catch(fail);

      expect(fs.readFile)
        .calledTwice
        .calledWith(process.cwd() + '/custom/service/template.js')
        .calledWith(process.cwd() + '/custom/service/test.js');

      fs.readFile.firstCall.yield(null, 'template');
      fs.readFile.secondCall.yield(null, 'test');

      expect(success).calledOnce.calledWith(['template', 'test']);
    });
    it('gets all files from default folder', function () {
      templatesHelper.getTemplates('custom', 'service', ['template.js', 'test.js'])
        .then(success).catch(fail);

      expect(fs.readFile)
        .calledTwice
        .calledWith(process.cwd() + '/custom/service/template.js')
        .calledWith(process.cwd() + '/custom/service/test.js');

      fs.readFile.firstCall.yield('Not found');
      fs.readFile.secondCall.yield('Not found');

      expect(fs.readFile)
        .callCount(4)
        .calledWith(process.cwd() + '/templates/service/template.js')
        .calledWith(process.cwd() + '/templates/service/test.js');

      fs.readFile.getCall(2).yield(null, 'template');
      fs.readFile.getCall(3).yield(null, 'test');

      expect(success).calledOnce.calledWith(['template', 'test']);
    });
    it('gets files from mixed folders', function () {
      templatesHelper.getTemplates('custom', 'service', ['template.js', 'test.js'])
        .then(success).catch(fail);

      expect(fs.readFile)
        .calledTwice
        .calledWith(process.cwd() + '/custom/service/template.js')
        .calledWith(process.cwd() + '/custom/service/test.js');

      fs.readFile.firstCall.yield('Not found');
      fs.readFile.secondCall.yield(null, 'test');

      expect(fs.readFile)
        .callCount(3)
        .calledWith(process.cwd() + '/templates/service/template.js');

      fs.readFile.getCall(2).yield(null, 'template');

      expect(success).calledOnce.calledWith(['template', 'test']);
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