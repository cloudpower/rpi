var express = require('express');

var app = express();

app.get('/', function(request, response){
    response.send('hello world');
});


app.listen(3000);
console.log('Listening on 3000');
