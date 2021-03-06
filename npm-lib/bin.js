module.exports = bin;

var npm = require("./npm.js");
var osenv = require("osenv");
var output = require("./utils/output.js");

bin.usage = "npm bin [--global]";

function bin(args, silent, cb) {
  if (typeof cb !== "function") {
    cb = silent;
    silent = false;
  }
  var b = npm.bin;
  var PATH = osenv.path();

  if (!silent) output(b);
  process.nextTick(cb.bind(this, null, b));

  if (npm.config.get("global") && PATH.indexOf(b) === -1) {
    npm.config.get("logstream").write("(not in PATH env variable)\n");
  }
}
