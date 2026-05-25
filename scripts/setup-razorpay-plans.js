const Razorpay = require('razorpay');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const instance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_StgUf4nSAvrqWc',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'RlfPGrUvrMuZmOEmPB2bNcDs',
});

const plansToCreate = [
  {
    period: 'monthly',
    interval: 1,
    item: {
      name: 'Creator Pro - Monthly (INR)',
      amount: 999 * 100, // 999 INR
      currency: 'INR',
      description: 'Creator Pro Monthly Subscription'
    },
    notes: { type: 'creator_monthly_inr' }
  },
  {
    period: 'yearly',
    interval: 1,
    item: {
      name: 'Creator Pro - Yearly (INR)',
      amount: 7999 * 100, // 7999 INR
      currency: 'INR',
      description: 'Creator Pro Yearly Subscription'
    },
    notes: { type: 'creator_yearly_inr' }
  },
  {
    period: 'monthly',
    interval: 1,
    item: {
      name: 'Studio Unlimited - Monthly (INR)',
      amount: 3499 * 100, // 3499 INR
      currency: 'INR',
      description: 'Studio Unlimited Monthly Subscription'
    },
    notes: { type: 'studio_monthly_inr' }
  },
  {
    period: 'yearly',
    interval: 1,
    item: {
      name: 'Studio Unlimited - Yearly (INR)',
      amount: 27999 * 100, // 27999 INR
      currency: 'INR',
      description: 'Studio Unlimited Yearly Subscription'
    },
    notes: { type: 'studio_yearly_inr' }
  }
];

async function setupPlans() {
  console.log('Creating Razorpay Plans...');
  const envUpdates = [];

  for (const planData of plansToCreate) {
    try {
      const plan = await instance.plans.create(planData);
      console.log(`✅ Created Plan: ${planData.item.name} -> ID: ${plan.id}`);
      
      const envKey = `RAZORPAY_PLAN_${planData.notes.type.toUpperCase()}`;
      envUpdates.push(`${envKey}=${plan.id}`);
    } catch (err) {
      console.error(`❌ Error creating ${planData.item.name}:`, err.message);
    }
  }

  if (envUpdates.length > 0) {
    const envPath = path.resolve(__dirname, '../.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    envUpdates.forEach(update => {
      // If it already exists, replace it
      const key = update.split('=')[0];
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, update);
      } else {
        envContent += `\n${update}`;
      }
    });

    // Also add the RAZORPAY_KEY_ID and SECRET if they are not in .env yet
    if (!/NEXT_PUBLIC_RAZORPAY_KEY_ID=/.test(envContent)) {
      envContent += `\nNEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_StgUf4nSAvrqWc`;
    }
    if (!/RAZORPAY_KEY_SECRET=/.test(envContent)) {
      envContent += `\nRAZORPAY_KEY_SECRET=RlfPGrUvrMuZmOEmPB2bNcDs`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('✅ Successfully updated .env file with new Razorpay configuration.');
  }
}

setupPlans();
