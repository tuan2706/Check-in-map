import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// eslint-disable-next-line
declare const self: any & SerwistGlobalConfig;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST as (PrecacheEntry | string)[],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
