var Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs')),
  path = require('path'),
  sinon = require('sinon'),
  assert = require('assert'),
  _ = require('lodash'),
  rewire = require('rewire'),
  drupal_module = rewire('../index.js'),
  jsdom = Promise.promisifyAll(require('jsdom'));

require('sinon-as-promised')(Promise);

describe('drupal', function() {
  var oldFunction;
  
  // Ensure we stub out retrieveProjectHistoryFile to avoid HTTP request to drupal.org
  before(function() {
    var stub = sinon.stub();
    stub.returns(fs.readFileAsync(path.resolve(__dirname, './data/drupal.xml'), 'utf8').then(function(text) {
      return jsdom.envAsync(text, [], { parsingMode : 'xml' });
    }));
    
    oldFunction = drupal_module.__get__('retrieveProjectHistoryFile');
    
    drupal_module.__set__('retrieveProjectHistoryFile', stub);
  });

  after(function() {
    drupal_module.__set__('retrieveProjectHistoryFile', oldFunction);
  });

  describe('getVersions', function() {
    it('I should have one 7.50 release', function() {
      return drupal_module.getVersions('drupal')
      .then(function(releases) {
        assert.equal(_.filter(releases, { version_major : 7, version_minor : 50 }).length, 1);
      });
    });
    
    it('I should have more than one 8.1.0 releases', function() {
      return drupal_module.getVersions('drupal')
      .then(function(releases) {
        assert.ok((_.filter(releases, { version_major : 8, version_minor : 1, version_patch : 0 }).length > 1));
      });
    });
  });
  
  describe('getLatestVersions', function() {
    it('I should have one 7.50 release', function() {
      return drupal_module.getLatestVersions('drupal')
      .then(function(releases) {
        assert.equal(_.filter(releases, { version_major : 7, version_minor : 50 }).length, 1);
      });
    });
  
    
    it('I should have one 8.1.0 releases', function() {
      return drupal_module.getLatestVersions('drupal')
      .then(function(releases) {
        assert.equal(_.filter(releases, { version_major : 8, version_minor : 1, version_patch : 0 }).length, 1);
      });
    });
  });
  
  describe('getLatestMinorVersions', function() {
    it('I should have one 7.50 release', function() {
      return drupal_module.getLatestMinorVersions('drupal')
      .then(function(releases) {
        assert.equal(_.filter(releases, { version_major : 7, version_minor : 50 }).length, 1);
      });
    });
  
    
    it('I should have one 8.1.x release', function() {
      return drupal_module.getLatestMinorVersions('drupal')
      .then(function(releases) {
        assert.equal(_.filter(releases, { version_major : 8, version_minor : 1 }).length, 1);
      });
    });
  });
});

describe('gesso', function() {
  var oldFunction;
  
  // Ensure we stub out retrieveProjectHistoryFile to avoid HTTP request to drupal.org
  before(function() {
    var stub = sinon.stub();
    stub.returns(fs.readFileAsync(path.resolve(__dirname, './data/gesso.xml'), 'utf8').then(function(text) {
      return jsdom.envAsync(text, [], { parsingMode : 'xml' });
    }));
    
    oldFunction = drupal_module.__get__('retrieveProjectHistoryFile');
    
    drupal_module.__set__('retrieveProjectHistoryFile', stub);
  });

  after(function() {
    drupal_module.__set__('retrieveProjectHistoryFile', oldFunction);
  });

  describe('getVersions', function() {
    it('I should have one 7.2.0 release', function() {
      return drupal_module.getVersions('gesso')
      .then(function(releases) {
        assert.equal(_.filter(releases, { version_major : 7, version_minor : 2, version_patch : 0 }).length, 1);
      });
    });
    
    it('I should have more than one 7.2 releases', function() {
      return drupal_module.getVersions('gesso')
      .then(function(releases) {
        assert.ok((_.filter(releases, { version_major : 7, version_minor : 2 }).length > 1));
      });
    });
    
    it('I should have more than one 7.1 releases', function() {
      return drupal_module.getVersions('gesso')
      .then(function(releases) {
        assert.ok((_.filter(releases, { version_major : 7, version_minor : 1 }).length > 1));
      });
    });
    
    it('I should have one 8.1 release', function() {
      return drupal_module.getVersions('gesso')
      .then(function(releases) {
        assert.equal(_.filter(releases, { version_major : 8, version_minor : 1 }).length, 1);
      });
    });
  });
  
  describe('getLatestVersions', function() {
    it('I should have one 7.2 release', function() {
      return drupal_module.getLatestVersions('gesso')
      .then(function(releases) {
        assert.equal(_.filter(releases, { version_major : 7, version_minor : 2 }).length, 1);
      });
    });
  
    
    it('I should have more than one 7.1 releases', function() {
      return drupal_module.getLatestVersions('gesso')
      .then(function(releases) {
        assert.ok((_.filter(releases, { version_major : 7, version_minor : 1 }).length > 1));
      });
    });
    
    it('I should have no 8.1 releases', function() {
      return drupal_module.getLatestVersions('gesso')
      .then(function(releases) {
        assert.equal(_.filter(releases, { version_major : 8, version_minor : 1 }).length, 0);
      });
    });
  });
  
  describe('getLatestMinorVersions', function() {
    it('I should have one 7.2 release', function() {
      return drupal_module.getLatestMinorVersions('gesso')
      .then(function(releases) {
        assert.equal(_.filter(releases, { version_major : 7, version_minor : 2 }).length, 1);
      });
    });
  
    
    it('I should have one 7.1 release', function() {
      return drupal_module.getLatestMinorVersions('gesso')
      .then(function(releases) {
        assert.equal(_.filter(releases, { version_major : 7, version_minor : 1 }).length, 1);
      });
    });
  });
});