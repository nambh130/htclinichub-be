import { Module, DynamicModule, FactoryProvider } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface HttpClientConfig {
  name: string;
  hostKey: string;
  portKey: string;
}

@Module({})
export class HttpModules {
  static registerAsync(configs: HttpClientConfig[]): DynamicModule {
    const providers: FactoryProvider[] = configs.map((config) => ({
      provide: config.name,
      useFactory: (configService: ConfigService): HttpService => {
        const host = configService.get<string>(config.hostKey);
        const port = configService.get<string | number>(config.portKey);

        console.log(`Configuring ${config.name}: http://${host}:${port}`);

        // Create axios instance with configuration
        const axiosInstance: AxiosInstance = axios.create({
          baseURL: `http://${host}:${port}`,
          timeout: 10000,
          withCredentials: true,
        });

        // Return HttpService instance with the configured axios
        return new HttpService(axiosInstance);
      },
      inject: [ConfigService],
    }));

    return {
      module: HttpModules,
      providers: providers,
      exports: providers.map((provider) => provider.provide),
    };
  }
}

export function httpClientConfig(
  serviceName: string,
  hostKey: string,
  portKey: string,
): HttpClientConfig {
  return {
    name: serviceName,
    hostKey,
    portKey,
  };
}
