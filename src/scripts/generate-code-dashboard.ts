import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '../..')
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'code-analysis')
const OUTPUT_PATH = path.join(REPORTS_DIR, 'index.html')

/**
 * Code Dashboard Generator Script
 *
 * Generates a consolidated HTML dashboard with:
 * - Code metrics by module and layer
 * - Architecture validation status
 * - Dependency graph visualization
 */

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
	byModule: Array<{
		module: string
		totalFiles: number
		totalLines: number
		byLayer: {
			domain: { files: number; lines: number }
			app: { files: number; lines: number }
			infrastructure: { files: number; lines: number }
			presentation: { files: number; lines: number }
		}
	}>
}

async function loadMetricsReport(): Promise<MetricsReport | null> {
	try {
		const metricsPath = path.join(REPORTS_DIR, 'metrics.json')
		const content = await fs.readFile(metricsPath, 'utf-8')
		return JSON.parse(content) as MetricsReport
	} catch {
		return null
	}
}

function generateHTML(metrics: MetricsReport | null): string {
	const timestamp = new Date().toLocaleString()
	const hasMetrics = metrics !== null

	const layerData = hasMetrics
		? {
				labels: ['Domain', 'Application', 'Infrastructure', 'Presentation'],
				files: [
					metrics.byLayer.domain.files,
					metrics.byLayer.app.files,
					metrics.byLayer.infrastructure.files,
					metrics.byLayer.presentation.files,
				],
				lines: [
					metrics.byLayer.domain.lines,
					metrics.byLayer.app.lines,
					metrics.byLayer.infrastructure.lines,
					metrics.byLayer.presentation.lines,
				],
			}
		: null

	const moduleData = hasMetrics
		? {
				labels: metrics.byModule.map((m) => m.module),
				lines: metrics.byModule.map((m) => m.totalLines),
				files: metrics.byModule.map((m) => m.totalFiles),
			}
		: null

	return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GeroCare - Code Analysis Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .timestamp {
            color: #7f8c8d;
            font-size: 14px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 20px;
        }
        .summary-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-value {
            font-size: 36px;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #7f8c8d;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .chart-container {
            position: relative;
            height: 300px;
            margin-top: 20px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
        }
        .warning strong {
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 GeroCare Code Analysis Dashboard</h1>
            <p class="timestamp">Generated: ${timestamp}</p>
        </header>

        ${
			hasMetrics
				? `
        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-value">${metrics.summary.totalFiles.toLocaleString()}</div>
                <div class="stat-label">Total Files</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${metrics.summary.totalLines.toLocaleString()}</div>
                <div class="stat-label">Total Lines</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${metrics.summary.modules}</div>
                <div class="stat-label">Business Modules</div>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h2>Files by Layer</h2>
                <div class="chart-container">
                    <canvas id="filesByLayerChart"></canvas>
                </div>
            </div>
            <div class="card">
                <h2>Lines of Code by Layer</h2>
                <div class="chart-container">
                    <canvas id="linesByLayerChart"></canvas>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>Top Modules by Lines of Code</h2>
            <div class="chart-container">
                <canvas id="modulesChart"></canvas>
            </div>
        </div>

        <div class="card">
            <h2>Metrics by Module</h2>
            <table>
                <thead>
                    <tr>
                        <th>Module</th>
                        <th>Total Files</th>
                        <th>Total Lines</th>
                        <th>Domain</th>
                        <th>Application</th>
                        <th>Infrastructure</th>
                        <th>Presentation</th>
                    </tr>
                </thead>
                <tbody>
                    ${metrics.byModule
											.map(
												(m) => `
                    <tr>
                        <td><strong>${m.module}</strong></td>
                        <td>${m.totalFiles}</td>
                        <td>${m.totalLines.toLocaleString()}</td>
                        <td>${m.byLayer.domain.files} files (${m.byLayer.domain.lines.toLocaleString()} lines)</td>
                        <td>${m.byLayer.app.files} files (${m.byLayer.app.lines.toLocaleString()} lines)</td>
                        <td>${m.byLayer.infrastructure.files} files (${m.byLayer.infrastructure.lines.toLocaleString()} lines)</td>
                        <td>${m.byLayer.presentation.files} files (${m.byLayer.presentation.lines.toLocaleString()} lines)</td>
                    </tr>
                    `
											)
											.join('')}
                </tbody>
            </table>
        </div>
        `
				: `
        <div class="card">
            <div class="warning">
                <strong>⚠️ No metrics data available</strong><br>
                Run <code>npm run analyze:metrics</code> to generate metrics data.
            </div>
        </div>
        `
		}

        <div class="card">
            <h2>Architecture Reports</h2>
            <ul style="list-style: none; padding: 0;">
                <li style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>Dependency Analysis:</strong>
                    <a href="dependencies.html" target="_blank">View HTML Report</a>
                </li>
                <li style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>Architecture Diagrams:</strong>
                    <a href="../../docs/architecture/" target="_blank">View Mermaid Diagrams</a>
                </li>
            </ul>
        </div>
    </div>

    <script>
        ${
			hasMetrics && layerData
				? `
        // Files by Layer Chart
        new Chart(document.getElementById('filesByLayerChart'), {
            type: 'doughnut',
            data: {
                labels: ${JSON.stringify(layerData.labels)},
                datasets: [{
                    data: ${JSON.stringify(layerData.files)},
                    backgroundColor: ['#3498db', '#e67e22', '#e74c3c', '#2ecc71']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        // Lines by Layer Chart
        new Chart(document.getElementById('linesByLayerChart'), {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(layerData.labels)},
                datasets: [{
                    label: 'Lines of Code',
                    data: ${JSON.stringify(layerData.lines)},
                    backgroundColor: ['#3498db', '#e67e22', '#e74c3c', '#2ecc71']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
        `
				: ''
		}

        ${
			hasMetrics && moduleData
				? `
        // Modules Chart
        new Chart(document.getElementById('modulesChart'), {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(moduleData.labels)},
                datasets: [{
                    label: 'Lines of Code',
                    data: ${JSON.stringify(moduleData.lines)},
                    backgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });
        `
				: ''
		}
    </script>
</body>
</html>
`
}

async function ensureReportsDirectory(): Promise<void> {
	await fs.mkdir(REPORTS_DIR, { recursive: true })
}

async function main() {
	try {
		console.log('📊 Generating code analysis dashboard...')

		await ensureReportsDirectory()

		const metrics = await loadMetricsReport()
		const html = generateHTML(metrics)

		await fs.writeFile(OUTPUT_PATH, html, 'utf-8')

		console.log(`✅ Dashboard generated successfully`)
		console.log(`📁 Output: ${path.relative(PROJECT_ROOT, OUTPUT_PATH)}`)
		console.log(`\n💡 Open ${OUTPUT_PATH} in your browser to view the dashboard`)
	} catch (error) {
		console.error('❌ Error generating dashboard:', error)
		process.exit(1)
	}
}

main()
