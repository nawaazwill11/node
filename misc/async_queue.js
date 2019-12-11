const async = require('async');
const server = require('http').createServer();

server.on('request', function (request, response) {

});
server.listen(8001);
async function afunc () {
    console.log('here');
    // create a queue object with concurrency 2
    var q = async.queue(function(task, callback) {
        console.log('hello ' + task.name);
        callback();
    }, 2);
    
    // assign a callback
    q.drain(function() {
        console.log('all items have been processed');
    });
    // or await the end
    await q.drain()
    
    // assign an error callback
    q.error(function(err, task) {
        console.error('task experienced an error');
    });
    
    // add some items to the queue
    q.push({name: 'foo'}, function(err) {
        console.log('finished processing foo');
    });
    // callback is optional
    q.push({name: 'bar'});
    
    // add some items to the queue (batch-wise)
    q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
        console.log('finished processing item');
    });
    
    // add some items to the front of the queue
    q.unshift({name: 'bar'}, function (err) {
        console.log('finished processing bar');
    });
}

afunc();