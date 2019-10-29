var orders = {};

$(document).ready( () => {
    $("#getOrder_button").click( () => { // getOrder_button
        $.ajax({
            url: 'orders',
            type: 'GET',
            dataType: 'json',
            success: getOrders
        });
    });

});

const getOrderId = (orderId) => {
    orderId = $('orderNum_entry').val();
};

const getKey = (key) => {
    key = $('key_entry').val();
}

const getOrderInfo = (orderId, key) => {
    console.log("Vol ", orders[key].vol); // I can't remember the object's structure
}

const getOrders = (data) => {
    console.log(data);
    orders = data;
    var wrapper = $('#wrapper'), container;
    for(var key in data)
    {   
        container = $('<div id = "order" class = "container"><div');
        wrapper.append(container);
        container.append('<div class = "item">' + key + '</div>');
        container.append('<div class = "color">' + data[key].color + '</div>');
        container.append('<div class = "height">' + data[key].height + '</div>');

    }
    // $('#status').html('Orders : ' + data);
};