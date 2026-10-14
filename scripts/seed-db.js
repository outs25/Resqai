const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || 3000,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function seedDatabase() {
  const port = process.env.PORT || 3000;
  console.log(`[ResQAI] Seeding database via http://localhost:${port}/api/demo/seed...`);

  try {
    const res = await post(`http://localhost:${port}/api/demo/seed`, { reset: true });
    if (res.status === 200) {
      console.log('✅ Database seeded successfully!');
      console.log('Telemetry summary:', res.body);
    } else {
      console.error('❌ Seeding returned status:', res.status, res.body);
    }
  } catch (err) {
    console.error('❌ Could not connect to ResQAI server to seed. Make sure the server is running on port', port);
    console.error('Error detail:', err.message);
  }
}

seedDatabase();
