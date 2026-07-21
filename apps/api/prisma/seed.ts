import { PrismaClient, RoleName } from '@prisma/client';

const prisma = new PrismaClient();

const COMPETENCIES = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'NestJS',
  'Java',
  'Spring Boot',
  'Cloud',
  'DevOps',
  'Quality Engineering',
  'Project Journey',
  'Managed Services',
  'Gen AI',
  'Data Engineering',
  'Frontend',
  'Backend',
  'Security',
];

const CATEGORIES = [
  'Engineering',
  'Architecture',
  'Leadership',
  'Delivery',
  'Innovation',
  'Best Practices',
  'Case Studies',
  'Workshops',
];

const PERMISSIONS = [
  { resource: 'users', action: 'manage', slug: 'users:manage' },
  { resource: 'teams', action: 'manage', slug: 'teams:manage' },
  { resource: 'content', action: 'create', slug: 'content:create' },
  { resource: 'content', action: 'approve', slug: 'content:approve' },
  { resource: 'content', action: 'delete', slug: 'content:delete' },
  { resource: 'content', action: 'publish', slug: 'content:publish' },
  { resource: 'homepage', action: 'manage', slug: 'homepage:manage' },
  { resource: 'analytics', action: 'view', slug: 'analytics:view' },
  { resource: 'announcements', action: 'manage', slug: 'announcements:manage' },
  { resource: 'comments', action: 'moderate', slug: 'comments:moderate' },
];

