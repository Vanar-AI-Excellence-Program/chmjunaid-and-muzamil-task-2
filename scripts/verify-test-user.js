import 'dotenv/config';

const port = process.env.PORT || 5174;
const base = process.env.BASE_URL || `http://localhost:${port}`;
const email = process.env.TEST_EMAIL_TO || 'testuser@local.test';

async function main() {
  const { spawn } = await import('node:child_process');
  const token = await new Promise((resolve, reject) => {
    const p = spawn(process.execPath, ['scripts/get-token.js', email]);
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d.toString()));
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('close', (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(err || `exit ${code}`));
    });
  });

  if (!token) {
    console.error('No verification token found for', email);
    process.exit(2);
  }

  const res = await fetch(`${base}/verify-email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token })
  });
  const body = await res.text();
  console.log('Verify status:', res.status, body);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




