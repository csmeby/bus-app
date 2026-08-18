// Expo's generated android/app/build.gradle signs the "release" build type
// with the shared, public debug keystore by default (its own comment
// literally says "Caution! In production, you need to generate your own
// keystore file.") — that still installs fine, but it's not a private
// signing identity, so this swaps it for a real release signingConfig
// sourced from the ANDROID_RELEASE_KEYSTORE_* env vars the workflow's build
// step provides. Run from the android/ directory, after `expo prebuild`
// (which regenerates android/ from scratch every time, so there's nothing
// to persist between runs) and before `./gradlew assembleRelease`.
//
// Patches the file's text directly rather than something more structured,
// and fails loudly if Expo's template ever changes shape, rather than
// silently shipping a debug-signed "release" APK.
const fs = require('fs');

const path = 'app/build.gradle';
let g = fs.readFileSync(path, 'utf8');

const debugOnlyConfigs = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;
const withReleaseConfig = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file(System.getenv("ANDROID_RELEASE_KEYSTORE_PATH"))
            storePassword System.getenv("ANDROID_RELEASE_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_RELEASE_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_RELEASE_KEY_PASSWORD")
        }
    }`;
if (!g.includes(debugOnlyConfigs)) {
  throw new Error(
    "Expected signingConfigs block not found in android/app/build.gradle - " +
    "Expo's generated template must have changed shape; update this script to match."
  );
}
g = g.replace(debugOnlyConfigs, withReleaseConfig);

const releaseUsesDebug = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;
const releaseUsesRelease = `        release {
            signingConfig signingConfigs.release`;
if (!g.includes(releaseUsesDebug)) {
  throw new Error(
    "Expected release buildType block not found in android/app/build.gradle - " +
    "Expo's generated template must have changed shape; update this script to match."
  );
}
g = g.replace(releaseUsesDebug, releaseUsesRelease);

fs.writeFileSync(path, g);
console.log('build.gradle patched: release builds now sign with signingConfigs.release.');
