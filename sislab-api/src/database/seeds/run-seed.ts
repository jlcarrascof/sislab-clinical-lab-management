import { AppDataSource } from '../data-source';
import { runInitialSeed } from './initial.seed';

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('El seed de demo no se ejecuta en producción');
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
