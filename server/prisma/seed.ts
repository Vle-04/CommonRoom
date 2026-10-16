import 'dotenv/config'
import { PrismaClient, ArtistRole, ArtworkType, ArtworkCategory, ListingCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('change-this-demo-password', 12)
  const lena = await prisma.user.upsert({
    where: { email: 'lena@example.test' },
    update: {},
    create: { email: 'lena@example.test', passwordHash, displayName: 'Lena Voss', pseudonym: 'lenavoss', role: ArtistRole.PAINTER, bio: 'Finding the last light of the day.', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
  })
  const art = await prisma.artwork.upsert({
    where: { id: 'seed-quiet-hours' },
    update: {},
    create: { id: 'seed-quiet-hours', creatorId: lena.id, title: 'Quiet Hours', description: 'A study in afternoon light.', type: ArtworkType.IMAGE, category: ArtworkCategory.PAINTING, mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5' },
  })
  await prisma.listing.upsert({
    where: { artworkId: art.id },
    update: {},
    create: { artworkId: art.id, sellerId: lena.id, category: ListingCategory.ORIGINAL_ART, priceCents: 48000 },
  })
}

main().finally(() => prisma.$disconnect())
