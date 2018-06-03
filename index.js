const fs = require('fs');
const parse5 = require('parse5');

function _readFile(filePath) {
  fs.readFile(filePath, 'utf8', function(err, data) {
    if (err) throw err;

    var indentedFile = _indent(data);
    // for(let char in data) {
    //   console.log(data[char]);
    // }
    // console.log(indentedFile);
  });
}

function _indent(file) {
  let root = parse5.parse(file);
  let html = '';
  let nodes = [];
  let indentStep = 2;
  let indentSize = 0;
  _traverse(root);
  console.log(html);
  // _buildHtml(nodes);

  function _traverse(node) {
    nodes.push({
      nodeName: node.nodeName,
      position: 'start'
    });
    // console.log(node);
    let indentedTabs = ' '.repeat(indentSize);
    if (node.nodeName === '#text') html +=  (indentedTabs + node.value + '\n');
    else html += indentedTabs + '<' + node.nodeName + '>' + '\n';

    indentSize += indentStep;

    if (node.childNodes && node.childNodes.length) {
      for (let childNode of node.childNodes) {
        // nodes.push(childNode.nodeName);
        if (['\n', '\n\n\n'].indexOf(childNode.value) > -1) continue;

        // html += '\n';

        _traverse(childNode);
      }

      nodes.push({
        nodeName: node.nodeName,
        position: 'end'
      });
      if (node.nodeName === '#text') { indentSize --; return;}
      else html += indentedTabs + '</' + node.nodeName + '>' + '\n';
      indentSize -= indentStep;
    } else {
      nodes.push({
        nodeName: node.nodeName,
        position: 'end'
      });
      if (node.nodeName === '#text') { indentSize --; return;}
      else html += indentedTabs + '</' + node.nodeName + '>' + '\n';
      indentSize -= indentStep;
    }



    // html += '\n';

  }

  // function _buildHtml(nodes) {
  //   let html = '';
  //   for(let node of nodes) {
  //   }
  // }


  return file;
}



_readFile('./cases/input-1.html');

module.exports = { _indent };
