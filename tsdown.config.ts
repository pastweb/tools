import { defineConfig } from 'tsdown';
import { preserveDirectives } from 'rollup-plugin-preserve-directives';

export default defineConfig({
  clean: true,
  entry: 'src/**/*.ts',
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  unbundle: true,
  plugins: [
    preserveDirectives({
      include: ['use client', 'use server'],
    }),
  ],
  copy: [
    {
      from: 'src/**/*.{css,scss,sass,less}',
      to: 'dist',
      flatten: false,
    },
  ],
  exports: {
    customExports: {
      // SCSS / Style exports
      './*.scss': {
        import: './dist/*.scss',
        require: './dist/*.scss',
        style: './dist/*.scss',
      },
      './**/*.scss': {
        import: './dist/**/*.scss',
        require: './dist/**/*.scss',
        style: './dist/**/*.scss',
      },
    },
    exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
  },
});
