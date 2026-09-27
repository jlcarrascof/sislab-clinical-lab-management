import { AppDataSource } from '../data-source';
import { runInitialSeed } from './initial.seed';

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The demo seed must not run in production');
  }
  await AppDataSource.initialize();
  try {
    await runInitialSeed(AppDataSource);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
