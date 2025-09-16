import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    // Test project table
    const projectCount = await prisma.project.count();
    console.log(`📊 Projects in database: ${projectCount}`);
    
    // Test task table
    const taskCount = await prisma.task.count();
    console.log(`📊 Tasks in database: ${taskCount}`);
    
    console.log('✅ Database connection test completed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
