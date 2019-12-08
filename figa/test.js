const async = require('async');

async.series([
    function(callback) {
        setTimeout(() => {

            console.log('Me first');
            callback(null, 'Me first');

        }, 2000)
    },
    function (callback) {
        console.log('Me 2');
        callback(null, 'Me 2');
    }
   ], function (error, result) {
       if (error) throw error;
       console.log(result);
   }
);