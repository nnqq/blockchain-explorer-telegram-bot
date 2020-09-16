const http = require('http');

module.exports = () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/healthz') {
      res.statusCode = 200;
      return res.end('');
    }

    res.statusCode = 404;
    return res.end('');
  });

  server.listen(process.env.HTTP_HEALTHZPORT);
};
