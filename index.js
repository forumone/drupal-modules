var Promise = require('bluebird'),
  jsdom = Promise.promisifyAll(require('jsdom')),
  wgxpath = require('wgxpath'),
  semver = require('semver'),
  _ = require('lodash');

function getVersions(project) {
  var url = 'https://updates.drupal.org/release-history/' + project + '/all';

  return jsdom.envAsync(url, [], { parsingMode : 'xml' }).then(function(window) {
    wgxpath.install(window);
    var expression = window.document.createExpression('//release');
    var result = expression.evaluate(window.document, wgxpath.XPathResultType.ORDERED_NODE_ITERATOR_TYPE);
    var rows = [];
    
    do {
      var item = result.iterateNext();
      if (item) {
        rows.push(_.reduce(item.childNodes, function(val, node) {
            if (1 == node.nodeType) {
              val[node.nodeName] = node.childNodes[0].nodeValue;
            }
            
            return val;
          }, {}));
      }
    } while (item);
    
    return rows;
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
      // Convert naming from [major]-x.[minor].[patch] to [major].[minor].[patch]
      var version = row.version.replace(/[^\d\.]+/g, '');
      
      if (!semver.valid(version)) {
        version = version + '.0';
      }
      
      if (semver.valid(version)) {
        var major = semver.major(version);
        var minor = semver.minor(version);
        
        if (!_.find(val, { major : major, minor : minor })) {
          val.push({
            major : major,
            minor : minor,
            data : row
          });
        }
      }
      
      return val;
    }, [])
    .map(function(row) {
      return row.data
    })
    .value();
  
    return versions;
  });
}

module.exports = {
    getVersions : getVersions,
    getLatestVersions : getLatestVersions
}