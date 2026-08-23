const http = require('http');

const data = JSON.stringify({
  email: 'testaccount4@example.com',
  displayName: 'Test Account',
  password: 'password1234'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/v1/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'http://localhost:3000',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
