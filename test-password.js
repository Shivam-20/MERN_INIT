import bcrypt from 'bcryptjs';

async function testPassword() {
  const password = 'password123';
  const hashedPassword = '$2a$12$n3TZj32WXjBH/Deq.9ZSKOpDPEkvvzl2aYSNNKZ/QHEVk28vySsqm';
  
  console.log('Testing password comparison...');
  console.log('Password:', password);
  console.log('Hashed password from DB:', hashedPassword);
  
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('Password matches:', isMatch);
  } catch (error) {
    console.error('Error comparing passwords:', error);
  }
}

testPassword();
