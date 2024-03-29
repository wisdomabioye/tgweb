'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFlags = exports.isSimpleType = exports.getTypeProps = exports.Layout = undefined;

var _has = require('ramda/src/has');

var _has2 = _interopRequireDefault(_has);

var _flip = require('ramda/src/flip');

var _flip2 = _interopRequireDefault(_flip);

var _contains = require('ramda/src/contains');

var _contains2 = _interopRequireDefault(_contains);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TypeClass {
  constructor(name) {
    this.types = new Set();

    this.name = name;
  }
  /*isTypeOf(value: any): boolean {
    return false
  }*/
}

class Argument {
  constructor(id, name, typeClass, isVector = false, isBare = false, isFlag = false, flagIndex = NaN) {
    this.name = name;
    this.typeClass = typeClass;
    this.isVector = isVector;
    this.isBare = isBare;
    this.isFlag = isFlag;
    this.flagIndex = flagIndex;
    this.id = id;

    this.fullType = Argument.fullType(this);
  }
  static fullType(obj) {
    var { typeClass, isVector, isFlag, flagIndex } = obj;
    var result = typeClass;
    if (isVector) result = `Vector<${result}>`;
    if (isFlag) result = `flags.${flagIndex}?${result}`;
    return result;
  }
}

class Creator {
  //predicate or method
  constructor(id, name, hasFlags, params) {
    this.id = id;
    this.name = name;
    this.hasFlags = hasFlags;
    this.params = params;
  }
}

class Method extends Creator {
  constructor(id, name, hasFlags, params, returns) {
    super(id, name, hasFlags, params);
    this.returns = returns;
  }
}

class Type extends Creator {
  constructor(id, name, hasFlags, params, typeClass) {
    super(id, name, hasFlags, params);
    this.typeClass = typeClass;
  }
}

var isFlagItself = param => param.name === 'flags' && param.type === '#';

class Layout {
  makeCreator(elem, name, sign, Construct) {
    var args = [];
    var hasFlags = false;
    for (var _iterator = elem.params.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var [i, param] = _ref;

      if (isFlagItself(param)) {
        hasFlags = true;
        continue;
      }
      var _id = `${name}.${param.name}/${i}`;
      var { typeClass, isVector, isFlag, flagIndex, isBare } = getTypeProps(param.type);
      if (isFlag) hasFlags = true;
      this.pushTypeClass(typeClass);
      var arg = new Argument(_id, param.name, typeClass, isVector, isBare, isFlag, flagIndex);
      if (param.name === 'seq') {
        this.seqSet.add(name);
      }
      args.push(arg);
      this.args.set(_id, arg);
    }
    var id = parseInt(elem.id, 10);
    var creator = new Construct(id, name, hasFlags, args, sign);
    this.creators.add(name);
    if (creator instanceof Method) this.funcs.set(name, creator);else if (creator instanceof Type) {
      this.types.set(name, creator);
      this.typesById.set(id, creator);
    }
  }
  makeMethod(elem) {
    var name = elem.method;
    var returns = elem.type;
    this.pushTypeClass(returns, name);
    this.makeCreator(elem, name, returns, Method);
  }
  pushTypeClass(typeClass, type) {
    var instance = void 0;
    if (this.typeClasses.has(typeClass)) instance = this.typeClasses.get(typeClass);else {
      instance = new TypeClass(typeClass);
      this.typeClasses.set(typeClass, instance);
    }
    if (type && instance) instance.types.add(type);
  }
  makeType(elem) {
    var name = elem.predicate;
    var typeClass = elem.type;
    this.pushTypeClass(typeClass, name);
    this.makeCreator(elem, name, typeClass, Type);
  }
  makeLayout(schema) {
    var { methods, constructors } = schema;
    constructors.map(this.makeType);
    methods.map(this.makeMethod);
    for (var _iterator2 = this.types.entries(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var [key, _type] = _ref2;

      if (hasEmpty(key)) this.typeDefaults.set(_type.typeClass, { _: key });
    }
  }
  constructor(schema) {
    this.typeClasses = new Map();
    this.creators = new Set();
    this.seqSet = new Set();
    this.args = new Map();
    this.funcs = new Map();
    this.types = new Map();
    this.typesById = new Map();
    this.typeDefaults = new Map();

    //$FlowIssue
    this.makeType = this.makeType.bind(this);
    //$FlowIssue
    this.makeMethod = this.makeMethod.bind(this);
    // this.schema = schema
    this.makeLayout(schema);
  }
}
exports.Layout = Layout;
var hasEmpty = (0, _contains2.default)('Empty');
var hasQuestion = (0, _contains2.default)('?');
var hasVector = (0, _contains2.default)('<');
var hasBare = (0, _contains2.default)('%');

var getTypeProps = exports.getTypeProps = rawType => {
  var result = {
    typeClass: rawType,
    isVector: false,
    isFlag: false,
    flagIndex: NaN,
    isBare: false
  };
  if (hasQuestion(rawType)) {
    var [prefix, rest] = rawType.split('?');
    var [, index] = prefix.split('.');
    result.isFlag = true;
    result.flagIndex = +index;
    result.typeClass = rest;
  }
  if (hasVector(result.typeClass)) {
    result.isVector = true;
    result.typeClass = result.typeClass.slice(7, -1);
  }
  if (hasBare(result.typeClass)) {
    result.isBare = true;
    result.typeClass = result.typeClass.slice(1);
  }
  return result;
};

var isSimpleType = exports.isSimpleType = (0, _flip2.default)(_contains2.default)(['int', /*'long',*/'string', /*'double', */'true']);

var getFlagsRed = data => (acc, { name, flagIndex }) => (0, _has2.default)(name, data) ? acc + Math.pow(2, flagIndex) : acc;

function _ref3(e) {
  return e.isFlag;
}

var getFlags = exports.getFlags = ({ params }) => {
  var flagsParams = params.filter(_ref3);

  return data => flagsParams.reduce(getFlagsRed(data), 0);
};

exports.default = Layout;
//# sourceMappingURL=index.js.map