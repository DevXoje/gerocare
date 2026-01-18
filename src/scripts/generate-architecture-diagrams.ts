import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '../..')
const SRC_DIR = path.join(PROJECT_ROOT, 'src')
const BUSINESS_DIR = path.join(SRC_DIR, 'business')
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'docs', 'architecture')

/**
 * Generate Architecture Diagrams Script
 *
 * Generates Mermaid diagrams for:
 * - Architecture layers (Domain, Application, Infrastructure, Presentation)
 * - Business modules and their relationships
 */

async function getBusinessModules(): Promise<string[]> {
	try {
		const entries = await fs.readdir(BUSINESS_DIR, { withFileTypes: true })
		return entries
			.filter((entry) => entry.isDirectory() && entry.name !== 'common')
			.map((entry) => entry.name)
			.sort()
	} catch {
		return []
	}
}

function generateLayersDiagram(): string {
	return `graph TB
    subgraph domain[Domain Layer]
        DomainEntities[Business Entities]
        DomainRepos[Repository Interfaces]
        DomainErrors[Error Types]
        DomainSchemas[Validation Schemas]
    end

    subgraph app[Application Layer]
        UseCases[Use Cases / Composables]
        FormHandlers[Form Handlers]
        AppHelpers[Application Helpers]
    end

    subgraph infrastructure[Infrastructure Layer]
        FirebaseRepos[Firebase Repositories]
        ExternalServices[External Services]
    end

    subgraph presentation[Presentation Layer]
        Components[Vue Components]
        Pages[Page Components]
        Layouts[Layouts]
    end

    subgraph shared[Shared]
        SharedDomain[Shared Domain]
        SharedComposables[Shared Composables]
        SharedUtils[Shared Utilities]
    end

    presentation -->|"uses"| app
    presentation -->|"uses"| shared
    app -->|"depends on"| domain
    app -->|"uses"| shared
    infrastructure -->|"implements"| domain
    infrastructure -->|"uses"| shared
    domain -->|"uses"| shared

    style domain fill:#e1f5ff
    style app fill:#fff4e1
    style infrastructure fill:#ffe1f5
    style presentation fill:#e1ffe1
    style shared fill:#f0f0f0
`
}

function generateModulesDiagram(modules: string[]): string {
	const moduleNodes = modules
		.map((module) => `    ${module}[${module}]`)
		.join('\n')

	const relationships = modules
		.map((module) => `    ${module} -.->|"uses"| shared[shared]`)
		.join('\n')

	return `graph TB
    subgraph businessModules[Business Modules]
${moduleNodes}
    end

    subgraph sharedModule[Shared Module]
        shared[shared]
    end

${relationships}

    style sharedModule fill:#f0f0f0
`
}

function generateCleanArchitectureRulesDiagram(): string {
	return `graph LR
    subgraph presentation[Presentation]
        P[Components<br/>Pages<br/>Layouts]
    end

    subgraph application[Application]
        A[Use Cases<br/>Form Handlers<br/>Helpers]
    end

    subgraph domain[Domain]
        D[Entities<br/>Repositories<br/>Schemas]
    end

    subgraph infrastructure[Infrastructure]
        I[Firebase<br/>Repositories<br/>External APIs]
    end

    P -->|"only imports from"| A
    P -->|"only imports from"| D
    A -->|"only imports from"| D
    I -->|"implements"| D
    I -.->|"depends on"| D

    style presentation fill:#e1ffe1
    style application fill:#fff4e1
    style domain fill:#e1f5ff
    style infrastructure fill:#ffe1f5
`
}

async function ensureOutputDirectory(): Promise<void> {
	await fs.mkdir(OUTPUT_DIR, { recursive: true })
}

async function saveDiagram(filename: string, content: string): Promise<void> {
	const outputPath = path.join(OUTPUT_DIR, filename)
	await fs.writeFile(outputPath, content, 'utf-8')
	console.log(`✅ Saved: ${path.relative(PROJECT_ROOT, outputPath)}`)
}

async function main() {
	try {
		console.log('📐 Generating architecture diagrams...')

		await ensureOutputDirectory()

		// Generate layers diagram
		const layersDiagram = generateLayersDiagram()
		await saveDiagram('architecture-layers.mmd', layersDiagram)

		// Generate modules diagram
		const modules = await getBusinessModules()
		const modulesDiagram = generateModulesDiagram(modules)
		await saveDiagram('architecture-modules.mmd', modulesDiagram)

		// Generate Clean Architecture rules diagram
		const rulesDiagram = generateCleanArchitectureRulesDiagram()
		await saveDiagram('clean-architecture-rules.mmd', rulesDiagram)

		console.log('\n✅ Architecture diagrams generated successfully')
		console.log(`📁 Output directory: ${path.relative(PROJECT_ROOT, OUTPUT_DIR)}`)
	} catch (error) {
		console.error('❌ Error generating diagrams:', error)
		process.exit(1)
	}
}

main()
