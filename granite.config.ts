import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';
import { router } from '@granite-js/plugin-router';

export default defineConfig({
  appName: 'mealsnap',
  scheme: 'intoss',
  entryFile: './src/_app.tsx',
  plugins: [
    router(),
    appsInToss({
      brand: {
        displayName: '하루세끼',
        primaryColor: '#FF6B35',
        icon: 'https://static.toss.im/icons/app-icon.png', // TODO: 실제 아이콘 URL로 교체
      },
      permissions: [
        { name: 'camera', access: 'access' },
      ],
    }),
  ],
});
