import fs from 'fs';
import path from 'path';

type Environment = 'qa' | 'uat' | 'prod';

export class TestDataProvider {
  private readonly environment: Environment;
  private readonly dataPath: string;

  constructor(environment?: string) {
    this.environment = (environment || process.env.ENV || 'qa') as Environment;

    if (!['qa', 'uat', 'prod'].includes(this.environment)) {
      throw new Error(
        `Unsupported environment: ${this.environment}. Supported environments: qa, uat, prod`,
      );
    }

    this.dataPath = path.join(
      process.cwd(),
      'data',
      this.environment,
    );
  }

  get<T>(fileName: string): T {
    const filePath = path.join(this.dataPath, `${fileName}.json`);

    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Test data file not found: ${filePath}`,
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    return JSON.parse(fileContent) as T;
  }

  login<T = Record<string, unknown>>(): T {
    return this.get<T>('login');
  }

  users<T = Record<string, unknown>>(): T {
    return this.get<T>('users');
  }

  courses<T = Record<string, unknown>>(): T {
    return this.get<T>('courses');
  }
}