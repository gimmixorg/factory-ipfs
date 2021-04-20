import IPFS from 'ipfs';
import polka from 'polka';
import fileUpload from 'express-fileupload';
import bodyparser from 'body-parser';
import cors from 'cors';
import unzipper from 'unzipper';
import fetch from 'node-fetch';

let node;
IPFS.create().then(_node => {
  node = _node;
});

polka()
  .use(cors(), fileUpload(), bodyparser.json())
  .use((_req, res, next) => {
    res.json = data => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, PUT, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, Content-Type, X-Auth-Token'
    );
    next();
  })
  .post('/upload', async (req, res) => {
    const data = await node.add(req.files.files.data);
    return res.json({ hash: data.path });
  })
  .post('/uploadJSON', async (req, res) => {
    const body = req.body;
    const data = await node.add(JSON.stringify(body));
    return res.json({ hash: data.path });
  })
  .get('/uploadSite', async (req, res) => {
    const { buildURL } = req.query;
    const buffer = await fetch(buildURL).then(res => res.buffer());
    const directory = await unzipper.Open.buffer(buffer);
    const files = await Promise.all(
      directory.files.map(async file => {
        return {
          path: file.path.replace('out/', 'site/'),
          content: await file.buffer()
        };
      })
    );
    const results = [];
    for await (const result of node.addAll(files)) {
      results.push(result);
    }
    return res.json({
      url: `ipfs://${results[results.length - 1].cid}`
    });
  })
  .listen(3000);
