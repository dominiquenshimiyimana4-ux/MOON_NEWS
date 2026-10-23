import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Article from './models/Article';
import Comment from './models/Comment';
import { connectDB } from './config/database';
import { hashPassword } from './utils/password';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Article.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const hashedPassword = await hashPassword('password123');
    const adminPassword = await hashPassword('kajipo123');
    const users = await User.insertMany([
      {
        name: 'kajipo tefu',
        email: 'kajipo tefu',
        password: adminPassword,
        role: 'admin',
        avatar: 'https://picsum.photos/seed/admin/100/100',
      },
      {
        name: 'Editor User',
        email: 'editor@moonnews.rw',
        password: hashedPassword,
        role: 'editor',
        avatar: 'https://picsum.photos/seed/editor/100/100',
      },
      {
        name: 'Author One',
        email: 'author1@moonnews.rw',
        password: hashedPassword,
        role: 'journalist',
        avatar: 'https://picsum.photos/seed/author1/100/100',
      },
    
      {
        name: 'Author Two',
        email: 'author2@moonnews.rw',
        password: hashedPassword,
        role: 'journalist',
        avatar: 'https://picsum.photos/seed/author2/100/100',
      },
      {
        name: 'Reader User',
        email: 'reader@moonnews.rw',
        password: hashedPassword,
        role: 'reader',
        avatar: 'https://picsum.photos/seed/reader/100/100',
      },
    ]);
    console.log('Created 5 users');

    // Create articles
    const articles = await Article.insertMany([
      {
        slug: 'rwanda-launches-digital-innovation-initiative',
        title: {
          rw: 'U Rwanda rwatangije gahunda nshya y\'ikoranabuhanga',
          en: 'Rwanda launches a new digital innovation initiative',
        },
        subtitle: {
          rw: 'Gahunda igamije guteza imbere urubyiruko rukora mu ikoranabuhanga',
          en: 'The programme aims to grow a youth-led technology sector',
        },
        excerpt: {
          rw: 'Gahunda nshya izafasha urubyiruko kubona amahugurwa, inkunga n\'ibikorwa remezo by\'ikoranabuhanga mu gihugu hose.',
          en: 'A new initiative will provide young people with training, funding and technology infrastructure across the country.',
        },
        content: {
          rw: 'U Rwanda rwatangije gahunda nshya y\'ikoranabuhanga igamije guteza imbere urubyiruko no kongera umubare w\'ibigo bikora software mu gihugu. Ibi bibaye intambwe ikomeye ku ikoranabuhanga mu Rwanda, kandi abasesenguzi bavuga ko ingaruka zabyo zizumvikana kure y\'itangazo ryatanzwe.',
          en: 'Rwanda has launched a new digital innovation initiative designed to empower young people and expand the country\'s software industry. This marks a significant moment for digital innovation in Rwanda, and observers say its effects will be felt well beyond the announcement.',
        },
        category: 'technology',
        authorId: users[2]._id,
        image: 'https://picsum.photos/seed/moon-digital/1200/800',
        imageCaption: 'Young developers at a Kigali innovation hub.',
        tags: ['innovation', 'technology', 'youth', 'kigali'],
        status: 'published',
        featured: true,
        breaking: true,
        readingTime: 5,
        views: 12400,
        shares: 245,
        commentsCount: 0,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        slug: 'kigali-markets-post-strong-quarter',
        title: {
          rw: 'Isoko ry\'imari i Kigali ryagaragaje iterambere rikomeye',
          en: 'Kigali financial markets post a strong quarter',
        },
        excerpt: {
          rw: 'Ibigo by\'imari n\'ishoramari byagaragaje inyongera, biterwa n\'ubucuruzi n\'ishoramari rishya.',
          en: 'Financial institutions and investors reported gains, driven by trade and fresh investment.',
        },
        content: {
          rw: 'Isoko ry\'imari i Kigali ryasoze igihembwe ku rwego rwiza, biterwa n\'ishoramari rishya n\'ubucuruzi mpuzamahanga.',
          en: 'Kigali\'s financial markets closed the quarter on a strong footing, buoyed by new investment and cross-border trade.',
        },
        category: 'business',
        authorId: users[3]._id,
        image: 'https://picsum.photos/seed/moon-markets/1200/800',
        tags: ['economy', 'markets', 'investment'],
        status: 'published',
        featured: true,
        readingTime: 4,
        views: 8300,
        shares: 156,
        commentsCount: 0,
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        slug: 'national-football-league-title-race',
        title: {
          rw: 'Irushanwa rya shampiyona y\'umupira w\'amaguru rirarushaho gukataza',
          en: 'National football league title race heats up',
        },
        excerpt: {
          rw: 'Amakipe abiri ararwanira igikombe nyuma y\'imikino iheruka y\'amatsinda.',
          en: 'Two clubs are battling for the title after a dramatic round of fixtures.',
        },
        content: {
          rw: 'Irushanwa rya shampiyona y\'umupira w\'amaguru mu Rwanda rirarushaho gukataza nyuma y\'imikino iheruka.',
          en: 'The national football league title race has intensified after a dramatic round of results.',
        },
        category: 'sports',
        authorId: users[2]._id,
        image: 'https://picsum.photos/seed/moon-football/1200/800',
        tags: ['football', 'league', 'sports'],
        status: 'published',
        readingTime: 3,
        views: 5600,
        shares: 89,
        commentsCount: 0,
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        slug: 'health-ministry-launches-wellness-program',
        title: {
          rw: 'Minisiteri y\'ubuzima itangije gahunda nshya y\'amajwi n\'ubuzima',
          en: 'Health Ministry launches new wellness program',
        },
        excerpt: {
          rw: 'Icyetf cyitangiye gahunda y\'ubuzima igamije kugabanya indwara z\'ubuzima.',
          en: 'A new health initiative aims to reduce lifestyle diseases across communities.',
        },
        content: {
          rw: 'Minisiteri y\'ubuzima itangije gahunda nshya y\'ubuzima igamije kugabanya indwara z\'ubuzima mu gihugu.',
          en: 'The Health Ministry has launched a comprehensive wellness program designed to reduce lifestyle diseases and improve public health outcomes.',
        },
        category: 'health',
        authorId: users[3]._id,
        image: 'https://picsum.photos/seed/moon-health/1200/800',
        tags: ['health', 'wellness', 'public health'],
        status: 'published',
        readingTime: 4,
        views: 3400,
        shares: 67,
        commentsCount: 0,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        slug: 'education-reforms-aim-to-modernize-schools',
        title: {
          rw: 'Igenamigambi nkuru mu mwalimu igamije kunoza amasomo',
          en: 'Education reforms aim to modernize school curriculum',
        },
        excerpt: {
          rw: 'Igenamigambi nshya yatangijwe kubona isomo rihoze n\'ikoranabuhanga.',
          en: 'New education reforms aim to integrate technology into the learning experience.',
        },
        content: {
          rw: 'Igenamigambi nkuru mu mwalimu itangijwe kugirango amasomo ahoze n\'ikoranabuhanga n\'ubwenge.',
          en: 'A new education reform initiative has been launched to modernize school curricula and prepare students for the digital age.',
        },
        category: 'education',
        authorId: users[2]._id,
        image: 'https://picsum.photos/seed/moon-education/1200/800',
        tags: ['education', 'reform', 'schools'],
        status: 'published',
        featured: true,
        readingTime: 5,
        views: 6200,
        shares: 124,
        commentsCount: 0,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log('Created 5 sample articles');

    // Create sample comments
    const comments = await Comment.insertMany([
      {
        articleId: articles[0]._id,
        authorName: 'techie_rw',
        authorAvatar: 'https://picsum.photos/seed/comment1/50/50',
        content: 'Great initiative! This will really help young tech enthusiasts in Rwanda.',
        likes: 5,
      },
      {
        articleId: articles[0]._id,
        authorName: 'innovator_kigali',
        authorAvatar: 'https://picsum.photos/seed/comment2/50/50',
        content: 'Looking forward to applying for this program. Exciting times ahead!',
        likes: 3,
      },
      {
        articleId: articles[1]._id,
        authorName: 'finance_guru',
        authorAvatar: 'https://picsum.photos/seed/comment3/50/50',
        content: 'Strong quarter indeed. The economy seems to be on the right track.',
        likes: 7,
      },
    ]);
    console.log('Created 3 sample comments');

    // Update comment counts
    articles[0].commentsCount = 2;
    articles[1].commentsCount = 1;
    await articles[0].save();
    await articles[1].save();

    console.log('✓ Seed data loaded successfully!');
    console.log('\nDemo Accounts:');
    console.log('- Admin: kajipo tefu / kajipo123');
    console.log('- Editor: editor@moonnews.rw / password123');
    console.log('- Journalist: author1@moonnews.rw / password123');
    console.log('- Reader: reader@moonnews.rw / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
