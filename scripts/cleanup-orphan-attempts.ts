import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import 'dotenv/config';

async function main() {
  const userIds = await prisma.user.findMany({ select: { id: true } });
  const problemIds = await prisma.problem.findMany({ select: { id: true } });
  const userIdSet = new Set(userIds.map((u) => u.id));
  const problemIdSet = new Set(problemIds.map((p) => p.id));

  const orphanAttempts = await prisma.attempt.findMany({
    select: { id: true, userId: true, problemId: true },
  });

  const toDelete = orphanAttempts
    .filter((a) => !userIdSet.has(a.userId) || !problemIdSet.has(a.problemId))
    .map((a) => a.id);

  if (toDelete.length === 0) {
    logger.info('No orphan attempts found.');
    return;
  }

  await prisma.attempt.deleteMany({ where: { id: { in: toDelete } } });
  logger.info(`Deleted ${toDelete.length} orphan attempt(s).`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
