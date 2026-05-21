const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tiffintryal";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    
    try {
      const db = mongoose.connection.db;
      const paymentsColl = db.collection("payments");
      
      // Drop all old indexes except _id_
      console.log("🗑️  Dropping old indexes...");
      const indexes = await paymentsColl.getIndexes();
      
      for (const indexName in indexes) {
        if (indexName !== "_id_") {
          console.log(`   Dropping: ${indexName}`);
          await paymentsColl.dropIndex(indexName);
        }
      }
      
      console.log("✅ Old indexes dropped");
      console.log("✅ Database cleaned!");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  });
