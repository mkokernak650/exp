(self["webpackChunk"] = self["webpackChunk"] || []).push([["resources_js_Pages_Ringba_makeData_js"],{

/***/ "./resources/js/Pages/Ringba/makeData.js":
/*!***********************************************!*\
  !*** ./resources/js/Pages/Ringba/makeData.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ makeData)
/* harmony export */ });
/* harmony import */ var namor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! namor */ "./node_modules/namor/dist/index.js");
/* harmony import */ var namor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(namor__WEBPACK_IMPORTED_MODULE_0__);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



var range = function range(len) {
  var arr = [];

  for (var i = 0; i < len; i++) {
    arr.push(i);
  }

  return arr;
};

var newPerson = function newPerson() {
  var statusChance = Math.random();
  return {
    firstName: namor__WEBPACK_IMPORTED_MODULE_0___default().generate({
      words: 1,
      numbers: 0
    }),
    lastName: namor__WEBPACK_IMPORTED_MODULE_0___default().generate({
      words: 1,
      numbers: 0
    }),
    age: Math.floor(Math.random() * 30),
    visits: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    status: statusChance > 0.66 ? 'relationship' : statusChance > 0.33 ? 'complicated' : 'single'
  };
};

function makeData() {
  for (var _len = arguments.length, lens = new Array(_len), _key = 0; _key < _len; _key++) {
    lens[_key] = arguments[_key];
  }

  var makeDataLevel = function makeDataLevel() {
    var depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var len = lens[depth];
    return range(len).map(function (d) {
      return _objectSpread(_objectSpread({}, newPerson()), {}, {
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined
      });
    });
  };

  return makeDataLevel();
}

/***/ }),

/***/ "./node_modules/base64-js/index.js":
/*!*****************************************!*\
  !*** ./node_modules/base64-js/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),

/***/ "./node_modules/buffer/index.js":
/*!**************************************!*\
  !*** ./node_modules/buffer/index.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(/*! base64-js */ "./node_modules/base64-js/index.js")
var ieee754 = __webpack_require__(/*! ieee754 */ "./node_modules/ieee754/index.js")
var isArray = __webpack_require__(/*! isarray */ "./node_modules/isarray/index.js")

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = __webpack_require__.g.TYPED_ARRAY_SUPPORT !== undefined
  ? __webpack_require__.g.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}


/***/ }),

/***/ "./node_modules/crypto-extra/dist/encryption.js":
/*!******************************************************!*\
  !*** ./node_modules/crypto-extra/dist/encryption.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process/browser */ "./node_modules/process/browser.js");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var crypto_1 = __importDefault(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'crypto'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
var utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/crypto-extra/dist/utils.js");
var ALGORITHM = "aes-256-ctr";
var HMAC_ALGORITHM = "sha256";
function getEncryptionKey(key) {
    var encryptionKey = key || process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
        throw new Error("No encryption key was found");
    }
    var cryptoKey = crypto_1["default"]
        .createHash("sha256")
        .update(encryptionKey)
        .digest();
    return cryptoKey;
}
function constantTimeCompare(val1, val2) {
    if (val1.length !== val2.length) {
        return false;
    }
    var sentinel = 0;
    for (var i = 0, len = val1.length; i < len; i++) {
        sentinel |= val1.charCodeAt(i) ^ val2.charCodeAt(i);
    }
    return sentinel === 0;
}
function encrypt(value, key) {
    var iv = Buffer.from(crypto_1["default"].randomBytes(16));
    var encryptionKey = Buffer.from(getEncryptionKey(key));
    var cipher = crypto_1["default"].createCipheriv(ALGORITHM, encryptionKey, iv);
    cipher.setEncoding("hex");
    cipher.write(utils_1.stringify(value));
    cipher.end();
    var cipherText = cipher.read();
    var hmac = crypto_1["default"].createHmac(HMAC_ALGORITHM, encryptionKey);
    hmac.update(cipherText);
    hmac.update(iv.toString("hex"));
    return cipherText + "$" + iv.toString("hex") + "$" + hmac.digest("hex");
}
exports.encrypt = encrypt;
function decrypt(value, key) {
    var cipher = value.split("$");
    var iv = Buffer.from(cipher[1], "hex");
    var encryptionKey = Buffer.from(getEncryptionKey(key));
    var hmac = crypto_1["default"].createHmac(HMAC_ALGORITHM, encryptionKey);
    hmac.update(cipher[0]);
    hmac.update(iv.toString("hex"));
    if (!constantTimeCompare(hmac.digest("hex"), cipher[2])) {
        throw new Error("Encrypted payload has been tampered with");
    }
    var decipher = crypto_1["default"].createDecipheriv(ALGORITHM, encryptionKey, iv);
    var decryptedText = decipher.update(cipher[0], "hex");
    var final = "" + decryptedText + decipher.final();
    try {
        return JSON.parse(final);
    }
    catch (err) {
        return final;
    }
}
exports.decrypt = decrypt;


/***/ }),

/***/ "./node_modules/crypto-extra/dist/hash.js":
/*!************************************************!*\
  !*** ./node_modules/crypto-extra/dist/hash.js ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var crypto_1 = __importDefault(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'crypto'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
var utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/crypto-extra/dist/utils.js");
function hash(value, options) {
    if (options === void 0) { options = {}; }
    var parsedValue = utils_1.stringify(value);
    var algorithm = options.algorithm || "sha256";
    var rounds = options.rounds || 1;
    var hash = "" + parsedValue + (options.salt || "");
    for (var i = 0; i < rounds; i++) {
        hash = crypto_1["default"]
            .createHash(algorithm)
            .update(hash)
            .digest("hex");
    }
    return hash;
}
exports.hash = hash;


/***/ }),

/***/ "./node_modules/crypto-extra/dist/index.js":
/*!*************************************************!*\
  !*** ./node_modules/crypto-extra/dist/index.js ***!
  \*************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var crypto_1 = __importDefault(__webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'crypto'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
var hash = __importStar(__webpack_require__(/*! ./hash */ "./node_modules/crypto-extra/dist/hash.js"));
var encryption = __importStar(__webpack_require__(/*! ./encryption */ "./node_modules/crypto-extra/dist/encryption.js"));
var random = __importStar(__webpack_require__(/*! ./random */ "./node_modules/crypto-extra/dist/random.js"));
function deprecationNotice(msg) {
    console.log("crypto-extra: " + msg);
}
module.exports = Object.assign(crypto_1["default"], {
    hash: hash.hash,
    encrypt: encryption.encrypt,
    decrypt: encryption.decrypt,
    randomString: random.randomString,
    randomNumber: random.randomNumber,
    randomKey: random.randomKey,
    generateKey: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        deprecationNotice("`generateKey` has been renamed to `randomKey`");
        return random.randomKey.apply(random, args);
    }
});


/***/ }),

/***/ "./node_modules/crypto-extra/dist/random.js":
/*!**************************************************!*\
  !*** ./node_modules/crypto-extra/dist/random.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

exports.__esModule = true;
var crypto_1 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'crypto'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
function randomString(size, charset) {
    if (size !== undefined && size <= 0) {
        throw new Error("Random size must be a number above 0!");
    }
    var bytes = crypto_1.randomBytes(size || 10);
    var chars = charset || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var value = "";
    for (var i = 0, len = bytes.length; i < len; i++) {
        value += chars[bytes.readUInt8(i) % chars.length];
    }
    return value;
}
exports.randomString = randomString;
function randomNumber(options) {
    if (options === void 0) { options = {}; }
    var integerLimit = Number.MAX_SAFE_INTEGER;
    options.min = options.min || 0;
    options.max = options.max || integerLimit;
    if (options.min < 0 ||
        options.min > integerLimit - 1 ||
        options.max < 1 ||
        options.max > integerLimit) {
        throw new Error("Limits must be between 0 and " + integerLimit);
    }
    var hex = crypto_1.randomBytes(16).toString("hex");
    var integer = parseInt(hex, 16);
    var random = integer / 0xffffffffffffffffffffffffffffffff;
    return Math.floor(random * (options.max - options.min + 1) + options.min);
}
exports.randomNumber = randomNumber;
function randomKey(length) {
    if (length === void 0) { length = 64; }
    if (length < 2 || length % 2 !== 0) {
        throw new TypeError("Length must be an even number above 0");
    }
    return crypto_1.randomBytes(length / 2).toString("hex");
}
exports.randomKey = randomKey;


/***/ }),

/***/ "./node_modules/crypto-extra/dist/utils.js":
/*!*************************************************!*\
  !*** ./node_modules/crypto-extra/dist/utils.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

exports.__esModule = true;
function stringify(value) {
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
exports.stringify = stringify;


/***/ }),

/***/ "./node_modules/ieee754/index.js":
/*!***************************************!*\
  !*** ./node_modules/ieee754/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),

/***/ "./node_modules/isarray/index.js":
/*!***************************************!*\
  !*** ./node_modules/isarray/index.js ***!
  \***************************************/
