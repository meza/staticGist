var express = require("express");
var http = require('http');
var app = express();
var engines = require('consolidate');
app.use(express.logger());
app.use("/flash", express.static(__dirname + '/public/flash'));

app.engine('.haml', engines.haml);
app.set('view engine', 'haml');

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'Something broke!');
});

app.get('/', function(request, response) {
	response.render('index');
});


app.get('/gist', function(request, response) {
    if(request.query.gistUrl == undefined) {
        response.redirect('/');
    }
    var url = request.query.gistUrl.replace("https", "http");

    if(url.substring(url.length-5)!=".json") {
        url += ".json";
    }

    var req = http.get(url, function(res) {
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));

    if(res.statusCode!=200) {
        response.send(500, "Oh no.");
        request.end();
    }

	var body = '';
	res.on('data', function(chunk) {
		body += chunk
		});
	res.on('end', function() {
		var data = JSON.parse(body);
		var html = data.div;
		var css = "<link rel=\"stylesheet\" href=\"http://www.github.com"+data.stylesheet+"\"/>";
		var content = css+"\n"+html;
		response.render('gist', {gist: content});
	});
	
	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
	  
    });
    
});



var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
