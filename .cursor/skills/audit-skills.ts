/**
 * Script de auditoría para skills de Cursor
 * Analiza todas las skills y genera un reporte de estado
 *
 * Ejecutar con: node --loader tsx .cursor/skills/audit-skills.ts
 * O con: npx tsx .cursor/skills/audit-skills.ts
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface SkillMetadata {
	name?: string
	description?: string
	license?: string
	version?: string
	scope?: string | string[]
	auto_invoke?: string
	author?: string
	allowed_tools?: string | string[]
}

interface SkillAudit {
	path: string
	name: string
	hasSkillFile: boolean
	metadata: SkillMetadata
	hasWhenToUse: boolean
	hasDontUse: boolean
	hasResources: boolean
	hasCommands: boolean
	hasRelationships: boolean
	trigger?: string
	issues: string[]
	recommendations: string[]
}

const SKILLS_DIR = join(process.cwd(), '.cursor', 'skills')

function extractFrontmatter(content: string): { frontmatter: Record<string, any>, body: string } {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
	const match = content.match(frontmatterRegex)

	if (!match) {
		return { frontmatter: {}, body: content }
	}

	const frontmatterText = match[1]
	const body = match[2]
	const frontmatter: Record<string, any> = {}

	// Parse YAML-like frontmatter (simple parser)
	const lines = frontmatterText.split('\n')
	let currentKey = ''
	let currentValue: any = ''
	let inArray = false
	let arrayValues: string[] = []

	for (const line of lines) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith('#')) continue

		if (trimmed.startsWith('-')) {
			// Array item
			const value = trimmed.substring(1).trim().replace(/^["']|["']$/g, '')
			if (!inArray && currentKey) {
				inArray = true
				arrayValues = []
			}
			arrayValues.push(value)
		} else if (trimmed.includes(':')) {
			// Save previous key-value
			if (currentKey) {
				if (inArray) {
					frontmatter[currentKey] = arrayValues
					inArray = false
					arrayValues = []
				} else {
					frontmatter[currentKey] = currentValue.trim().replace(/^["']|["']$/g, '')
				}
			}

			const [key, ...valueParts] = trimmed.split(':')
			currentKey = key.trim()
			currentValue = valueParts.join(':').trim()

			// Handle multi-line values (description with >)
			if (currentValue === '>' || currentValue === '|') {
				currentValue = ''
				continue
			}
		} else if (currentKey && (trimmed.startsWith('>') || trimmed.startsWith('|'))) {
			// Continuation of multi-line value
			continue
		} else if (currentKey && trimmed) {
			// Continuation line
			currentValue += ' ' + trimmed
		}
	}

	// Save last key-value
	if (currentKey) {
		if (inArray) {
			frontmatter[currentKey] = arrayValues
		} else {
			frontmatter[currentKey] = currentValue.trim().replace(/^["']|["']$/g, '')
		}
	}

	// Handle metadata nested object
	if (frontmatter.metadata && typeof frontmatter.metadata === 'string') {
		// Try to parse as YAML-like
		const metadataLines = frontmatter.metadata.split('\n').filter(l => l.trim())
		const metadata: Record<string, any> = {}
		for (const line of metadataLines) {
			if (line.includes(':')) {
				const [key, value] = line.split(':').map(s => s.trim())
				metadata[key] = value.replace(/^["']|["']$/g, '')
			}
		}
		frontmatter.metadata = metadata
	}

	return { frontmatter, body }
}

function checkSection(content: string, sectionName: string): boolean {
	const patterns = [
		new RegExp(`^##+\\s+${sectionName}`, 'mi'),
		new RegExp(`^###+\\s+${sectionName}`, 'mi'),
		new RegExp(`\\*\\*${sectionName}\\*\\*`, 'i'),
	]
	return patterns.some(pattern => pattern.test(content))
}

function auditSkill(skillDir: string): SkillAudit | null {
	const skillPath = join(SKILLS_DIR, skillDir)
	const skillFile = join(skillPath, 'SKILL.md')

	if (!statSync(skillPath).isDirectory()) {
		return null
	}

	const audit: SkillAudit = {
		path: skillDir,
		name: skillDir,
		hasSkillFile: false,
		metadata: {},
		hasWhenToUse: false,
		hasDontUse: false,
		hasResources: false,
		hasCommands: false,
		hasRelationships: false,
		issues: [],
		recommendations: [],
	}

	try {
		const content = readFileSync(skillFile, 'utf-8')
		audit.hasSkillFile = true

		const { frontmatter, body } = extractFrontmatter(content)

		// Extract metadata
		audit.metadata = {
			name: frontmatter.name,
			description: frontmatter.description,
			license: frontmatter.license,
			version: frontmatter.metadata?.version || frontmatter.version,
			scope: frontmatter.metadata?.scope || frontmatter.scope,
			auto_invoke: frontmatter.auto_invoke,
			author: frontmatter.metadata?.author || frontmatter.author,
			allowed_tools: frontmatter.allowed_tools || frontmatter['allowed-tools'],
		}

		audit.name = audit.metadata.name || skillDir
		audit.trigger = frontmatter.description?.match(/Trigger:\s*(.+)/i)?.[1]?.trim()

		// Check required metadata
		if (!audit.metadata.name) audit.issues.push('Missing metadata.name')
		if (!audit.metadata.description) audit.issues.push('Missing metadata.description')
		if (!audit.metadata.license) audit.issues.push('Missing metadata.license')
		if (!audit.metadata.version) audit.issues.push('Missing metadata.version')
		if (!audit.metadata.scope) audit.issues.push('Missing metadata.scope')
		if (!audit.metadata.auto_invoke) audit.issues.push('Missing auto_invoke')
		if (!audit.metadata.author) audit.issues.push('Missing metadata.author')

		// Check sections
		audit.hasWhenToUse = checkSection(body, 'When to Use')
		audit.hasDontUse = checkSection(body, "Don't use") || checkSection(body, "Don't Use")
		audit.hasResources = checkSection(body, 'Resources')
		audit.hasCommands = checkSection(body, 'Commands')
		audit.hasRelationships = checkSection(body, 'Relationship') || checkSection(body, 'Relationships')

		if (!audit.hasWhenToUse) {
			audit.issues.push('Missing "When to Use" section')
		}
		if (!audit.hasDontUse) {
			audit.recommendations.push('Consider adding "Don\'t use" section for clarity')
		}
		if (!audit.hasResources) {
			audit.issues.push('Missing "Resources" section')
		}

		// Skill-specific recommendations
		if (['docker', 'testing', 'ui-design-system'].includes(skillDir) && !audit.hasCommands) {
			audit.recommendations.push('Should have "Commands" section')
		}

		if (!audit.hasRelationships && ['coding-style', 'zod', 'testing'].includes(skillDir)) {
			audit.recommendations.push('Should have "Relationship with Other Skills" section')
		}

	} catch (error) {
		audit.issues.push(`Error reading skill file: ${error}`)
	}

	return audit
}

function findTriggerOverlaps(audits: SkillAudit[]): Map<string, string[]> {
	const triggerMap = new Map<string, string[]>()

	for (const audit of audits) {
		if (!audit.trigger) continue

		const triggerWords = audit.trigger.toLowerCase().split(/\s+/)
		for (const word of triggerWords) {
			if (word.length < 4) continue // Skip short words

			if (!triggerMap.has(word)) {
				triggerMap.set(word, [])
			}
			triggerMap.get(word)!.push(audit.name)
		}
	}

	const overlaps = new Map<string, string[]>()
	for (const [word, skills] of triggerMap.entries()) {
		if (skills.length > 1) {
			overlaps.set(word, skills)
		}
	}

	return overlaps
}

function generateReport(audits: SkillAudit[]): string {
	const report: string[] = []

	report.push('# Reporte de Auditoría de Skills\n')
	report.push(`Generado: ${new Date().toISOString()}\n`)
	report.push(`Total de skills analizadas: ${audits.length}\n`)

	// Summary
	const skillsWithIssues = audits.filter(a => a.issues.length > 0)
	const skillsWithRecommendations = audits.filter(a => a.recommendations.length > 0)
	const skillsComplete = audits.filter(a => a.issues.length === 0)

	report.push('## Resumen\n')
	report.push(`- ✅ Skills completas: ${skillsComplete.length}/${audits.length}`)
	report.push(`- ⚠️ Skills con problemas: ${skillsWithIssues.length}/${audits.length}`)
	report.push(`- 💡 Skills con recomendaciones: ${skillsWithRecommendations.length}/${audits.length}\n`)

	// Metadata issues
	report.push('## Problemas de Metadata\n')
	const metadataIssues = audits.filter(a =>
		a.issues.some(i => i.includes('Missing metadata') || i.includes('Missing auto_invoke'))
	)

	if (metadataIssues.length === 0) {
		report.push('✅ Todas las skills tienen metadata completa.\n')
	} else {
		for (const audit of metadataIssues) {
			report.push(`### ${audit.name}`)
			const metadataProblems = audit.issues.filter(i =>
				i.includes('Missing metadata') || i.includes('Missing auto_invoke')
			)
			for (const issue of metadataProblems) {
				report.push(`- ${issue}`)
			}
			report.push('')
		}
	}

	// Section issues
	report.push('## Problemas de Secciones\n')
	const sectionIssues = audits.filter(a =>
		a.issues.some(i => i.includes('Missing "') && !i.includes('metadata'))
	)

	if (sectionIssues.length === 0) {
		report.push('✅ Todas las skills tienen las secciones requeridas.\n')
	} else {
		for (const audit of sectionIssues) {
			report.push(`### ${audit.name}`)
			const sectionProblems = audit.issues.filter(i =>
				i.includes('Missing "') && !i.includes('metadata')
			)
			for (const issue of sectionProblems) {
				report.push(`- ${issue}`)
			}
			report.push('')
		}
	}

	// Trigger overlaps
	report.push('## Solapamiento de Triggers\n')
	const overlaps = findTriggerOverlaps(audits)
	if (overlaps.size === 0) {
		report.push('✅ No se encontraron triggers solapados.\n')
	} else {
		for (const [word, skills] of overlaps.entries()) {
			if (skills.length > 1) {
				report.push(`- Palabra "${word}" aparece en: ${skills.join(', ')}`)
			}
		}
		report.push('')
	}

	// Recommendations
	report.push('## Recomendaciones\n')
	if (skillsWithRecommendations.length === 0) {
		report.push('✅ No hay recomendaciones adicionales.\n')
	} else {
		for (const audit of skillsWithRecommendations) {
			if (audit.recommendations.length > 0) {
				report.push(`### ${audit.name}`)
				for (const rec of audit.recommendations) {
					report.push(`- ${rec}`)
				}
				report.push('')
			}
		}
	}

	// Detailed per-skill status
	report.push('## Estado Detallado por Skill\n')
	for (const audit of audits) {
		report.push(`### ${audit.name}`)
		report.push(`- Path: \`${audit.path}\``)
		report.push(`- Metadata completa: ${audit.issues.filter(i => i.includes('Missing')).length === 0 ? '✅' : '❌'}`)
		report.push(`- Secciones: When to Use: ${audit.hasWhenToUse ? '✅' : '❌'}, Resources: ${audit.hasResources ? '✅' : '❌'}, Commands: ${audit.hasCommands ? '✅' : 'N/A'}, Relationships: ${audit.hasRelationships ? '✅' : 'N/A'}`)
		if (audit.trigger) {
			report.push(`- Trigger: "${audit.trigger}"`)
		}
		if (audit.issues.length > 0) {
			report.push(`- Problemas: ${audit.issues.length}`)
		}
		if (audit.recommendations.length > 0) {
			report.push(`- Recomendaciones: ${audit.recommendations.length}`)
		}
		report.push('')
	}

	return report.join('\n')
}

// Main execution
function main() {
	const skillDirs = readdirSync(SKILLS_DIR).filter(dir => {
		const path = join(SKILLS_DIR, dir)
		return statSync(path).isDirectory()
	})

	const audits: SkillAudit[] = []

	for (const skillDir of skillDirs) {
		const audit = auditSkill(skillDir)
		if (audit) {
			audits.push(audit)
		}
	}

	const report = generateReport(audits)
	console.log(report)

	// Write to file
	const reportPath = join(SKILLS_DIR, 'AUDIT_REPORT.md')
	writeFileSync(reportPath, report, 'utf-8')
	console.log(`\n✅ Reporte guardado en: ${reportPath}`)
}

main()
