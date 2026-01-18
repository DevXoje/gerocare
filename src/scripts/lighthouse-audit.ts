import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { launch as launchChrome } from 'chrome-launcher'
import lighthouse from 'lighthouse'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Lighthouse Accessibility Audit Script
 *
 * Audits main pages for accessibility compliance using Lighthouse.
 * Generates HTML and JSON reports in lighthouse-reports/ directory.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const MIN_ACCESSIBILITY_SCORE = 90 // WCAG AA compliance target

const PAGES_TO_AUDIT = [
	{ path: '/login', name: 'Login' },
	{ path: '/dashboard', name: 'Dashboard' },
	{ path: '/residents', name: 'Residents' },
]

interface AuditResult {
	page: string
	name: string
	accessibilityScore: number
	performanceScore?: number
	bestPracticesScore?: number
	seoScore?: number
	reportPath: string
	passed: boolean
}

async function runLighthouseAudit(url: string, pageName: string): Promise<AuditResult> {
	console.log(`\n🔍 Auditing ${pageName} at ${url}...`)

	// Launch Chrome
	const chrome = await launchChrome({ chromeFlags: ['--headless'] })

	try {
		// Run Lighthouse
		const options = {
			logLevel: 'info' as const,
			output: ['html', 'json'] as const,
			onlyCategories: ['accessibility'] as const,
			port: chrome.port,
		}

		const runnerResult = await lighthouse(url, options)

		if (!runnerResult) {
			throw new Error('Lighthouse audit failed')
		}

		// Extract scores
		const lhr = runnerResult.lhr
		const accessibilityScore = Math.round((lhr.categories.accessibility?.score || 0) * 100)
		const performanceScore = Math.round((lhr.categories.performance?.score || 0) * 100)
		const bestPracticesScore = Math.round((lhr.categories['best-practices']?.score || 0) * 100)
		const seoScore = Math.round((lhr.categories.seo?.score || 0) * 100)

		// Create reports directory if it doesn't exist
		const reportsDir = path.join(__dirname, '../../lighthouse-reports')
		await fs.mkdir(reportsDir, { recursive: true })

		// Generate safe filename from page name
		const safePageName = pageName.toLowerCase().replace(/\s+/g, '-')

		// Save HTML report
		const htmlReportPath = path.join(reportsDir, `${safePageName}-report.html`)
		if (runnerResult.report) {
			await fs.writeFile(htmlReportPath, runnerResult.report[0], 'utf-8')
		}

		// Save JSON report
		const jsonReportPath = path.join(reportsDir, `${safePageName}-report.json`)
		await fs.writeFile(jsonReportPath, JSON.stringify(lhr, null, 2), 'utf-8')

		const passed = accessibilityScore >= MIN_ACCESSIBILITY_SCORE

		return {
			page: url,
			name: pageName,
			accessibilityScore,
			performanceScore,
			bestPracticesScore,
			seoScore,
			reportPath: htmlReportPath,
			passed,
		}
	} finally {
		// Close Chrome
		await chrome.kill()
	}
}

async function main() {
	console.log('🚀 Starting Lighthouse Accessibility Audit')
	console.log(`Base URL: ${BASE_URL}`)
	console.log(`Minimum Accessibility Score: ${MIN_ACCESSIBILITY_SCORE}/100`)

	const results: AuditResult[] = []

	for (const page of PAGES_TO_AUDIT) {
		const url = `${BASE_URL}${page.path}`
		try {
			const result = await runLighthouseAudit(url, page.name)
			results.push(result)

			// Print result summary
			console.log(
				`  ${result.passed ? '✅' : '❌'} ${page.name}: ${result.accessibilityScore}/100 (Report: ${result.reportPath})`
			)
		} catch (error) {
			console.error(`  ❌ Error auditing ${page.name}:`, error)
			results.push({
				page: url,
				name: page.name,
				accessibilityScore: 0,
				reportPath: '',
				passed: false,
			})
		}
	}

	// Summary
	console.log('\n📊 Audit Summary:')
	console.log('─'.repeat(60))

	let allPassed = true
	for (const result of results) {
		const status = result.passed ? '✅ PASS' : '❌ FAIL'
		console.log(`${status} | ${result.name.padEnd(20)} | Score: ${result.accessibilityScore}/100`)
		if (!result.passed) {
			allPassed = false
		}
	}

	console.log('─'.repeat(60))

	// Exit code based on results
	if (!allPassed) {
		console.error(
			`\n❌ Some pages did not meet the minimum accessibility score of ${MIN_ACCESSIBILITY_SCORE}/100`
		)
		console.log('💡 Check the HTML reports in lighthouse-reports/ for detailed information')
		process.exit(1)
	} else {
		console.log(
			`\n✅ All pages meet the minimum accessibility score of ${MIN_ACCESSIBILITY_SCORE}/100`
		)
		process.exit(0)
	}
}

main().catch(error => {
	console.error('Fatal error:', error)
	process.exit(1)
})
