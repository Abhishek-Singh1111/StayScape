require('dotenv').config();

const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const initData = require('./data.js');

const ownerId = '684e4f53116ea6f8b0bc1a33';

const initDb = async () => {
  const dbUrl = process.env.ATLASDB_URL;
  if (!dbUrl) {
    throw new Error('ATLASDB_URL must be set to initialize the cloud database.');
  }

  const { hostname } = new URL(dbUrl);
  if (['localhost', '127.0.0.1', '::1'].includes(hostname)) {
    throw new Error('Refusing to initialize a local database; configure ATLASDB_URL for Atlas.');
  }

  await mongoose.connect(dbUrl);
  try {
    await Listing.deleteMany({});
    const listings = initData.data.map((listing) => ({ ...listing, owner: ownerId }));
    const insertedListings = await Listing.insertMany(listings);
    console.log(`Initialized ${insertedListings.length} listings.`);
  } finally {
    await mongoose.disconnect();
  }
};

initDb().catch((err) => {
  console.error('Failed to initialize listings:', err);
  process.exitCode = 1;
});
