# Pretty Html

[![npm version](https://badge.fury.io/js/pretty-html.svg)](https://badge.fury.io/js/pretty-html)

------

## A package to convert your messy html to beautifull one
![linter](https://user-images.githubusercontent.com/9321354/42126148-48a18fe2-7c83-11e8-8cf5-acdf1410431f.gif)


Pretty html is an opinionated Javascript package to lint html components/partials (angular components mainly)
according to front-end guidelines used at @instabug.

## Installation

### npm (server-side)

    npm install ibg-html-pretty

### yarn

    yarn add ibg-html-pretty


## Quick Example

### Node

```js
import linter from 'ibg-html-pretty';

    html      = `<div class="parent">
<div class="color-orange" id="divId" ng-if="vm.variable">
</div>

<div
	class="color-red" ng-if="vm.variable">
</div>

<div
	class="color-yellow" ng-if="vm.variable">
	<span>hello world, hi hello people from long line road in wide scentence streat and much words town hello hello hello hello hello hello hello hello hello hello hello hello world!</span>

	<hello-component
		class="hello"
		attr="attr1"
		attr2="attr2">
		<img/>

		<img
			alt="some-pic"
			source="https://www.autocar.co.uk/sites/autocar.co.uk/files/styles/gallery_slide/public/bmw-m2-road-test-0273_0.jpg?itok=rZL6Hh9r"/>
	</hello-component>
</div>
</div>
`;
    lintedHtml      = linter.lint(html);
```
### Output


```html
<div class="parent">
	<div
		id="divId"
		class="color-orange"
		ng-if="vm.variable">
	</div>

	<div
		class="color-red"
		ng-if="vm.variable">
	</div>

	<div
		class="color-yellow"
		ng-if="vm.variable">
		<span>
			hello world, hi hello people from long line road in wide scentence streat and much words town
			hello hello hello hello hello hello hello hello hello hello hello hello world!
		</span>

		<hello-component
			class="hello"
			attr="attr1"
			attr2="attr2">
			<img/>

			<img
				alt="some-pic"
				source="https://www.autocar.co.uk/sites/autocar.co.uk/files/styles/gallery_slide/public/bmw-m2-road-test-0273_0.jpg?itok=rZL6Hh9r"/>
		</hello-component>
	</div>
</div>
```

## Options

No options yet
