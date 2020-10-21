import { exec } from 'child_process';
import { sep } from 'path';

import bufferEq from 'buffer-equal-constant-time';
import crypto from 'crypto';
import express from 'express';

const timeout = 8000;
const separator = '========================================';
const app = express();
app.use(express.raw({ type: 'application/json' }));

app.get('/', (_req, res) => {
  res.set('content-type', 'text/html; charset=utf-8');
  res.set('cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('pragma', 'no-cache');
  res.set('expires', 'no-store');
  res.set('surrogate-control', 'no-store');
  res.send('ready');
});

app.get('*', (_req, res) => {
  res.status(404).send();
});

app.post('/', (req, res) => {
  const xHubSignature256 = req.get('x-hub-signature-256');
  if (typeof xHubSignature256 !== 'string') {
    res.status(403).text('Signature is invalid.');
    return;
  }
  if (!(req.body instanceof Buffer)) {
    res.status(400).json({
      error: 'Header `Content-Type` should be `application/json`.',
    });
    return;
  }
  const signature = 'sha256=' + crypto.createHmac('sha256', Buffer.from(process.env.SECRET, 'utf8')).update(req.body).digest('hex');
  if (!bufferEq(Buffer.from(xHubSignature256, 'utf8'), Buffer.from(signature, 'utf8'))) {
    res.status(403).text('Signature is invalid.');
    return;
  }
  if (req.get('x-github-event') === 'push') {
    let body;
    try {
      body = JSON.parse(req.body.toString('utf8'));
    } catch (error) {
      res.status(400).text('Body should be a valid JSON string.');
      return;
    }
    const sshUrl = body && body.repository && body.repository.ssh_url;
    if (typeof sshUrl !== 'string') {
      res.status(400).text('Body should be a valid JSON string.');
      return;
    }
    let finish = false;
    exec(`sh ${__dirname}${sep}deploy.sh ${sshUrl.replace('git@github.com:', 'github:')}`, (error, stdout, stderr) => {
      if (!finish) {
        finish = true;
        res.send(`${separator}[RETURN]${separator}\n${error && error.code ? error.code : 0}\n${separator}[STDOUT]${separator}\n${stdout}\n${separator}[STDERR]${separator}\n${stderr}`);
      }
    });
    setTimeout(() => {
      if (!finish) {
        finish = true;
        res.status(202).send('Processing ...');
      }
    }, timeout);
  } else {
    res.send('Ready.');
    return;
  }
});

app.post('*', (_req, res) => {
  res.status(404).send();
});

app.all('*', (_req, res) => {
  res.set('Allow', 'GET, POST').status(405).send();
});

app.listen(8005);
