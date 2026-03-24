import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://ais-dev-vruyfslezvhfasj53bjowy-6305977561.europe-west3.run.app/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id: 'test', data: 'a'.repeat(2 * 1024 * 1024) }])
    });
    console.log(res.status, await res.text());
  } catch (e) {
    console.error(e);
  }
}
test();
