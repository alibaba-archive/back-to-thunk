back-to-thunk
=============

transform generator, generatorFunction, promise and other yieldables back to thunk

sometimes you want to transform all the yieldables back to thunk, so you can do some more fine-grained operation and compose. like [co-any](https://github.com/dead-horse/co-any).

## Install

```
npm install back-to-thunk
```

## Usage

```
var toThunk = rquire('back-to-thunk');

var thunk = toThunk(function *() {
  yield 1;
  return 2;
});
```

## License

MIT
