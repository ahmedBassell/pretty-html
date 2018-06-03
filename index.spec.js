const { _indent } = require('./index');

// test('adds 1 + 2 to equal 3', () => {
//   expect(sum(1, 2)).toBe(3);
// });

test('should indent file', () => {
  // If line size is less than limit 80 then it's ok to put child elements on same line
  expect(_indent(`
<html>
<body>
<h1>My Header</h1>
<p>My paragraph.</p>
</body>
</html>
`)).toBe(`
<html>
  <body>
    <h1>My Header</h1>
    <p>My paragraph.</p>
  </body>
</html>
`);
});
