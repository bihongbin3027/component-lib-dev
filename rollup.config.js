import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import filesize from 'rollup-plugin-filesize';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import packageJson from './package.json';
import antdVars from './antd-vars.json';

export default {
  input: 'components/index.ts',
  output: [
    {
      file: packageJson.module,
      format: 'cjs',
      sourcemap: false,
      globals: {
        react: 'react',
        'react-dom': 'react-dom',
      },
    },
  ],
  plugins: [
    peerDepsExternal(),
    filesize(),
    resolve(),
    commonjs(),
    terser(), // 压缩js
    postcss({
      // Minimize CSS, boolean or options for cssnano.
      minimize: true,
      // Enable sourceMap.
      sourceMap: false,
      // This plugin will process files ending with these extensions and the extensions supported by custom loaders.
      extensions: ['.less', '.css'],
      use: [
        [
          'less',
          {
            javascriptEnabled: true,
            modifyVars: antdVars,
          },
        ],
      ],
    }),
    typescript({ tsconfig: 'tsconfig.json' }),
  ],
};
