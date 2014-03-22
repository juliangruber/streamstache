# streamstache

Mustache + Streams for node and browsers.

[![testling badge](https://ci.testling.com/juliangruber/streamstache.png)](https://ci.testling.com/juliangruber/streamstache)

[![build status](https://secure.travis-ci.org/juliangruber/streamstache.png)](http://travis-ci.org/juliangruber/streamstache)

## Example

Given this template:

```html
<div>{foo}</div>
<div>{bar}</div>
```

```js
var streamstache = require('streamstache');
var fs = require('fs');

var tmpl = streamstache(fs.readFileSync(__dirname + '/multi.html'));
tmpl.pipe(process.stdout);

tmpl.foo = 'bar';

setTimeout(function() {
  tmpl.bar = fs.createReadStream(__dirname + '/lorem.txt');
}, 500);
```

The output is:

```html
<div>bar</div>
<div>Lorem ipsum dolor sit amet...</div>
```

Because **streamstache** is streaming, the output arrives in 2 chunks, as `bar`  is only set after 500ms. The first chunk is:

```html
<div>bar</div>
<div>
```

The second and last chunk then is:

```html
Lorem ipsum dolor sit amet...</div>
```

## Syntax

### Interpolation

* `{<key>}`: Gets replaced with the `String` or `Stream` set under `key`.

Reserved keys:

* get
* set
* setEncoding
* pipe

### Blocks

Blocks are denoted with `{#<key>}...{/<key>}` but take on different roles
depending on the content in the scope at `key`.

#### Array Blocks

When the value for a block is an array, the content is looped over for each
element in the array with the scope augmented by the array element value.

#### Stream Blocks

When the value for a block is a stream, the content is looped over each time a
new row arrives, augmenting the scope with the row value until the stream ends.

#### Boolean Blocks

When the value for a block is anything else, it is treated as a boolean.
When a boolean is false, the content between `{#key}` and `{/key}` is hidden.
Otherwise, the content is shown.

## API

todo.

### streamstache(tpl[, scope])

### streamstache#{key} = value
### streamstache#set(key, value)

### streamstache#{key}
### streamstache#get(key)

### streamstache#setEncoding(encoding)

### streamstache#pipe(stream)

## TODO

* figure out the syntax and feature set to support
* iteration over streams

## Installation

For node or browserify install with [npm](https://npmjs.org):

```bash
npm install streamstache
```

For browser usage as a standalone library, grab a build from the [dist](https://github.com/juliangruber/streamstache/tree/master/dist) directory.

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
