export default {
  input: 'src/index.js',
  output: {
    format: 'cjs',
    file: 'lib/index.js',
  },
  external: ['ml-array-normed', 'ml-array-xy-sort-x', 'ml-arrayxy-uniquex'],
};