/***/ ((module) => {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),

/***/ "./node_modules/namor/dist/_data.js":
/*!******************************************!*\
  !*** ./node_modules/namor/dist/_data.js ***!
  \******************************************/
/***/ ((module) => {

"use strict";

module.exports = JSON.parse("{\"adjectives\":[\"aback\",\"abaft\",\"abandoned\",\"abashed\",\"aberrant\",\"abhorrent\",\"abiding\",\"abject\",\"ablaze\",\"able\",\"abnormal\",\"aboard\",\"aboriginal\",\"abortive\",\"abounding\",\"abrasive\",\"abrupt\",\"absent\",\"absorbed\",\"absorbing\",\"abstracted\",\"absurd\",\"abundant\",\"abusive\",\"acceptable\",\"accessible\",\"accidental\",\"accurate\",\"acid\",\"acidic\",\"acoustic\",\"acrid\",\"actual\",\"actually\",\"adamant\",\"adaptable\",\"addicted\",\"additional\",\"adhesive\",\"adhoc\",\"adjoining\",\"administrative\",\"adorable\",\"adventurous\",\"afraid\",\"aggressive\",\"agonizing\",\"agreeable\",\"ahead\",\"ajar\",\"alcoholic\",\"alert\",\"alike\",\"alive\",\"alleged\",\"alluring\",\"aloof\",\"amazing\",\"ambiguous\",\"ambitious\",\"american\",\"amuck\",\"amused\",\"amusing\",\"ancient\",\"angry\",\"animated\",\"annoyed\",\"annoying\",\"anxious\",\"apathetic\",\"aquatic\",\"aromatic\",\"arrogant\",\"ashamed\",\"asleep\",\"aspiring\",\"assorted\",\"astonishing\",\"attractive\",\"auspicious\",\"automatic\",\"available\",\"average\",\"awake\",\"aware\",\"awesome\",\"awful\",\"axiomatic\",\"bad\",\"barbarous\",\"bashful\",\"basic\",\"bawdy\",\"beautiful\",\"befitting\",\"belligerent\",\"beneficial\",\"bent\",\"berserk\",\"best\",\"better\",\"bewildered\",\"big\",\"billowy\",\"bitesized\",\"bitter\",\"bizarre\",\"black\",\"bloody\",\"blue\",\"blueeyed\",\"blushing\",\"boiling\",\"boorish\",\"bored\",\"boring\",\"bouncy\",\"boundless\",\"brainy\",\"brash\",\"brave\",\"brawny\",\"breakable\",\"breezy\",\"brief\",\"bright\",\"broad\",\"broken\",\"brown\",\"bumpy\",\"burly\",\"bustling\",\"busy\",\"cagey\",\"calculating\",\"callous\",\"calm\",\"capable\",\"capricious\",\"careful\",\"careless\",\"caring\",\"cautious\",\"ceaseless\",\"central\",\"certain\",\"changeable\",\"charming\",\"cheap\",\"cheerful\",\"chemical\",\"chief\",\"childlike\",\"chilly\",\"chivalrous\",\"chubby\",\"chunky\",\"civil\",\"clammy\",\"classy\",\"clean\",\"clear\",\"clever\",\"cloistered\",\"close\",\"closed\",\"cloudy\",\"clumsy\",\"cluttered\",\"coherent\",\"cold\",\"colorful\",\"colossal\",\"combative\",\"comfortable\",\"common\",\"competitive\",\"complete\",\"complex\",\"comprehensive\",\"concerned\",\"condemned\",\"confident\",\"confused\",\"conscious\",\"consistent\",\"cooing\",\"cool\",\"cooperative\",\"coordinated\",\"courageous\",\"cowardly\",\"crabby\",\"craven\",\"crazy\",\"creepy\",\"critical\",\"crooked\",\"crowded\",\"cruel\",\"cuddly\",\"cultural\",\"cultured\",\"cumbersome\",\"curious\",\"curly\",\"current\",\"curved\",\"curvy\",\"cut\",\"cute\",\"cynical\",\"daffy\",\"daily\",\"damaged\",\"damaging\",\"damp\",\"dangerous\",\"dapper\",\"dark\",\"dashing\",\"dazzling\",\"dead\",\"deadpan\",\"deafening\",\"dear\",\"debonair\",\"decent\",\"decisive\",\"decorous\",\"deep\",\"deeply\",\"defeated\",\"defective\",\"defiant\",\"delicate\",\"delicious\",\"delightful\",\"delirious\",\"democratic\",\"demonic\",\"dependent\",\"depressed\",\"deranged\",\"descriptive\",\"deserted\",\"desperate\",\"detailed\",\"determined\",\"devilish\",\"didactic\",\"different\",\"difficult\",\"diligent\",\"direful\",\"dirty\",\"disagreeable\",\"disastrous\",\"discreet\",\"disgusted\",\"disgusting\",\"disillusioned\",\"dispensable\",\"distinct\",\"disturbed\",\"divergent\",\"dizzy\",\"domineering\",\"doubtful\",\"drab\",\"draconian\",\"dramatic\",\"dreary\",\"drunk\",\"dry\",\"dull\",\"dusty\",\"dynamic\",\"dysfunctional\",\"eager\",\"early\",\"earsplitting\",\"earthy\",\"eastern\",\"easy\",\"eatable\",\"economic\",\"educated\",\"educational\",\"efficacious\",\"efficient\",\"eight\",\"elastic\",\"elated\",\"elderly\",\"electric\",\"electrical\",\"electronic\",\"elegant\",\"elfin\",\"elite\",\"embarrassed\",\"eminent\",\"emotional\",\"empty\",\"enchanted\",\"enchanting\",\"encouraging\",\"endurable\",\"energetic\",\"enormous\",\"entertaining\",\"enthusiastic\",\"entire\",\"envious\",\"environmental\",\"equable\",\"equal\",\"erect\",\"erratic\",\"ethereal\",\"evanescent\",\"evasive\",\"even\",\"every\",\"excellent\",\"excited\",\"exciting\",\"exclusive\",\"existing\",\"exotic\",\"expensive\",\"exuberant\",\"exultant\",\"fabulous\",\"faded\",\"faint\",\"fair\",\"faithful\",\"fallacious\",\"false\",\"familiar\",\"famous\",\"fanatical\",\"fancy\",\"fantastic\",\"far\",\"farflung\",\"fascinated\",\"fast\",\"fat\",\"faulty\",\"fearful\",\"fearless\",\"federal\",\"feeble\",\"feigned\",\"female\",\"fertile\",\"festive\",\"few\",\"fierce\",\"filthy\",\"final\",\"financial\",\"fine\",\"finicky\",\"first\",\"five\",\"fixed\",\"flagrant\",\"flaky\",\"flashy\",\"flat\",\"flawless\",\"flimsy\",\"flippant\",\"flowery\",\"fluffy\",\"fluttering\",\"foamy\",\"foolish\",\"foregoing\",\"foreign\",\"forgetful\",\"former\",\"fortunate\",\"four\",\"fragile\",\"frail\",\"frantic\",\"free\",\"freezing\",\"frequent\",\"fresh\",\"fretful\",\"friendly\",\"frightened\",\"frightening\",\"full\",\"fumbling\",\"functional\",\"funny\",\"furry\",\"furtive\",\"future\",\"futuristic\",\"fuzzy\",\"gabby\",\"gainful\",\"gamy\",\"gaping\",\"garrulous\",\"gaudy\",\"general\",\"gentle\",\"giant\",\"giddy\",\"gifted\",\"gigantic\",\"glamorous\",\"gleaming\",\"glib\",\"glistening\",\"global\",\"glorious\",\"glossy\",\"godly\",\"good\",\"goofy\",\"gorgeous\",\"graceful\",\"grandiose\",\"grateful\",\"gratis\",\"gray\",\"greasy\",\"great\",\"greedy\",\"green\",\"grey\",\"grieving\",\"groovy\",\"grotesque\",\"grouchy\",\"grubby\",\"gruesome\",\"grumpy\",\"guarded\",\"guiltless\",\"guilty\",\"gullible\",\"gusty\",\"guttural\",\"habitual\",\"half\",\"hallowed\",\"halting\",\"handsome\",\"handsomely\",\"handy\",\"hanging\",\"hapless\",\"happy\",\"hard\",\"harmonious\",\"harsh\",\"hateful\",\"heady\",\"healthy\",\"heartbreaking\",\"heavenly\",\"heavy\",\"hellish\",\"helpful\",\"helpless\",\"hesitant\",\"hideous\",\"high\",\"highfalutin\",\"highpitched\",\"hilarious\",\"hissing\",\"historical\",\"holistic\",\"hollow\",\"homeless\",\"homely\",\"honorable\",\"horrible\",\"hospitable\",\"hot\",\"huge\",\"hulking\",\"human\",\"humdrum\",\"humorous\",\"hungry\",\"hurried\",\"hurt\",\"hushed\",\"husky\",\"hypnotic\",\"hysterical\",\"icky\",\"icy\",\"idiotic\",\"ignorant\",\"ill\",\"illegal\",\"illfated\",\"illinformed\",\"illustrious\",\"imaginary\",\"immediate\",\"immense\",\"imminent\",\"impartial\",\"imperfect\",\"impolite\",\"important\",\"imported\",\"impossible\",\"impressive\",\"incandescent\",\"incompetent\",\"inconclusive\",\"incredible\",\"industrious\",\"inexpensive\",\"infamous\",\"informal\",\"innate\",\"inner\",\"innocent\",\"inquisitive\",\"insidious\",\"instinctive\",\"intelligent\",\"interesting\",\"internal\",\"international\",\"invincible\",\"irate\",\"irritating\",\"itchy\",\"jaded\",\"jagged\",\"jazzy\",\"jealous\",\"jittery\",\"jobless\",\"jolly\",\"joyous\",\"judicious\",\"juicy\",\"jumbled\",\"jumpy\",\"juvenile\",\"kaput\",\"keen\",\"kind\",\"kindhearted\",\"kindly\",\"knotty\",\"knowing\",\"knowledgeable\",\"known\",\"labored\",\"lackadaisical\",\"lacking\",\"lame\",\"lamentable\",\"languid\",\"large\",\"last\",\"late\",\"latter\",\"laughable\",\"lavish\",\"lazy\",\"lean\",\"learned\",\"left\",\"legal\",\"lethal\",\"level\",\"lewd\",\"light\",\"like\",\"likeable\",\"likely\",\"limping\",\"literate\",\"little\",\"lively\",\"living\",\"local\",\"logical\",\"lonely\",\"long\",\"longing\",\"longterm\",\"loose\",\"lopsided\",\"loud\",\"loutish\",\"lovely\",\"loving\",\"low\",\"lowly\",\"lucky\",\"ludicrous\",\"lumpy\",\"lush\",\"luxuriant\",\"lying\",\"lyrical\",\"macabre\",\"macho\",\"mad\",\"maddening\",\"madly\",\"magenta\",\"magical\",\"magnificent\",\"main\",\"majestic\",\"major\",\"makeshift\",\"male\",\"malicious\",\"mammoth\",\"maniacal\",\"many\",\"marked\",\"married\",\"marvelous\",\"massive\",\"material\",\"materialistic\",\"mature\",\"mean\",\"measly\",\"meaty\",\"medical\",\"meek\",\"mellow\",\"melodic\",\"melted\",\"mental\",\"merciful\",\"mere\",\"messy\",\"mighty\",\"military\",\"milky\",\"mindless\",\"miniature\",\"minor\",\"miscreant\",\"misty\",\"mixed\",\"moaning\",\"modern\",\"moldy\",\"momentous\",\"motionless\",\"mountainous\",\"muddled\",\"mundane\",\"murky\",\"mushy\",\"mute\",\"mysterious\",\"naive\",\"nappy\",\"narrow\",\"nasty\",\"national\",\"natural\",\"naughty\",\"nauseating\",\"near\",\"neat\",\"nebulous\",\"necessary\",\"needless\",\"needy\",\"neighborly\",\"nervous\",\"new\",\"next\",\"nice\",\"nifty\",\"nimble\",\"nine\",\"nippy\",\"noiseless\",\"noisy\",\"nonchalant\",\"nondescript\",\"nonstop\",\"normal\",\"nostalgic\",\"nosy\",\"noxious\",\"null\",\"numberless\",\"numerous\",\"nutritious\",\"nutty\",\"oafish\",\"obedient\",\"obeisant\",\"obese\",\"obnoxious\",\"obscene\",\"obsequious\",\"observant\",\"obsolete\",\"obtainable\",\"obvious\",\"oceanic\",\"odd\",\"offbeat\",\"old\",\"oldfashioned\",\"omniscient\",\"one\",\"onerous\",\"only\",\"open\",\"opposite\",\"optimal\",\"orange\",\"ordinary\",\"organic\",\"ossified\",\"other\",\"outgoing\",\"outrageous\",\"outstanding\",\"oval\",\"overconfident\",\"overjoyed\",\"overrated\",\"overt\",\"overwrought\",\"painful\",\"painstaking\",\"pale\",\"paltry\",\"panicky\",\"panoramic\",\"parallel\",\"parched\",\"parsimonious\",\"past\",\"pastoral\",\"pathetic\",\"peaceful\",\"penitent\",\"perfect\",\"periodic\",\"permissible\",\"perpetual\",\"personal\",\"petite\",\"phobic\",\"physical\",\"picayune\",\"pink\",\"piquant\",\"placid\",\"plain\",\"plant\",\"plastic\",\"plausible\",\"pleasant\",\"plucky\",\"pointless\",\"poised\",\"polite\",\"political\",\"poor\",\"popular\",\"possessive\",\"possible\",\"powerful\",\"practical\",\"precious\",\"pregnant\",\"premium\",\"present\",\"pretty\",\"previous\",\"pricey\",\"prickly\",\"private\",\"probable\",\"productive\",\"profuse\",\"protective\",\"proud\",\"psychedelic\",\"psychological\",\"psychotic\",\"public\",\"puffy\",\"pumped\",\"puny\",\"pure\",\"purple\",\"purring\",\"pushy\",\"puzzled\",\"puzzling\",\"quack\",\"quaint\",\"quarrelsome\",\"questionable\",\"quick\",\"quickest\",\"quiet\",\"quirky\",\"quixotic\",\"quizzical\",\"rabid\",\"racial\",\"ragged\",\"rainy\",\"rambunctious\",\"rampant\",\"rapid\",\"rare\",\"raspy\",\"ratty\",\"ready\",\"real\",\"realistic\",\"reasonable\",\"rebel\",\"recent\",\"receptive\",\"recondite\",\"red\",\"redundant\",\"reflective\",\"regular\",\"relevant\",\"relieved\",\"religious\",\"remarkable\",\"reminiscent\",\"repulsive\",\"resolute\",\"resonant\",\"responsible\",\"rhetorical\",\"rich\",\"right\",\"righteous\",\"rightful\",\"rigid\",\"ripe\",\"ritzy\",\"roasted\",\"robust\",\"romantic\",\"roomy\",\"rotten\",\"rough\",\"round\",\"royal\",\"ruddy\",\"rude\",\"rural\",\"rustic\",\"ruthless\",\"sable\",\"sad\",\"safe\",\"salty\",\"same\",\"sassy\",\"satisfying\",\"savory\",\"scandalous\",\"scarce\",\"scared\",\"scary\",\"scattered\",\"scientific\",\"scintillating\",\"scrawny\",\"screeching\",\"second\",\"secondhand\",\"secret\",\"secretive\",\"sedate\",\"seemly\",\"selective\",\"selfish\",\"separate\",\"serious\",\"several\",\"severe\",\"sexual\",\"shaggy\",\"shaky\",\"shallow\",\"sharp\",\"shiny\",\"shivering\",\"shocking\",\"short\",\"shrill\",\"shut\",\"shy\",\"sick\",\"significant\",\"silent\",\"silky\",\"silly\",\"similar\",\"simple\",\"simplistic\",\"sincere\",\"single\",\"six\",\"skillful\",\"skinny\",\"sleepy\",\"slim\",\"slimy\",\"slippery\",\"sloppy\",\"slow\",\"small\",\"smart\",\"smelly\",\"smiling\",\"smoggy\",\"smooth\",\"sneaky\",\"snobbish\",\"snotty\",\"social\",\"soft\",\"soggy\",\"solid\",\"somber\",\"sophisticated\",\"sordid\",\"sore\",\"sorry\",\"sour\",\"southern\",\"sparkling\",\"special\",\"spectacular\",\"spicy\",\"spiffy\",\"spiky\",\"spiritual\",\"spiteful\",\"splendid\",\"spooky\",\"spotless\",\"spotted\",\"spotty\",\"spurious\",\"squalid\",\"square\",\"squealing\",\"squeamish\",\"staking\",\"stale\",\"standing\",\"statuesque\",\"steadfast\",\"steady\",\"steep\",\"stereotyped\",\"sticky\",\"stiff\",\"stimulating\",\"stingy\",\"stormy\",\"straight\",\"strange\",\"strict\",\"striped\",\"strong\",\"stupendous\",\"stupid\",\"sturdy\",\"subdued\",\"subsequent\",\"substantial\",\"successful\",\"succinct\",\"sudden\",\"sufficient\",\"suitable\",\"sulky\",\"super\",\"superb\",\"superficial\",\"supreme\",\"sure\",\"suspicious\",\"swanky\",\"sweet\",\"sweltering\",\"swift\",\"symptomatic\",\"synonymous\",\"taboo\",\"tacit\",\"tacky\",\"talented\",\"tall\",\"tame\",\"tan\",\"tangible\",\"tangy\",\"tart\",\"tasteful\",\"tasteless\",\"tasty\",\"tawdry\",\"tearful\",\"technical\",\"tedious\",\"teeny\",\"telling\",\"temporary\",\"ten\",\"tender\",\"tense\",\"tenuous\",\"terrible\",\"terrific\",\"tested\",\"testy\",\"thankful\",\"therapeutic\",\"thick\",\"thin\",\"thinkable\",\"third\",\"thirsty\",\"thoughtful\",\"thoughtless\",\"threatening\",\"three\",\"thundering\",\"tidy\",\"tight\",\"tightfisted\",\"tiny\",\"tired\",\"tiresome\",\"toothsome\",\"torpid\",\"tough\",\"towering\",\"traditional\",\"tranquil\",\"trashy\",\"tremendous\",\"tricky\",\"trite\",\"troubled\",\"truculent\",\"true\",\"truthful\",\"two\",\"typical\",\"ubiquitous\",\"ugliest\",\"ugly\",\"ultra\",\"unable\",\"unaccountable\",\"unadvised\",\"unarmed\",\"unbecoming\",\"unbiased\",\"uncovered\",\"understood\",\"undesirable\",\"unequal\",\"unequaled\",\"uneven\",\"unfair\",\"unhappy\",\"unhealthy\",\"uninterested\",\"unique\",\"united\",\"unkempt\",\"unknown\",\"unlikely\",\"unnatural\",\"unruly\",\"unsightly\",\"unsuitable\",\"untidy\",\"unused\",\"unusual\",\"unwieldy\",\"unwritten\",\"upbeat\",\"uppity\",\"upset\",\"uptight\",\"used\",\"useful\",\"useless\",\"utopian\",\"utter\",\"uttermost\",\"vacuous\",\"vagabond\",\"vague\",\"valuable\",\"various\",\"vast\",\"vengeful\",\"venomous\",\"verdant\",\"versed\",\"victorious\",\"vigorous\",\"violent\",\"violet\",\"visible\",\"vivacious\",\"voiceless\",\"volatile\",\"voracious\",\"vulgar\",\"wacky\",\"waggish\",\"waiting\",\"wakeful\",\"wandering\",\"wanting\",\"warlike\",\"warm\",\"wary\",\"wasteful\",\"watery\",\"weak\",\"wealthy\",\"weary\",\"wellgroomed\",\"wellmade\",\"welloff\",\"wet\",\"whimsical\",\"whispering\",\"white\",\"whole\",\"wholesale\",\"wicked\",\"wide\",\"wiggly\",\"wild\",\"willing\",\"windy\",\"wiry\",\"wise\",\"wistful\",\"witty\",\"woebegone\",\"womanly\",\"wonderful\",\"wooden\",\"woozy\",\"workable\",\"worried\",\"worthless\",\"wrathful\",\"wretched\",\"wrong\",\"wry\",\"yellow\",\"yielding\",\"young\",\"youthful\",\"yummy\",\"zany\",\"zealous\",\"zesty\",\"zippy\",\"zonked\"],\"nouns\":[\"ability\",\"able\",\"accident\",\"account\",\"achieve\",\"acoustics\",\"act\",\"action\",\"activity\",\"actor\",\"ad\",\"addition\",\"adjustment\",\"administration\",\"advertisement\",\"advertising\",\"advice\",\"affair\",\"aftermath\",\"afternoon\",\"afterthought\",\"agency\",\"agreement\",\"air\",\"airplane\",\"airport\",\"alarm\",\"alcohol\",\"alley\",\"ambition\",\"amount\",\"amusement\",\"analysis\",\"analyst\",\"anger\",\"angle\",\"animal\",\"answer\",\"ant\",\"ants\",\"anxiety\",\"apartment\",\"apparatus\",\"apparel\",\"appearance\",\"apple\",\"apples\",\"appliance\",\"application\",\"appointment\",\"approval\",\"arch\",\"area\",\"argument\",\"arithmetic\",\"arm\",\"army\",\"arrival\",\"art\",\"article\",\"aspect\",\"assignment\",\"assistance\",\"assistant\",\"association\",\"assumption\",\"atmosphere\",\"attack\",\"attempt\",\"attention\",\"attitude\",\"attraction\",\"audience\",\"aunt\",\"authority\",\"awareness\",\"babies\",\"baby\",\"back\",\"badge\",\"bag\",\"bait\",\"balance\",\"ball\",\"balloon\",\"balls\",\"banana\",\"band\",\"base\",\"baseball\",\"basin\",\"basis\",\"basket\",\"basketball\",\"bat\",\"bath\",\"bathroom\",\"battle\",\"bead\",\"beam\",\"bean\",\"bear\",\"bears\",\"beast\",\"bed\",\"bedroom\",\"beds\",\"bee\",\"beef\",\"beer\",\"beetle\",\"beggar\",\"beginner\",\"behavior\",\"belief\",\"believe\",\"bell\",\"bells\",\"berry\",\"bike\",\"bikes\",\"bird\",\"birds\",\"birth\",\"birthday\",\"bit\",\"bite\",\"blade\",\"blood\",\"blow\",\"board\",\"boat\",\"boats\",\"body\",\"bomb\",\"bone\",\"bonus\",\"book\",\"books\",\"boot\",\"border\",\"bottle\",\"boundary\",\"box\",\"boy\",\"boyfriend\",\"boys\",\"brain\",\"brake\",\"branch\",\"brass\",\"bread\",\"breakfast\",\"breath\",\"brick\",\"bridge\",\"brother\",\"brothers\",\"brush\",\"bubble\",\"bucket\",\"building\",\"bulb\",\"bun\",\"burn\",\"burst\",\"bushes\",\"business\",\"butter\",\"button\",\"buyer\",\"cabbage\",\"cabinet\",\"cable\",\"cactus\",\"cake\",\"cakes\",\"calculator\",\"calendar\",\"camera\",\"camp\",\"can\",\"cancer\",\"candidate\",\"cannon\",\"canvas\",\"cap\",\"caption\",\"car\",\"card\",\"care\",\"carpenter\",\"carriage\",\"cars\",\"cart\",\"cast\",\"cat\",\"category\",\"cats\",\"cattle\",\"cause\",\"cave\",\"celebration\",\"celery\",\"cell\",\"cellar\",\"cemetery\",\"cent\",\"chain\",\"chair\",\"chairs\",\"chalk\",\"championship\",\"chance\",\"change\",\"channel\",\"chapter\",\"charity\",\"cheek\",\"cheese\",\"chemistry\",\"cherries\",\"cherry\",\"chess\",\"chest\",\"chicken\",\"chickens\",\"child\",\"childhood\",\"children\",\"chin\",\"chocolate\",\"church\",\"cigarette\",\"circle\",\"city\",\"clam\",\"class\",\"classroom\",\"client\",\"climate\",\"clock\",\"clocks\",\"cloth\",\"clothes\",\"cloud\",\"clouds\",\"clover\",\"club\",\"coach\",\"coal\",\"coast\",\"coat\",\"cobweb\",\"coffee\",\"coil\",\"collar\",\"collection\",\"college\",\"color\",\"comb\",\"combination\",\"comfort\",\"committee\",\"communication\",\"community\",\"company\",\"comparison\",\"competition\",\"complaint\",\"computer\",\"concept\",\"conclusion\",\"condition\",\"confusion\",\"connection\",\"consequence\",\"construction\",\"context\",\"contract\",\"contribution\",\"control\",\"conversation\",\"cook\",\"cookie\",\"copper\",\"copy\",\"cord\",\"cork\",\"corn\",\"cough\",\"country\",\"county\",\"courage\",\"cousin\",\"cover\",\"cow\",\"cows\",\"crack\",\"cracker\",\"crate\",\"crayon\",\"cream\",\"creator\",\"creature\",\"credit\",\"crib\",\"crime\",\"criticism\",\"crook\",\"crow\",\"crowd\",\"crown\",\"crush\",\"cry\",\"cub\",\"cup\",\"currency\",\"current\",\"curtain\",\"curve\",\"cushion\",\"customer\",\"dad\",\"data\",\"database\",\"daughter\",\"day\",\"dealer\",\"death\",\"debt\",\"decision\",\"deer\",\"definition\",\"degree\",\"delivery\",\"department\",\"departure\",\"depression\",\"depth\",\"description\",\"design\",\"desire\",\"desk\",\"destruction\",\"detail\",\"development\",\"device\",\"diamond\",\"difference\",\"difficulty\",\"digestion\",\"dime\",\"dinner\",\"dinosaurs\",\"direction\",\"director\",\"dirt\",\"disaster\",\"discovery\",\"discussion\",\"disease\",\"disgust\",\"disk\",\"distance\",\"distribution\",\"division\",\"dock\",\"doctor\",\"dog\",\"dogs\",\"doll\",\"dolls\",\"donkey\",\"door\",\"downtown\",\"drain\",\"drama\",\"drawer\",\"drawing\",\"dress\",\"drink\",\"driver\",\"driving\",\"drop\",\"drug\",\"drum\",\"duck\",\"ducks\",\"dust\",\"ear\",\"earth\",\"earthquake\",\"economics\",\"edge\",\"editor\",\"education\",\"effect\",\"efficiency\",\"effort\",\"egg\",\"eggnog\",\"eggs\",\"elbow\",\"election\",\"elevator\",\"emotion\",\"emphasis\",\"employee\",\"employer\",\"employment\",\"end\",\"energy\",\"engine\",\"engineering\",\"entertainment\",\"enthusiasm\",\"entry\",\"environment\",\"equipment\",\"error\",\"establishment\",\"estate\",\"event\",\"exam\",\"examination\",\"example\",\"exchange\",\"excitement\",\"existence\",\"expansion\",\"experience\",\"expert\",\"explanation\",\"expression\",\"extent\",\"eye\",\"eyes\",\"face\",\"fact\",\"failure\",\"fairies\",\"fall\",\"family\",\"fan\",\"fang\",\"farm\",\"farmer\",\"father\",\"faucet\",\"fear\",\"feast\",\"feather\",\"feedback\",\"feeling\",\"feet\",\"fiction\",\"field\",\"fifth\",\"fight\",\"finding\",\"finger\",\"fire\",\"fireman\",\"fish\",\"fishing\",\"flag\",\"flame\",\"flavor\",\"flesh\",\"flight\",\"flock\",\"floor\",\"flower\",\"flowers\",\"fly\",\"fog\",\"fold\",\"food\",\"foot\",\"football\",\"force\",\"fork\",\"form\",\"fortune\",\"foundation\",\"fowl\",\"frame\",\"freedom\",\"friction\",\"friend\",\"friends\",\"friendship\",\"frog\",\"frogs\",\"front\",\"fruit\",\"fuel\",\"funeral\",\"furniture\",\"game\",\"garbage\",\"garden\",\"gate\",\"geese\",\"gene\",\"ghost\",\"giants\",\"giraffe\",\"girl\",\"girlfriend\",\"girls\",\"glass\",\"glove\",\"glue\",\"goal\",\"goat\",\"gold\",\"goldfish\",\"goodbye\",\"goose\",\"government\",\"governor\",\"grade\",\"grain\",\"grandfather\",\"grandmother\",\"grape\",\"grass\",\"grip\",\"grocery\",\"ground\",\"group\",\"growth\",\"guest\",\"guidance\",\"guide\",\"guitar\",\"gun\",\"hair\",\"haircut\",\"hall\",\"hammer\",\"hand\",\"hands\",\"harbor\",\"harmony\",\"hat\",\"hate\",\"head\",\"health\",\"hearing\",\"heart\",\"heat\",\"height\",\"help\",\"hen\",\"highway\",\"hill\",\"historian\",\"history\",\"hobbies\",\"hole\",\"holiday\",\"home\",\"homework\",\"honey\",\"hook\",\"hope\",\"horn\",\"horse\",\"horses\",\"hose\",\"hospital\",\"hot\",\"hotel\",\"hour\",\"house\",\"houses\",\"housing\",\"humor\",\"hydrant\",\"ice\",\"icicle\",\"idea\",\"imagination\",\"importance\",\"impression\",\"improvement\",\"impulse\",\"income\",\"increase\",\"independence\",\"indication\",\"industry\",\"inflation\",\"information\",\"initiative\",\"injury\",\"ink\",\"insect\",\"inspection\",\"inspector\",\"instance\",\"instruction\",\"instrument\",\"insurance\",\"intention\",\"interaction\",\"interest\",\"internet\",\"introduction\",\"invention\",\"investment\",\"iron\",\"island\",\"jail\",\"jam\",\"jar\",\"jeans\",\"jelly\",\"jellyfish\",\"jewel\",\"join\",\"joke\",\"journey\",\"judge\",\"judgment\",\"juice\",\"jump\",\"kettle\",\"key\",\"kick\",\"king\",\"kiss\",\"kite\",\"kitten\",\"kittens\",\"kitty\",\"knee\",\"knife\",\"knot\",\"knowledge\",\"lab\",\"laborer\",\"lace\",\"ladder\",\"lady\",\"ladybug\",\"lake\",\"lamp\",\"land\",\"language\",\"laugh\",\"law\",\"lawyer\",\"lead\",\"leader\",\"leadership\",\"leaf\",\"learning\",\"leather\",\"leg\",\"legs\",\"length\",\"letter\",\"letters\",\"lettuce\",\"level\",\"library\",\"lift\",\"light\",\"limit\",\"line\",\"linen\",\"lip\",\"liquid\",\"list\",\"literature\",\"lizards\",\"loaf\",\"location\",\"lock\",\"locket\",\"look\",\"loss\",\"love\",\"low\",\"lumber\",\"lunch\",\"lunchroom\",\"machine\",\"magazine\",\"magic\",\"maid\",\"mailbox\",\"maintenance\",\"mall\",\"man\",\"management\",\"manager\",\"manufacturer\",\"map\",\"marble\",\"mark\",\"market\",\"marketing\",\"marriage\",\"mask\",\"mass\",\"match\",\"math\",\"meal\",\"meaning\",\"measure\",\"measurement\",\"meat\",\"media\",\"medicine\",\"meeting\",\"member\",\"membership\",\"memory\",\"men\",\"menu\",\"message\",\"metal\",\"method\",\"mice\",\"middle\",\"midnight\",\"milk\",\"mind\",\"mine\",\"minister\",\"mint\",\"minute\",\"mist\",\"mitten\",\"mixture\",\"mode\",\"mom\",\"moment\",\"money\",\"monkey\",\"month\",\"mood\",\"moon\",\"morning\",\"mother\",\"motion\",\"mountain\",\"mouth\",\"move\",\"movie\",\"mud\",\"muscle\",\"music\",\"nail\",\"name\",\"nation\",\"nature\",\"neck\",\"need\",\"needle\",\"negotiation\",\"nerve\",\"nest\",\"net\",\"news\",\"newspaper\",\"night\",\"noise\",\"north\",\"nose\",\"note\",\"notebook\",\"number\",\"nut\",\"oatmeal\",\"obligation\",\"observation\",\"ocean\",\"offer\",\"office\",\"oil\",\"operation\",\"opinion\",\"opportunity\",\"orange\",\"oranges\",\"order\",\"organization\",\"ornament\",\"outcome\",\"oven\",\"owl\",\"owner\",\"page\",\"pail\",\"pain\",\"paint\",\"painting\",\"pan\",\"pancake\",\"paper\",\"parcel\",\"parent\",\"park\",\"part\",\"partner\",\"party\",\"passenger\",\"passion\",\"paste\",\"patch\",\"patience\",\"payment\",\"peace\",\"pear\",\"pen\",\"penalty\",\"pencil\",\"people\",\"percentage\",\"perception\",\"performance\",\"permission\",\"person\",\"personality\",\"perspective\",\"pest\",\"pet\",\"pets\",\"philosophy\",\"phone\",\"photo\",\"physics\",\"piano\",\"pickle\",\"picture\",\"pie\",\"pies\",\"pig\",\"pigs\",\"pin\",\"pipe\",\"pizza\",\"pizzas\",\"place\",\"plane\",\"planes\",\"plant\",\"plantation\",\"plants\",\"plastic\",\"plate\",\"platform\",\"play\",\"player\",\"playground\",\"pleasure\",\"plot\",\"plough\",\"pocket\",\"poem\",\"poet\",\"poetry\",\"point\",\"poison\",\"police\",\"policy\",\"polish\",\"politics\",\"pollution\",\"popcorn\",\"population\",\"porter\",\"position\",\"possession\",\"possibility\",\"pot\",\"potato\",\"powder\",\"power\",\"preference\",\"preparation\",\"presence\",\"presentation\",\"president\",\"price\",\"print\",\"priority\",\"prison\",\"problem\",\"procedure\",\"process\",\"produce\",\"product\",\"profession\",\"professor\",\"profit\",\"promotion\",\"property\",\"proposal\",\"prose\",\"protection\",\"protest\",\"psychology\",\"pull\",\"pump\",\"punishment\",\"purpose\",\"push\",\"quality\",\"quantity\",\"quarter\",\"quartz\",\"queen\",\"question\",\"quicksand\",\"quiet\",\"quill\",\"quilt\",\"quince\",\"quiver\",\"rabbit\",\"rabbits\",\"rail\",\"railway\",\"rain\",\"rainstorm\",\"rake\",\"range\",\"rat\",\"rate\",\"ratio\",\"ray\",\"reaction\",\"reading\",\"reality\",\"reason\",\"receipt\",\"reception\",\"recess\",\"recipe\",\"recognition\",\"recommendation\",\"record\",\"recording\",\"reflection\",\"refrigerator\",\"region\",\"regret\",\"relation\",\"relationship\",\"religion\",\"replacement\",\"representative\",\"republic\",\"reputation\",\"request\",\"requirement\",\"resolution\",\"resource\",\"respect\",\"response\",\"responsibility\",\"rest\",\"restaurant\",\"revenue\",\"revolution\",\"reward\",\"rhythm\",\"rice\",\"riddle\",\"rifle\",\"ring\",\"rings\",\"river\",\"road\",\"robin\",\"rock\",\"rod\",\"role\",\"roll\",\"roof\",\"room\",\"root\",\"rose\",\"route\",\"rub\",\"rule\",\"run\",\"sack\",\"safety\",\"sail\",\"salad\",\"salt\",\"sample\",\"sand\",\"satisfaction\",\"scale\",\"scarecrow\",\"scarf\",\"scene\",\"scent\",\"school\",\"science\",\"scissors\",\"screw\",\"sea\",\"seashore\",\"seat\",\"secretary\",\"sector\",\"security\",\"seed\",\"selection\",\"self\",\"sense\",\"series\",\"servant\",\"session\",\"setting\",\"shade\",\"shake\",\"shame\",\"shape\",\"sheep\",\"sheet\",\"shelf\",\"ship\",\"shirt\",\"shock\",\"shoe\",\"shoes\",\"shop\",\"shopping\",\"show\",\"side\",\"sidewalk\",\"sign\",\"signature\",\"significance\",\"silk\",\"silver\",\"singer\",\"sink\",\"sir\",\"sister\",\"sisters\",\"situation\",\"size\",\"skate\",\"skill\",\"skin\",\"skirt\",\"sky\",\"slave\",\"sleep\",\"sleet\",\"slip\",\"slope\",\"smash\",\"smell\",\"smile\",\"smoke\",\"snail\",\"snails\",\"snake\",\"snakes\",\"sneeze\",\"snow\",\"soap\",\"society\",\"sock\",\"soda\",\"sofa\",\"software\",\"solution\",\"son\",\"song\",\"songs\",\"sort\",\"sound\",\"soup\",\"space\",\"spade\",\"spark\",\"speaker\",\"speech\",\"spiders\",\"sponge\",\"spoon\",\"spot\",\"spring\",\"spy\",\"square\",\"squirrel\",\"stage\",\"stamp\",\"star\",\"start\",\"statement\",\"station\",\"steak\",\"steam\",\"steel\",\"stem\",\"step\",\"stew\",\"stick\",\"sticks\",\"stitch\",\"stocking\",\"stomach\",\"stone\",\"stop\",\"storage\",\"store\",\"story\",\"stove\",\"stranger\",\"strategy\",\"straw\",\"stream\",\"street\",\"stretch\",\"string\",\"structure\",\"student\",\"studio\",\"substance\",\"success\",\"sugar\",\"suggestion\",\"suit\",\"summer\",\"sun\",\"supermarket\",\"support\",\"surgery\",\"surprise\",\"sweater\",\"swim\",\"swing\",\"sympathy\",\"system\",\"table\",\"tail\",\"tale\",\"talk\",\"tank\",\"taste\",\"tax\",\"tea\",\"teacher\",\"teaching\",\"team\",\"technology\",\"teeth\",\"television\",\"temper\",\"temperature\",\"tendency\",\"tennis\",\"tension\",\"tent\",\"territory\",\"test\",\"texture\",\"thanks\",\"theory\",\"thing\",\"things\",\"thought\",\"thread\",\"thrill\",\"throat\",\"throne\",\"thumb\",\"thunder\",\"ticket\",\"tiger\",\"time\",\"tin\",\"title\",\"toad\",\"toe\",\"toes\",\"tomatoes\",\"tongue\",\"tooth\",\"toothbrush\",\"toothpaste\",\"top\",\"topic\",\"touch\",\"town\",\"toy\",\"toys\",\"trade\",\"tradition\",\"trail\",\"train\",\"trainer\",\"trains\",\"tramp\",\"transport\",\"transportation\",\"tray\",\"treatment\",\"tree\",\"trees\",\"trick\",\"trip\",\"trouble\",\"trousers\",\"truck\",\"trucks\",\"truth\",\"tub\",\"turkey\",\"turn\",\"twig\",\"twist\",\"two\",\"umbrella\",\"uncle\",\"understanding\",\"underwear\",\"union\",\"unit\",\"university\",\"use\",\"user\",\"vacation\",\"value\",\"van\",\"variation\",\"variety\",\"vase\",\"vegetable\",\"vehicle\",\"veil\",\"vein\",\"verse\",\"version\",\"vessel\",\"vest\",\"video\",\"view\",\"village\",\"virus\",\"visitor\",\"voice\",\"volcano\",\"volleyball\",\"volume\",\"voyage\",\"walk\",\"wall\",\"war\",\"warning\",\"wash\",\"waste\",\"watch\",\"water\",\"wave\",\"waves\",\"wax\",\"way\",\"weakness\",\"wealth\",\"weather\",\"wedding\",\"week\",\"weight\",\"wheel\",\"whip\",\"whistle\",\"wife\",\"wilderness\",\"wind\",\"window\",\"wine\",\"wing\",\"winner\",\"winter\",\"wire\",\"wish\",\"woman\",\"women\",\"wood\",\"wool\",\"word\",\"work\",\"worker\",\"world\",\"worm\",\"wound\",\"wren\",\"wrench\",\"wrist\",\"writer\",\"writing\",\"yak\",\"yam\",\"yard\",\"yarn\",\"year\",\"yoke\",\"youth\",\"zebra\",\"zephyr\",\"zinc\",\"zipper\",\"zoo\"],\"verbs\":[\"abide\",\"accelerate\",\"accept\",\"accomplish\",\"accuse\",\"achieve\",\"acquire\",\"acted\",\"activate\",\"adapt\",\"add\",\"address\",\"adjust\",\"administer\",\"admire\",\"admit\",\"adopt\",\"advise\",\"afford\",\"agree\",\"alert\",\"alight\",\"allow\",\"altered\",\"amuse\",\"analyze\",\"announce\",\"annoy\",\"answer\",\"anticipate\",\"apologize\",\"appear\",\"applaud\",\"applied\",\"apply\",\"appoint\",\"appraise\",\"appreciate\",\"approach\",\"approve\",\"arbitrate\",\"are\",\"argue\",\"arise\",\"arrange\",\"arrest\",\"arrive\",\"ascertain\",\"ask\",\"assemble\",\"assess\",\"assist\",\"assume\",\"assure\",\"attach\",\"attack\",\"attain\",\"attempt\",\"attend\",\"attract\",\"audited\",\"avoid\",\"awake\",\"back\",\"bake\",\"balance\",\"ban\",\"bang\",\"bare\",\"bat\",\"bathe\",\"battle\",\"be\",\"beam\",\"bear\",\"beat\",\"become\",\"beg\",\"begin\",\"behave\",\"behold\",\"believe\",\"belong\",\"bend\",\"beset\",\"bet\",\"bid\",\"bind\",\"bite\",\"bleach\",\"bleed\",\"bless\",\"blind\",\"blink\",\"blot\",\"blow\",\"blush\",\"boast\",\"boil\",\"bolt\",\"bomb\",\"book\",\"bore\",\"borrow\",\"bounce\",\"bow\",\"box\",\"brake\",\"branch\",\"break\",\"breathe\",\"breed\",\"brief\",\"bring\",\"broadcast\",\"bruise\",\"brush\",\"bubble\",\"budget\",\"build\",\"bump\",\"burn\",\"burst\",\"bury\",\"bust\",\"buy\",\"buzz\",\"calculate\",\"call\",\"camp\",\"care\",\"carry\",\"carve\",\"cast\",\"catalog\",\"catch\",\"cause\",\"celebrate\",\"challenge\",\"change\",\"charge\",\"chart\",\"chase\",\"cheat\",\"check\",\"cheer\",\"chew\",\"choke\",\"choose\",\"chop\",\"claim\",\"clap\",\"clarify\",\"classify\",\"clean\",\"clear\",\"cling\",\"clip\",\"close\",\"clothe\",\"coach\",\"coil\",\"collect\",\"color\",\"comb\",\"come\",\"command\",\"commit\",\"communicate\",\"compare\",\"compete\",\"compile\",\"complain\",\"complete\",\"compose\",\"compute\",\"conceive\",\"concentrate\",\"conceptualize\",\"concern\",\"conclude\",\"conduct\",\"confess\",\"confirm\",\"confront\",\"confuse\",\"connect\",\"conserve\",\"consider\",\"consist\",\"consolidate\",\"construct\",\"consult\",\"contain\",\"continue\",\"contract\",\"control\",\"convert\",\"convince\",\"coordinate\",\"copy\",\"correct\",\"correlate\",\"cost\",\"cough\",\"counsel\",\"count\",\"cover\",\"crack\",\"crash\",\"crawl\",\"create\",\"creep\",\"criticize\",\"critique\",\"cross\",\"crush\",\"cry\",\"cure\",\"curl\",\"curve\",\"cut\",\"cycle\",\"dam\",\"damage\",\"dance\",\"dare\",\"deal\",\"decay\",\"deceive\",\"decide\",\"decorate\",\"define\",\"delay\",\"delegate\",\"delight\",\"deliver\",\"demonstrate\",\"depend\",\"describe\",\"desert\",\"deserve\",\"design\",\"destroy\",\"detail\",\"detect\",\"determine\",\"develop\",\"devise\",\"diagnose\",\"differ\",\"dig\",\"direct\",\"disagree\",\"disappear\",\"disapprove\",\"disarm\",\"discover\",\"discuss\",\"dislike\",\"dispense\",\"display\",\"disprove\",\"dissect\",\"distribute\",\"dive\",\"divert\",\"divide\",\"do\",\"does\",\"double\",\"doubt\",\"draft\",\"drag\",\"drain\",\"dramatize\",\"draw\",\"dream\",\"dress\",\"drink\",\"drip\",\"drive\",\"drop\",\"drown\",\"drum\",\"dry\",\"dust\",\"dwell\",\"earn\",\"eat\",\"edited\",\"educate\",\"eliminate\",\"embarrass\",\"emphasize\",\"employ\",\"empty\",\"enable\",\"enacted\",\"encourage\",\"encouraging\",\"end\",\"endure\",\"enforce\",\"engage\",\"engineer\",\"enhance\",\"enjoy\",\"enlist\",\"ensure\",\"enter\",\"entertain\",\"escape\",\"establish\",\"estimate\",\"evaluate\",\"examine\",\"exceed\",\"excite\",\"excuse\",\"execute\",\"exercise\",\"exhibit\",\"exist\",\"expand\",\"expect\",\"expedite\",\"experiment\",\"explain\",\"explode\",\"explore\",\"express\",\"extend\",\"extract\",\"face\",\"facilitate\",\"fade\",\"fail\",\"fancy\",\"fasten\",\"fax\",\"fear\",\"feed\",\"feel\",\"fence\",\"fetch\",\"fight\",\"file\",\"fill\",\"film\",\"finalize\",\"finance\",\"find\",\"fire\",\"fit\",\"fix\",\"flap\",\"flash\",\"flee\",\"fling\",\"float\",\"flood\",\"flow\",\"flower\",\"fly\",\"fold\",\"follow\",\"fool\",\"forbid\",\"force\",\"forecast\",\"forego\",\"foresee\",\"foretell\",\"forget\",\"forgive\",\"form\",\"formulate\",\"forsake\",\"frame\",\"freeze\",\"frighten\",\"fry\",\"gather\",\"gaze\",\"generate\",\"get\",\"give\",\"glow\",\"glue\",\"go\",\"govern\",\"grab\",\"graduate\",\"grate\",\"grease\",\"greet\",\"grin\",\"grind\",\"grip\",\"groan\",\"grow\",\"guarantee\",\"guard\",\"guess\",\"guide\",\"hammer\",\"hand\",\"handle\",\"handwrite\",\"hang\",\"happen\",\"harass\",\"harm\",\"has\",\"hate\",\"haunt\",\"head\",\"heal\",\"heap\",\"hear\",\"heat\",\"help\",\"hesitate\",\"hide\",\"hit\",\"hold\",\"hook\",\"hop\",\"hope\",\"hover\",\"hug\",\"hum\",\"hunt\",\"hurry\",\"hurt\",\"hypothesize\",\"identify\",\"ignore\",\"illustrate\",\"imagine\",\"implement\",\"imply\",\"impress\",\"improve\",\"improvise\",\"include\",\"incorporate\",\"increase\",\"indicate\",\"induce\",\"influence\",\"inform\",\"initiate\",\"inject\",\"injure\",\"inlay\",\"innovate\",\"input\",\"insist\",\"inspect\",\"inspire\",\"install\",\"institute\",\"instruct\",\"insure\",\"integrate\",\"intend\",\"intensify\",\"interest\",\"interfere\",\"interlay\",\"interpret\",\"interrupt\",\"interview\",\"introduce\",\"invent\",\"inventory\",\"invest\",\"investigate\",\"invite\",\"involve\",\"irritate\",\"is\",\"itch\",\"jail\",\"jam\",\"jog\",\"join\",\"joke\",\"judge\",\"juggle\",\"jump\",\"justify\",\"keep\",\"kept\",\"kick\",\"kill\",\"kiss\",\"kneel\",\"knit\",\"knock\",\"knot\",\"know\",\"label\",\"land\",\"last\",\"laugh\",\"launch\",\"lay\",\"lead\",\"lean\",\"leap\",\"learn\",\"leave\",\"lecture\",\"led\",\"lend\",\"let\",\"level\",\"license\",\"lick\",\"lie\",\"lifted\",\"light\",\"lighten\",\"like\",\"list\",\"listen\",\"live\",\"load\",\"locate\",\"lock\",\"log\",\"long\",\"look\",\"lose\",\"love\",\"maintain\",\"make\",\"man\",\"manage\",\"manipulate\",\"manufacture\",\"manufacturing\",\"map\",\"march\",\"mark\",\"market\",\"marry\",\"match\",\"mate\",\"matter\",\"mean\",\"measure\",\"meddle\",\"mediate\",\"meet\",\"melt\",\"memorize\",\"mend\",\"mentor\",\"milk\",\"mine\",\"mislead\",\"miss\",\"misspell\",\"mistake\",\"misunderstand\",\"mix\",\"moan\",\"model\",\"modify\",\"monitor\",\"moor\",\"motivate\",\"mourn\",\"move\",\"mow\",\"muddle\",\"mug\",\"multiply\",\"murder\",\"nail\",\"name\",\"navigate\",\"need\",\"negotiate\",\"nest\",\"nod\",\"nominate\",\"normalize\",\"note\",\"notice\",\"number\",\"obey\",\"object\",\"observe\",\"obtain\",\"occur\",\"offend\",\"offer\",\"officiate\",\"open\",\"operate\",\"order\",\"organize\",\"oriented\",\"originate\",\"ought\",\"overcome\",\"overdo\",\"overdraw\",\"overflow\",\"overhear\",\"overtake\",\"overthrow\",\"owe\",\"own\",\"pack\",\"paddle\",\"paint\",\"park\",\"part\",\"participate\",\"pass\",\"paste\",\"pat\",\"pause\",\"pay\",\"peck\",\"pedal\",\"peel\",\"peep\",\"perceive\",\"perfect\",\"perform\",\"permit\",\"persuade\",\"phone\",\"photograph\",\"pick\",\"pilot\",\"pinch\",\"pine\",\"pinpoint\",\"pioneer\",\"place\",\"plan\",\"plant\",\"play\",\"plead\",\"please\",\"plug\",\"point\",\"poke\",\"polish\",\"pop\",\"possess\",\"post\",\"pour\",\"practice\",\"praised\",\"pray\",\"preach\",\"precede\",\"predict\",\"prefer\",\"prepare\",\"prescribe\",\"present\",\"preserve\",\"preset\",\"preside\",\"press\",\"pretend\",\"prevent\",\"prick\",\"print\",\"process\",\"procure\",\"produce\",\"profess\",\"program\",\"progress\",\"project\",\"promise\",\"promote\",\"proofread\",\"propose\",\"protect\",\"prove\",\"provide\",\"publicize\",\"pull\",\"pump\",\"punch\",\"puncture\",\"punish\",\"purchase\",\"pursue\",\"push\",\"put\",\"qualify\",\"question\",\"queue\",\"quit\",\"race\",\"radiate\",\"rain\",\"raise\",\"rank\",\"rate\",\"reach\",\"react\",\"read\",\"realign\",\"realize\",\"reason\",\"receive\",\"recognize\",\"recommend\",\"reconcile\",\"record\",\"recruit\",\"reduce\",\"refer\",\"reflect\",\"refuse\",\"regret\",\"regulate\",\"rehabilitate\",\"reign\",\"reinforce\",\"reject\",\"rejoice\",\"relate\",\"relax\",\"release\",\"relieve\",\"rely\",\"remain\",\"remaining\",\"remember\",\"remind\",\"remove\",\"render\",\"reorganize\",\"repair\",\"repeat\",\"replace\",\"reply\",\"report\",\"represent\",\"reproduce\",\"request\",\"require\",\"rescue\",\"research\",\"resolve\",\"respond\",\"restored\",\"restructure\",\"retain\",\"retire\",\"retrieve\",\"return\",\"review\",\"revise\",\"rhyme\",\"rid\",\"ride\",\"ring\",\"rinse\",\"rise\",\"risk\",\"rob\",\"rock\",\"roll\",\"rot\",\"rub\",\"ruin\",\"rule\",\"run\",\"rush\",\"sack\",\"sail\",\"satisfy\",\"save\",\"saw\",\"say\",\"scare\",\"scatter\",\"schedule\",\"scold\",\"scorch\",\"scrape\",\"scratch\",\"scream\",\"screw\",\"scribble\",\"scrub\",\"seal\",\"search\",\"secure\",\"see\",\"seek\",\"seem\",\"select\",\"sell\",\"send\",\"sense\",\"separate\",\"serve\",\"service\",\"set\",\"settle\",\"sew\",\"shade\",\"shake\",\"shall\",\"shape\",\"share\",\"shave\",\"shear\",\"shed\",\"shelter\",\"shine\",\"shiver\",\"shock\",\"shoe\",\"shoot\",\"shop\",\"show\",\"shrink\",\"shrug\",\"shut\",\"sigh\",\"sign\",\"signal\",\"simplify\",\"sin\",\"sing\",\"sink\",\"sip\",\"sit\",\"sketch\",\"ski\",\"skip\",\"slap\",\"slay\",\"sleep\",\"slide\",\"sling\",\"slink\",\"slip\",\"slit\",\"slow\",\"smash\",\"smell\",\"smile\",\"smite\",\"smoke\",\"snatch\",\"sneak\",\"sneeze\",\"sniff\",\"snore\",\"snow\",\"soak\",\"solve\",\"soothe\",\"soothsay\",\"sort\",\"sound\",\"sow\",\"spare\",\"spark\",\"sparkle\",\"speak\",\"specify\",\"speed\",\"spell\",\"spend\",\"spill\",\"spin\",\"spit\",\"split\",\"spoil\",\"spot\",\"spray\",\"spread\",\"spring\",\"sprout\",\"squash\",\"squeak\",\"squeal\",\"squeeze\",\"stain\",\"stamp\",\"stand\",\"stare\",\"start\",\"stay\",\"steal\",\"steer\",\"step\",\"stick\",\"stimulate\",\"sting\",\"stink\",\"stir\",\"stitch\",\"stop\",\"store\",\"strap\",\"streamline\",\"strengthen\",\"stretch\",\"stride\",\"strike\",\"string\",\"strip\",\"strive\",\"stroke\",\"structure\",\"study\",\"stuff\",\"sublet\",\"submit\",\"subtract\",\"succeed\",\"suck\",\"suffer\",\"suggest\",\"suit\",\"summarize\",\"supervise\",\"supply\",\"support\",\"suppose\",\"surprise\",\"surround\",\"survive\",\"suspect\",\"suspend\",\"swear\",\"sweat\",\"sweep\",\"swell\",\"swim\",\"swing\",\"switch\",\"symbolize\",\"synthesize\",\"systemize\",\"tabulate\",\"take\",\"talk\",\"tame\",\"tap\",\"target\",\"taste\",\"teach\",\"tear\",\"tease\",\"telephone\",\"tell\",\"tempt\",\"tend\",\"terrify\",\"test\",\"thank\",\"thaw\",\"think\",\"thrive\",\"throw\",\"thrust\",\"tick\",\"tickle\",\"tie\",\"time\",\"tip\",\"tire\",\"touch\",\"tour\",\"tow\",\"trace\",\"trade\",\"train\",\"transcribe\",\"transfer\",\"transform\",\"translate\",\"transport\",\"trap\",\"travel\",\"tread\",\"treat\",\"tremble\",\"trick\",\"trip\",\"trot\",\"trouble\",\"troubleshoot\",\"trust\",\"try\",\"tug\",\"tumble\",\"turn\",\"tutor\",\"twist\",\"type\",\"undergo\",\"understand\",\"undertake\",\"undress\",\"unfasten\",\"unify\",\"unite\",\"unlock\",\"unpack\",\"untidy\",\"update\",\"upgrade\",\"uphold\",\"upset\",\"use\",\"utilize\",\"vanish\",\"vary\",\"verbalize\",\"verify\",\"vex\",\"visit\",\"wail\",\"wait\",\"wake\",\"walk\",\"wander\",\"want\",\"warm\",\"warn\",\"wash\",\"waste\",\"watch\",\"water\",\"wave\",\"wear\",\"weave\",\"wed\",\"weep\",\"weigh\",\"welcome\",\"wend\",\"wet\",\"whine\",\"whip\",\"whirl\",\"whisper\",\"whistle\",\"win\",\"wind\",\"wink\",\"wipe\",\"wish\",\"withdraw\",\"withhold\",\"withstand\",\"wobble\",\"wonder\",\"work\",\"worry\",\"would\",\"wrap\",\"wreck\",\"wrestle\",\"wriggle\",\"wring\",\"write\",\"xray\",\"yawn\",\"yell\",\"zip\",\"zoom\"],\"reserved\":[\"about\",\"abuse\",\"access\",\"account\",\"accounts\",\"ad\",\"add\",\"address\",\"adm\",\"admanager\",\"admin\",\"admindashboard\",\"administration\",\"administrator\",\"ads\",\"adsense\",\"advertising\",\"adwords\",\"affiliate\",\"affiliates\",\"ajax\",\"alias\",\"analytics\",\"android\",\"anon\",\"anonymous\",\"api\",\"app\",\"apps\",\"archive\",\"asset\",\"assets\",\"assets1\",\"assets2\",\"assets3\",\"auth\",\"authenticate\",\"authentication\",\"auto\",\"avatar\",\"backup\",\"backups\",\"banner\",\"banners\",\"beta\",\"billing\",\"bin\",\"blog\",\"blogs\",\"board\",\"bot\",\"bots\",\"business\",\"buy\",\"cache\",\"calendar\",\"camo\",\"campaign\",\"careers\",\"cdn\",\"cgi\",\"chat\",\"child\",\"cli\",\"client\",\"cliente\",\"clients\",\"cms\",\"code\",\"comercial\",\"community\",\"company\",\"compare\",\"conditions\",\"config\",\"connect\",\"contact\",\"contest\",\"copyright\",\"cp\",\"cpanel\",\"create\",\"css\",\"css1\",\"css2\",\"css3\",\"dashboard\",\"data\",\"db\",\"delete\",\"demo\",\"design\",\"dev\",\"develop\",\"developer\",\"developers\",\"development\",\"dir\",\"directory\",\"dns\",\"doc\",\"docs\",\"documentation\",\"domain\",\"donate\",\"download\",\"downloads\",\"ecommerce\",\"edit\",\"editor\",\"email\",\"faq\",\"favorite\",\"features\",\"feed\",\"feedback\",\"feeds\",\"file\",\"files\",\"follow\",\"forum\",\"forums\",\"free\",\"ftp\",\"games\",\"gettingstarted\",\"git\",\"global\",\"graph\",\"graphs\",\"group\",\"groups\",\"guest\",\"help\",\"home\",\"homepage\",\"host\",\"hosting\",\"hostname\",\"html\",\"http\",\"httpd\",\"https\",\"id\",\"image\",\"images\",\"imap\",\"img\",\"img1\",\"img2\",\"img3\",\"index\",\"info\",\"information\",\"intranet\",\"investors\",\"invite\",\"invoice\",\"invoices\",\"ios\",\"ipad\",\"iphone\",\"irc\",\"java\",\"javascript\",\"job\",\"jobs\",\"join\",\"js\",\"js1\",\"js2\",\"js3\",\"knowledgebase\",\"lab\",\"list\",\"lists\",\"log\",\"login\",\"logout\",\"logs\",\"m\",\"mail\",\"mail1\",\"mail2\",\"mail3\",\"mailer\",\"mailing\",\"mailto\",\"manage\",\"manager\",\"marketing\",\"master\",\"me\",\"media\",\"message\",\"messenger\",\"mob\",\"mobile\",\"movie\",\"movies\",\"mp3\",\"msg\",\"msn\",\"music\",\"mx\",\"my\",\"mysql\",\"name\",\"named\",\"net\",\"network\",\"networks\",\"new\",\"news\",\"newsite\",\"newsletter\",\"notes\",\"ns\",\"ns1\",\"ns2\",\"ns3\",\"old\",\"online\",\"openings\",\"operator\",\"order\",\"orders\",\"page\",\"pages\",\"panel\",\"partner\",\"partnerpage\",\"partners\",\"password\",\"payment\",\"payments\",\"perl\",\"photo\",\"photos\",\"php\",\"pic\",\"pics\",\"plugin\",\"plugins\",\"pop\",\"pop3\",\"popular\",\"post\",\"postfix\",\"postmaster\",\"posts\",\"privacy\",\"prod\",\"production\",\"profile\",\"project\",\"projects\",\"promo\",\"pub\",\"public\",\"python\",\"random\",\"redirect\",\"register\",\"registration\",\"resolver\",\"root\",\"rss\",\"ruby\",\"sale\",\"sales\",\"sample\",\"samples\",\"sandbox\",\"script\",\"scripts\",\"search\",\"secure\",\"security\",\"send\",\"server\",\"servers\",\"service\",\"setting\",\"settings\",\"setup\",\"shop\",\"signin\",\"signup\",\"site\",\"sitemap\",\"sites\",\"sms\",\"smtp\",\"sorry\",\"sql\",\"ssh\",\"ssl\",\"stage\",\"staging\",\"start\",\"stat\",\"static\",\"stats\",\"status\",\"storage\",\"store\",\"stores\",\"subdomain\",\"subscribe\",\"support\",\"survey\",\"surveys\",\"svn\",\"system\",\"tablet\",\"tablets\",\"talk\",\"task\",\"tasks\",\"tech\",\"telnet\",\"terms\",\"test\",\"test1\",\"test2\",\"test3\",\"teste\",\"testing\",\"tests\",\"theme\",\"themes\",\"tmp\",\"todo\",\"tools\",\"trac\",\"tracking\",\"translate\",\"tv\",\"update\",\"upload\",\"uploads\",\"url\",\"us\",\"usage\",\"user\",\"username\",\"users\",\"validation\",\"validations\",\"video\",\"videos\",\"visitor\",\"web\",\"webdisk\",\"webmail\",\"webmaster\",\"website\",\"websites\",\"whois\",\"wiki\",\"win\",\"workshop\",\"ww\",\"wws\",\"www\",\"www1\",\"www2\",\"www3\",\"wwws\",\"wwww\",\"xpg\",\"you\",\"yourdomain\",\"yourname\",\"yoursite\",\"yourusername\"],\"manly\":{\"adjectives\":[\"abandoned\",\"almighty\",\"avenged\",\"bad\",\"badass\",\"ballistic\",\"bareback\",\"bearded\",\"blackened\",\"blazing\",\"bloodied\",\"bloody\",\"bold\",\"brave\",\"brawny\",\"bulged\",\"bulging\",\"burly\",\"burnt\",\"butch\",\"caged\",\"carnal\",\"chiseled\",\"courageous\",\"dangerous\",\"daring\",\"deep\",\"downtrodden\",\"dry\",\"elite\",\"excessive\",\"exploding\",\"explosive\",\"fallen\",\"fearful\",\"fearless\",\"ferocious\",\"fierce\",\"fiery\",\"flexing\",\"flinty\",\"forged\",\"furious\",\"gallant\",\"gigantic\",\"glorious\",\"gnarly\",\"golden\",\"grandeur\",\"greasy\",\"grizzled\",\"grizzly\",\"gutsy\",\"hanging\",\"hardened\",\"heavy\",\"heroic\",\"highpowered\",\"hostile\",\"howling\",\"huge\",\"hunky\",\"impossible\",\"inglorious\",\"intense\",\"iron\",\"jackboot\",\"kicking\",\"legendary\",\"macho\",\"magnificent\",\"mannish\",\"max\",\"maximum\",\"mighty\",\"monstrous\",\"muscular\",\"musky\",\"nuclear\",\"potent\",\"powerful\",\"premium\",\"primal\",\"pummeled\",\"pure\",\"rabid\",\"raging\",\"relentless\",\"righteous\",\"robust\",\"rugged\",\"ruthless\",\"sauced\",\"savage\",\"sharp\",\"sharpened\",\"shaving\",\"smoldering\",\"stampeding\",\"sterling\",\"stormy\",\"strapping\",\"strong\",\"stubbled\",\"suave\",\"super\",\"supreme\",\"swanson\",\"sweaty\",\"tame\",\"techno\",\"transcendent\",\"turbo\",\"tyrannosaurus\",\"ultimate\",\"unrelenting\",\"vehicular\",\"vicious\",\"vigorous\",\"violent\",\"virile\",\"viscous\",\"weak\",\"weathered\",\"wild\",\"zealous\"],\"nouns\":[\"aggression\",\"armageddon\",\"attack\",\"auger\",\"avenger\",\"bacon\",\"badass\",\"ballistic\",\"balls\",\"banner\",\"bar\",\"barbecue\",\"barfight\",\"baron\",\"barrage\",\"barrel\",\"battle\",\"battleaxe\",\"bear\",\"beard\",\"bearskin\",\"beef\",\"beer\",\"bicep\",\"blaster\",\"blood\",\"bomb\",\"bourbon\",\"box\",\"brawn\",\"brimstone\",\"bronco\",\"bruise\",\"buck\",\"bull\",\"bullet\",\"burn\",\"bushwak\",\"buzzsaw\",\"cage\",\"camp\",\"cannon\",\"cannons\",\"caution\",\"chainsaw\",\"challenge\",\"chest\",\"chop\",\"cigar\",\"claw\",\"clip\",\"cobra\",\"coil\",\"competition\",\"corvette\",\"courage\",\"cure\",\"cutlass\",\"czar\",\"damage\",\"danger\",\"darkness\",\"death\",\"deathgrip\",\"deck\",\"delay\",\"demon\",\"den\",\"denim\",\"desert\",\"desire\",\"dinosaur\",\"dog\",\"dogs\",\"dominance\",\"dragon\",\"drain\",\"drill\",\"drone\",\"dropkick\",\"dust\",\"eagle\",\"eagles\",\"earth\",\"echo\",\"emperor\",\"empire\",\"endurance\",\"enemies\",\"enemy\",\"engine\",\"explode\",\"eye\",\"face\",\"falcon\",\"fangs\",\"fear\",\"feast\",\"fence\",\"ferrari\",\"fight\",\"fightmaster\",\"fire\",\"fireball\",\"fish\",\"fist\",\"flag\",\"flames\",\"flint\",\"flood\",\"fool\",\"force\",\"forge\",\"fortress\",\"frame\",\"fume\",\"gate\",\"gates\",\"glory\",\"glue\",\"grease\",\"greatness\",\"grill\",\"guard\",\"guts\",\"hammer\",\"harley\",\"hawk\",\"head\",\"heap\",\"heat\",\"hell\",\"hellfire\",\"hero\",\"heroes\",\"hill\",\"hills\",\"hook\",\"horsepower\",\"hound\",\"hounds\",\"hulk\",\"hurricane\",\"ice\",\"infinity\",\"iron\",\"jail\",\"jaw\",\"jaws\",\"jerky\",\"jet\",\"jetblast\",\"king\",\"knees\",\"knuckles\",\"kraken\",\"land\",\"leather\",\"legend\",\"lightning\",\"lion\",\"lock\",\"log\",\"love\",\"lumberjack\",\"machete\",\"magnificence\",\"meat\",\"meatslab\",\"mercy\",\"metal\",\"mettle\",\"might\",\"mincemeat\",\"missile\",\"monster\",\"mortal\",\"motor\",\"motorcycle\",\"mount\",\"mountain\",\"mug\",\"muscle\",\"mustache\",\"mustang\",\"nail\",\"nap\",\"night\",\"nunchuck\",\"nunchuk\",\"oak\",\"oil\",\"opponent\",\"overdrive\",\"pack\",\"paint\",\"panther\",\"panzer\",\"passion\",\"peak\",\"peg\",\"phoenix\",\"pine\",\"pistol\",\"piston\",\"plane\",\"power\",\"predator\",\"raptor\",\"revolution\",\"rex\",\"ride\",\"rifle\",\"rock\",\"rodeo\",\"rope\",\"rulership\",\"saber\",\"sauce\",\"saw\",\"scar\",\"scorpion\",\"scotch\",\"seal\",\"sergeant\",\"shade\",\"shark\",\"shelter\",\"shotgun\",\"shrapnel\",\"smoke\",\"spark\",\"spit\",\"spoils\",\"stain\",\"stallion\",\"stampede\",\"stash\",\"steak\",\"stitch\",\"storm\",\"stranglehold\",\"strap\",\"stratosphere\",\"streetfight\",\"stunt\",\"sun\",\"swagger\",\"swanson\",\"sword\",\"talon\",\"tent\",\"thunder\",\"tiger\",\"tire\",\"titanium\",\"toast\",\"tomahawk\",\"tomcat\",\"tornado\",\"torpedo\",\"truck\",\"turbo\",\"turkeyleg\",\"typhoon\",\"uppercut\",\"urge\",\"valhalla\",\"valley\",\"vengeance\",\"victory\",\"vigor\",\"viking\",\"viper\",\"war\",\"warrior\",\"warthog\",\"weakness\",\"whiskey\",\"wizard\",\"wolf\",\"wolves\"],\"verbs\":[\"alert\",\"allege\",\"annihilate\",\"answer\",\"arrest\",\"attack\",\"awake\",\"balk\",\"ban\",\"bandage\",\"bang\",\"barbecue\",\"bark\",\"barter\",\"bask\",\"baste\",\"battle\",\"bellow\",\"bend\",\"besiege\",\"bestow\",\"bite\",\"bleed\",\"boast\",\"boil\",\"bolt\",\"bomb\",\"breach\",\"break\",\"breed\",\"broil\",\"bruise\",\"build\",\"bulge\",\"burn\",\"bury\",\"camp\",\"carve\",\"chant\",\"chase\",\"chew\",\"choke\",\"chomp\",\"chop\",\"chug\",\"claim\",\"climb\",\"clip\",\"coach\",\"command\",\"conquer\",\"cough\",\"crack\",\"crash\",\"crush\",\"cry\",\"cure\",\"curl\",\"cut\",\"damage\",\"dare\",\"decay\",\"deceive\",\"defeat\",\"deliver\",\"demand\",\"destroy\",\"dethrone\",\"dictate\",\"die\",\"dig\",\"dislike\",\"dive\",\"divide\",\"divulge\",\"dominate\",\"drag\",\"drain\",\"dread\",\"drill\",\"drink\",\"drip\",\"dump\",\"eat\",\"encode\",\"engulf\",\"escape\",\"evacuate\",\"explode\",\"explore\",\"fade\",\"fail\",\"fall\",\"fasten\",\"feast\",\"feed\",\"fight\",\"fix\",\"flex\",\"fly\",\"force\",\"fry\",\"gaze\",\"gnaw\",\"gorge\",\"grab\",\"grill\",\"grip\",\"growl\",\"grumble\",\"grunt\",\"guard\",\"gurgle\",\"handle\",\"hang\",\"harass\",\"harm\",\"hate\",\"haunt\",\"hibernate\",\"hide\",\"hijack\",\"hinder\",\"hiss\",\"hit\",\"hoist\",\"howl\",\"hunt\",\"hurt\",\"impose\",\"infect\",\"infuse\",\"itch\",\"jam\",\"jolt\",\"jump\",\"kick\",\"kill\",\"knock\",\"knot\",\"land\",\"launch\",\"lift\",\"manhandle\",\"marvel\",\"mate\",\"measure\",\"melt\",\"mend\",\"merge\",\"mount\",\"mow\",\"murder\",\"park\",\"plow\",\"polish\",\"preserve\",\"protect\",\"pry\",\"pull\",\"pummel\",\"pump\",\"punch\",\"puncture\",\"punish\",\"pursue\",\"push\",\"race\",\"rave\",\"reign\",\"repair\",\"report\",\"reprimand\",\"request\",\"rescue\",\"ride\",\"rip\",\"risk\",\"roar\",\"rock\",\"roll\",\"rot\",\"run\",\"rush\",\"sack\",\"sail\",\"saw\",\"scale\",\"scold\",\"scorch\",\"scrape\",\"scratch\",\"scream\",\"screech\",\"seal\",\"search\",\"seize\",\"sever\",\"shade\",\"shave\",\"shock\",\"shoot\",\"shout\",\"shriek\",\"signal\",\"sin\",\"singe\",\"ski\",\"slap\",\"sleep\",\"smash\",\"smoke\",\"snore\",\"soak\",\"soar\",\"spark\",\"squash\",\"squeeze\",\"stab\",\"stain\",\"stamp\",\"stare\",\"steer\",\"stitch\",\"stoke\",\"storm\",\"strengthen\",\"stretch\",\"strike\",\"strut\",\"stuff\",\"stun\",\"submerge\",\"surround\",\"tackle\",\"tame\",\"taunt\",\"tear\",\"tempt\",\"terrify\",\"test\",\"thaw\",\"threaten\",\"thrust\",\"tie\",\"tow\",\"track\",\"trade\",\"transcend\",\"trap\",\"traverse\",\"trim\",\"triumph\",\"trust\",\"tug\",\"unite\",\"uppercut\",\"vanquish\",\"watch\",\"weigh\",\"whip\",\"win\",\"wipe\",\"work\",\"wreck\",\"wrestle\",\"yield\"]}}");


/***/ }),

/***/ "./node_modules/namor/dist/generate.js":
/*!*********************************************!*\
  !*** ./node_modules/namor/dist/generate.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var crypto_extra_1 = __importDefault(__webpack_require__(/*! crypto-extra */ "./node_modules/crypto-extra/dist/index.js"));
