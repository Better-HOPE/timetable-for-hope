import * as esbuild from 'esbuild'
import { resolve } from 'path'

const preactResolvePlugin = {
	name: 'preact-compat resolver',
	setup(build) {
		build.onResolve({ filter: /^react$/ }, () => {
			return { path: resolve('./node_modules/preact/compat/dist/compat.mjs') }
		})
		build.onResolve({ filter: /^react-dom$/ }, () => {
			return { path: resolve('./node_modules/preact/compat/dist/compat.mjs') }
		})
	}
}

const browserExtensionPolyfillResolvePlugin = {
	name: 'webextension-polyfill-ts resolver',
	setup(build) {
		build.onResolve({ filter: /^webextension-polyfill-ts$/ }, () => {
			return { path: ["firefox", "chromium"].includes(process.env.TARGET) ? undefined : resolve('./src/utils/noop.js') }
		})
	}
}

await esbuild.build({
	entryPoints: ['src/index.tsx'],
	bundle: true,
	outfile: './build/core/index.js',
	minify: true,
	plugins: [preactResolvePlugin, browserExtensionPolyfillResolvePlugin],
	define: {
		TARGET: `"${process.env.TARGET}"`
	}
});
