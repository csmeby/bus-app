const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Android blocks plaintext (HTTP) network traffic by default for any app
// targeting API 28+ (this app targets 36) - every fetch() to API_BASE (see
// lib/api-base.ts: http://147.224.136.252:5000, plain HTTP, no TLS cert for
// a bare IP) was silently failing on Android as a result, surfacing as a
// permanent "No connection. Showing saved routes" banner on Android only
// (iOS already has its own scoped exception for the same IP, see
// app.config.js's ios.infoPlist.NSAppTransportSecurity.NSExceptionDomains).
//
// expo-build-properties doesn't expose a networkSecurityConfig option (as
// of 1.0.10 - checked its plugin schema directly, it only covers SDK/build
// tool versions and a few Gradle knobs), so this is a small local config
// plugin instead: copies network-security-config.xml into the generated
// Android project's res/xml/ and points AndroidManifest.xml's <application>
// tag at it. Scoped to just the one backend IP, same as the iOS exception -
// not a blanket cleartext allowance for every domain the app might ever
// talk to.
module.exports = function withAndroidNetworkSecurityConfig(config) {
  config = withDangerousMod(config, [
    'android',
    async config => {
      const src = path.join(config.modRequest.projectRoot, 'network-security-config.xml');
      const destDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, path.join(destDir, 'network_security_config.xml'));
      return config;
    },
  ]);

  return withAndroidManifest(config, config => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) {
      throw new Error('withAndroidNetworkSecurityConfig: <application> tag not found in AndroidManifest.xml');
    }
    application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return config;
  });
};
