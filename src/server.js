const http = require('http');
// const fs = require('fs');
const expressjs = require('./express') // The express.js file that handles front end
const expressfw =  require('express'); // Importing Express
const express = expressfw(); // Initilizing Express

express.use(expressfw.static('res'));
// express.set('view engine', 'ejs');

const app = require('./app')

var htmlPath = './index.html';
var htmlErr = 0;


// function onRequest(request, response)
// {
//     response.writeHead(200, {'Content-Type': 'text/html'});
//     fs.readFile('./index.html', null, function(error, data){
//         if(error)
//         {
//             response.writeHead(404);
//             response.write('Page not found');
//         }
//         else
//         {
//             response.write(data);
//         }
//         response.end();
//     });

// }

express.listen(8080, () => {
    expressjs.start(express);
    expressjs.handleRequest();
});
http.createServer(app.handleRequest).listen(8000);
app.start();