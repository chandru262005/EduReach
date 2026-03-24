require('dotenv').config();
const mongoose = require('mongoose');

// We just copy the strict mapping logic dynamically from the db instance manually instead of ts modules to run easily
const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  eventType: String,
  date: Date,
  durationHours: Number,
  location: {
    address: String,
    city: String,
    schoolId: mongoose.Schema.Types.ObjectId
  },
  requirements: {
    skills: [String],
    maxVolunteers: Number
  },
  volunteersRegistered: [mongoose.Schema.Types.ObjectId],
  volunteersAttended: [mongoose.Schema.Types.ObjectId],
  status: String,
  createdBy: mongoose.Schema.Types.ObjectId
});

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

const seedEvents = [
  {
    title: "Weekend Tamil Literacy Support",
    description: "Join us in helping slow-learning primary students at a rural Government High School catch up with fundamental Tamil reading and writing skills. Patience and a kind heart are the only prerequisites!",
    eventType: "teaching",
    date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    durationHours: 4,
    location: {
      address: "Salem Govt High School, Annadhanapatti",
      city: "Salem",
    },
    requirements: {
      skills: ["Tamil Fluency", "Primary Education", "Patience"],
      maxVolunteers: 10
    },
    status: "upcoming"
  },
  {
    title: "Spoken English and Confidence Workshop",
    description: "Help standard 10 students overcome stage fear and the English communication barrier to tackle future higher-edu interviews confidently.",
    eventType: "workshop",
    date: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days
    durationHours: 6,
    location: {
      address: "Madurai Corporation Sec School, Kalavasal",
      city: "Madurai",
    },
    requirements: {
      skills: ["English Fluency", "Public Speaking", "Mentoring"],
      maxVolunteers: 5
    },
    status: "upcoming"
  },
  {
    title: "Math & Science Board Exam Crash Course",
    description: "Looking for engineering/science graduates to guide underprivileged 10th-grade board exam aspirants with foundational algebra and physics formulas over weekends.",
    eventType: "mentoring",
    date: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
    durationHours: 5,
    location: {
      address: "Chennai Public Govt School, T-Nagar",
      city: "Chennai",
    },
    requirements: {
      skills: ["Mathematics", "Physics", "Teaching"],
      maxVolunteers: 8
    },
    status: "upcoming"
  },
  {
    title: "School Library Setup & Sorting Drive",
    description: "Help us physically organize, categorize, and label thousands of donated textbooks and storybooks to set up the very first functional library for this middle school.",
    eventType: "infrastructure_help",
    date: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
    durationHours: 8,
    location: {
      address: "Trichy Boys Middle School, Cantonment",
      city: "Tiruchirappalli",
    },
    requirements: {
      skills: ["Organizing", "Library Management", "Dedication"],
      maxVolunteers: 15
    },
    status: "upcoming"
  },
  {
    title: "Basic Computer Literacy Bootcamp",
    description: "Introduce basic MS Word, Excel, and safe Internet researching skills to 8th-grade girls from rural backgrounds. Computers will be strictly provided at the center.",
    eventType: "teaching",
    date: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000),
    durationHours: 4,
    location: {
      address: "Coimbatore Siruvani Govt HSS, Vadavalli",
      city: "Coimbatore",
    },
    requirements: {
      skills: ["Computer Literacy", "MS Office", "Teaching"],
      maxVolunteers: 6
    },
    status: "upcoming"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Seeding");
    
    // Find an admin user to attach createdBy
    let adminAuth = await mongoose.connection.db.collection('auths').findOne({ role: 'admin' });
    let createdById = adminAuth ? adminAuth.user_id : new mongoose.Types.ObjectId();

    // Attach admin id to all mock events
    const populatedEvents = seedEvents.map(ev => ({
      ...ev,
      createdBy: createdById,
      volunteersRegistered: [],
      volunteersAttended: []
    }));

    await Event.insertMany(populatedEvents);
    console.log("Successfully seeded 5 highly targeted educational mock events!");
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
