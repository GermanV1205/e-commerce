import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const CATEGORIES = [
  { name: 'Chaquetas', slug: 'chaquetas' },
  { name: 'Blusas', slug: 'blusas' },
  { name: 'Pantalones', slug: 'pantalones' },
  { name: 'Vestidos', slug: 'vestidos' },
  { name: 'Accesorios', slug: 'accesorios' },
];

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@tienda.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';

async function main() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }
  console.log(`Categorías sincronizadas: ${CATEGORIES.length}`);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: Role.ADMIN },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      firstName: 'Administrador',
      lastName: 'Tienda',
      role: Role.ADMIN,
    },
  });
  console.log(`Usuario ADMIN listo: ${ADMIN_EMAIL}`);

  const clientEmail = process.env.SEED_CLIENT_EMAIL ?? 'cliente@tienda.com';
  const clientPassword = process.env.SEED_CLIENT_PASSWORD ?? 'Cliente123!';
  const clientHash = await bcrypt.hash(clientPassword, 10);
  await prisma.user.upsert({
    where: { email: clientEmail },
    update: {},
    create: {
      email: clientEmail,
      passwordHash: clientHash,
      firstName: 'Cliente',
      lastName: 'Demo',
      role: Role.CLIENT,
    },
  });
  console.log(`Usuario CLIENT listo: ${clientEmail}`);

  // Producto de ejemplo para que el catálogo no arranque vacío en un entorno nuevo.
  const chaquetas = await prisma.category.findUniqueOrThrow({
    where: { slug: 'chaquetas' },
  });

  const demoExists = await prisma.product.findUnique({
    where: { slug: 'chaqueta-cuero-vintage' },
  });

  if (!demoExists) {
    await prisma.product.create({
      data: {
        name: 'Chaqueta de Cuero Vintage',
        description: 'Chaqueta clásica con forro interior, ideal para el invierno.',
        slug: 'chaqueta-cuero-vintage',
        categoryId: chaquetas.id,
        imageUrl:
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
        variants: {
          create: [
            { sku: 'CHQ-NG-M', size: 'M', color: 'Negro', price: 89.99, stock: 5 },
            { sku: 'CHQ-NG-L', size: 'L', color: 'Negro', price: 89.99, stock: 2 },
          ],
        },
      },
    });
    console.log('Producto de ejemplo creado.');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
