/**
 * Run to populate sample charities:
 *   node scripts/seedCharities.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Charity = require('../models/Charity');

const CHARITIES = [
  {
    name: 'Cancer Research UK',
    description: 'We are the world\'s leading cancer research organisation. We pioneer life-saving research to bring forward the day when all cancers are cured.',
    category: 'health',
    website: 'https://www.cancerresearchuk.org',
    isFeatured: true,
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/42/Cancer_Research_UK.svg/200px-Cancer_Research_UK.svg.png',
  },
  {
    name: 'The Golf Foundation',
    description: 'The Golf Foundation inspires and enables young people to play and enjoy golf, developing life skills through the sport.',
    category: 'sport',
    website: 'https://www.golf-foundation.org',
    isFeatured: true,
    logo: '',
    events: [
      { title: 'Junior Golf Day', date: new Date('2026-05-15'), description: 'Annual junior golf fundraiser', location: 'Wentworth Club, Surrey' },
    ],
  },
  {
    name: "Children's Society",
    description: 'We work with children and young people, giving them the help, skills and knowledge they need to thrive, and fighting for the changes they deserve.',
    category: 'community',
    website: 'https://www.childrenssociety.org.uk',
    isFeatured: false,
  },
  {
    name: 'WWF UK',
    description: "We're working to protect the natural world. We help people and nature thrive by tackling climate change and restoring the natural world that we all depend on.",
    category: 'environment',
    website: 'https://www.wwf.org.uk',
    isFeatured: false,
  },
  {
    name: 'Alzheimer\'s Research UK',
    description: 'We are the UK\'s leading dementia research charity, pioneering the science that will defeat dementia.',
    category: 'health',
    website: 'https://www.alzheimersresearchuk.org',
    isFeatured: false,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  let created = 0;
  for (const c of CHARITIES) {
    const exists = await Charity.findOne({ name: c.name });
    if (!exists) {
      await Charity.create(c);
      console.log('✅ Created:', c.name);
      created++;
    } else {
      console.log('⏭  Skipped (exists):', c.name);
    }
  }

  console.log(`\nDone. ${created} charities created.`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });