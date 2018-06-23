const init = require('./initHTO.js');
const build = require('./buildHLA.js');

init.readFile((file) => {
  let root = init.parse(file);
  let HTO = init.initHTO(root, 0);
  let HLA = build.buildHLA(HTO);
  // console.log(HLA.join('\n'));
});
