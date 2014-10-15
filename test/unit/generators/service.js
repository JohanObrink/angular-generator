var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonPromise = require('sinon-promise'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));
sinonPromise(sinon);

describe('/generators/service', function () {
  var service, init, options, templatesHelper, files, fs;

  beforeEach(function () {
    options = {
      module: 'angular-generator',
      sourceFolder: 'src',
      testFolder: 'test'
    };
    init = {
      load: sinon.promise().resolves(options)
    };
    files = [
      {
        name: 'template.js',
        path: '/foo/bar/template.js',
        template: 'module(\'{{module}}\').service(\'{{name}}\');',
        content: 'module(\'angular-generator\').service(\'foo\');'
      },
      {
        name: 'test.js',
        path: '/foo/bar/test.js',
        template: 'describe(\'{{name}}\');',
        content: 'describe(\'foo\');'
      }
    ];
    templatesHelper = {
      getTemplates: sinon.promise().resolves(files)
    };
    fs = {
      writeFile: sinon.stub()
    };

    var mocks = {
      'fs': fs,
      'q': sinonPromise.Q,
      '../init': init,
      '../templatesHelper': templatesHelper
    };

    service = proxyquire(process.cwd() + '/lib/generators/service', mocks);
  });
  it('gets templates from templatesHelper', function () {
    service('foo');
    expect(templatesHelper.getTemplates).calledOnce.calledWith('service', {
      module: 'angular-generator',
      name: 'foo',
      filename: 'foo'
    });
  });
  it('saves the files', function () {
    service('foo');
    expect(fs.writeFile).calledTwice;
    expect(fs.writeFile).calledWith(process.cwd() + '/src/service/foo.js', files[0].content);
    expect(fs.writeFile).calledWith(process.cwd() + '/test/unit/service/foo.js', files[1].content);
  });
  it('returns true on success', function () {
    var success = sinon.spy(), fail = sinon.spy();
    fs.writeFile.yields(null, {});
    service('foo').then(success).catch(fail);
    expect(fail).not.called;
    expect(success).calledOnce.calledWith(true);
  });
});