var _data_1 = __importDefault(__webpack_require__(/*! ./_data */ "./node_modules/namor/dist/_data.js"));
var Word;
(function (Word) {
    Word["Adjective"] = "adjectives";
    Word["Noun"] = "nouns";
    Word["Verb"] = "verbs";
})(Word || (Word = {}));
function randomFromArray(arr) {
    return arr[crypto_extra_1["default"].randomNumber({ max: arr.length - 1 })];
}
exports.randomFromArray = randomFromArray;
function getPattern(count) {
    switch (count) {
        case 0:
            return [];
        case 1:
            return [Word.Noun];
        case 3:
            return [Word.Adjective, Word.Noun, Word.Verb];
        case 4:
            return [Word.Adjective, Word.Noun, Word.Noun, Word.Verb];
        case 2:
        default:
            return randomFromArray([
                [Word.Adjective, Word.Noun],
                [Word.Noun, Word.Verb],
            ]);
    }
}
exports.getPattern = getPattern;
function getSalt(type, length) {
    var charset;
    switch (type) {
        case "string":
            charset = "abcdefghijklmnopqrstuvwxyz";
            break;
        case "number":
            charset = "0123456789";
            break;
        case "mixed":
        default:
            charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    }
    return crypto_extra_1["default"].randomString(length, charset);
}
exports.getSalt = getSalt;
function default_1(opts) {
    if (opts === void 0) { opts = {}; }
    if (opts.char) {
        console.log("namor.generate(): `char` option has been renamed to `separator`");
        opts.separator = opts.char;
    }
    if (opts.numbers) {
        console.log("namor.generate(): `numbers` option has been renamed to `saltLength`/`saltType`");
        opts.saltLength = opts.numbers;
        opts.saltType = "number";
    }
    if (opts.manly) {
        console.log("namor.generate(): `manly` option is deprecated, use `subset` instead");
        opts.subset = "manly";
    }
    if (opts.words && (opts.words < 1 || opts.words > 4)) {
        throw new TypeError("Word count must be between 1-4");
    }
    opts.separator = opts.separator || "-";
    opts.words = Number(opts.words !== undefined ? opts.words : 2);
    opts.saltType = opts.saltType || "mixed";
    opts.saltLength = Number(opts.saltLength !== undefined ? opts.saltLength : 5);
    var dictionary = opts.subset ? _data_1["default"][opts.subset] : _data_1["default"];
    var salt = opts.saltLength > 0 ? getSalt(opts.saltType, opts.saltLength) : null;
    var name = getPattern(opts.words)
        .map(function (type) { return randomFromArray(dictionary[type]); })
        .concat([salt])
        .filter(Boolean)
        .join(opts.separator);
    if (name.length > 63) {
        throw new TypeError("Subdomains cannot be longer than 63 characters! Try shortening your trailing salt.");
    }
    return name;
}
exports.default = default_1;


