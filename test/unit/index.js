var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));

describe('/index', function () {
  var generator;
  var gulp, yargs, alias, argv;
  var init, generators;

  beforeEach(function () {
    gulp = {
      task: sinon.stub()
    };

    argv = {};

    var alias = sinon.stub();
    alias.returns({ alias: alias, argv: argv });

    var yargs = {
      alias: alias,
      argv: argv
    };

    init = sinon.stub();

    generators = {
      partial: sinon.stub(),
      controller: sinon.stub(),
      service: sinon.stub(),
      directive: sinon.stub(),
      filter: sinon.stub(),
      model: sinon.stub(),
      constant: sinon.stub()
    };

    generator = proxyquire(process.cwd() + '/lib/', {
      'gulp': gulp,
      'yargs': yargs,
      './init': init,
      './generators/partial': generators.partial,
      './generators/controller': generators.controller,
      './generators/service': generators.service,
      './generators/directive': generators.directive,
      './generators/filter': generators.filter,
      './generators/model': generators.model,
      './generators/constant': generators.constant,
    });

    sinon.stub(process, 'nextTick').yields();
  });
  afterEach(function () {
    process.nextTick.restore();
  });

  it('calls all succesful commands in series', function () {
    init.returns();
    generators.partial.returns();

    argv.init = null;
    argv.partial = 'foo';

    var success = sinon.spy();
    var fail = sinon.spy();
    generator.generate().then(success).catch(fail);

    expect(init).calledOnce;
    expect(generators.partial).calledOnce;

    expect(fail, 'fail').not.called;
    expect(success, 'success').calledOnce.calledWith(undefined);
  });

  it('halts execution of series on fail', function () {
    var err = new Error('b0rked');
    init.throws(err);
    generators.partial.returns();

    argv.init = null;
    argv.partial = 'foo';

    var success = sinon.spy();
    var fail = sinon.spy();
    generator.generate().then(success).catch(fail);

    expect(init).calledOnce;
    expect(generators.partial).not.called;

    expect(fail, 'fail').calledOnce.calledWith(err);
    expect(success, 'success').not.called;
  });
});