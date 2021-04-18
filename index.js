import IPFS from 'ipfs';
import polka from 'polka';
import fileUpload from 'express-fileupload';

let node;
IPFS.create().then(_node => {
  node = _node;
});

polka()
  .use(fileUpload())
  .use((_req, res, next) => {
    res.json = data => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  })
  .get('/ipfs/:hash', async (req, res) => {
    const cid = req.params.hash;
    for await (const file of node.get(cid)) {
      if (!file.content) continue;
      const content = [];
      for await (const chunk of file.content) {
        content.push(chunk);
      }
      res.end(content[0]);
    }
  })
  .post('/upload', async (req, res) => {
    const data = await node.add(req.files.files.data);
    return res.json({ hash: data.path });
  })
  .listen(3000);
