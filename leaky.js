var esprima = require('esprima');

// copied from https://github.com/substack/node-syntax-error
function LeakError (opts, src, file) {
  Error.call(this);
    
  this.message = 'global leak detected: ' + opts.variable;

  this.line = opts.line;
  this.column = opts.column;
  
  this.annotated = '\n'
    + (file || '(anonymous file)')
    + ':' + this.line
    + '\n'
    + src.split('\n')[this.line - 1]
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
  }
  var err = new LeakError(opts, src, file);
  throw err;
}

function check(src, file) {
  var obj = esprima.parse(src, {loc: true});

  var declared = [];

  function getIds(node) {
    return node.declarations.map(function(child) {
      return child.id.name;
    });
  }

  function walk(node) {
    if (Array.isArray(node.body)) {
      var added = 0;
      node.body.forEach(function(child) {

        if (child.type === 'VariableDeclaration') {
          child.declarations.map(function(obj) {
            declared.push(obj.id.name);
            added++;
          });
          return;
        }

        if (child.type === 'FunctionDeclaration') {
            var id = child.id.name;
            added += 1;
            declared.push(id);
        }
      });

      node.body.forEach(walk);

      declared.length = declared.length - added;
      return;
    }

    if (node.type === 'AssignmentExpression') {
      if (node.left && node.left.name) {
        var name = node.left.name;
        if (declared.indexOf(name) === -1) {
          throwError(node.loc.start, name, src, file)
        }
      }
    }

    if (node.type === 'UpdateExpression') {
      if (node.argument && node.argument.name) {
        var name = node.argument.name;
        if (declared.indexOf(name) === -1) {
          throwError(node.loc.start, name, src, file)
        }
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