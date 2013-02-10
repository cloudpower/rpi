var state = 'off'; 
$("#state-button").click(function(){
    if(state == 'on'){
        state = 'off';
        $("state-button").text('turn on');
        $.get('/api/v1/off', function(data){
            console.log(data);
        });
    }
    else if(state=='off'){
        state = 'on';
        $("#state-button").text('turn off');
        $.get('/api/v1/on', function(data){
            console.log(data);
        });
    }
});