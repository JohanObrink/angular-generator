var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonPromise = require('sinon-promise'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));
sinonPromise(sinon);

describe('/generators/service', function () {
  var service, init, options, fileHelper, files, fs;

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
    fileHelper = {
      getTemplates: sinon.promise().resolves(files),
      saveFile: sinon.promise().resolves()
    };
    fs = {
      writeFile: sinon.stub()
    };

    var mocks = {
      'fs': fs,
      'q': sinonPromise.Q,
      '../init': init,
      '../fileHelper': fileHelper
    };

    service = proxyquire(process.cwd() + '/lib/generators/service', mocks);
  });
  it('gets templates from fileHelper', function () {
    service('foo');
    expect(fileHelper.getTemplates).calledOnce.calledWith('service', {
      module: 'angular-generator',
      name: 'foo',
      filename: 'foo'
    });
  });
  it('saves the files', function () {
    service('foo');
    expect(fileHelper.saveFile).calledTwice;
    expect(fileHelper.saveFile).calledWith(process.cwd() + '/src/service/foo.js', files[0].content);
    expect(fileHelper.saveFile).calledWith(process.cwd() + '/test/unit/service/foo.js', files[1].content);
  });
});