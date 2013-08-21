
# streamstache

Mustache + Streams for node and browsers.

## Example

Given this template:

```html
<div id="foo"></div>
<div id="bar"></div>
```

```js
var streamstache = require('streamstache');
var fs = require('fs');

var tmpl = streamstache(fs.readFileSync(__dirname + '/multi.html'));
tmpl.pipe(process.stdout);

tmpl.set('foo', 'bar');

setTimeout(function() {
  tmpl.set('bar', fs.createReadStream(__dirname + '/lorem.txt'));
}, 500);
```

The output is:

```html
<div id="foo">bar</div>
<div id="bar">Lorem ipsum dolor sit amet...</div>
```

Because **streamstache** is streaming, the output arrives in 2 chunks, as `bar`  is only set after 500ms. The first chunk is:

```html
<div id="foo">bar</div>
<div id="bar">
```

The second and last chunk then is:

```html
Lorem ipsum dolor sit amet...</div>
```

## Syntax

* `{<id>}`: Gets replaced with the `String` or `Stream` set under `id`.

## API

todo.

### streamstache(tpl)

### streamstache#set(key, value)

### streamstache#setEncoding(encoding)

### streamstache#pipe(stream)

## TODO

* turn examples into tests
* figure out the syntax and feature set to support

## Installation

For node or browserify install with [npm](https://npmjs.org):

```bash
npm install streamstache
```

For browser usage as a standalone library, include a build from the [dist](https://github.com/juliangruber/streamstache/tree/master/dist) directory.

## License

(MIT)

Copyright (c) 2013 Julian Gruber &lt;julian@juliangruber.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
