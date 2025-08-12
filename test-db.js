const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password',
  database: 'klassenbuch'
});

async function testConnection() {
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Current time from DB:', result.rows[0].now);
    
    await client.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Connection error:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();