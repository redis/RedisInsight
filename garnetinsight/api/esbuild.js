const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();
const { dependencies } = require('../package.json');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const outDir = 'dist-minified';
const define = {
  'process.env.NODE_ENV': JSON.stringify(
    production ? 'production' : 'development',
  ),
};

const external = [
  '@nestjs/microservices',
  '@fastify/static',
  'class-transformer',
  // packages with binaries
  ...Object.keys(dependencies),
];

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['dist/src/main.js'],
    bundle: true,
    format: 'cjs',
    minifyWhitespace: true,
    // if true - some nestjs decorators are not working
    minifyIdentifiers: false,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: `${outDir}/main.js`,
    define,
    external,
    logLevel: 'silent',
    plugins: [
      /* add to the end of plugins array */
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      esbuildProblemMatcherPlugin,
    ],
  });
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

function copySource(source, destination) {
  try {
    if (fs.pathExistsSync(source)) {
      fs.copySync(source, destination);
    }
  } catch (error) {
    console.error('✘ [esbuild ERROR copySource]', error);
  }
}

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.debug('[esbuild] build started');
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [esbuild ERROR] ${text}`);
        console.error(
          `    ${location.file}:${location.line}:${location.column}:`,
        );
      });
      console.debug('[esbuild] build finished');

      copySource(
        path.resolve(__dirname, 'defaults'),
        path.resolve(__dirname, outDir, 'defaults'),
      );
      console.debug('[esbuild] copied "defaults" folder');
    });
  },
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
