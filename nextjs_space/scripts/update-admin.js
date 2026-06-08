const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function main() {
  const filePath = path.resolve(__dirname, '../firebase-mock.json');
  if (!fs.existsSync(filePath)) {
    console.error('firebase-mock.json not found');
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  const adminEmail = 'yuku8434023311@gmail.com';
  const adminPassword = 'Yuvraj@1221';

  // Find admin user
  const adminIndex = data.users.findIndex(u => u.email.toLowerCase() === adminEmail.toLowerCase());
  if (adminIndex === -1) {
    console.error('Admin user not found in firebase-mock.json');
    return;
  }

  // Generate bcrypt hash
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(adminPassword, salt);

  // Update password in mock database
  data.users[adminIndex].password = hash;
  data.users[adminIndex].role = 'ADMIN'; // Ensure role is ADMIN

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Successfully updated admin user: ${adminEmail} with hashed password for "${adminPassword}"`);
}

main().catch(err => {
  console.error('Error updating admin:', err);
});
