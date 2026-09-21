import fs from 'fs';
import path from 'path';

export type HistoricalFailureRecord = {
testCaseId: string;
testName?: string;
testFile?: string;
errorMessage: string;
failureType?: string;
failedStep?: string;
page?: string;
endpoint?: string;
environment?: string;
browser?: string;
durationMs?: number;
rootCause?: string;
resolution?: string;
retryResult?: string;
timestamp: string;
};

export class HistoricalFailureStore {


private readonly filePath: string;

constructor(
    filePath?: string
) {
    this.filePath =
        filePath ??
        path.resolve(
            process.cwd(),
            'qa-knowledge',
            'failure-history.json'
        );

    this.ensureStore();
}

save(
    failure: HistoricalFailureRecord
): void {

    const failures =
        this.load();

    failures.push(failure);

    this.write(failures);

    console.log(
        `[HISTORICAL FAILURE STORE] ` +
        `Saved failure for ${failure.testCaseId}`
    );
}

saveMany(
    failures: HistoricalFailureRecord[]
): void {

    if (!failures.length) {
        return;
    }

    const existing =
        this.load();

    existing.push(
        ...failures
    );

    this.write(existing);

    console.log(
        `[HISTORICAL FAILURE STORE] ` +
        `Saved ${failures.length} failure(s)`
    );
}

load(): HistoricalFailureRecord[] {

    if (!fs.existsSync(this.filePath)) {
        return [];
    }

    const content =
        fs.readFileSync(
            this.filePath,
            'utf-8'
        ).trim();

    if (!content) {
        return [];
    }

    try {
        const failures =
            JSON.parse(content);

        if (!Array.isArray(failures)) {
            throw new Error(
                'Failure history must be a JSON array'
            );
        }

        return failures as HistoricalFailureRecord[];

    } catch (error) {

        throw new Error(
            `[HISTORICAL FAILURE STORE] ` +
            `Invalid failure history file: ` +
            `${this.filePath}\n` +
            `${error instanceof Error
                ? error.message
                : String(error)}`
        );
    }
}

findByTestCase(
    testCaseId: string
): HistoricalFailureRecord[] {

    return this.load().filter(
        failure =>
            failure.testCaseId === testCaseId
    );
}

findByErrorMessage(
    errorMessage: string
): HistoricalFailureRecord[] {

    const normalizedError =
        errorMessage
            .toLowerCase()
            .trim();

    if (!normalizedError) {
        return [];
    }

    return this.load().filter(
        failure => {

            const historicalError =
                failure.errorMessage
                    ?.toLowerCase()
                    .trim();

            return (
                historicalError ===
                normalizedError
            );
        }
    );
}

findRelevant(
    testCaseId: string,
    errorMessage?: string
): HistoricalFailureRecord[] {

    const failures =
        this.load();

    const normalizedError =
        errorMessage
            ?.toLowerCase()
            .trim();

    return failures.filter(
        failure => {

            const sameTestCase =
                failure.testCaseId ===
                testCaseId;

            const sameError =
                normalizedError &&
                failure.errorMessage
                    ?.toLowerCase()
                    .includes(
                        normalizedError
                    );

            return (
                sameTestCase ||
                Boolean(sameError)
            );
        }
    );
}

clear(): void {

    this.write([]);

    console.log(
        '[HISTORICAL FAILURE STORE] ' +
        'Failure history cleared'
    );
}

private ensureStore(): void {

    const directory =
        path.dirname(
            this.filePath
        );

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(
            directory,
            {
                recursive: true,
            }
        );
    }

    if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(
            this.filePath,
            '[]',
            'utf-8'
        );
    }
}

private write(
    failures: HistoricalFailureRecord[]
): void {

    fs.writeFileSync(
        this.filePath,
        JSON.stringify(
            failures,
            null,
            2
        ),
        'utf-8'
    );
}


}
