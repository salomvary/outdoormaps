var http = require('http');
var url = require('url');
var domain = 'map.turistautak.hu';

http.createServer(function(proxyReq, proxyResp) {
  var query = decodeURIComponent(url.parse(proxyReq.url).query);
  var destParams = url.parse(query);

  if(destParams.hostname && destParams.pathname) {
    var validHost = destParams.hostname.indexOf(domain, destParams.hostname.length - domain.length) !== -1;

    if(validHost) {

      var reqOptions = {
          host : destParams.hostname,
          port : destParams.port,
          path : destParams.pathname,
          method : "GET"
      };

      console.log(reqOptions);

      var req = http.request(reqOptions, function(res) {
          var headers = res.headers;
          headers['Access-Control-Allow-Origin'] = '*';
          headers['Access-Control-Allow-Headers'] = 'X-Requested-With';
          proxyResp.writeHead(200, headers);

          res.on('data', function(chunk) {
              proxyResp.write(chunk);
          });

          res.on('end', function() {
              proxyResp.end();
          });
      });

      req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
          proxyResp.writeHead(503);
          proxyResp.write("An error happened!");
          proxyResp.end();
      });

      req.end();

    } else {
      proxyResp.writeHead(403, destParams.host + ' is not permitted');
      proxyResp.end();
    }
  } else {
    proxyResp.writeHead(400);
    proxyResp.end();
  }

}).listen(12354);
