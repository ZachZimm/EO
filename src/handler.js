var url = require('url');
var fs = require('fs');
var DB;

var KrakenClient; // Make these const
var client;
var self;
// const config = require('configuration')


// const kraken = require('node-kraken-api');
// const api = kraken(require('./../config/config.json'));

// var config;
var orders = [];
var closedOrders = [];

var checkTime;
var logonTime;
var balance;
var tickerPrice;

function Handler(cfg)
{
    self = this;
    this.config = cfg;
  
    KrakenClient = require('./krakenClient')
    client = new KrakenClient(cfg.key, cfg.secret)

    var  testFind, connectDB, replaceDB, sendToDB, callBalance, callOpenOrders, callClosedOrders, 
    callOpenPositions, callClosedPositions, callTime, 
    callTicker, callPlaceOrder, callCancelOrder, callDepth, 
    callSpread, callOHLC, beginThread
    
    testFind = async (req) => {
        console.log( "Key :",req)
        var collection = DB.collection('orders');
        collection.find({"key":{$in: [req]}}).forEach((data => {
            console.log("Key : ", req, " Data : ", data.key, "Match : ", (req == data.key))
        }))
    }

    connectDB = async (db) => {
        DB = db;
        console.log("Mongo Connected to Hanlder!")
    }
    self.connectDB = connectDB;


    replaceDB = async (req) => {
        return new Promise((resolve, reject) => {
            collection = DB.collection('orders');
            collection.deleteMany({"type":{ $in:["buy"]}})
            collection.deleteMany({"type":{ $in:["sell"]}})
            collection.insertMany(req);
            resolve(req)
        })
    }
    self.replaceDB = replaceDB    

    sendToDB = async (req) => { // this function is nearly useless in this state
        compareDB(req).then((orderArr) => {
            if(orderArr.length > 1) // orderArr.length == result.insertedCount
            {
                collection.insertMany(orderArr, (err, result) => {
                    if(err) console.log("Error ! ", err)
                    else( console.log("-Pushed " + result.insertedCount + " documents to mongo"))
                })
            }
            else if (orderArr.length == 1)
            {
                collection.insertOne(orderArr, (err, result) => {
                    if(err) console.log("Error ! ", err)
                    else( console.log("-Pushed 1 document to mongo"))
                });
            }
            else{console.log("-Pushed 0 documents to mongo")}
        })
        .catch((error) => console.log(error))
        // collection.find().toArray((err, data) => {
        //     if (err) { console.log("Error! ", data)}
        //     else if (data.length) { callback(data) }
        //     else {console.log("Error ! No data found!")}
        // })
    }
    self.sendToDB = sendToDB;

    callBalance = async (res) => {
        client.api('Balance')
            .then(data => { res = data })
            .catch(err => { res = err; console.log("Error! ", err.message) });
    };
    self.callBalance = callBalance
    
    callOpenOrders = async (res) => {
        client.api('OpenOrders', {userref: 0})
            .then(data => {
                var i = 0;
                var lev;
                for(var key in data.open)
                {
                     
                    if(data.open[key].descr.leverage != "none")
                    { lev = parseInt(data.open[key].descr.leverage[0]) }
                    else { lev = 1 }
                    
                    var order = {
                        key: key,
                        pair: data.open[key].descr.pair,
                        volume: parseFloat(data.open[key].vol),
                        price: data.open[key].descr.price,                        
                        leverage: lev,
                        type: data.open[key].descr.type,
                        stopprice: parseFloat(data.open[key].stopprice),
                        limitprice: parseFloat(data.open[key].limitprice),
                        opentime: parseInt(data.open[key].opentm)
                    };

                    orders[i] = order;
                    i++;
                    
                    console.log(order.pair
                        + "\t: " + order.leverage
                        + "x " + order.volume.toFixed(2)
                        + "\t@ " + order.price
                        + "\t: " + order.type);
                }
                // sendToDB(orders);
                replaceDB(orders);
                // testFind(orders[0].key)                
                // testFind(orders[1].key)                
            })
            .catch(err => { res = err; console.log("Error! ", err.message) });
    }
    self.callOpenOrders = callOpenOrders

    // Untested
    callClosedOrders = async (res) => {
        console.log(config.key);
        client.api('ClosedOrders', {userref: 0})
            .then(data => {
                var i = 0;
                for(var key in data.open)
                {
                    var order = {
                        key: key,
                        pair: data.open[key].descr.pair,
                        volume: parseFloat(data.open[key].vol),
                        price: data.open[key].descr.price,
                        leverage: parseInt(data.open[key].descr.leverage[0]),
                        type: data.open[key].descr.type,
                        stopprice: parseFloat(data.open[key].stopprice),
                        limitprice: parseFloat(data.open[key].limitprice),
                        opentime: parseInt(data.open[key].opentm)
                    };
                    
                    closedOrders[i] = order;
                    i++;
                    
                    console.log(order.pair
                        + "\t: " + order.leverage
                        + "x " + order.volume.toFixed(2)
                        + "\t@ " + order.price
                        + "\t: " + order.type);
                }
            })
            .catch(err => { res = err; console.log("Error! ", err.message) });
    }
    self.callClosedOrders = callClosedOrders

    callOpenPositions = async (res) => {
        client.api('OpenPositions')
            .then(data => console.log(data))
            .catch(err => { res = err; console.log("Error! ", err.message) });
    }
    self.callOpenPositions = callOpenPositions

    // Untested
    callClosedPositions = async (res) => {
        client.api('ClosedPositions')
            .then(data => console.log(data))
            .catch(err => { res = err; console.log("Error! ", err.message) });
    }
    self.callClosedPositions = callClosedPositions

    callPlaceOrder = async (req) => { // req is an object {ticker, volume, side, type, price, leverage}
        return new Promise((resolve, reject) => {
            client.api('AddOrder', {
                pair: req.ticker,
                volume:req.volume,
                type: req.side,
                ordertype: req.type,
                price: req.price,
                leverage: req.leverage
        })
        .then((data) => resolve(data))
        .catch((err) => reject(err))
    })
     } // Unfinished (clearly)
    self.callPlaceOrder = callPlaceOrder

    callCancelOrder = async (txid, res) => {
        client.api('CancelOrder', {txid: txid})
            .then(data => {
                res = (data.descr.order)
                console.log("\"" + data.descr.order + "\" canceled!")
            })
            .catch(err => { res = err; console.log("Error! ", err.message) });
    }
    self.callCancelOrder = callCancelOrder

    // Untested
    callSpread = async (pair, time, res) => {
        api.call('Spread', {pair: pair, time: time}) // 'time' is unixtime
            .then(data => { res = data })
            .catch(err => { res = err; console.error(err);});
    }
    self.callSpread = callSpread

    callDepth = async (pair, count) => {
        api.call('Depth', {pair: pair, count: count})
            .then(data => res = data)
            .catch(err => { res = err; console.log("Error! ", err.message) });
    }
    self.callDepth = callDepth

    callTicker = async (ticker, res) => {
        client.api('Ticker', {pair: ticker})
            .then(data => {
                var num = (24*60) / data[ticker].t[1];
                console.log(num + " minutes per trade");
                res = data;
                console.log(ticker);
                console.log("Ask : \t   " + data[ticker].a[0])
                console.log("Last : " + data[ticker].c[0]);
                console.log("Bid : \t   " + data[ticker].b[0])
            })
            .catch(err => { res = err; console.log("Error! ", err.message) });
    }
    self.callTicker = callTicker;

    callTime = async (isLogon, res) => {
            client.api('Time')
                .then(data => {
                    if(isLogon == 1)
                    {
                        res = data.unixtime
                        checkTime = logonTime;
                        logonTime = data.unixtime;
                        console.log("Welcome!", "It is " + logonTime + " O'clock!\n");
                    }
                    else
                    {
                        checkTime = data.unixtime
                        console.log(checkTime)
                    }
                })
                .catch(err => { res = err; console.log("Error! ", err.message) });
    };
    self.callTime = callTime

    beginThread = () => {
        // Check details about API limits
        // loop synchronously every some ms

        // check price of selected asset
        // Log price
    }
    self.beginThread = beginThread

    callTime(1);
};

