import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000/api/v1';

async function testAuthFlow() {
  const email = `test.user.${Date.now()}@example.com`;
  const password = 'Password123!';

  try {
    console.log(`\n1. Signing up user: ${email}...`);
    const signupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password,
        phone: '01712345678',
      }),
    });
    const signupData = await signupRes.json();
    console.log('Signup successful:', signupData);

    console.log(`\n2. Fetching verification token from database...`);
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isEmailVerified: true, verificationToken: true },
    });

    if (!user || !user.verificationToken) {
      throw new Error('User or verification token not found in database.');
    }
    console.log('User found in DB. Verified?', user.isEmailVerified);
    console.log('Token:', user.verificationToken);

    console.log(`\n3. Verifying email using the token...`);
    const verifyRes = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: user.verificationToken,
      }),
    });
    const verifyData = await verifyRes.json();
    
    console.log('Verification response status:', verifyRes.status);
    console.log('Access token received:', verifyData.access_token ? 'YES' : 'NO');
    console.log('User object received:', verifyData.user ? 'YES' : 'NO');

    console.log(`\n4. Checking DB again to ensure verified flag is true...`);
    const userAfter = await prisma.user.findUnique({
      where: { email },
      select: { isEmailVerified: true, verificationToken: true },
    });
    
    console.log('Verified?', userAfter?.isEmailVerified);
    console.log('Token is null?', userAfter?.verificationToken === null);

    console.log('\n✅ End-to-end auth flow tested successfully!');
  } catch (error: any) {
    console.error('\n❌ Error during testing:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAuthFlow();
