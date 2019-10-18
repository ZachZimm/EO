var express;
var orders;

const sendToBrowser = (req, res) => {
    if(req) { res.send(req); }
    else { res.send("Not found"); }
}

module.exports = {
    handleRequest: async (req, res) => {
        express.get('orders', (req, res) => {
            req = 
            sendToBrowser(res, req);
            });

        express.get('/orders', (req, res) => { 
            req = orders; 
            sendToBrowser(req, res);
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
    start: async (req, res) => {
        express = req;
        orders = {
            'philip': {color: "green", height: "2"},
            "john": {color: "blue", height: "8"},
            'caroline': {color: "orange", height: '4'}
        }

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

        console.log("Expresso is served!")
    }
}