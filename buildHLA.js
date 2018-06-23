const fs = require('fs');
const parse5 = require('parse5');
const MAX_LINE_LENGTH = 100;

let HLA = [];
let ORDERED_ATTRS = [
  'id',
  'class',

  'accept',
  'accept-charset',
  'accesskey',
  'action',
  'align',
  'alt',
  'async',
  'autocomplete',
  'autofocus',
  'autoplay',
  'color',
  'data',
  'for',
  'href',
  'min',
  'max',
  'name',
  'src',

  'ng-class',
  'ng-if',
  'ng-show',
  'ng-hide'
];

function buildHLA(HTO) {
  // if (HTO.childNodes) {
    HLA = _traverse(HTO);
  // }

  console.log(HLA);

  HLA = _removeFragment(HLA);
  HLA = _oneLine(HLA);
  HLA = _separationSpace(HLA);
  HLA = _indent(HLA);

  // console.log(_buildPage(HLA));

  _output(_buildPage(HLA));
}

function _traverse(node) {
  switch (node.nodeName) {
      case '#text':
        _handleTextTraverse(node);
        break;
      case 'img':
        _handleVoidElementTraverse(node);
        break;
      case 'input':
        _handleVoidElementTraverse(node);
        break;
      case 'br':
        _handleVoidElementTraverse(node);
        break;
      default:
        _handleTagTraverse(node);
  }

  return HLA;
}

function _handleTagTraverse(node) {
  let htmlLine = {
    line: `<${node.nodeName}`,
    indentSize: node.indentSize,
    tagStatus: 'open',
    node: node.nodeName,
  };


  node.orderedAttrs = _orderAttrs(node);

  if (node.orderedAttrs && node.orderedAttrs.length > 1) {

    HLA.push(htmlLine);
    for (let index = 0; index < node.orderedAttrs.length; index++) {
      let attr = node.orderedAttrs[index];
      htmlLine = {
        line: `${attr.name}="${attr.value}"`,
        indentSize: node.indentSize + 1,
        isMultipleAttr: (node.orderedAttrs.length > 1),
        isAttr: true,
      };

      htmlLine.line += (index === (node.orderedAttrs.length - 1)) ? `>`:``;
      HLA.push(htmlLine);
    }
  } else if (node.orderedAttrs && node.orderedAttrs.length === 1) {
    htmlLine.line += ` ${node.orderedAttrs[0].name}="${node.orderedAttrs[0].value}">`;
    HLA.push(htmlLine);
  } else {
    htmlLine.line += `>`;
    HLA.push(htmlLine);
  }

  if (node.childNodes) {
    for (let childNode of node.childNodes) {
      _traverse(childNode);
    }
  }

  htmlLine = {
    line: `</${node.nodeName}>`,
    indentSize: node.indentSize,
    tagStatus: 'close',
    node: node.nodeName,
  };

  HLA.push(htmlLine);
}

function _handleVoidElementTraverse(node) {
  htmlLine = {
    line: `<${node.nodeName}`,
    indentSize: node.indentSize,
    tagStatus: 'void',
    node: node.nodeName,
  };


  node.orderedAttrs = _orderAttrs(node);

  if (node.orderedAttrs && node.orderedAttrs.length > 1) {

    HLA.push(htmlLine);
    for (let index = 0; index < node.orderedAttrs.length; index++) {
      let attr = node.orderedAttrs[index];
      htmlLine = {
        line: `${attr.name}="${attr.value}"`,
        indentSize: node.indentSize + 1,
        isMultipleAttr: (node.orderedAttrs.length > 1),
        isAttr: true,
      };

      htmlLine.line += (index === (node.orderedAttrs.length - 1)) ? `/>`:``;
      HLA.push(htmlLine);
    }
  } else if (node.orderedAttrs && node.orderedAttrs.length === 1) {
    htmlLine.line += ` ${node.orderedAttrs[0].name}="${node.orderedAttrs[0].value}"/>`;
    HLA.push(htmlLine);
  } else {
    htmlLine.line += `/>`;
    HLA.push(htmlLine);
  }
}

function _handleTextTraverse(node) {
  htmlLine = {
    line: '',
    indentSize: node.indentSize,
    tagStatus: 'void',
  };

  htmlLine.line = node.value.replace(/\n/g, '');
  htmlLine.line = htmlLine.line.replace(/ /g, '');
  if (htmlLine.line) HLA.push(htmlLine);
}

function _orderAttrs(node) {
  if (node.attrs && node.attrs.length) {
    node.orderedAttrs = [];
    for (let orderedAttr of ORDERED_ATTRS) {
      for (let index = 0; index < node.attrs.length; index++) {
        let attr = node.attrs[index];
        if (attr.name === orderedAttr) {
          node.orderedAttrs.push(attr);
          node.attrs.splice(index, 1);
          break;
        }
      }
    }


    if (node.attrs.length) {
      node.orderedAttrs = node.orderedAttrs.concat(node.attrs);
    }

  }

  return node.orderedAttrs;
}

function _oneLine(hla) {
  for (let index = 0; index < hla.length; index++) {
    let lineObj = hla[index];
    let currentNode = lineObj.node;

    if (lineObj.tagStatus === 'close') continue;

    let newline = '';
    let ElementsStack = [];
    let toBeDeletedIndices = [];
    for (let cindex = index; cindex < hla.length; cindex++) {
      let clineObj = hla[cindex];
      newline += ((clineObj.isAttr) ? ` `: ``) + clineObj.line;
      if (clineObj.tagStatus === 'open') ElementsStack.push(clineObj.node);
      if (newline.length > MAX_LINE_LENGTH || clineObj.isMultipleAttr) {
        break;
      }
      toBeDeletedIndices.push(cindex);
      if (clineObj.tagStatus === 'close') ElementsStack.pop();
      if (!ElementsStack.length) {
        hla.splice(toBeDeletedIndices[0], toBeDeletedIndices.length, {
          line: newline,
          indentSize: lineObj.indentSize,
          tagStatus: 'void',
        });

        // _oneLine(hla);
        break;
      }
    }

  }

  return hla;
}


function _separationSpace(hla) {
  for (let index = 0; index < hla.length - 1; index ++ ) {
    let currentLineObj = hla[index];
    let nextLineObj = hla[index + 1];

    console.log(currentLineObj.node, currentLineObj.tagStatus);
    if ((currentLineObj.tagStatus === 'close' || currentLineObj.tagStatus === 'void') &&
      (nextLineObj.tagStatus === 'open' || nextLineObj.tagStatus === 'void')) {
      currentLineObj.line += '\n';
    }
  }

  return hla;
}

function _removeFragment(hla) {
  let newHla = [];
  for (let lineObj of hla) {
    if (lineObj.node === '#document-fragment') {
      continue;
    } else {
      newHla.push(lineObj);
    }
  }

  return newHla;
}

function _indent(hla) {
  for (let lineObj of hla) {
    lineObj.line = '\t'.repeat(lineObj.indentSize) + lineObj.line;
  }

  return hla;
}

function _buildPage(hla) {
  let page = '';

  for (let lineObj of hla) {
    page += lineObj.line + '\n';
  }

  return page;
}

function _output(page) {
  var fileName = 'output/file1.html';
  var stream = fs.createWriteStream(fileName);

  stream.once('open', function(fd) {
    // var html = html;

    stream.end(page);
  });
}

module.exports = {
  buildHLA: buildHLA,
};
