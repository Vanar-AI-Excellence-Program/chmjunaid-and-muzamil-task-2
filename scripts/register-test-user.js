import 'dotenv/config';

const port = process.env.PORT || 5174;
const base = process.env.BASE_URL || `http://localhost:${port}`;

const email = process.env.TEST_EMAIL_TO || 'testuser@local.test';

async function main() {
  const res = await fetch(`${base}/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password: 'Test1234!' })
  });
  const body = await res.text();
  console.log('Register status:', res.status, body);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




