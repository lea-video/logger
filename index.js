const FS = require('fs');
const HTTPS = require('https');

class Logger {
  constructor(module, file, remote) {
    this._stdout = false;
    this._file = file;
    this._remote = remote;
    this._module = module;
  }
  
  setSTDOUT(stdout) {
    this._stdout = stdout;
  }
  
  _log(level, txt, ...payload) {
    const expanded = {
      level,
      module: this._module,
      msg: txt,
      payload,
      stack: (new Error()).stack,
      time: Date.now(),
    };
    if(target._file) {
      FS.appendFile(target._file, JSON.stringify(expanded) + '\n')
    }
    if(target._stdout) {
      console.log(`${level}@[${new Date(expanded.time).toISOString()}]${JSON.stringify(expanded)}`);
    }
    if(target._remote) {
      const req = HTTPS.request(`${target._remote.ip}:${target._remote.port}${target._remote.path}`, {auth: target._remote.auth});
      req.write(JSON.stringify(expanded));
      req.end();
    }
  }
}
Logger.levels = ['debug', 'info', 'warn', 'error'];
for(const level of Logger.levels) {
  Logger.prototype[level] = (...args) => Logger.prototype._log(level, ...args);
}

exports.initFile = (module, file) => {
  return new Logger(module, file, null);
}
exports.initRemote = (module, ip, auth, port, path) => {
  return new Logger(module, null, {
    ip,
    auth,
    port,
    path,
  });
}
