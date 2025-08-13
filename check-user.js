const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findFirst();
    console.log('User email:', user.email);
    console.log('Has password hash:', !!user.passwordHash);
    
    // Test demo password
    const isValid = await bcrypt.compare('demo123', user.passwordHash);
    console.log('Password demo123 valid:', isValid);
    
    // Generate correct password hash for demo123
    if (!isValid) {
      const newHash = await bcrypt.hash('demo123', 10);
      console.log('\nTo fix, update user with this hash:');
      console.log(newHash);
      
      // Update the user
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash }
      });
      console.log('User password updated!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();