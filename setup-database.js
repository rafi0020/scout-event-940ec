#!/usr/bin/env node

/**
 * Database Setup Script for Netlify
 * This script initializes the database with default data
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Check if database is already initialized
    const eventCount = await prisma.event.count();
    
    if (eventCount > 0) {
      console.log('ℹ️  Database already initialized');
      return;
    }

    console.log('🚀 Initializing database...');

    // Create default event
    const defaultEvent = await prisma.event.create({
      data: {
        name: 'Scout Event 2025',
        isOpen: true,
        leaderboardVisibility: 'TEAMS'
      }
    });

    console.log(`✅ Created default event: ${defaultEvent.name} (${defaultEvent.id})`);

    // Create admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = process.env.ADMIN_PASSWORD || 'Scout2025Admin!';
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const adminUser = await prisma.user.create({
      data: {
        role: 'ADMIN',
        email: process.env.ADMIN_EMAIL || 'admin@scout.event',
        passwordHash: passwordHash
      }
    });

    console.log(`✅ Created admin user: ${adminUser.email}`);

    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
