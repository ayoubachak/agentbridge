const typescript = require('rollup-plugin-typescript2');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const pkg = require('./package.json');

const input = 'src/index.ts';
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'rxjs/operators'
];

module.exports = [
  // CommonJS build
  {
    input,
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    external,
    plugins: [
      typescript({
        typescript: require('typescript'),
        tsconfigOverride: {
          compilerOptions: {
            module: 'ES2015'
          }
        }
      }),
      nodeResolve(),
      commonjs(),
      terser()
    ]
  },
  // ESM build
  {
    input,
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    },
    external,
    plugins: [
      typescript({
        typescript: require('typescript'),
        tsconfigOverride: {
          compilerOptions: {
            module: 'ES2015'
          }
        }
      }),
      nodeResolve(),
      commonjs()
    ]
  }
]; 