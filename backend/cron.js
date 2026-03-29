const cron = require("node-cron");
const Capsule = require("./models/Capsule");
const Memory = require("./models/Memory");
// Using mock email since nodemailer password is not available.

// Run every minute for testing/demo purposes, but optimally runs every midnight "0 0 * * *"
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    
    // Unlock Capsules
    const capsulesToUnlock = await Capsule.find({
      isUnlocked: false,
      unlockDate: { $lte: now }
    });

    if (capsulesToUnlock.length > 0) {
      console.log(`[Cron] Found ${capsulesToUnlock.length} capsules to unlock.`);
      
      for (const capsule of capsulesToUnlock) {
        capsule.isUnlocked = true;
        await capsule.save();
        
        // Mock email logic
        console.log(`[Email Mock] 📧 Sent unlock notification to user regarding capsule: "${capsule.title}"`);
      }
    }

    // Unlock Memories
    const memoriesToUnlock = await Memory.find({
      isLocked: true,
      unlockDate: { $lte: now }
    });

    if (memoriesToUnlock.length > 0) {
      console.log(`[Cron] Found ${memoriesToUnlock.length} memories to unlock.`);
      
      for (const memory of memoriesToUnlock) {
        memory.isLocked = false;
        await memory.save();
        
        console.log(`[Email Mock] 📧 Sent unlock notification to user regarding a memory on ${memory.date}`);
      }
    }

  } catch (error) {
    console.error("[Cron] Error processing unbounding of memories:", error);
  }
});

console.log("✅ Cron job initialized successfully.");
