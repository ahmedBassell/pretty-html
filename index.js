const init = require('./initHTO.js');
const build = require('./buildHLA.js');

function lintFile(path) {
  init.readFile(path, (file) => {
    let root = init.parse(file);
    let HTO = init.initHTO(root, 0);
    let HLA = build.buildHLA(HTO);
  });
}

function lintVar(data) {
  let root = init.parse(data);
  let HTO = init.initHTO(root, 0);
  let HLA = build.buildHLA(HTO);

  return HLA;
}

module.exports = {
  // lintFile: lintFile,
  lint: lintVar,
};
