import {db} from './db'

interface SeedLog{
  timestamp: number;
  time: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  trace:string;
  service: string;
  message: string;
}

const initialLogs: SeedLog[] = [
  {
    timestamp: Date.now() - 5 * 60 * 1000, 
    time: "14:42:18.904",
    level: "ERROR",
    service: "payment-api",
    message: "Connection pool exhausted after 30000ms",
    trace: "req_8f31a",
  },
  {
    timestamp: Date.now() - 2 * 60 * 60 * 1000, 
    time: "14:42:16.217",
    level: "WARN",
    service: "auth-service",
    message: "Rate limit approaching for client 10.0.4.21",
    trace: "req_8f319",
  },
  {
    timestamp: Date.now() - 20 * 60 * 1000, 
    time: "16:21:54.547",
    level: "DEBUG",
    service: "reg-service",
    message: "Some error",
    trace: "req_9c381a",
  },
  {
    timestamp: Date.now() - 3 * 60 * 60 * 1000, 
    time: "14:42:13.041",
    level: "INFO",
    service: "edge-router",
    message: "Request completed in 84ms · GET /v2/health",
    trace: "req_8f318",
  },
  {
    timestamp: Date.now() - 6 * 60 * 60 * 1000, 
    time: "14:42:08.653",
    level: "ERROR",
    service: "worker-sync",
    message: "Failed to process queue message: invalid payload",
    trace: "req_8f317",
  },
  {
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    time: "14:42:02.190",
    level: "INFO",
    service: "user-service",
    message: "Profile cache refreshed successfully",
    trace: "req_8f316",
  },
  {
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    time: "14:41:58.772",
    level: "WARN",
    service: "database",
    message: "Slow query detected · duration 1247ms",
    trace: "req_8f315",
  },
];

async function seed(): Promise<void> {
  console.log('Starting seed...');

  const Log = db.orm.public.Log;

  console.log('Clearing Log table...');
  await Log.where({}).deleteAll();

  
  const data = initialLogs.map((log) => ({
    timestamp: new Date(log.timestamp).toISOString(),
    level: log.level,
    service: log.service,
    message: log.message,
    trace: log.trace,
  }));

  
  console.log(`Inserting ${data.length} logs...`);
  const inserted = await Log.createAll(data);
  console.log(`✅ Inserted rows: ${inserted.length}`);

  
  const allLogs = await Log.all();
  console.log(` Total rows in DB: ${allLogs.length}`);
}

seed()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error('❌ Seed failed:');
    console.error(error);
    process.exit(1);
  });