
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tasksphere.app',
  appName: 'TaskSphere',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'android.keystore',
      keystoreAlias: 'tasksphere',
    }
  }
};

export default config;
