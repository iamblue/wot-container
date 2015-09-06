var _wot = require('wot.js');

var child_process = require('child_process');
var wot = _wot.init({
  port: 8000,
});

function booting (config) {
  // console.log(process.env.PWD)
  var msgProcess = child_process.spawn('node', ['./app/index'], { stdio: ['ipc'] })
  // var msgProcess = child_process.fork('./test/app.js');

  wot.on('device:onMessage', function(data) {
    if (data.type === '@command'){
      if (wot.auth) {
        if( !wot.auth(config.info)) {
          return wot.emit('device:emitMessage', 'you dont have permission!')
        }
      }
    }

    return msgProcess.send(data);
  });

  wot.schema = config.schema;

  msgProcess.on('message', function(data) {
    wot.emit(data.type, data.data);
  });

  msgProcess.on('close', function(e){
    return booting(config);
  });

}

module.exports = new booting({
  schema: {
    command: {
      '@type': 'command',
      '@context': {}
    },
    device: {
      '@type': 'device',
      '@context': {
        'sendData': {}
      }
    }
  }
});