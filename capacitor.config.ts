
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.91783fc5aff5407b96899d39cdd34e3f',
  appName: 'VideoCall App',
  webDir: 'dist',
  server: {
    url: 'https://91783fc5-aff5-407b-9689-9d39cdd34e3f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: null,
      keystoreAlias: null,
      keystorePassword: null,
      keystoreAliasPassword: null,
      signingType: null,
    }
  }
};

export default config;
