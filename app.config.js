require('dotenv').config();

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "Century Tree Transit",
    slug: "bus",
    version: "1.0.8",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "ctt",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.csmeby.ctt",
      buildNumber: "4",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSAppTransportSecurity: {
          NSExceptionDomains: {
            "147.224.136.252": {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSIncludesSubdomains: false
            }
          }
        }
      }
    },
    android: {
      package: "com.csmeby.ctt",
      adaptiveIcon: {
        backgroundColor: "#58121D",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-blank.png",
          backgroundColor: "#F2F2F7",
          dark: {
            backgroundColor: "#0D0D0E"
          }
        }
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission: "Used to set your starting point in Plan a Ride and show your position on the map."
        }
      ],
      [
        "expo-notifications",
        {
          mode: "production"
        }
      ],
      [
        "react-native-maps",
        {
          androidGoogleMapsApiKey: googleMapsApiKey,
          iosGoogleMapsApiKey: googleMapsApiKey
        }
      ],
      // Android equivalent of ios.infoPlist's NSExceptionDomains above -
      // Android blocks plaintext HTTP by default (targetSdkVersion 36
      // here), which was silently failing every fetch() to API_BASE
      // (http://147.224.136.252:5000, no TLS) and showing as permanent
      // "No connection. Showing saved routes" on Android specifically. See
      // plugins/withAndroidNetworkSecurityConfig.js and
      // network-security-config.xml for why this is scoped to just that
      // one IP rather than a blanket cleartext allowance.
      "./plugins/withAndroidNetworkSecurityConfig"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "05aa43b9-321c-48fb-a109-1300a7d3ccdc"
      }
    },
    owner: "csmeby"
  }
};
