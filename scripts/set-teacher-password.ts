import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/services/auth';

async function main() {
  const prisma = new PrismaClient();
  try {
    const email = 'math_teacher1@example.com';
    const password = 'password123';
    const hashed = await hashPassword(password);
    const updated = await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });
    console.log('Updated teacher password:', updated.email);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
