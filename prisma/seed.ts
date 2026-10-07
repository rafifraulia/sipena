import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password 'admin123'
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Upsert admin user (create jika belum ada, update jika sudah ada)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });

  console.log('✅ Berhasil membuat akun Admin');
  console.log('📧 Username: admin');
  console.log('🔑 Password: admin123');
  console.log('🆔 User ID:', admin.id);
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
