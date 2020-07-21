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
      stack: new Error().stack,
      time: Date.now(),
    };
    if (this._file) {
      FS.appendFile(this._file, `${JSON.stringify(expanded)}\n`);
    }
    if (this._stdout) {
      let date = new Date(expanded.time).toISOString();
      // eslint-disable-next-line no-console
      console.log(`${level}@[${date}]${JSON.stringify(expanded)}`);
    }
    if (this._remote) {
      const req = HTTPS.request({
        method: 'POST',
        host: this._remote.ip,
        port: this._remote.port,
        // Path also includes query
        path: this._remote.path,
        headers: { lea_auth: this._remote.auth },
      });
      req.write(JSON.stringify(expanded));
      req.end();
    }
  }
}
Logger.levels = ['debug', 'info', 'warn', 'error'];
for (const level of Logger.levels) {
  Logger.prototype[level] = function(...args) {
    this._log(level, ...args)
    return this;
  }
}

exports.initFile = (module, file) => new Logger(module, file, null);
exports.initRemote = (module, ip, auth, port=443, path='/') => new Logger(module, null, {
  ip,
  auth,
  port,
  path,
});
