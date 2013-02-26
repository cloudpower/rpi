"use strict";

var state = 'off';
$.get('/api/v1/online', function(data){
    if (data.online){
        $("#online-status").text('online');
    }
    else {
        $("#online-status").text('offline');
    }
});
$("#state-button").click(function(){
    if(state === 'on'){
        state = 'off';
        $("#state-button").text('turn on');
        $.post('/api/v1/outlet/3', {
            'state': 0
        }, function(data){
            console.log(data);
        });
    }
    else if(state === 'off'){
        state = 'on';
        $("#state-button").text('turn off');
        $.post('/api/v1/outlet/3', {
            'state': 1
        }, function(data){
            console.log(data);
        });
    }
});