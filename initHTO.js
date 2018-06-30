const fs = require('fs');
const parse5 = require('parse5');

let HTO = {};

function readFile(filePath, callback) {
  fs.readFile(filePath, 'utf8', function(err, data) {
    if (err) throw err;

    callback(data);
  });

}

function parse(file) {
  let ast = parse5.parseFragment(file);
  return ast;
}

function initHTO(root) {
  HTO = root;

  if (HTO.childNodes) {
    _traverse(HTO, -1);
  }

  return HTO;
}

function _traverse(node, indentBefore) {
  node.indentSize = indentBefore;
  delete node.parentNode;
  indentBefore ++;
  if (node.childNodes) {
    for (let childNode of node.childNodes) {
      _traverse(childNode, indentBefore);
    }
  }
}


module.exports = {
    readFile: readFile,
    parse: parse,
    initHTO: initHTO
  };
