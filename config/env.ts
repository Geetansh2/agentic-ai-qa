import { qaConfig } from './qa.config';
import { uatConfig } from './uat.config';
import { prodConfig } from './prod.config';
import dotenv from 'dotenv';

dotenv.config();

const configs = {
  qa: qaConfig,
  uat: uatConfig,
  prod: prodConfig,
};

const environment = (process.env.ENV || 'qa') as keyof typeof configs;

console.log('ENV:', environment);
console.log('BASE URL:', configs[environment].baseURL);
if (!configs[environment]) {
  throw new Error(
    `Unsupported environment: ${environment}. Supported environments: qa, uat, prod`,
  );
}

export const envConfig = configs[environment];