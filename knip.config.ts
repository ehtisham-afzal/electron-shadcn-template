import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: ['src/renderer/src/components/ui/**', 'src/renderer/src/routeTree.gen.ts'],
  ignoreDependencies: ["tailwindcss", "tw-animate-css"]
};

export default config;