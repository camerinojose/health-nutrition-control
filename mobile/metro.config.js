const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Metro on Windows can crash when it starts watching Gradle build intermediates
// (e.g. android/app/build/intermediates/**) due to extended-length paths (\\?\C:\...).
// These folders should never be watched by Metro, so we explicitly block them.
config.resolver.blockList = [
  /android\\.*\\build\\.*/,
  /android\/.*\/build\/.*/,
  /android\\.*\\\.gradle\\.*/,
  /android\/.*\/\.gradle\/.*/,
];

module.exports = config;
