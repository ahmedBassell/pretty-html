const fs = require('fs');
const parse5 = require('parse5');

let maxLength = 100;

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
  let indentStep = 1;
  let indentSize = 0;
  _traverse(root);
  html = _oneLine(html);
  console.log(html);


  var fileName = 'output/file1.html';
  var stream = fs.createWriteStream(fileName);

  stream.once('open', function(fd) {
    // var html = html;

    stream.end(html);
  });
  // _buildHtml(nodes);

  function _traverse(node) {
    nodes.push({
      nodeName: node.nodeName,
      position: 'start'
    });
    // console.log(node);
    let indentedTabs = '\t'.repeat(indentSize);
    if (node.nodeName !== '#document') {
      if (node.nodeName === '#text') html +=  (indentedTabs + node.value + '\n');
      else html += indentedTabs + '<' + node.nodeName + '>' + '\n';

      indentSize += indentStep;
    }

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
      if (node.nodeName !== '#document') {
        if (node.nodeName === '#text') { indentSize --; return;}
        else html += indentedTabs + '</' + node.nodeName + '>' + '\n';
        indentSize -= indentStep;
      }
    } else {
      nodes.push({
        nodeName: node.nodeName,
        position: 'end'
      });
      if (node.nodeName !== '#document') {
        if (node.nodeName === '#text') { indentSize --; return;}
        else html += indentedTabs + '</' + node.nodeName + '>' + '\n';
        indentSize -= indentStep;
      }
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

function _oneLine(html) {
  let htmlArr = html.split('\n');
  let oneLinedHtml = '';
  let oneLinedElm = '';
  let currentNode;
  let startedElm = false;
  let endedElm = false;

  let ElementsStack = [];

  for (let htmlElm of htmlArr) {
    console.log(parse5.parse(htmlElm));

    if (!startedElm) {
      currentNode = htmlElm.split(' ')[0].replace('<', '').replace('>', '');
      startedElm = true;
      // console.log(currentNode);
      if (currentNode[0] === '/') startedElm = false;
    }

    if (startedElm) {
      // console.log((oneLinedElm.length + htmlElm.length));
      if ((oneLinedElm.length + htmlElm.length) <= maxLength) {
        oneLinedElm += htmlElm;
      } else {
        currentNode = htmlElm.split(' ')[0].replace('<', '').replace('>', '');
        startedElm = true;
        oneLinedElm = htmlElm;
      }

      endedElm = (htmlElm.replace('\t', '').split(' ')[0].replace('</', '').replace('>', '') === currentNode);
      // console.log(endedElm);
      // console.log(htmlElm.replace('\t', '').split(' ')[0].replace('</', '').replace('>', ''));

      if (endedElm) {
        if ((oneLinedElm.length + htmlElm.length) <= maxLength) {
          oneLinedElm += htmlElm;
          oneLinedHtml += oneLinedElm;
          oneLinedElm = '';
        } else {
          oneLinedElm = '';
        }
      }
    }
    // oneLinedElm = htmlElm;
    console.log(oneLinedElm);
  }

  return oneLinedHtml;
}



_readFile('./cases/input-1.html');

module.exports = { _indent };