/***/ }),

/***/ "./node_modules/namor/dist/index.js":
/*!******************************************!*\
  !*** ./node_modules/namor/dist/index.js ***!
  \******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _data_1 = __importDefault(__webpack_require__(/*! ./_data */ "./node_modules/namor/dist/_data.js"));
var generate_1 = __importDefault(__webpack_require__(/*! ./generate */ "./node_modules/namor/dist/generate.js"));
var validate_1 = __importDefault(__webpack_require__(/*! ./validate */ "./node_modules/namor/dist/validate.js"));
module.exports = {
    generate: generate_1["default"],
    validate: validate_1["default"],
    rawData: _data_1["default"],
    isValid: function (name, opts) {
        console.log("namor: `isValid` has been renamed to `validate`");
        return validate_1["default"](name, opts);
    }
};


/***/ }),

/***/ "./node_modules/namor/dist/validate.js":
/*!*********************************************!*\
  !*** ./node_modules/namor/dist/validate.js ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var _data_1 = __importDefault(__webpack_require__(/*! ./_data */ "./node_modules/namor/dist/_data.js"));
function default_1(name, opts) {
    if (opts === void 0) { opts = {}; }
    var result = /^[\w](?:[\w-]{0,63}[\w])?$/.test(name);
    if (opts.reserved) {
        return result && _data_1["default"].reserved.indexOf(name) === -1;
    }
    return result;
}
exports.default = default_1;


/***/ })

}]);