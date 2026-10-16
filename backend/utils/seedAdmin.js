const User = require('../models/User');

/**
 * Ensures a designated system administrator account exists in the database.
 * Credentials and identity are driven entirely by environment variables.
 */
const seedAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@careerai.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePass123!';
    const adminName = (process.env.ADMIN_NAME || 'System Administrator').trim();

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`🛡️ [Security] System Administrator initialized: ${adminEmail}`);
    } else {
      let needsSave = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        needsSave = true;
      }
      if (needsSave) {
        await admin.save();
        console.log(`🛡️ [Security] User ${adminEmail} elevated to Administrator.`);
      } else {
        console.log(`🛡️ [Security] Administrator verified: ${adminEmail}`);
      }
    }

    return admin;
  } catch (error) {
    console.error(`⚠️ [Security] Failed to bootstrap administrator account: ${error.message}`);
  }
};

module.exports = seedAdmin;
