var Promise = require('bluebird'),
  jsdom = Promise.promisifyAll(require('jsdom')),
  wgxpath = require('wgxpath'),
  semver = require('semver'),
  _ = require('lodash');

function retrieveProjectHistoryFile(project) {
  var url = 'https://updates.drupal.org/release-history/' + project + '/all';
  return jsdom.envAsync(url, [], { parsingMode : 'xml' });
}

function getProjectHistory(project) {
  return retrieveProjectHistoryFile(project).then(function(window) {
    wgxpath.install(window);
    var expression = window.document.createExpression('//release');
    var result = expression.evaluate(window.document, wgxpath.XPathResultType.ORDERED_NODE_ITERATOR_TYPE);
    var rows = [];

    do {
      var item = result.iterateNext();
      if (item) {
        rows.push(_.reduce(item.childNodes, function(val, node) {
            if (node.childNodes.length > 0 && 1 == node.nodeType) {
              val[node.nodeName] = node.childNodes[0].nodeValue;
            }

            return val;
          }, {}));
      }
    } while (item);
    
    return rows;
  });
}

function getVersions(project) {
  var url = 'https://updates.drupal.org/release-history/' + project + '/all';

  return getProjectHistory(project).then(function(rows) {
    var releases = rows.map(function(row) {
      var version = row.version;
      
      // If there is a version_extra, e.g. rc3, dev, etc. remove it
      if (_.has(row, 'version_extra')) {
        version = version.replace(row.version_extra, '');
      }
      
      // Next remove tails for branches that look like 7.x-2.x-dev
      version = version.replace(/\.x-$/g, '').replace(/x-/g, '');
      
      // Next remove any non-numeric, non-decimal separators
      version = version.replace(/[^\d\.]+/g, '');
      
      if (!semver.valid(version)) {
        version = version + '.0';
      }
      
      if (semver.valid(version)) {
        row.version_major = semver.major(version);
        row.version_minor = semver.minor(version);
        
        // Dev releases should not have a patch version
        if (!_.has(row, 'version_extra') || 'dev' !== row.version_extra) {
          row.version_patch = semver.patch(version);
        }
      }
      
      return row;
    });
    
    
    return releases;
  });
}

function getLatestVersions(project) {
  return getVersions(project).then(function(rows) {
    var versions = _.chain(rows)
    // Only return releases
    .filter(function(row) {
      return _.has(row, 'version_patch')
    })
    .reduce(function(val, row) {
      if (!_.find(val, { version_major : row.version_major, version_minor : row.version_minor, version_patch : row.version_patch })) {
        val.push(row);
      }
      
      return val;
    }, [])
    .value();
  
    return versions;
  });
}

function getLatestMinorVersions(project) {
  return getVersions(project).then(function(rows) {
    var versions = _.chain(rows)
    // Only return releases
    .filter(function(row) {
      return _.has(row, 'version_patch')
    })
    .reduce(function(val, row) {
      if (!_.find(val, { version_major : row.version_major, version_minor : row.version_minor })) {
        val.push(row);
      }
      
      return val;
    }, [])
    .value();
  
    return versions;
  });
}

module.exports = {
    getVersions : getVersions,
    getLatestVersions : getLatestVersions,
    getLatestMinorVersions : getLatestMinorVersions
}