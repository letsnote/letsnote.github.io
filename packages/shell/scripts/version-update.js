/**
 * Update manifest.json to synchronize with package.json.
 */
const fs = require('fs');
const packageObject = JSON.parse(fs.readFileSync('package.json'));
const manifestObject = JSON.parse(fs.readFileSync('manifest.json'));
manifestObject.version = packageObject.version
fs.writeFileSync('manifest.json', JSON.stringify(manifestObject, null, 2));