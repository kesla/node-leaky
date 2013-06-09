var esprima = require('esprima');
var syntaxError = require('syntax-error');

// LeakError copied from https://github.com/substack/node-syntax-error
function LeakError (opts, src, file) {
  Error.call(this);

  this.message = 'global leak detected: ' + opts.variable;

  this.line = opts.line - 1;
  this.column = opts.column;

  this.annotated = '\n'
    + (file || '(anonymous file)')
    + ':' + this.line
    + '\n'
    + src.split('\n')[this.line]
    + '\n'
    + Array(this.column + 1).join(' ') + '^'
    + '\n'
    + 'LeakError: ' + this.message
  ;
}

LeakError.prototype = new Error;

LeakError.prototype.toString = function () {
  return this.annotated;
};

LeakError.prototype.inspect = function () {
  return this.annotated;
};

function throwError(start, name, src, file) {
  var opts = {
    line: start.line
    , column: start.column
    , variable: name
  };
  throw new LeakError(opts, src, file);
}

function check(src, file) {
  src = src.replace(/^#![^\n]*/, '');
  src = '(function(){\n' + src + '\n})();';

  var err = syntaxError(src, file);
  if (err) {
    return err;
  }

  var obj = esprima.parse(src, {loc: true});

  var declared = [];
  var globals = Object.keys(global).concat(['errno', 'exports', 'module']);

  function getIds(node) {
    return node.declarations.map(function(child) {
      return child.id.name;
    });
  }

  function collectDeclarations(node) {
    var added = 0;

    if (node.id && node.id.name) {
      added++;
      declared.push(node.id.name);
      // deal with 'var a = function b() {}' where only 'a' should be defined as a variable
      if (node.init && node.init.type === 'FunctionExpression') {
        return added + collectDeclarations(node.init.body);
      }
    }

    if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
      return 0;
    }

    Object.keys(node).forEach(function(key) {
      var child = node[key];
      if (Array.isArray(child) || child && child.type) {
        added += collectDeclarations(child);
      }
    });
    return added;
  }

  function collectParams(node) {
    var params = node.params.map(function(param) {
      return param.name;
    })
    declared = declared.concat(params);
    return params.length;
  }

  function walk(node) {
    var name;

    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'Program') {
      var added = collectDeclarations(node.body);
      if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
        added += collectParams(node);
      }
      walk(node.body);
      declared.length = declared.length - added;
      return;
    }

    if (node.type === 'AssignmentExpression' && node.left && node.left.name) {
      name = node.left.name;
      if (declared.indexOf(name) === -1 && globals.indexOf(name) === -1) {
        throwError(node.loc.start, name, src, file);
      }
    }

    Object.keys(node).forEach(function(key) {
      var child = node[key];
      if (Array.isArray(child)) {
        child.forEach(walk);
      } else if (child && typeof(child) === 'object' && child.type) {
        walk(child);
      }
    });
  }

  try {
    walk(obj);
  } catch(e) {

    if (e instanceof LeakError) {
      return e;
    }

    throw e;
  }
}

module.exports = check;
module.exports.LeakError = LeakError;
