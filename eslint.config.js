import { defineConfig, globalIgnores } from 'eslint/config';
import configs from 'eslint-config-cheminfo-typescript';

export default defineConfig(
  globalIgnores(['coverage', 'lib', 'dist', 'docs']),
  ...configs,
);
