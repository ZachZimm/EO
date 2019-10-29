var express;
var DB;
var orders = [];

const sendToBrowser = (req, res) => {
    if(req) { res.send(req); }
    else { res.send("Not found"); }
}

module.exports = {
    handleRequest: async (req, res) => {

        express.get('/orders', (req, res) => { 
            req = orders; 
            sendToBrowser(req, res);
         });
         express.get('/mongo', (req, res) => {
            getData('orders', (data) => {
                sendToBrowser(data, res);
            })
         });
         express.get('/orders/:key', (req, res) => {
             const key = req.params.key;
             req = orders[key];
             sendToBrowser(req, res);
         });

         express.get('/trade', (req, res) => {
             req = "Trade"
             sendToBrowser(req, res);
         });
    },
    start: (exp, res) => {
        express = exp;
        console.log("Expresso is served!")
        // express.get('/orders', (request, res) => {
        //     console.log("Getting Orders!");
            
            
        //     res.send(orders);
        // })

        // express.get('/orders/:order', (request, res) => {
        //     const order = request.params.order;
        //     if(orders[order])
        //     {
        //         res.send(orders[order])
        //     }
        //     else
        //     {
        //         res.send("Invalid Request.");
        //     }
        // })
    },
    connectDB: (db) => {
        DB = db;
        getData('orders', (data) => { orders = data; })
        console.log("Mongo Connected to Express!")
    }
}

const getData = (collectionStr, callback) => { // I should (probably) use a cursor here
    var coll = DB.collection(collectionStr);

    coll.find().toArray((err, data) => {
        if (err) { console.log("Error! ", data)}
        else if (data.length) { callback(data) }
        else {console.log("Error ! No data found!")}
    })
}

/*
    res.redirect('path') - to redirect

    I'm not sure if I should be storing orders in ram (probably) or 
    accessing them with mongo
*/