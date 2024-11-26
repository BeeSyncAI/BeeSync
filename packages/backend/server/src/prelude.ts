import 'reflect-metadata';

import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { config } from 'dotenv';
import { omit } from 'lodash-es';

import {
  applyEnvToConfig,
  getDefaultBeeSyncConfig,
} from './fundamentals/config';

const configDir = join(fileURLToPath(import.meta.url), '../config');
async function loadRemote(remoteDir: string, file: string) {
  const filePath = join(configDir, file);
  if (configDir !== remoteDir) {
    cpSync(join(remoteDir, file), filePath, {
      force: true,
    });
  }

  await import(pathToFileURL(filePath).href);
}

async function load() {
  const BeeSync_CONFIG_PATH = process.env.BeeSync_CONFIG_PATH ?? configDir;
  // Initializing BeeSync config
  //
  // 1. load dotenv file to `process.env`
  // load `.env` under pwd
  config();
  // load `.env` under user config folder
  config({
    path: join(BeeSync_CONFIG_PATH, '.env'),
  });

  // 2. generate BeeSync default config and assign to `globalThis.BeeSync`
  globalThis.BeeSync = getDefaultBeeSyncConfig();

  // TODO(@forehalo):
  //   Modules may contribute to ENV_MAP, figure out a good way to involve them instead of hardcoding in `./config/BeeSync.env`
  // 3. load env => config map to `globalThis.BeeSync.ENV_MAP
  await loadRemote(BeeSync_CONFIG_PATH, 'BeeSync.env.js');

  // 4. load `config/BeeSync` to patch custom configs
  await loadRemote(BeeSync_CONFIG_PATH, 'BeeSync.js');

  // 5. load `config/BeeSync.self` to patch custom configs
  // This is the file only take effect in [BeeSync Cloud]
  if (!BeeSync.isSelfhosted) {
    await loadRemote(BeeSync_CONFIG_PATH, 'BeeSync.self.js');
  }

  // 6. apply `process.env` map overriding to `globalThis.BeeSync`
  applyEnvToConfig(globalThis.BeeSync);

  if (BeeSync.node.dev) {
    console.log(
      'BeeSync Config:',
      JSON.stringify(omit(globalThis.BeeSync, 'ENV_MAP'), null, 2)
    );
  }
}

await load();
