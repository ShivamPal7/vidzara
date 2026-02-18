import 'dotenv/config'; // Load env vars first

import { prisma } from '../src/lib/prisma';
import { checkUsage, incrementUsage, getUsageSummary } from '../src/lib/usage';
import { Feature } from '../src/lib/prisma';

async function main() {
  console.log('Starting usage test...');

  // Create a dummy user
  const email = `test-usage-${Date.now()}@example.com`;
  console.log(`Creating user with email: ${email}`);
  
  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: 'Test Usage User',
        email,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
  } catch (e) {
    console.error("Failed to create user:", e);
    return;
  }

  console.log(`Created test user: ${user.id}`);

  try {
    const feature = Feature.VIDEO_SEO;
    
    // Check initial usage
    console.log('Checking initial usage...');
    const initialCheck = await checkUsage(user.id, feature);
    console.log('Initial Check:', initialCheck);

    if (initialCheck.usage !== 0) {
      throw new Error(`Expected usage to be 0, got ${initialCheck.usage}`);
    }

    // Increment usage
    console.log('Incrementing usage...');
    await incrementUsage(user.id, feature);
    
    // Check usage again
    const afterIncrement = await checkUsage(user.id, feature);
    console.log('After Increment:', afterIncrement);

    if (afterIncrement.usage !== 1) {
      throw new Error(`Expected usage to be 1, got ${afterIncrement.usage}`);
    }

    // Get summary
    console.log('Getting usage summary...');
    const summary = await getUsageSummary(user.id);
    console.log('Usage Summary for VIDEO_SEO:', summary[feature]);
    
    if (summary[feature].used !== 1) {
      throw new Error(`Expected summary used to be 1, got ${summary[feature].used}`);
    }
    
    // Test limit (Free plan limit is 3 for VIDEO_SEO)
    console.log("Testing limit enforcement...");
    await incrementUsage(user.id, feature); // 2
    await incrementUsage(user.id, feature); // 3
    
    const atLimit = await checkUsage(user.id, feature);
    console.log("At limit check:", atLimit);
    if (atLimit.allowed === false) { // Limit is 3, usage is 3. allowed should be false (usage < limit => 3 < 3 is false)
         console.log("At limit confirmed (allowed=false)");
    } else {
         throw new Error("Expected allowed to be false at limit. Got: " + atLimit.allowed);
    }

    console.log('✅ Usage tracking test passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    if (user) {
        console.log('Cleaning up...');
        await prisma.usageRecord.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  }
}

main();
