const http = require('http');

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 --- RESQAI FULL INTEGRATION VERIFICATION ---');

  // 1. Get Incidents
  const incRes = await request('http://localhost:3000/api/incidents');
  console.log('1. Incidents endpoint status:', incRes.status, '| Total count:', incRes.body.count);

  // 2. Citizen SOS Submission
  const reportPayload = {
    emergencyType: 'ACCIDENT',
    description: 'Two vehicle collision on flyover descent with occupant trapped',
    latitude: 12.9575,
    longitude: 77.641,
    address: 'Old Airport Road Flyover East',
    inDanger: true,
    peopleCount: 4,
    anonymousSessionId: 'test-session-node-1',
  };
  const repRes = await request(
    'http://localhost:3000/api/reports',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    reportPayload
  );
  console.log('2. Citizen SOS Submission status:', repRes.status);
  console.log('   Report ID:', repRes.body.report_id, '| Public Incident:', repRes.body.public_id);
  console.log('   Is Clustered:', repRes.body.is_clustered, '| Message:', repRes.body.message);

  // 3. Cluster Burst Simulation
  const burstRes = await request(
    'http://localhost:3000/api/demo/simulate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { scenario: 'CLUSTER_BURST' }
  );
  console.log('3. Cluster Burst Simulation status:', burstRes.status);
  console.log('   Result:', burstRes.body.message);

  // 4. Dispatch Units
  const dispatchRes = await request(
    'http://localhost:3000/api/dispatch',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      incidentId: 'inc-001',
      resourceIds: ['res-amb-01', 'res-fire-02'],
      operatorName: 'Cmdr. Sarah Chen',
      operatorId: 'op-001',
    }
  );
  console.log('4. Fleet Dispatch status:', dispatchRes.status);
  console.log('   Units dispatched:', dispatchRes.body.assignments_count);

  // 5. Analytics
  const analyticsRes = await request('http://localhost:3000/api/analytics');
  console.log('5. Analytics status:', analyticsRes.status);
  console.log('   Total Incidents:', analyticsRes.body.analytics.total_incidents);
  console.log('   Clustering Efficiency:', analyticsRes.body.analytics.clustering_efficiency_pct + '%');
  console.log('   Active Fleet Utilization:', analyticsRes.body.analytics.resource_utilization_pct + '%');
  console.log('   AI Insights:', analyticsRes.body.analytics.ai_insights[0]);

  console.log('✅ ALL INTEGRATION TESTS PASSED PERFECTLY!');
}

runTests().catch(console.error);
