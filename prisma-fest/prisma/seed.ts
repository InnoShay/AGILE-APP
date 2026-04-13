import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// SQLite uses plain strings instead of enums
const UserRole = { admin: 'admin', organizer: 'organizer', student: 'student' } as const;
const EventStatus = { upcoming: 'upcoming', ongoing: 'ongoing', completed: 'completed', cancelled: 'cancelled' } as const;
const EventCategory = { technical: 'technical', dance: 'dance', music: 'music', workshop: 'workshop', sports: 'sports', arts: 'arts', gaming: 'gaming', literary: 'literary', other: 'other' } as const;
const SponsorTier = { title: 'title', gold: 'gold', silver: 'silver', bronze: 'bronze' } as const;
const TicketType = { general: 'general', vip: 'vip' } as const;
const PaymentStatus = { pending: 'pending', completed: 'completed', failed: 'failed', refunded: 'refunded' } as const;

async function main() {
  console.log('🌱 Seeding PRISMA Fest database...\n');

  // ─── Clear existing data ───
  await prisma.feedback.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.festSchedule.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('Password123', 12);

  // ─── Users ───
  const admin = await prisma.user.create({
    data: {
      name: 'Admin PRISMA',
      email: 'admin@prismafest.com',
      passwordHash: hash,
      role: UserRole.admin,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=Admin',
    },
  });

  const org1 = await prisma.user.create({
    data: {
      name: 'Riya Sharma',
      email: 'riya@prismafest.com',
      passwordHash: hash,
      role: UserRole.organizer,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=RS',
    },
  });

  const org2 = await prisma.user.create({
    data: {
      name: 'Arjun Mehta',
      email: 'arjun@prismafest.com',
      passwordHash: hash,
      role: UserRole.organizer,
      isVerified: true,
      avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=AM',
    },
  });

  const studentNames = [
    'Priya Patel', 'Rahul Kumar', 'Sneha Gupta', 'Vikram Singh',
    'Ananya Iyer', 'Karan Verma', 'Divya Nair', 'Aditya Joshi',
    'Meera Reddy', 'Rohan Das',
  ];

  const students = await Promise.all(
    studentNames.map((name, i) =>
      prisma.user.create({
        data: {
          name,
          email: `student${i + 1}@prismafest.com`,
          passwordHash: hash,
          role: UserRole.student,
          isVerified: true,
          studentId: `SRM2025${String(i + 1).padStart(3, '0')}`,
          avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${name.replace(' ', '')}`,
        },
      }),
    ),
  );

  console.log(`✅ Created ${3 + students.length} users`);

  // ─── Events ───
  const now = new Date();
  const dayMs = 86400000;

  const eventsData = [
    {
      title: 'CodeStorm — 24hr Hackathon',
      description: '<p>The ultimate coding marathon. Build something incredible in 24 hours. Teams of 2-4. Prizes worth ₹5,00,000.</p><p>Bring your laptops, your ideas, and your hunger to build. Mentors from top tech companies will be available throughout.</p>',
      category: EventCategory.technical,
      venue: 'Innovation Lab, Block A',
      date: new Date(now.getTime() + 3 * dayMs),
      time: '10:00 AM',
      totalCapacity: 200,
      registeredCount: 156,
      status: EventStatus.upcoming,
      isFree: false,
      price: 299,
      isApproved: true,
      organizerId: org1.id,
      coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format',
    },
    {
      title: 'Nritya — Classical Dance Competition',
      description: '<p>Showcase your classical dance talent. Solo and group categories. Styles: Bharatanatyam, Kathak, Odissi, Kuchipudi, and Mohiniyattam.</p>',
      category: EventCategory.dance,
      venue: 'Main Auditorium',
      date: new Date(now.getTime() + 2 * dayMs),
      time: '4:00 PM',
      totalCapacity: 50,
      registeredCount: 42,
      status: EventStatus.upcoming,
      isFree: true,
      price: 0,
      isApproved: true,
      organizerId: org1.id,
      coverImage: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&auto=format',
    },
    {
      title: 'Battle of Bands',
      description: '<p>Plug in. Turn up. Rock the campus. Battle of Bands returns bigger than ever. All genres welcome. 20-minute sets. Crowd + judges scoring.</p>',
      category: EventCategory.music,
      venue: 'Open Air Theatre',
      date: new Date(now.getTime() + 1 * dayMs),
      time: '6:00 PM',
      totalCapacity: 500,
      registeredCount: 387,
      status: EventStatus.upcoming,
      isFree: true,
      price: 0,
      isApproved: true,
      organizerId: org2.id,
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format',
    },
    {
      title: 'AI/ML Workshop — Build Your First Model',
      description: '<p>Hands-on workshop on machine learning fundamentals. Build a real model from scratch using Python, scikit-learn, and TensorFlow. Laptops required.</p>',
      category: EventCategory.workshop,
      venue: 'Computer Lab 3, Block C',
      date: new Date(now.getTime() + 4 * dayMs),
      time: '10:00 AM',
      totalCapacity: 60,
      registeredCount: 58,
      status: EventStatus.upcoming,
      isFree: false,
      price: 199,
      isApproved: true,
      organizerId: org1.id,
      coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format',
    },
    {
      title: 'Campus Cricket League — Finals',
      description: '<p>The grand finale of CCL 2025. Two teams. One trophy. Come cheer for your branch team in the most electrifying cricket showdown.</p>',
      category: EventCategory.sports,
      venue: 'Main Ground',
      date: new Date(now.getTime() + 5 * dayMs),
      time: '2:00 PM',
      totalCapacity: 1000,
      registeredCount: 724,
      status: EventStatus.upcoming,
      isFree: true,
      price: 0,
      isApproved: true,
      organizerId: org2.id,
      coverImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format',
    },
    {
      title: 'Pixel Wars — Digital Art Competition',
      description: '<p>Unleash your creativity. Digital illustration, graphic design, or 3D art. Theme will be revealed on spot. 3-hour window. Bring your own device + stylus.</p>',
      category: EventCategory.arts,
      venue: 'Design Studio, Block B',
      date: new Date(now.getTime() + 2 * dayMs),
      time: '11:00 AM',
      totalCapacity: 40,
      registeredCount: 32,
      status: EventStatus.upcoming,
      isFree: false,
      price: 149,
      isApproved: true,
      organizerId: org1.id,
      coverImage: 'https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=800&auto=format',
    },
    {
      title: 'Valorant Tournament — Campus Edition',
      description: '<p>5v5 tactical shooter tournament. Best of 3 rounds. Top 16 teams compete for the campus championship title and gaming peripherals worth ₹2,00,000.</p>',
      category: EventCategory.gaming,
      venue: 'Esports Arena, Block D',
      date: new Date(now.getTime() + 3 * dayMs),
      time: '12:00 PM',
      totalCapacity: 80,
      registeredCount: 80,
      status: EventStatus.upcoming,
      isFree: false,
      price: 499,
      isApproved: true,
      organizerId: org2.id,
      coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format',
    },
    {
      title: 'Slam Poetry Night',
      description: '<p>Words that hit different. Open mic slam poetry night. Express yourself. 3-minute limit per performer. No props. Just you and the mic.</p>',
      category: EventCategory.literary,
      venue: 'Cafe Amphitheatre',
      date: new Date(now.getTime() + 1 * dayMs),
      time: '7:30 PM',
      totalCapacity: 100,
      registeredCount: 67,
      status: EventStatus.upcoming,
      isFree: true,
      price: 0,
      isApproved: true,
      organizerId: org1.id,
      coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format',
    },
  ];

  const events = await Promise.all(
    eventsData.map((e) => prisma.event.create({ data: e })),
  );

  console.log(`✅ Created ${events.length} events`);

  // ─── Registrations ───
  const registrations = [];
  for (let i = 0; i < students.length; i++) {
    // Each student registers for 2-3 events
    const eventIndices = [i % 8, (i + 3) % 8];
    if (i % 3 === 0) eventIndices.push((i + 5) % 8);

    for (const eIdx of eventIndices) {
      registrations.push(
        prisma.registration.create({
          data: {
            userId: students[i].id,
            eventId: events[eIdx].id,
            ticketType: eIdx % 2 === 0 ? TicketType.general : TicketType.vip,
            paymentStatus: events[eIdx].isFree ? PaymentStatus.completed : PaymentStatus.completed,
            qrCode: `QR_${students[i].id}_${events[eIdx].id}`,
            checkedIn: i < 3,
          },
        }),
      );
    }
  }
  await Promise.all(registrations);
  console.log(`✅ Created ${registrations.length} registrations`);

  // ─── Schedule ───
  const scheduleData = [
    { day: 1, startTime: '09:00', endTime: '10:00', title: 'Opening Ceremony', stage: 'Main Stage' },
    { day: 1, startTime: '10:00', endTime: '11:00', title: 'CodeStorm Kickoff', stage: 'Innovation Lab', eventId: events[0].id },
    { day: 1, startTime: '11:00', endTime: '14:00', title: 'Pixel Wars', stage: 'Design Studio', eventId: events[5].id },
    { day: 1, startTime: '18:00', endTime: '20:00', title: 'Battle of Bands', stage: 'Open Air Theatre', eventId: events[2].id },
    { day: 1, startTime: '19:30', endTime: '21:00', title: 'Slam Poetry Night', stage: 'Cafe Amphitheatre', eventId: events[7].id },
    { day: 2, startTime: '10:00', endTime: '16:00', title: 'AI/ML Workshop', stage: 'Computer Lab 3', eventId: events[3].id },
    { day: 2, startTime: '12:00', endTime: '18:00', title: 'Valorant Tournament', stage: 'Esports Arena', eventId: events[6].id },
    { day: 2, startTime: '16:00', endTime: '18:00', title: 'Nritya Dance Competition', stage: 'Main Auditorium', eventId: events[1].id },
    { day: 3, startTime: '10:00', endTime: '10:00', title: 'CodeStorm Final Presentations', stage: 'Innovation Lab', eventId: events[0].id },
    { day: 3, startTime: '14:00', endTime: '18:00', title: 'Cricket League Finals', stage: 'Main Ground', eventId: events[4].id },
    { day: 3, startTime: '19:00', endTime: '21:00', title: 'Closing Ceremony & Prize Distribution', stage: 'Main Stage' },
  ];
  await Promise.all(scheduleData.map((s) => prisma.festSchedule.create({ data: s })));
  console.log(`✅ Created ${scheduleData.length} schedule slots`);

  // ─── Sponsors ───
  await prisma.sponsor.createMany({
    data: [
      {
        name: 'TechCorp India',
        logoUrl: 'https://api.dicebear.com/8.x/shapes/svg?seed=TechCorp&backgroundColor=0a0a0f',
        tier: SponsorTier.title,
        website: 'https://techcorp.example.com',
      },
      {
        name: 'InnovateLabs',
        logoUrl: 'https://api.dicebear.com/8.x/shapes/svg?seed=InnovateLabs&backgroundColor=0a0a0f',
        tier: SponsorTier.gold,
        website: 'https://innovatelabs.example.com',
      },
      {
        name: 'CampusConnect',
        logoUrl: 'https://api.dicebear.com/8.x/shapes/svg?seed=CampusConnect&backgroundColor=0a0a0f',
        tier: SponsorTier.silver,
        website: 'https://campusconnect.example.com',
      },
    ],
  });
  console.log('✅ Created 3 sponsors');

  // ─── Notifications ───
  await Promise.all(
    students.slice(0, 5).map((s) =>
      prisma.notification.create({
        data: {
          userId: s.id,
          title: 'Welcome to PRISMA Fest 2025!',
          body: 'Your account is verified. Start exploring events and register now!',
          type: 'welcome',
        },
      }),
    ),
  );
  console.log('✅ Created sample notifications');

  // ─── Announcements ───
  await prisma.announcement.create({
    data: {
      title: '🎉 PRISMA Fest 2025 is officially live!',
      body: 'Registrations are now open for all events. Early bird discounts available on paid events. Visit the events page to browse and register.',
      priority: 'normal',
      createdById: admin.id,
    },
  });
  console.log('✅ Created sample announcement');

  // ─── Feedback ───
  await Promise.all([
    prisma.feedback.create({
      data: { userId: students[0].id, eventId: events[2].id, rating: 5, comment: 'Absolutely incredible energy!' },
    }),
    prisma.feedback.create({
      data: { userId: students[1].id, eventId: events[2].id, rating: 4, comment: 'Great performances, venue could be bigger.' },
    }),
  ]);
  console.log('✅ Created sample feedback');

  console.log('\n🚀 Seed complete! All data ready.');
  console.log('\n📧 Login credentials (all users): Password123');
  console.log('   Admin:     admin@prismafest.com');
  console.log('   Organizer: riya@prismafest.com / arjun@prismafest.com');
  console.log('   Students:  student1@prismafest.com ... student10@prismafest.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