// Handler.prototype.assetPairs = async () => {
//     client.api('AssetPairs')
//         .then(data => {
//             for(var pair in data)
//             {
//                 console.log(pair + " : " + data[pair].altname + "\n-");
//             }
//         })
//         .catch(err => console.log("Error! ", err)); 
// }

function renderHTML(path, response)
{
    response.writeHead(200, {'Content-Type': 'text/html'});

    fs.readFile(path, null, async (error, data) => {
        if(error)
        {
            response.writeHead('404');
            response.write('File not found');
        }
        else
        {
            response.write(data);
        }
        response.end();
    })
}

Handler.prototype.handleRequest = (request, response) => {
    // request = './index.html'
    response.writeHead(200, {'Content-Type': 'text/html'});
    
    var path = url.parse(request.url).pathname;
    switch(path)
    {
    case '/':
        renderHTML('./html/index.html', response);
        break;
    case '/trade':
        renderHTML('./html/trade.html', response);
        var timeResponse;
        callTime(timeResponse);
        console.log(timeResponse);
        break;
    case '/trade2':
        renderHTML('./html/trade.html', response);
        callDepth();
        break;
    case '/spread':
        renderHTML('./html/trade.html', response);
        callSpread();
        break;
    case '/balance':
        renderHTML('./html/trade.html', response);
        callBalance();
        break;
    case '/openorders':
        renderHTML('./html/trade.html', response);
        openOrders();
        break;
    case '/openpositions':
        renderHTML('./html/trade.html', response);
        openPositions();
        break;
    case '/cancelorder':
        renderHTML('./html/trade.html', response);
        cancelOrder();
        break;
    case '/ticker':
        renderHTML('./html/trade.html', response);
        ticker('XETCXXBT');
        break;
    case '/pairs':
        renderHTML('./html/trade.html', response);
        assetPairs();
        break;
    default:
        renderHTML('./html/404.html', response);
        break;
    }
}

