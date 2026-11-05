if(process.env.NODE_ENV !="production"){
require('dotenv').config()
}
const express = require('express');
const app = express();
const mongoose  = require('mongoose');
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ejsMate = require('ejs-mate');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const path = require('path');
const methodOverride = require('method-override');
const session = require("express-session");
const flash = require("connect-flash");
const dbUrl = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/wanderlust';
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname,"/public")));
app.set("views", path.join(__dirname, "views"));

const port = 8080;

//sessionOptions
const sessionOptions={
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now() + 7*24*60*60*1000,
      maxAge:7*24*60*60*1000,
      httpOnly:true,
  }
}
//session meddleware
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

 app.use(express.static(path.join(__dirname,"/public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// Middleware to serve static files
app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride('_method'));            

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter)               
app.use("/",userRouter);


// Connect to MongoDB
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}


app.get("/Search", async (req, res) => {
  const { title } = req.query; // Use query parameter
  let listings;
  if (title) {
    listings = await Listing.findOne({ title }).populate("reviews");
    if (!listings) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }
    return res.render("listings/show", { listing: listings });
  }
  listings = await Listing.find({});
  res.render("listings/index", { listings });
});

app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong"} = err;
  res.status(statusCode).render("StatusError", { statusCode, message });
});
app.use((req, res, next) => {
  res.status(404).render("StatusError", { statusCode: 404, message: "Page Not Found" });
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`); 
}); 
