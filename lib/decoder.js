var childProcess = require('child_process');

var zbar = childProcess.spawn('zbarcam', ['--nodisplay']);

zbar.stdout.on('data', function(data){
    console.log(JSON.parse(data.toString().split('QR-Code:')[1]));
    zbar.kill();
});

