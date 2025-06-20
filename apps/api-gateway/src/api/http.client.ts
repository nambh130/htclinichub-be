// helpers/http-client-config.ts
import { HttpModuleOptions } from '@nestjs/axios';

export function httpClientConfig(
  host: string | undefined,
  port: string | number | undefined,
): HttpModuleOptions {
  return {
    baseURL: `http://${host}:${port}`,
    timeout: 5000,
  };
}