module.exports = Handler


/*
    I wonder whether this could be made api-neutral through method abstraction
    It would be accomplished via assigning functions to variables
    That way, arbitrage could be effectively fee-free, you'd just have to actively maintain accounts on multiple exchanges.

    Maybe that's going to be a crux of this program. The ability to easily manage accounts on multiple excjanges simultaniously
    Damn, for that to be completely effective without relying on somehting like TradingView, that would require quite a bit of front end work
    This might have to turn into a multi person affair just to be usable. I need to be careful with how I work out the front end portions.
    At first, TradingView integration might be worth looking into, just to get up and running. Hopefully that doesn't mean sending each value
    individually. You'd hope I can just use their chars on my site, like Binance.us except I'm not binance

    Where could Cameron fit into all of this? (I think) He's looking for a reliable, large income from a traditional job
    Carson seemed content with having a job at The Home Depoot. I wonder if he's changed his mind. I wonder if I could shape him into
        MY front end guy
    What about Aiden Donohue? I think he was interested in hardware but maybe I could come up with a use for him.
        I should ask him about whether his interests have changed though
    There are lots of people out there, I just need the ones with the right attrubutes. (Dating Service)
    Perhaps integrating TradingView would be a decent idea. But that would make me reliant on TradingView, and cut into profits
*/

/* What is RSI?

    I have stopped using RSI but I think it's important to know what it does at the very least.
    I mean in terms of how it's derrived.

*/

/*  Moving Resistance Flow
    
    Compares various resistance metrics (Ichimoku, MA, BB, Volu, Voli) and optputs a number 0-1 or 0-100 or something
    that represents the correlation between those inputs. Clearly some logic and careful selection of inputs would be required (or would it?).
    That output would likely be its own graph and may also be worth investingating, derivitave and what not.
    This study will also draw a single line on the chart that represents a moving resistance. I'm not sure how the details are going to
    work out but that's the jist of it.
*/

/*  Trend Strength Indicator

    Using various, as of yet undefined, inputs (of course) the price's likliness to test and cross (important distonction) resistance is determined
    Volitility would have to be taken into account as it is fairly common to see massive jumps. I would need some way of predicting those.
    Regular price movements would likely be the majority of the input. The output of this study would be a discrete chart which shows the 
    liklihood of resistance activity.

*/

/*  What's Next?

    All that's needed at first is just to send a tweet
    Maybe - honestly that might be something for the next project
    There's going to be something to do once this works.
    I need to bring in consistent income with a public facing buisness - cheap education?
    Maybe I'll study educational theory and history. I could make it a real thing. It's been an interest for a while
*/  

/*  Strategy Tidbits

    Cut losses early, add to the winners.

    Gonna have to learn a hell of a lot about statistics
    I wonder if volume wieghted charts are a thing

*/

/*   TODO
    make some variables const : search "const"
    place an order 
    run a loop and update the price - I'm concerned this won't be best with node but you never know

    I should be accounting for different ordre types, limit, market, stop-loss, trailing-stop

    get front end to work with back end - still
    use an event-driven system : do the .emit thing to send requests to this file
        -maybe not?


 */