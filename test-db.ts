import { db } from './src/lib/db.js'; 
async function test() {
  try {
    const hosts = await db.host.findMany({ take: 1 });
    console.log('Database connection successful:', hosts.length, 'hosts found');
  } catch (error: any) {
    console.error('Database connection failed:', error.message);
  }
}
test();
