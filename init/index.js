const mongoose  = require('mongoose');
const Listing = require('../models/listing.js');
const { object } = require('joi');
const initData = require('./data.js'); 
const dbUrl = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/wanderlust';
      // Connect to MongoDb
 main()
 .then(()=>{
     console.log("connected to db");
 }).catch( (err)=>{
     console.log(err);
 })
 async function main(){
  await mongoose.connect(dbUrl)
   
 }
const initDb = async () => {
  await Listing.deleteMany({});
  // Fix: map over initData.data and set owner
  const listings = initData.data.map(obj => ({ ...obj, owner: '684e4f53116ea6f8b0bc1a33' }));
  await Listing.insertMany(listings);
  console.log("data was initialized");
};

initDb();