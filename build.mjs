import htmlPlugin from '@chialab/esbuild-plugin-html';
import esbuild from 'esbuild';

const config = {
  entryPoints: ['index.html'],
  outdir: 'dist',
  assetNames: 'assets/[name]-[hash]',
  chunkNames: '[ext]/[name]-[hash]',
  plugins: [htmlPlugin()],
  bundle: true,
  logLevel: 'info',
  loader: {
    '.png': 'file',
    '.gif': 'file',
    '.svg': 'file',
  },
};

if (process.argv[2] === 'serve') {
  const context = await esbuild.context({
    ...config,
    sourcemap: true,
  });

  await context.watch();

  await context.serve({
    servedir: 'dist',
  });
} else {
  await esbuild.build({ ...config, minify: true });
}