const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  ADMIN: PERMISSIONS.map((p) => p.slug),
  TEAM: ['content:create', 'content:publish', 'analytics:view'],
  USER: [],
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Seeding roles and permissions...');

  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { slug: permission.slug },
      update: {},
      create: permission,
    });
  }

  for (const roleName of Object.values(RoleName)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} role`,
      },
    });

    const slugs = ROLE_PERMISSIONS[roleName];
    for (const slug of slugs) {
      const permission = await prisma.permission.findUnique({ where: { slug } });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('Seeding competencies...');
  for (const [index, name] of COMPETENCIES.entries()) {
    const slug = slugify(name);
    await prisma.competency.upsert({
      where: { slug },
      update: { sortOrder: index },
      create: { name, slug, sortOrder: index },
    });
  }

  console.log('Seeding categories...');
  for (const [index, name] of CATEGORIES.entries()) {
    const slug = slugify(name);
    await prisma.category.upsert({
      where: { slug },
      update: { sortOrder: index },
      create: { name, slug, sortOrder: index },
    });
  }

  console.log('Seeding sample content...');
  await seedContent();

  await ensureBootstrapAdmin('eram.fatima@tothenew.com');

  console.log('Seed completed.');
}

async function ensureBootstrapAdmin(email: string) {
  const adminRole = await prisma.role.findUnique({ where: { name: RoleName.ADMIN } });
  if (!adminRole) return;

  const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
  if (!user) {
    console.log(`Bootstrap admin skipped — user not found yet: ${email}`);
    return;
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
    update: {},
    create: { userId: user.id, roleId: adminRole.id },
  });

  console.log(`Bootstrap admin granted: ${email}`);
}

async function seedContent() {
  const adminRole = await prisma.role.findUnique({ where: { name: RoleName.ADMIN } });
  const genAi = await prisma.competency.findUnique({ where: { slug: 'gen-ai' } });
  const nestjs = await prisma.competency.findUnique({ where: { slug: 'nestjs' } });
  const react = await prisma.competency.findUnique({ where: { slug: 'react' } });
  const engineering = await prisma.category.findUnique({ where: { slug: 'engineering' } });

  const seedUser = await prisma.user.upsert({
    where: { email: 'knowledgehub-seed@tothenew.com' },
    update: {},
    create: {
      email: 'knowledgehub-seed@tothenew.com',
      name: 'KnowledgeHub Seed',
      googleId: 'seed-google-id-knowledgehub',
      roles: adminRole ? { create: [{ roleId: adminRole.id }] } : undefined,
    },
  });

  const speaker1 = await prisma.speaker.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: { slug: 'priya-sharma' },
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Priya Sharma',
      slug: 'priya-sharma',
      designation: 'Principal Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
  });

  const speaker2 = await prisma.speaker.upsert({
    where: { id: '00000000-0000-4000-8000-000000000002' },
    update: { slug: 'rahul-verma' },
    create: {
      id: '00000000-0000-4000-8000-000000000002',
      name: 'Rahul Verma',
      slug: 'rahul-verma',
      designation: 'Engineering Manager',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    },
  });

  const sampleVideoUrl =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const videoData = [
    {
      id: '10000000-0000-4000-8000-000000000001',
      title: 'Prompt Engineering Fundamentals',
      description: 'Learn how to craft effective prompts for LLM applications.',
      speakerId: speaker1.id,
      competencyId: genAi?.id,
      durationSeconds: 2531,
      thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
      viewCount: 420,
    },
    {
      id: '10000000-0000-4000-8000-000000000002',
      title: 'NestJS Authentication Patterns',
      description: 'JWT, guards, and OAuth integration in NestJS.',
      speakerId: speaker2.id,
      competencyId: nestjs?.id,
      durationSeconds: 3302,
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      viewCount: 310,
    },
    {
      id: '10000000-0000-4000-8000-000000000003',
      title: 'React Server Components Deep Dive',
      description: 'Understanding RSC architecture in Next.js.',
      speakerId: speaker1.id,
      competencyId: react?.id,
      durationSeconds: 2890,
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      viewCount: 275,
    },
  ];

  for (const video of videoData) {
    await prisma.video.upsert({
      where: { id: video.id },
      update: {},
      create: {
        ...video,
        categoryId: engineering?.id,
        uploadedById: seedUser.id,
        videoUrl: sampleVideoUrl,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  const series = await prisma.knowledgeSeries.upsert({
    where: { id: '20000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '20000000-0000-4000-8000-000000000001',
      title: 'Generative AI Series',
      description: 'From prompt engineering to AI agents in production.',
      competencyId: genAi?.id,
      createdById: seedUser.id,
      thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      status: 'PUBLISHED',
    },
  });

  await prisma.seriesSession.upsert({
    where: { id: '30000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '30000000-0000-4000-8000-000000000001',
      seriesId: series.id,
      videoId: '10000000-0000-4000-8000-000000000001',
      title: 'Session 1: Prompt Engineering',
      orderIndex: 1,
    },
  });

  await prisma.seriesSession.upsert({
    where: { id: '30000000-0000-4000-8000-000000000002' },
    update: {},
    create: {
      id: '30000000-0000-4000-8000-000000000002',
      seriesId: series.id,
      videoId: '10000000-0000-4000-8000-000000000002',
      title: 'Session 2: Auth Patterns',
      orderIndex: 2,
    },
  });

  const upcomingMeetDate = new Date();
  upcomingMeetDate.setDate(upcomingMeetDate.getDate() + 3);

  const pastMeetDate = new Date();
  pastMeetDate.setDate(pastMeetDate.getDate() - 14);

  await prisma.knowledgeMeet.upsert({
    where: { id: '40000000-0000-4000-8000-000000000001' },
    update: {
      scheduledAt: upcomingMeetDate,
      status: 'UPCOMING',
      visibility: 'INTERNAL',
      deletedAt: null,
    },
    create: {
      id: '40000000-0000-4000-8000-000000000001',
      title: 'Knowledge Meet: AI Agents in Production',
      subtitle: 'Platform Engineering Chapter',
      description: 'Live session on deploying AI agents at scale.',
      speakerId: speaker2.id,
      competencyId: genAi?.id,
      categoryId: engineering?.id,
      createdById: seedUser.id,
      scheduledAt: upcomingMeetDate,
      durationMinutes: 60,
      thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
      meetingLink: 'https://meet.google.com/sample-link',
      status: 'UPCOMING',
      attendanceType: 'MANDATORY',
      visibility: 'INTERNAL',
    },
  });

  await prisma.knowledgeMeet.upsert({
    where: { id: '40000000-0000-4000-8000-000000000002' },
    update: {
      scheduledAt: pastMeetDate,
      status: 'COMPLETED',
      visibility: 'INTERNAL',
      deletedAt: null,
    },
    create: {
      id: '40000000-0000-4000-8000-000000000002',
      title: 'Knowledge Meet: React Performance Patterns',
      subtitle: 'Frontend Guild',
      description: 'Recording from our React performance deep dive.',
      speakerId: speaker1.id,
      competencyId: react?.id,
      categoryId: engineering?.id,
      createdById: seedUser.id,
      scheduledAt: pastMeetDate,
      durationMinutes: 45,
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      recordingUrl: 'https://example.com/recordings/react-performance',
      status: 'COMPLETED',
      attendanceType: 'OPTIONAL',
      visibility: 'INTERNAL',
    },
  });

  await prisma.announcement.upsert({
    where: { id: '50000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '50000000-0000-4000-8000-000000000001',
      title: 'Q3 Learning Sprint is live',
      body: 'Complete 3 competencies this quarter to earn your learning badge.',
      priority: 1,
    },
  });

  console.log('Seeding tags...');
  const tagNames = ['AI', 'Authentication', 'React', 'Best Practices'];
  const tagRecords: { id: string }[] = [];
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    tagRecords.push(tag);
  }

  await prisma.videoTag.upsert({
    where: {
      videoId_tagId: {
        videoId: '10000000-0000-4000-8000-000000000001',
        tagId: tagRecords[0].id,
      },
    },
    update: {},
    create: {
      videoId: '10000000-0000-4000-8000-000000000001',
      tagId: tagRecords[0].id,
    },
  });

  console.log('Seeding sample notifications...');
  await prisma.notification.upsert({
    where: { id: '60000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '60000000-0000-4000-8000-000000000001',
      userId: seedUser.id,
      type: 'NEW_CONTENT',
      title: 'New series available',
      body: 'Generative AI Series has a new session ready to watch.',
      payload: { seriesId: '20000000-0000-4000-8000-000000000001' },
    },
  });
  await prisma.notification.upsert({
    where: { id: '60000000-0000-4000-8000-000000000002' },
    update: {},
    create: {
      id: '60000000-0000-4000-8000-000000000002',
      userId: seedUser.id,
      type: 'MEET_REMINDER',
      title: 'Upcoming knowledge meet',
      body: 'AI Agents in Production starts in 3 days.',
      payload: { meetId: '40000000-0000-4000-8000-000000000001' },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
