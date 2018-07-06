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
  HLA = [];
  HLA = _traverse(HTO);

  HLA = _removeFragment(HLA);
  HLA = _oneLine(HLA);
  HLA = _separationSpace(HLA);
  HLA = _breakTexts(HLA);
  HLA = _indent(HLA);

  return _buildPage(HLA);
}

function _traverse(node) {
  switch (node.nodeName) {
      case '#comment':
        _handleCommentTraverse(node);
        break;
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
      let prefix = attr.prefix ? (attr.prefix + ':') : '';
      let name = attr.name || '';
      let value = attr.value ? ('="' + attr.value + '"') : '';
      htmlLine = {
        line: `${prefix}${name}${value}`,
        indentSize: node.indentSize + 1,
        isMultipleAttr: (node.orderedAttrs.length > 1),
        isAttr: true,
      };

      htmlLine.line += (index === (node.orderedAttrs.length - 1)) ? `>`:``;
      HLA.push(htmlLine);
    }
  } else if (node.orderedAttrs && node.orderedAttrs.length === 1) {
    let attr = node.orderedAttrs[0];
    let prefix = attr.prefix ? (attr.prefix + ':') : '';
    let name = attr.name || '';
    let value = attr.value ? ('="' + attr.value + '"') : '';

    htmlLine.line += ` ${prefix}${name}${value}>`;
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
      let prefix = attr.prefix ? (attr.prefix + ':') : '';
      let name = attr.name || '';
      let value = attr.value ? ('="' + attr.value + '"') : '';

      htmlLine = {
        line: `${prefix}${name}${value}`,
        indentSize: node.indentSize + 1,
        isMultipleAttr: (node.orderedAttrs.length > 1),
        isAttr: true,
      };

      htmlLine.line += (index === (node.orderedAttrs.length - 1)) ? `/>`:``;
      HLA.push(htmlLine);
    }
  } else if (node.orderedAttrs && node.orderedAttrs.length === 1) {
    let attr = node.orderedAttrs[0];
    let prefix = attr.prefix ? (attr.prefix + ':') : '';
    let name = attr.name || '';
    let value = attr.value ? ('="' + attr.value + '"') : '';
    htmlLine.line += ` ${prefix}${name}${value}/>`;
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

  htmlLine.line = node.value.replace(/\n/g, ' ');
  htmlLine.line = htmlLine.line.trim();
  htmlLine.line = htmlLine.line.replace(/\t/g, '');
  if (htmlLine.line !== '') HLA.push(htmlLine);
}

function _handleCommentTraverse(node) {
  let comment = node.data;
  comment = comment.replace(/\n/g, ' ');
  comment = comment.replace(/\t/g, '');
  comment = comment.trim();

  htmlLine = {
    line: ` ${comment} `,
    indentSize: node.indentSize + 1,
    tagStatus: 'void',
  };

  if (comment !== '') {
    HLA.push({
      line: '<!--',
      indentSize: node.indentSize,
      tagStatus: 'open',
    });
    HLA.push(htmlLine);
    HLA.push({
      line: '-->',
      indentSize: node.indentSize,
      tagStatus: 'close',
    });
  }


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

    if (lineObj.tagStatus !== 'open') continue;

    let newline = '';
    let newlineLength = 0;
    let ElementsStack = [];
    let toBeDeletedIndices = [];
    for (let cindex = index; cindex < hla.length; cindex++) {
      let clineObj = hla[cindex];
      newline += ((clineObj.isAttr) ? ` `: ``) + clineObj.line;
      newlineLength = newline.length + (clineObj.indentSize * 2);
      if (clineObj.tagStatus === 'open') ElementsStack.push(clineObj.node);
      if (newlineLength > MAX_LINE_LENGTH || clineObj.isMultipleAttr) {
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
    if (['#document-fragment', '#document'].indexOf(lineObj.node) > -1) {
      continue;
    } else {
      newHla.push(lineObj);
    }
  }

  return newHla;
}

function _breakTexts(hla) {
  for (let lineObjIndex = 0; lineObjIndex < hla.length; lineObjIndex ++) {
    let lineObj = hla[lineObjIndex];

    if (lineObj.tagStatus === 'void') {
      let newLine = '';
      let newLines = [];
      let words = lineObj.line.split(' ');
      for (let word of words) {
        if (((newLine + ' ' + word).length + (lineObj.indentSize * 2)) > MAX_LINE_LENGTH) {
          newLines.push(newLine);
          newLine = word;
        } else {
          if (newLine === '') {
            newLine += word;
          } else {
            newLine += ' ' + word;
          }
        }
      }

      if (newLine != '') newLines.push(newLine);

      if (newLines.length) {
        lineObj.line = newLines[0];
        for (let newIndex = 1; newIndex < newLines.length; newIndex ++) {
          let newLine1 = newLines[newIndex];
          hla = _insertNewLine(hla, (lineObjIndex + newIndex), newLine1,
            lineObj.indentSize, lineObj.tagStatus);
        }
      }
    }


  }

  return hla;
}

function _insertNewLine(hla, index,  newLine, indentSize, tagStatus) {
  hla.splice(index, 0, {
    line: newLine.trim(),
    indentSize: indentSize,
    tagStatus: tagStatus,
  });

  return hla;
}

function _indent(hla) {
  for (let lineObj of hla) {
    lineObj.line = '  '.repeat(lineObj.indentSize) + lineObj.line;
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

// function _output(page) {
//   var fileName = 'output/file1.html';
//   var stream = fs.createWriteStream(fileName);
//
//   stream.once('open', function(fd) {
//     // var html = html;
//
//     stream.end(page);
//   });
// }

module.exports = {
  buildHLA: buildHLA,
};
