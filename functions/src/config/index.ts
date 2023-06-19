import * as dotenv from 'dotenv';

const nodeEnv: string = process.env.NODE_ENV ?? 'development';
dotenv.config({
  path: `.${nodeEnv}.env`
});

export const getEnvironmentVariable = (key: string): string | undefined => {
  return process.env[key];
};
