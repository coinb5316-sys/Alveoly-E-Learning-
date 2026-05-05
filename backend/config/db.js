import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Remove deprecated options - they are no longer supported in Mongoose 7+
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📚 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('\n📋 Troubleshooting:');
    console.error('1. Check your internet connection');
    console.error('2. Verify MongoDB Atlas IP whitelist includes your IP');
    console.error('3. Confirm username and password are correct');
    console.error('4. Ensure database user has proper permissions');
    console.error('5. Try using local MongoDB: mongodb://localhost:27017/alveoly_db');
    process.exit(1);
  }
};

export default connectDB;