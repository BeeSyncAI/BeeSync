/// <reference types="./global.d.ts" />
import './prelude';

import { Logger } from '@nestjs/common';

import { createApp } from './app';

const app = await createApp();
const listeningHost = BeeSync.deploy ? '0.0.0.0' : 'localhost';
await app.listen(BeeSync.port, listeningHost);

const logger = new Logger('App');

logger.log(`BeeSync Server is running in [${BeeSync.type}] mode`);
logger.log(`Listening on http://${listeningHost}:${BeeSync.port}`);
logger.log(`And the public server should be recognized as ${BeeSync.baseUrl}`);
