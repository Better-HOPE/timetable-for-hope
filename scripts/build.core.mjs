import * as esbuild from 'esbuild'
import { resolve } from 'path'

const preactResolvePlugin = {
	name: 'preact-compat resolver',
	setup(build) {
		build.onResolve({ filter: /^react$/ }, () => {
			return { path: resolve('./node_modules/@preact/compat/index.js') }
		})
		build.onResolve({ filter: /^react-dom$/ }, () => {
			return { path: resolve('./node_modules/@preact/compat/index.js') }
		})
	}
}

await esbuild.build({
    entryPoints: ['src/index.tsx'],
    bundle: true,
    outfile: './build/core/index.js',
    minify: true,
    plugins: [preactResolvePlugin]
});
