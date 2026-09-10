
import fs from 'fs';
import path from 'path';

export type InspectedFile = {
    file: string;
    content: string;
};

export class ProjectInspector {

    private readonly projectRoot: string;

    private readonly excludedDirectories = new Set([
        'node_modules',
        '.git',
        'dist',
        'build',
        'coverage',
        'allure-results',
        'allure-report',
        'playwright-report',
        'test-results',
        '.next',
        '.turbo',
    ]);

    private readonly supportedExtensions = new Set([
        '.ts',
        '.tsx',
    ]);

    constructor() {
        this.projectRoot = process.cwd();
    }

    inspect(
        testCase: Record<string, unknown>
    ): InspectedFile[] {

        const searchTerms =
            this.extractSearchTerms(testCase);

        console.log(
            `[PROJECT INSPECTOR] Searching for: ` +
            `${searchTerms.join(', ')}`
        );

        const files =
            this.discoverProjectFiles();

        console.log(
            `[PROJECT INSPECTOR] Discovered ${files.length} project files`
        );

        const scoredFiles = files
            .map(file => ({
                file,
                score: this.calculateScore(
                    file,
                    searchTerms
                ),
            }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);

        const selectedFiles =
            scoredFiles
                .slice(0, 10)
                .map(item => item.file);

        console.log(
            `[PROJECT INSPECTOR] Relevant files:`
        );

        selectedFiles.forEach(file => {
            console.log(`  - ${file}`);
        });

        return selectedFiles.map(file => ({
            file,
            content: this.readFile(file),
        }));
    }

    private discoverProjectFiles(): string[] {

        const files: string[] = [];

        this.collectFiles(
            this.projectRoot,
            files
        );

        return files;
    }

    private collectFiles(
        directoryPath: string,
        files: string[]
    ): void {

        const entries =
            fs.readdirSync(
                directoryPath,
                {
                    withFileTypes: true,
                }
            );

        for (const entry of entries) {

            const fullPath =
                path.join(
                    directoryPath,
                    entry.name
                );

            if (entry.isDirectory()) {

                if (
                    this.excludedDirectories.has(
                        entry.name
                    )
                ) {
                    continue;
                }

                this.collectFiles(
                    fullPath,
                    files
                );

                continue;
            }

            if (!entry.isFile()) {
                continue;
            }

            const extension =
                path.extname(entry.name);

            if (
                this.supportedExtensions.has(
                    extension
                )
            ) {
                files.push(
                    path.relative(
                        this.projectRoot,
                        fullPath
                    )
                );
            }
        }
    }

    private calculateScore(
        file: string,
        searchTerms: string[]
    ): number {

        const content =
            this.readFile(file);

        const searchableText =
            `${file}\n${content}`.toLowerCase();

        let score = 0;

        for (const term of searchTerms) {

            const normalizedTerm =
                term.toLowerCase();

            if (!normalizedTerm) {
                continue;
            }

            if (
                file
                    .toLowerCase()
                    .includes(normalizedTerm)
            ) {
                score += 5;
            }

            if (
                searchableText.includes(
                    normalizedTerm
                )
            ) {
                score += 2;
            }
        }

        return score;
    }

    private extractSearchTerms(
        testCase: Record<string, unknown>
    ): string[] {

        const values: string[] = [];

        const addValue = (
            value: unknown
        ): void => {

            if (typeof value === 'string') {
                values.push(value);
                return;
            }

            if (Array.isArray(value)) {

                value.forEach(item => {
                    addValue(item);
                });

                return;
            }

            if (
                typeof value === 'object' &&
                value !== null
            ) {

                Object.values(value).forEach(item => {
                    addValue(item);
                });
            }
        };

        addValue(testCase);

        return [
            ...new Set(
                values
                    .flatMap(value =>
                        value.split(
                            /[\s,.'"`/()[\]-]+/
                        )
                    )
                    .map(value =>
                        value.trim()
                    )
                    .filter(value =>
                        value.length >= 3
                    )
            ),
        ];
    }

    private readFile(
        file: string
    ): string {

        const filePath =
            path.resolve(
                this.projectRoot,
                file
            );

        if (!fs.existsSync(filePath)) {
            throw new Error(
                `Project file not found: ${file}`
            );
        }

        return fs.readFileSync(
            filePath,
            'utf-8'
        );
    }
}
