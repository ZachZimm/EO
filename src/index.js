const mongo = require('mongodb').MongoClient;

const mongoUrl = 'mongodb://localhost:27017/eo'
var DB;

const http = require('http');
// const fs = require('fs');
const expressjs = require('./express') // The express.js file that handles front end
const expressfw =  require('express'); // Importing Express
const express = expressfw(); // Initilizing Express

express.use(expressfw.static('res'));
// express.set('view engine', 'ejs');

const config = require('./../config/config.json')
const Handler = require('./handler')
const handler = new Handler(config)

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

var res;
var ticker = 'XETHXXBT'
express.listen(8080, () => {
    expressjs.start(express);
    expressjs.handleRequest();
});

mongo.connect(mongoUrl, {useNewUrlParser: true}, (err, client) => {
    if(err)
    {
        console.log("Error! ", err)
    }
    else
    {
        console.log("Mongo Connection Established!")

        getData(client.db('eo'), (data) => { 
            expressjs.connectDB(DB);
            handler.connectDB(DB);
        })

    }
})

const getData = (db, callback) => {
    DB = db;
    var collection = DB.collection('orders');
    
    collection.find().toArray((err, data) => {
        if (err) { console.log("Error! ", err) }
        else if(data.length) { callback(data); }
        else { console.log("No data found") }
    })
}
handler.callOpenOrders(res);
// handler.callTicker(ticker, res);
// handler.callPlaceOrder(
//     {ticker:"XETHXXBT", volume: "1", side: "buy", type:"limit", price: "0.01800", leverage: "3"})
//     .then((data) => console.log(data))
//     .catch((err) => console.log("Error!", err))




// console.log(res)
// http.createServer(app.handleRequest).listen(8000);
