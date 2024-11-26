/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Custom configurations for BeeSync Cloud
// ====================================================================================
// Q: WHY THIS FILE EXISTS?
// A: BeeSync deployment environment may have a lot of custom environment variables,
//    which are not suitable to be put in the `BeeSync.ts` file.
//    For example, BeeSync Cloud Clusters are deployed on Google Cloud Platform.
//    We need to enable the `gcloud` plugin to make sure the nodes working well,
//    but the default selfhost version may not require it.
//    So it's not a good idea to put such logic in the common `BeeSync.ts` file.
//
//    ```
//    if (BeeSync.deploy) {
//      BeeSync.plugins.use('gcloud');
//    }
//    ```
// ====================================================================================
const env = process.env;

BeeSync.metrics.enabled = !BeeSync.node.test;

if (env.R2_OBJECT_STORAGE_ACCOUNT_ID) {
  BeeSync.plugins.use('cloudflare-r2', {
    accountId: env.R2_OBJECT_STORAGE_ACCOUNT_ID,
    credentials: {
      accessKeyId: env.R2_OBJECT_STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_OBJECT_STORAGE_SECRET_ACCESS_KEY!,
    },
  });
  BeeSync.storage.storages.avatar.provider = 'cloudflare-r2';
  BeeSync.storage.storages.avatar.bucket = 'account-avatar';
  BeeSync.storage.storages.avatar.publicLinkFactory = key =>
    `https://avatar.BeeSyncassets.com/${key}`;

  BeeSync.storage.storages.blob.provider = 'cloudflare-r2';
  BeeSync.storage.storages.blob.bucket = `workspace-blobs-${
    BeeSync.BeeSync.canary ? 'canary' : 'prod'
  }`;

  BeeSync.storage.storages.copilot.provider = 'cloudflare-r2';
  BeeSync.storage.storages.copilot.bucket = `workspace-copilot-${
    BeeSync.BeeSync.canary ? 'canary' : 'prod'
  }`;
}

BeeSync.plugins.use('copilot', {
  openai: {},
  fal: {},
});
BeeSync.plugins.use('redis');
BeeSync.plugins.use('payment', {
  stripe: {
    keys: {
      // fake the key to ensure the server generate full GraphQL Schema even env vars are not set
      APIKey: '1',
      webhookKey: '1',
    },
  },
});
BeeSync.plugins.use('oauth');

if (BeeSync.deploy) {
  BeeSync.mailer = {
    service: 'gmail',
    auth: {
      user: env.MAILER_USER,
      pass: env.MAILER_PASSWORD,
    },
  };

  BeeSync.plugins.use('gcloud');
}
