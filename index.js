const FS = require('fs');
const HTTPS = require('https');

const types = ['debug', 'warn', 'error'];
const target = { file: require('path').resolve(__dirname, './logs.txt, remote: null, stdout: false };
const e = module.exports = {};

e.setFileLocation = (location) => {
  target = {file: location};
}
e.removeFileLocation = () => {
  target.file = null;
}
e.setSTDOUT = () => {
  target.stdout = true;
}
e.removeSTDOUT = () => {
  target.stdout = false;
}
e.setRemoteLocation = (ip, auth, port=443, path='/') => {
  target = {remote: {ip, port, path, auth}};
}
e.removeFileLocation = () => {
  target.remove = null;
}

for(const type of types) {
  e[type] = (txt) => log(type, txt);
}
const log = (level, txt) => {
  const expanded = JSON.stringify({
    msg: txt,
    stack: (new Error()).stack,
    time: Date.now(),
  });
  if(target.stdout) {
    console.log(expanded);
  }
  if(target.file) {
    FS.appendFile(target.file, expanded + '\n')
  }
  if(target.remote) {
    const req = HTTPS.request(`${target.remote.ip}:${target.remote.port}${target.remote.path}`, {auth: target.remote.auth});
    req.write(expanded);
    req.end();
  }
}
