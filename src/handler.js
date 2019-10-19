// const key = 'IZakOAo97IEKXeB0jqX9WsXf+D3EVAiOsundzuf3tL7x9HKvpFX912Ep';
// const secret = 'dXKXOFzthTQ2vBGFjjVB+Gk9stSLOMVYHd5hFxOZ4yydOaheSeN/aYID5ZGOoem3Wk3Q+Nn8wLXvwQ1tcc8e/w==';
// const pass = "tL14!OesbF4HIb%M";

var url = require('url');
var fs = require('fs');

var KrakenClient; // Make these const
var client;
var self;
// const config = require('configuration')


// const kraken = require('node-kraken-api');
// const api = kraken(require('./../config/config.json'));

// var config;
var orders = {};
var closedOrders = {};

var checkTime;
var logonTime;
var balance;
var tickerPrice;

function Handler(cfg)
{
    self = this;
    this.config = cfg;

    KrakenClient = require('./krakenClient')
    client = new KrakenClient(cfg.key, cfg.secret, {otp: cfg.pass})

    var callBalance, callOpenOrders, callClosedOrders, 
    callOpenPositions, callClosedPositions, callTime, 
    callTicker, callPlaceOrder, callCancelOrder, callDepth, 
    callSpread

    

    callBalance = async () => {
        client.api('Balance')
            .then(data => {
                console.log(data)
                console.log("---BALANCE---")
                console.log("Balance : ", data.XXBT, " BTC")
            })
            .catch(err => console.log(err.message));
    };
    
    callOpenOrders = async () => {
        console.log(config.key);
        client.api('OpenOrders', {userref: 0})
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
                    
                    orders[i] = order;
                    i++;
                    
                    console.log(order.pair
                        + "\t: " + order.leverage
                        + "x " + order.volume.toFixed(2)
                        + "\t@ " + order.price
                        + "\t: " + order.type);
                }
            })
            .catch(err => console.log("Error! ", err.message));
    }

    // Untested
    callClosedOrders = async () => {
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
            .catch(err => console.log("Error! ", err.message));
    }

    callOpenPositions = async () => {
        client.api('OpenPositions')
            .then(data => console.log(data))
            .catch(err => console.log("Error! ", err.message));
    }

    // Untested
    callClosedPositions = async () => {
        client.api('ClosedPositions')
            .then(data => console.log(data))
            .catch(err => console.log("Error! ", err))
    }

    callPlaceOrder = async () => { } // Unfinished (clearly)

    callCancelOrder = async (txid) => {
        client.api('CancelOrder', {txid: txid})
            .then(data => {
                console.log("\"" + data.descr.order + "\" canceled!")
            })
            .catch(err => console.log("Error! ", err));
    }

    // Untested
    callSpread = async (pair, time) => {
        api.call('Spread', {pair: pair, time: time}) // 'time' is unixtime
            .then(data => console.log(data))
            .catch(err => console.error(err));
    }

    callDepth = async (pair, count) => {
        api.call('Depth', {pair: pair, count: count})
            .then(data => console.log(data))
            .catch(err => console.log("Error! ", err))
    }

    callTicker = async (ticker) => {
        client.api('Ticker', {pair: ticker})
            .then(data => {
                var num = (24*60) / data[ticker].t[1];
                console.log(num + " minutes per trade");
                console.log(ticker);
                console.log("Ask : \t   " + data[ticker].a[0])
                console.log("Last : " + data[ticker].c[0]);
                console.log("Bid : \t   " + data[ticker].b[0])
            })
            .catch(err => {
                console.log("Error! ", err);
            })
    }

    callTime = async (isLogon) => {
        client.api('Time')
            .then(data => {
                if(isLogon == 1)
                {
                    logonTime = data.unixtime;
                    console.log("Welcome!", "It is " + logonTime + " O'clock!\n");
                    checkTime = logonTime;
                }
                else
                {
                    checkTime = data.unixtime;
                }
            })
            .catch(err => console.log("Error!", err.message));
    };

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

/*   TODO
    
    constructor
    public getters and setters(?)
    make some variables const : search "const"
    place an order 

    get front end to work with back end - still
    use an event-driven system : do the .emit thing to send requests to this file

 */