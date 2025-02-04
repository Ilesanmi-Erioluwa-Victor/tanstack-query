import type { QueryKey } from '@tanstack/react-query';
import type { RawAxiosRequestHeaders } from 'axios';
import type { IMakeRequest } from '../request';

export interface BootstrapConfig {
  environments?: {
    appBaseUrl: string;
    appTimeout: number;
  };
  context?: ContextType;
  modelConfig?: BootstrapModelConfig;
  mutationMiddleware?: (mutateRequestConfig?: IMakeRequest & { mutationKey: QueryKey }) => Promise<boolean>;
  queryMiddleware?: (queryRequestConfig?: IMakeRequest & { queryKey: QueryKey }) => Promise<boolean>;
}

export interface BootstrapModelConfig {
  idColumn: string;
}

export type ContextType = 'app' | 'web' | 'electronjs';
export interface TanstackQueryConfig {
  headers: RawAxiosRequestHeaders;
  options?: BootstrapConfig;
}

export interface IUseQueryHeaders {
  getHeaders: () => TanstackQueryConfig['headers'];
  setQueryHeaders: (header: TanstackQueryConfig['headers']) => void;
}
