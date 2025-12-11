require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/userSchema");

async function run() {
  const URL = process.env.MONGO_URI || "mongodb://localhost:27017/jobvibes";
  await mongoose.connect(URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

  const email = process.env.ADMIN_EMAIL || "admin.jobvibe@yopmail.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  const existing = await User.findOne({ email });
  console.log("------ ~ run ~ existing:------", existing);
  if (existing) {
    console.log("Admin user already exists:", email);
    await mongoose.connection.close();
    return process.exit(0);
  }

  const admin = await User.create({
    user_name: "admin_user",
    phone_number: "0000000000",
    email,
    password, // plaintext to match current auth service check
    role: "employer",
    name: "JobVibes",
    status: "active",
    company_name: "JobVibes",
  });

  console.log("✅ Admin user created:", admin.email);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("Seeder failed:", err);
  try {
    await mongoose.connection.close();
  } catch {}
  process.exit(1);
});
