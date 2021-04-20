const IPFS = require('ipfs');
const polka = require('polka');
const fileUpload = require('express-fileupload');
const bodyparser = require('body-parser');
const cors = require('cors');

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
  .listen(process.env.PORT || 3000);
