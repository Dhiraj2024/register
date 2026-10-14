const bcrypt = require('bcryptjs');

/**
 * Utility script to generate a bcrypt password hash for server environment variables.
 * Usage:
 *   node utils/generateHash.js [password]
 * Example:
 *   node utils/generateHash.js admin123
 */

const password = process.argv[2] || 'admin321';
const saltRounds = 10;

console.log('--------------------------------------------------');
console.log('Bcrypt Password Hash Generator');
console.log('--------------------------------------------------');
console.log(`Hashing password: "${password}"`);

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }

  console.log('\nGenerated Hash:');
  console.log(hash);
  console.log('\nAdd this to your server/.env or Vercel environment variables:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('--------------------------------------------------');
});
