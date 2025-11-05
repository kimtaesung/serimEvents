const bcrypt = require('bcryptjs');

const password = 'admin123';
const salt = 10;

bcrypt.hash(password, salt, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Hashed password for admin123:');
  console.log(hash);
  
  // Verify the hash
  bcrypt.compare(password, hash, (err, result) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('Verification result:', result);
  });
});
