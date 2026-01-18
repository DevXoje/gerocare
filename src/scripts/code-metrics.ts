import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '../..')
const SRC_DIR = path.join(PROJECT_ROOT, 'src')
const BUSINESS_DIR = path.join(SRC_DIR, 'business')

/**
 * Code Metrics Script
 *
 * Calculates code metrics by business module and architecture layer.
 * Generates JSON report with metrics for code analysis dashboard.
 */

interface FileMetrics {
	path: string
	lines: number
	layer?: 'domain' | 'app' | 'infrastructure' | 'presentation'
	module?: string
}

interface ModuleMetrics {
	module: string
	totalFiles: number
	totalLines: number
	byLayer: {
		domain: { files: number; lines: number }
		app: { files: number; lines: number }
		infrastructure: { files: number; lines: number }
		presentation: { files: number; lines: number }
	}
}

interface MetricsReport {
	timestamp: string
	summary: {
		totalFiles: number
		totalLines: number
		modules: number
	}
	byLayer: {
		domain: { files: number; lines: number; modules: string[] }
		app: { files: number; lines: number; modules: string[] }
		infrastructure: { files: number; lines: number; modules: string[] }
		presentation: { files: number; lines: number; modules: string[] }
	}
	byModule: ModuleMetrics[]
}

async function readFileLines(filePath: string): Promise<number> {
	try {
		const content = await fs.readFile(filePath, 'utf-8')
		return content.split('\n').length
	} catch {
		return 0
	}
}

function getLayerFromPath(filePath: string): 'domain' | 'app' | 'infrastructure' | 'presentation' | undefined {
	if (filePath.includes('/domain/')) return 'domain'
	if (filePath.includes('/app/')) return 'app'
	if (filePath.includes('/infrastructure/')) return 'infrastructure'
	if (filePath.includes('/presentation/')) return 'presentation'
	return undefined
}

function getModuleFromPath(filePath: string): string | undefined {
	const match = filePath.match(/business\/([^/]+)/)
	return match?.[1]
}

async function getFilesRecursive(dir: string, extensions: string[] = ['.ts', '.vue']): Promise<string[]> {
	const files: string[] = []

	try {
		const entries = await fs.readdir(dir, { withFileTypes: true })

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name)

			// Skip test files and directories
			if (
				entry.name.startsWith('.') ||
				entry.name.includes('__tests__') ||
				entry.name.includes('.spec.') ||
				entry.name.includes('.test.') ||
				entry.name.includes('.stories.')
			) {
				continue
			}

			if (entry.isDirectory()) {
				const subFiles = await getFilesRecursive(fullPath, extensions)
				files.push(...subFiles)
			} else if (entry.isFile()) {
				const ext = path.extname(entry.name)
				if (extensions.includes(ext)) {
					files.push(fullPath)
				}
			}
		}
	} catch {
		// Directory might not exist or be inaccessible
	}

	return files
}

async function calculateFileMetrics(filePath: string): Promise<FileMetrics> {
	const lines = await readFileLines(filePath)
	const layer = getLayerFromPath(filePath)
	const module = getModuleFromPath(filePath)

	return {
		path: path.relative(PROJECT_ROOT, filePath),
		lines,
		layer,
		module,
	}
}

async function calculateMetrics(): Promise<MetricsReport> {
	const businessFiles = await getFilesRecursive(BUSINESS_DIR)
	const fileMetrics = await Promise.all(businessFiles.map(calculateFileMetrics))

	// Group by module
	const moduleMap = new Map<string, FileMetrics[]>()
	const layerMap = {
		domain: new Set<string>(),
		app: new Set<string>(),
		infrastructure: new Set<string>(),
		presentation: new Set<string>(),
	}

	for (const metrics of fileMetrics) {
		if (metrics.module) {
			if (!moduleMap.has(metrics.module)) {
				moduleMap.set(metrics.module, [])
			}
			moduleMap.get(metrics.module)!.push(metrics)

			if (metrics.layer) {
				layerMap[metrics.layer].add(metrics.module)
			}
		}
	}

	// Calculate module metrics
	const byModule: ModuleMetrics[] = Array.from(moduleMap.entries()).map(([module, files]) => {
		const byLayer = {
			domain: { files: 0, lines: 0 },
			app: { files: 0, lines: 0 },
			infrastructure: { files: 0, lines: 0 },
			presentation: { files: 0, lines: 0 },
		}

		let totalFiles = 0
		let totalLines = 0

		for (const file of files) {
			totalFiles++
			totalLines += file.lines

			if (file.layer) {
				byLayer[file.layer].files++
				byLayer[file.layer].lines += file.lines
			}
		}

		return {
			module,
			totalFiles,
			totalLines,
			byLayer,
		}
	})

	// Calculate layer metrics
	const byLayer = {
		domain: { files: 0, lines: 0, modules: Array.from(layerMap.domain) },
		app: { files: 0, lines: 0, modules: Array.from(layerMap.app) },
		infrastructure: { files: 0, lines: 0, modules: Array.from(layerMap.infrastructure) },
		presentation: { files: 0, lines: 0, modules: Array.from(layerMap.presentation) },
	}

	for (const metrics of fileMetrics) {
		if (metrics.layer) {
			byLayer[metrics.layer].files++
			byLayer[metrics.layer].lines += metrics.lines
		}
	}

	return {
		timestamp: new Date().toISOString(),
		summary: {
			totalFiles: fileMetrics.length,
			totalLines: fileMetrics.reduce((sum, m) => sum + m.lines, 0),
			modules: moduleMap.size,
		},
		byLayer,
		byModule: byModule.sort((a, b) => b.totalLines - a.totalLines),
	}
}

async function saveMetricsReport(report: MetricsReport): Promise<void> {
	const outputDir = path.join(PROJECT_ROOT, 'reports', 'code-analysis')
	await fs.mkdir(outputDir, { recursive: true })

	const outputPath = path.join(outputDir, 'metrics.json')
	await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8')

	console.log(`✅ Metrics report saved to: ${outputPath}`)
}

function printSummary(report: MetricsReport): void {
	console.log('\n📊 Code Metrics Summary\n')
	console.log(`Total Files: ${report.summary.totalFiles}`)
	console.log(`Total Lines: ${report.summary.totalLines.toLocaleString()}`)
	console.log(`Modules: ${report.summary.modules}\n`)

	console.log('By Layer:')
	console.log(`  Domain:         ${report.byLayer.domain.files} files, ${report.byLayer.domain.lines.toLocaleString()} lines`)
	console.log(`  Application:    ${report.byLayer.app.files} files, ${report.byLayer.app.lines.toLocaleString()} lines`)
	console.log(`  Infrastructure: ${report.byLayer.infrastructure.files} files, ${report.byLayer.infrastructure.lines.toLocaleString()} lines`)
	console.log(`  Presentation:   ${report.byLayer.presentation.files} files, ${report.byLayer.presentation.lines.toLocaleString()} lines\n`)

	console.log('Top Modules by Lines:')
	for (const module of report.byModule.slice(0, 5)) {
		console.log(`  ${module.module.padEnd(20)} ${module.totalLines.toLocaleString().padStart(8)} lines (${module.totalFiles} files)`)
	}
	console.log()
}

async function main() {
	const showSummary = process.argv.includes('--summary')

	try {
		console.log('📊 Calculating code metrics...')
		const report = await calculateMetrics()

		await saveMetricsReport(report)

		if (showSummary) {
			printSummary(report)
		} else {
			console.log('✅ Metrics calculated successfully')
		}
	} catch (error) {
		console.error('❌ Error calculating metrics:', error)
		process.exit(1)
	}
}

main()
