const http = require('http');

const payload = JSON.stringify({
  region: 'Test Firebase, Maharashtra',
  land_size_acres: 5,
  land_ownership: 'owned',
  annual_income_inr: 200000,
  crop_types: ['wheat'],
  household_size: 4,
  irrigation_access: true,
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/dataset',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(JSON.parse(data));
  });
});

req.write(payload);
req.end();
