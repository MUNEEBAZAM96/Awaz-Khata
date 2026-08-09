const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// This repo can live on an exFAT/network volume, where macOS stores extended
// attributes in AppleDouble sidecars named `._<original>`. Those are binary,
// and expo-router's `require.context` over `app/` otherwise picks up
// `app/._layout.tsx` as a route, failing the bundle with a SyntaxError.
const APPLE_DOUBLE = /(^|[\\/])\._[^\\/]*$/;

config.resolver.blockList = config.resolver.blockList
  ? [].concat(config.resolver.blockList, APPLE_DOUBLE)
  : [APPLE_DOUBLE];

module.exports = config;
