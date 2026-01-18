/** @type {import('dependency-cruiser').IConfiguration} */
export default {
	forbidden: [
		{
			name: 'no-deprecated-core',
			comment: 'Avoid using deprecated core Node.js modules',
			severity: 'warn',
			from: {},
			to: {
				dependencyTypes: ['core'],
				path: [
					'^(punycode|domain|constants|sys|_linklist)$',
					'^(sys|_linklist|punycode|domain|constants)$',
				],
			},
		},
		{
			name: 'no-deprecated-nodejs',
			comment: 'Avoid using deprecated Node.js core modules',
			severity: 'warn',
			from: {},
			to: {
				dependencyTypes: ['core'],
				path: ['^node:punycode$', '^node:domain$', '^node:constants$', '^node:sys$'],
			},
		},
		// Clean Architecture Rules
		{
			name: 'presentation-must-not-import-infrastructure',
			comment:
				'Presentation layer (components) must not import from infrastructure layer. It should only import from app or domain layers.',
			severity: 'error',
			from: {
				path: '^src/business/[^/]+/presentation',
			},
			to: {
				path: '^src/business/[^/]+/infrastructure',
			},
		},
		{
			name: 'presentation-must-not-import-other-presentation',
			comment:
				'Presentation layer should not import from other business modules presentation layers. Use shared components instead.',
			severity: 'warn',
			from: {
				path: '^src/business/([^/]+)/presentation',
			},
			to: {
				path: '^src/business/(?!\\1)[^/]+/presentation',
			},
		},
		{
			name: 'app-must-not-import-infrastructure',
			comment:
				'Application layer must not import from infrastructure layer. It should only import from domain or shared layers.',
			severity: 'error',
			from: {
				path: '^src/business/[^/]+/app',
			},
			to: {
				path: '^src/business/[^/]+/infrastructure',
			},
		},
		{
			name: 'app-must-not-import-presentation',
			comment: 'Application layer must not import from presentation layer.',
			severity: 'error',
			from: {
				path: '^src/business/[^/]+/app',
			},
			to: {
				path: '^src/business/[^/]+/presentation',
			},
		},
		{
			name: 'domain-must-not-import-other-layers',
			comment:
				'Domain layer must not import from app, infrastructure, or presentation layers. It should only import from shared/domain.',
			severity: 'error',
			from: {
				path: '^src/business/[^/]+/domain',
			},
			to: {
				path: [
					'^src/business/[^/]+/app',
					'^src/business/[^/]+/infrastructure',
					'^src/business/[^/]+/presentation',
				],
			},
		},
		{
			name: 'domain-must-not-import-other-business-domains',
			comment:
				'Domain layer should not import from other business module domains. Each domain should be independent.',
			severity: 'warn',
			from: {
				path: '^src/business/([^/]+)/domain',
			},
			to: {
				path: '^src/business/(?!\\1)[^/]+/domain',
			},
		},
	],
	options: {
		doNotFollow: {
			path: [
				'node_modules',
				'coverage',
				'dist',
				'dist-ssr',
				'.storybook',
				'storybook-static',
				'test-results',
				'playwright-report',
			],
		},
		exclude: {
			path: [
				'node_modules',
				'coverage',
				'dist',
				'dist-ssr',
				'.storybook',
				'storybook-static',
				'test-results',
				'playwright-report',
				'__tests__',
				'__snapshots__',
				'\\.spec\\.',
				'\\.test\\.',
				'\\.stories\\.',
			],
		},
		includeOnly: {
			path: '^src',
		},
		tsPreCompilationDeps: true,
		tsConfig: {
			fileName: 'tsconfig.json',
		},
		reporterOptions: {
			dot: {
				collapsePattern: '^(node_modules|src)[^/]*',
			},
			archi: {
				collapsePattern: '^(node_modules|src)[^/]*',
			},
		},
	},
}
