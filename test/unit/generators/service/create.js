var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonPromise = require('sinon-promise'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));
sinonPromise(sinon);

describe('/generators/service', function () {
  var service, init, options, templatesHelper;

  beforeEach(function () {
    options = {
      "templatesFolder": "custom"
    };
    init = {
      load: sinon.promise().resolves(options)
    };
    templatesHelper = {
      getTemplates: sinon.stub()
    };
    service = proxyquire(process.cwd() + '/lib/generators/service', {
      '../init': init,
      '../templatesHelper': templatesHelper
    });
  });
  it('gets templates directory from init', function () {
    service('foo');
    expect(init.load).calledOnce;
  });
  it('gets templates using helper', function () {
    service('foo');
    expect(templatesHelper.getTemplates)
      .calledOnce
      .calledWith('custom', 'service', ['template.js', 'test.js']);
  });
});