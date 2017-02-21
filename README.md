# drupal-modules
Retrieves information about Drupal modules.

## Functions provided
- `retrieveProjectHistoryFile(project)`
- `getProjectHistory(project)`
- `getVersions(project)`
- `getLatestVersions(project)`
- `getLatestMinorVersions(project)

## Usage
```javascript
var drupal-modules = require('drupal-modules');

promise = drupal_modules.getVersions('gesso')
.then(function(versions) {
  var url = _.find(versions, { version_major : 8, version_minor : 1 }).download_link;
  return that.remoteAsync(url, true);
});
```
