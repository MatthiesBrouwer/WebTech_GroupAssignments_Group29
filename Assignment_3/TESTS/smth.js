var http = require('http');
var url = require('url');

var server = http.createServer(function(request, response) {
    var parsedUrl = url.parse(request.url, true);
    var queryAsObject = parsedUrl.query;
    var name = queryAsObject.name;

    response.writeHead(200, {'Content-Type' : 'text/plain'});
    response.end('Hello, ' + name + '\n');
});

server.listen(8081);

console.log('Server running at http://127.0.0.1:8081/');