"use strict";
var path = require("path");
var fs = require("graceful-fs");
var rimraf = require("rimraf");
var asyncMap = require("slide").asyncMap;
var mkdirp = require("gentle-fs").mkdir;
var npm = require("../../npm.js.js");
var andIgnoreErrors = require("../and-ignore-errors.js");
var move = require("../../utils/move.js");
var isInside = require("path-is-inside");
var vacuum = require("fs-vacuum");

// This is weird because we want to remove the module but not it's node_modules folder
// allowing for this allows us to not worry about the order of operations
module.exports = function (staging, pkg, log, next) {
  log.silly("remove", pkg.path);
  if (pkg.target) {
    removeLink(pkg, next);
  } else {
    removeDir(pkg, log, next);
  }
};

function removeLink(pkg, next) {
  var base = isInside(pkg.path, npm.prefix) ? npm.prefix : pkg.path;
  rimraf(pkg.path, (err) => {
    if (err) return next(err);
    vacuum(pkg.path, { base: base }, next);
  });
}

function removeDir(pkg, log, next) {
  var modpath = path.join(
    path.dirname(pkg.path),
    "." + path.basename(pkg.path) + ".MODULES"
  );

  move(path.join(pkg.path, "node_modules"), modpath).then(
    unbuildPackage,
    unbuildPackage
  );

  function unbuildPackage(moveEr) {
    rimraf(
      pkg.path,
      moveEr ? andRemoveEmptyParents(pkg.path) : moveModulesBack
    );
  }

  function andRemoveEmptyParents(path) {
    return function (er) {
      if (er) return next(er);
      removeEmptyParents(pkg.path);
    };
  }

  function moveModulesBack() {
    fs.readdir(modpath, makeTarget);
  }

  function makeTarget(readdirEr, files) {
    if (readdirEr) return cleanup();
    if (!files.length) return cleanup();
    mkdirp(path.join(pkg.path, "node_modules"), function (mkdirEr) {
      moveModules(mkdirEr, files);
    });
  }

  function moveModules(mkdirEr, files) {
    if (mkdirEr) return next(mkdirEr);
    asyncMap(
      files,
      function (file, done) {
        var from = path.join(modpath, file);
        var to = path.join(pkg.path, "node_modules", file);
        // we ignore errors here, because they can legitimately happen, for instance,
        // bundled modules will be in both node_modules folders
        move(from, to).then(andIgnoreErrors(done), andIgnoreErrors(done));
      },
      cleanup
    );
  }

  function cleanup() {
    rimraf(modpath, afterCleanup);
  }

  function afterCleanup(rimrafEr) {
    if (rimrafEr) log.warn("remove", rimrafEr);
    removeEmptyParents(path.resolve(pkg.path, ".."));
  }

  function removeEmptyParents(pkgdir) {
    fs.rmdir(pkgdir, function (er) {
      // FIXME: Make sure windows does what we want here
      if (er && er.code !== "ENOENT") return next();
      removeEmptyParents(path.resolve(pkgdir, ".."));
    });
  }
}
