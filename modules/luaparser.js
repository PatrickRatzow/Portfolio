import extend from 'extend';
import tokenizer from './tokenizer';

var input, options, length;
var isInClassMethod = false,
  isInClassConstructor = false,
  classSuperCalled = false,
  classConstructorToken;

var currentClassParent;

// Options can be set either globally on the parser object through
// defaultOptions, or during the parse call.
var defaultOptions = {
  // Explicitly tell the parser when the input ends.
  wait: false,
  // Track identifier scopes by adding an isLocal attribute to each
  // identifier-node.
  scope: false,
  // Store location information on each syntax node as
  // `loc: { start: { line, column }, end: { line, column } }`.
  locations: false,
  // Store the start and end character locations on each syntax node as
  // `range: [start, end]`.
  ranges: false,
  // A callback which will be invoked when a syntax node has been completed.
  // The node which has been created will be passed as the only parameter.
  onCreateNode: null,
  // A callback which will be invoked when a new scope is created.
  onCreateScope: null,
  // A callback which will be invoked when the current scope is destroyed.
  onDestroyScope: null
};

// The available tokens

var EOF = 'EOF', StringLiteral = 'StringLiteral', Keyword = 'Keyword', Identifier = 'Identifier',
  NumericLiteral = 'NumericLiteral', Punctuator = 'Punctuator', BooleanLiteral = 'BooleanLiteral',
  NilLiteral = 'NilLiteral', VarargLiteral = 'VarargLiteral';

// As this parser is a bit different from luas own, the error messages
// will be different in some situations.

var errors = {
  unexpected: 'unexpected %1 \'%2\' near \'%3\'',
  expected: '\'%1\' expected near \'%2\'',
  expectedToken: '%1 expected near \'%2\'',
  unfinishedString: 'unfinished string near \'%1\'',
  malformedNumber: 'malformed number near \'%1\'',
  invalidVar: 'invalid left-hand side of assignment near \'%1\'',

  notAllowedBeforeSuper: '%1 is not allowed before super()',
  superOnlyAllowedDerived: 'super() is only allowed in a derived constructor',
  superOutsideClass: `'super' outside of class`,
  missingSuperCall: 'missing super() call in constructor',
};

// ### Abstract Syntax Tree
//
// The default AST structure is inspired by the Mozilla Parser API but can
// easily be customized by overriding these functions.

var ast = {
  labelStatement: function(label) {
    return {
      type: 'LabelStatement'
      , label: label
    };
  }

  , breakStatement: function() {
    return {
      type: 'BreakStatement'
    };
  }

  , continueStatement: function() {
    return {
      type: 'ContinueStatement'
    };
  }

  , gotoStatement: function(label) {
    return {
      type: 'GotoStatement'
      , label: label
    };
  }

  , returnStatement: function(args) {
    return {
      type: 'ReturnStatement'
      , 'arguments': args
    };
  }

  , ifStatement: function(clauses) {
    return {
      type: 'IfStatement'
      , clauses: clauses
    };
  }
  , ifClause: function(condition, body) {
    return {
      type: 'IfClause'
      , condition: condition
      , body: body
    };
  }
  , elseifClause: function(condition, body) {
    return {
      type: 'ElseifClause'
      , condition: condition
      , body: body
    };
  }
  , elseClause: function(body) {
    return {
      type: 'ElseClause'
      , body: body
    };
  }

  , whileStatement: function(condition, body) {
    return {
      type: 'WhileStatement'
      , condition: condition
      , body: body
    };
  }

  , doStatement: function(body) {
    return {
      type: 'DoStatement'
      , body: body
    };
  }

  , repeatStatement: function(condition, body) {
    return {
      type: 'RepeatStatement'
      , condition: condition
      , body: body
    };
  }

  , localStatement: function(variables, init) {
    return {
      type: 'LocalStatement'
      , variables: variables
      , init: init
    };
  }

  , localDestructorStatement: function(variables, init) {
    return {
      type: 'LocalDestructorStatement'
      , variables: variables
      , init: init
    };
  }

  , tableDestructorStatement: function(variables, init) {
    return {
      type: 'TableDestructorStatement'
      , variables: variables
      , init: init
    };
  }

  , assignmentStatement: function(variables, init) {
    return {
      type: 'AssignmentStatement'
      , variables: variables
      , init: init
    };
  }

  , callStatement: function(expression) {
    return {
      type: 'CallStatement'
      , expression: expression
    };
  }

  , functionStatement: function(identifier, parameters, isLocal, body) {
    return {
      type: 'FunctionDeclaration'
      , identifier: identifier
      , isLocal: isLocal
      , parameters: parameters
      , body: body
    };
  }

  , fatArrowStatement: function(parameters, body) {
    return {
      type: 'FatArrowDeclaration'
      , parameters: parameters
      , body: body
    };
  }

  , thinArrowStatement: function(parameters, body) {
    return {
      type: 'ThinArrowDeclaration'
      , parameters: parameters
      , body: body
    };
  }

  , classStatement: function(identifier, parent, constructor, members, methods, isPublic) {
    return {
      type: 'ClassStatement'
      , identifier: identifier
      , parent: parent
      , constructor: constructor
      , members: members
      , methods: methods
      , isPublic: isPublic
    };
  }

  , classMemberStatement: function(identifier, expression, isStatic) {
    return {
      type: 'ClassMemberStatement'
      , identifier: identifier
      , expression: expression
      , isStatic: isStatic
    };
  }

  , classMethodStatement: function(identifier, parameters, body, isStatic) {
    return {
      type: 'ClassMethodStatement'
      , identifier: identifier
      , parameters: parameters
      , body: body
      , isStatic: isStatic
    };
  }

  , classConstructorStatement: function(parameters, body) {
    return {
      type: 'ClassConstructorStatement'
      , parameters: parameters
      , body: body
    }
  }


  , forNumericStatement: function(variable, start, end, step, body) {
    return {
      type: 'ForNumericStatement'
      , variable: variable
      , start: start
      , end: end
      , step: step
      , body: body
    };
  }

  , forGenericStatement: function(variables, iterators, body) {
    return {
      type: 'ForGenericStatement'
      , variables: variables
      , iterators: iterators
      , body: body
    };
  }

  , forOfStatement: function(variables, expression, body) {
    return {
      type: 'ForOfStatement'
      , variables: variables
      , expression: expression
      , body: body
    };
  }

  , mutationStatement: function(expression, sign, value) {
    return {
      type: 'MutationStatement'
      , expression: expression
      , sign: sign
      , value: value
    };
  }

  , chunk: function(body) {
    return {
      type: 'Chunk'
      , body: body
    };
  }

  , identifier: function(name, isLocal) {
    return {
      type: 'Identifier'
      , name: name
      , isLocal: isLocal
    };
  }

  , literal: function(type, value, raw) {
    type = (type === StringLiteral) ? 'StringLiteral'
      : (type === NumericLiteral) ? 'NumericLiteral'
        : (type === BooleanLiteral) ? 'BooleanLiteral'
          : (type === NilLiteral) ? 'NilLiteral'
            : 'VarargLiteral';

    return {
      type: type
      , value: value
      , raw: raw
    };
  }

  , templateStringLiteral: function(expressions) {
    return {
      type: 'TemplateStringLiteral'
      , expressions: expressions
    };
  }

  , tableKey: function(key, value) {
    return {
      type: 'TableKey'
      , key: key
      , value: value
    };
  }
  , tableKeyString: function(key, value) {
    return {
      type: 'TableKeyString'
      , key: key
      , value: value
    };
  }
  , tableValue: function(value) {
    return {
      type: 'TableValue'
      , value: value
    };
  }


  , tableConstructorExpression: function(fields) {
    return {
      type: 'TableConstructorExpression'
      , fields: fields
    };
  }
  , binaryExpression: function(operator, left, right) {
    var type = ('and' === operator || 'or' === operator) ?
      'LogicalExpression' :
      'BinaryExpression';

    return {
      type: type
      , operator: operator
      , left: left
      , right: right
    };
  }
  , unaryExpression: function(operator, argument) {
    return {
      type: 'UnaryExpression'
      , operator: operator
      , argument: argument
    };
  }

  , memberExpression: function(base, indexer, identifier) {
    return {
      type: 'MemberExpression'
      , indexer: indexer
      , identifier: identifier
      , base: base
    };
  }

  , safeMemberExpression: function(base, indexer, identifier) {
    return {
      type: 'SafeMemberExpression'
      , indexer: indexer
      , identifier: identifier
      , base: base
    };
  }

  , indexExpression: function(base, index) {
    return {
      type: 'IndexExpression'
      , base: base
      , index: index
    };
  }

  , callExpression: function(base, args) {
    return {
      type: 'CallExpression'
      , base: base
      , 'arguments': args
    };
  }

  , tableCallExpression: function(base, args) {
    return {
      type: 'TableCallExpression'
      , base: base
      , 'arguments': args
    };
  }

  , stringCallExpression: function(base, argument) {
    return {
      type: 'StringCallExpression'
      , base: base
      , argument: argument
    };
  }

  , superExpression: function() {
    return {
      type: 'SuperExpression'
    }
  }

  , superCallExpression: function(base, args) {
    return {
      type: 'SuperCallExpression'
      , base: base
      , 'arguments': args
    }
  }

  , superTableCallExpression: function(base, args) {
    return {
      type: 'SuperTableCallExpression'
      , base: base
      , 'arguments': args
    };
  }

  , superStringCallExpression: function(base, argument) {
    return {
      type: 'SuperStringCallExpression'
      , base: base
      , argument: argument
    };
  }

  , spreadExpression: function(expression) {
    return {
      type: 'SpreadExpression'
      , expression: expression
    };
  }

  , tableSpreadExpression: function(expression) {
    return {
      type: 'TableSpreadExpression'
      , expression: expression
    };
  }

  , comment: function(value, raw) {
    return {
      type: 'Comment'
      , value: value
      , raw: raw
    };
  }
};

// Wrap up the node object.

function finishNode(node) {
  // Pop a `Marker` off the location-array and attach its location data.
  if (trackLocations) {
    var location = locations.pop();
    location.complete();
    if (options.locations) node.loc = location.loc;
    if (options.ranges) node.range = location.range;
  }
  if (options.onCreateNode) options.onCreateNode(node);
  return node;
}


// Helpers
// -------

var slice = Array.prototype.slice
  , indexOf = function indexOf(array, element) {
  for (var i = 0, length = array.length; i < length; i++) {
    if (array[i] === element) return i;
  }
  return -1;
};

// Iterate through an array of objects and return the index of an object
// with a matching property.

function indexOfObject(array, property, element) {
  for (var i = 0, length = array.length; i < length; i++) {
    if (array[i][property] === element) return i;
  }
  return -1;
}

// A sprintf implementation using %index (beginning at 1) to input
// arguments in the format string.
//
// Example:
//
//     // Unexpected function in token
//     sprintf('Unexpected %2 in %1.', 'token', 'function');

function sprintf(format) {
  var args = slice.call(arguments, 1);
  format = format.replace(/%(\d)/g, function (match, index) {
    return '' + args[index - 1] || '';
  });
  return format;
}

// ### Error functions

// #### Raise an exception.
//
// Raise an exception by passing a token, a string format and its paramters.
//
// The passed tokens location will automatically be added to the error
// message if it exists, if not it will default to the lexers current
// position.
//
// Example:
//
//     // [1:0] expected [ near (
//     raise(token, "expected %1 near %2", '[', token.value);

function raise(token) {
  var message = sprintf.apply(null, slice.call(arguments, 1)),
    error, col;

  var errToken = token;
  var errIndex = errToken.range[0];
  if (token.type == 'EOF') {
    errToken = previousToken;
    errIndex = errToken.range[1];
  }

  col = errIndex - errToken.lineStart;
  error = new SyntaxError(sprintf('[%1:%2] %3', errToken.line, col, message));
  error.line = errToken.line;
  error.index = errIndex
  error.column = col;
  throw error;
}

// #### Raise an unexpected token error.
//
// Example:
//
//     // expected <name> near '0'
//     raiseUnexpectedToken('<name>', token);

function raiseUnexpectedToken(type, token) {
  raise(token, errors.expectedToken, type, token.value);
}

// #### Raise a general unexpected error
//
// Usage should pass either a token object or a symbol string which was
// expected. We can also specify a nearby token such as <eof>, this will
// default to the currently active token.
//
// Example:
//
//     // Unexpected symbol 'end' near '<eof>'
//     unexpected(token);
//
// If there's no token in the buffer it means we have reached <eof>.

function unexpected(found, near) {
  if ('undefined' === typeof near) near = lookahead.value;
  if ('undefined' !== typeof found.type) {
    var type;
    switch (found.type) {
      case StringLiteral:   type = 'string';      break;
      case Keyword:         type = 'keyword';     break;
      case Identifier:      type = 'identifier';  break;
      case NumericLiteral:  type = 'number';      break;
      case Punctuator:      type = 'symbol';      break;
      case BooleanLiteral:  type = 'boolean';     break;
      case NilLiteral:
        return raise(found, errors.unexpected, 'symbol', 'nil', near);
    }
    return raise(found, errors.unexpected, type, found.value, near);
  }
  return raise(found, errors.unexpected, 'symbol', found, near);
}


var tokens,
  tokenIndex,
  token,
  previousToken,
  lookahead;

// Read the next token.
//
// This is actually done by setting the current token to the lookahead and
// reading in the new lookahead token.

function next() {
  previousToken = token;
  token = lookahead;
  lookahead = nextToken();
}

function nextToken() {
  var t = tokens[Math.min(tokenIndex, tokens.length)] || tokenizer.EOF;
  tokenIndex++;

  return t;
}

// Consume a token if its value matches. Once consumed or not, return the
// success of the operation.

function consume(value) {
  if (value === token.value) {
    next();
    return true;
  }
  return false;
}

// Expect the next token value to match. If not, throw an exception.

function expect(value) {
  if (value === token.value) next();
  else raise(token, errors.expected, value, token.value);
}

// ### Validation functions

function isUnary(token) {
  if (Punctuator === token.type) return '#-~!'.indexOf(token.value) >= 0;
  if (Keyword === token.type) return 'not' === token.value;
  return false;
}

// @TODO this needs to be rethought.
function isCallExpression(expression) {
  switch (expression.type) {
    case 'CallExpression':
    case 'TableCallExpression':
    case 'StringCallExpression':
    case 'SuperCallExpression':
    case 'SuperStringCallExpression':
    case 'SuperTableCallExpression':
      return true;
  }
  return false;
}

// Check if the token syntactically closes a block.

function isBlockFollow(token) {
  if (EOF === token.type) return true;
  if (Keyword !== token.type) return false;
  switch (token.value) {
    case 'else': case 'elseif':
    case 'end': case 'until':
      return true;
    default:
      return false;
  }
}

// Scope
// -----

// Store each block scope as a an array of identifier names. Each scope is
// stored in an FILO-array.
var scopes
  // The current scope index
  , scopeDepth
  // A list of all global identifier nodes.
  , globals;

// Create a new scope inheriting all declarations from the previous scope.
function createScope() {
  var scope = Array.apply(null, scopes[scopeDepth++]);
  scopes.push(scope);
  if (options.onCreateScope) options.onCreateScope();
}

// Exit and remove the current scope.
function destroyScope() {
  var scope = scopes.pop();
  scopeDepth--;
  if (options.onDestroyScope) options.onDestroyScope();
}

// Add identifier name to the current scope if it doesnt already exist.
function scopeIdentifierName(name) {
  if (-1 !== indexOf(scopes[scopeDepth], name)) return;
  scopes[scopeDepth].push(name);
}

// Add identifier to the current scope
function scopeIdentifier(node) {
  scopeIdentifierName(node.name);
  attachScope(node, true);
}

// Attach scope information to node. If the node is global, store it in the
// globals array so we can return the information to the user.
function attachScope(node, isLocal) {
  if (!isLocal && -1 === indexOfObject(globals, 'name', node.name))
    globals.push(node);

  node.isLocal = isLocal;
}

// Is the identifier name available in this scope.
function scopeHasName(name) {
  return (-1 !== indexOf(scopes[scopeDepth], name));
}

// Location tracking
// -----------------
//
// Locations are stored in FILO-array as a `Marker` object consisting of both
// `loc` and `range` data. Once a `Marker` is popped off the list an end
// location is added and the data is attached to a syntax node.

var locations = []
  , trackLocations;

function createLocationMarker() {
  return new Marker(token);
}

function Marker(token) {
  if (options.locations) {
    this.loc = {
      start: {
        line: token.line
        , column: token.range[0] - token.lineStart
      }
      , end: {
        line: 0
        , column: 0
      }
    };
  }
  if (options.ranges) this.range = [token.range[0], 0];
}

// Complete the location data stored in the `Marker` by adding the location
// of the *previous token* as an end location.
Marker.prototype.complete = function() {
  if (options.locations) {
    this.loc.end.line = previousToken.line;
    this.loc.end.column = previousToken.range[1] - previousToken.lineStart;
  }
  if (options.ranges) {
    this.range[1] = previousToken.range[1];
  }
};

// Create a new `Marker` and add it to the FILO-array.
function markLocation() {
  if (trackLocations) locations.push(createLocationMarker());
}

// Push an arbitrary `Marker` object onto the FILO-array.
function pushLocation(marker) {
  if (trackLocations) locations.push(marker);
}

// Parse functions
// ---------------

// Chunk is the main program object. Syntactically it's the same as a block.
//
//     chunk ::= block

function parseChunk() {
  next();
  markLocation();
  if (options.scope) createScope();
  var body = parseBlock();
  if (options.scope) destroyScope();
  if (EOF !== token.type) unexpected(token);
  // If the body is empty no previousToken exists when finishNode runs.
  if (trackLocations && !body.length) previousToken = token;
  return finishNode(ast.chunk(body));
}

// A block contains a list of statements with an optional return statement
// as its last statement.
//
//     block ::= {stat} [retstat]

function parseBlock(terminator) {
  var block = []
    , statement;

  while (!isBlockFollow(token)) {
    // Return has to be the last statement in a block.
    if ('return' === token.value) {
      block.push(parseStatement());
      break;
    }
    statement = parseStatement();
    // Statements are only added if they are returned, this allows us to
    // ignore some statements, such as EmptyStatement.
    if (statement) block.push(statement);
  }

  // Doesn't really need an ast node
  return block;
}

// There are two types of statements, simple and compound.
//
//     statement ::= break | goto | do | while | repeat | return
//          | if | for | function | local | label | assignment
//          | functioncall | ';'

function parseStatement() {
  markLocation();
  if (Keyword === token.type) {
    switch (token.value) {
      case 'local':    next(); return parseLocalStatement();
      case 'if':       next(); return parseIfStatement();
      case 'return':   next(); return parseReturnStatement();
      case 'function': next();
        var name = parseFunctionName();
        return parseFunctionDeclaration(name);
      case 'while':    next(); return parseWhileStatement();
      case 'for':      next(); return parseForStatement();
      case 'repeat':   next(); return parseRepeatStatement();
      case 'break':    next(); return parseBreakStatement();
      case 'continue': next(); return parseContinueStatement();
      case 'do':       next(); return parseDoStatement();
      case 'goto':     next(); return parseGotoStatement();
      case 'public':   next(); return parseClassStatement(true);
      case 'class':    next(); return parseClassStatement(false);
    }
  }

  if (Punctuator === token.type) {
    if (consume('::')) return parseLabelStatement();
  }

  // Assignments memorizes the location and pushes it manually for wrapper
  // nodes. Additionally empty `;` statements should not mark a location.
  if (trackLocations) locations.pop();

  // When a `;` is encounted, simply eat it without storing it.
  if (consume(';')) return;

  return parseAssignmentOrCallStatement();
}

// ## Statements

//     label ::= '::' Name '::'

function parseLabelStatement() {
  var name = token.value
    , label = parseIdentifier();

  if (options.scope) {
    scopeIdentifierName('::' + name + '::');
    attachScope(label, true);
  }

  expect('::');
  return finishNode(ast.labelStatement(label));
}

//     break ::= 'break'

function parseBreakStatement() {
  return finishNode(ast.breakStatement());
}

//     continue ::= 'continue'

function parseContinueStatement() {
  return finishNode(ast.continueStatement());
}

//     goto ::= 'goto' Name

function parseGotoStatement() {
  var name = token.value
    , label = parseIdentifier();

  return finishNode(ast.gotoStatement(label));
}

//     do ::= 'do' block 'end'

function parseDoStatement() {
  if (options.scope) createScope();
  var body = parseBlock();
  if (options.scope) destroyScope();
  expect('end');
  return finishNode(ast.doStatement(body));
}

//     while ::= 'while' exp 'do' block 'end'

function parseWhileStatement() {
  var condition = parseExpectedExpression();
  expect('do');
  if (options.scope) createScope();
  var body = parseBlock();
  if (options.scope) destroyScope();
  expect('end');
  return finishNode(ast.whileStatement(condition, body));
}

//     repeat ::= 'repeat' block 'until' exp

function parseRepeatStatement() {
  if (options.scope) createScope();
  var body = parseBlock();
  expect('until');
  var condition = parseExpectedExpression();
  if (options.scope) destroyScope();
  return finishNode(ast.repeatStatement(condition, body));
}

//     retstat ::= 'return' [exp {',' exp}] [';']

function parseReturnStatement() {
  var expressions = [];

  if ('end' !== token.value) {
    var expression = parseExpression();
    if (null != expression) expressions.push(expression);
    while (consume(',')) {
      expression = parseExpectedExpression();
      expressions.push(expression);
    }
    consume(';'); // grammar tells us ; is optional here.
  }
  return finishNode(ast.returnStatement(expressions));
}

//     if ::= 'if' exp 'then' block {elif} ['else' block] 'end'
//     elif ::= 'elseif' exp 'then' block

function parseIfStatement() {
  var clauses = []
    , condition
    , body
    , marker;

  // IfClauses begin at the same location as the parent IfStatement.
  // It ends at the start of `end`, `else`, or `elseif`.
  if (trackLocations) {
    marker = locations[locations.length - 1];
    locations.push(marker);
  }
  condition = parseExpectedExpression();
  expect('then');
  if (options.scope) createScope();
  body = parseBlock();
  if (options.scope) destroyScope();
  clauses.push(finishNode(ast.ifClause(condition, body)));

  if (trackLocations) marker = createLocationMarker();
  while (consume('elseif')) {
    pushLocation(marker);
    condition = parseExpectedExpression();
    expect('then');
    if (options.scope) createScope();
    body = parseBlock();
    if (options.scope) destroyScope();
    clauses.push(finishNode(ast.elseifClause(condition, body)));
    if (trackLocations) marker = createLocationMarker();
  }

  if (consume('else')) {
    // Include the `else` in the location of ElseClause.
    if (trackLocations) {
      marker = new Marker(previousToken);
      locations.push(marker);
    }
    if (options.scope) createScope();
    body = parseBlock();
    if (options.scope) destroyScope();
    clauses.push(finishNode(ast.elseClause(body)));
  }

  expect('end');
  return finishNode(ast.ifStatement(clauses));
}

// There are two types of for statements, generic and numeric.
//
//     for ::= Name '=' exp ',' exp [',' exp] 'do' block 'end'
//     for ::= namelist 'in' explist 'do' block 'end'
//     namelist ::= Name {',' Name}
//     explist ::= exp {',' exp}

function parseForStatement() {
  var variable = parseIdentifier()
    , body;

  // The start-identifier is local.

  if (options.scope) {
    createScope();
    scopeIdentifier(variable);
  }

  // If the first expression is followed by a `=` punctuator, this is a
  // Numeric For Statement.
  if (consume('=')) {
    // Start expression
    var start = parseExpectedExpression();
    expect(',');
    // End expression
    var end = parseExpectedExpression();
    // Optional step expression
    var step = consume(',') ? parseExpectedExpression() : null;

    expect('do');
    body = parseBlock();
    expect('end');
    if (options.scope) destroyScope();

    return finishNode(ast.forNumericStatement(variable, start, end, step, body));
  }
  // If not, it's a Generic For Statement
  else {
    // The namelist can contain one or more identifiers.
    var variables = [variable];
    while (consume(',')) {
      variable = parseIdentifier();
      // Each variable in the namelist is locally scoped.
      if (options.scope) scopeIdentifier(variable);
      variables.push(variable);
    }

    if (consume('in')) {
      var iterators = [];

      // One or more expressions in the explist.
      do {
        var expression = parseExpectedExpression();
        iterators.push(expression);
      } while (consume(','));

      expect('do');
      body = parseBlock();
      expect('end');
      if (options.scope) destroyScope();

      return finishNode(ast.forGenericStatement(variables, iterators, body));
    }
    else if (consume('of')) {
      var expression = parseExpectedExpression();

      expect('do');
      body = parseBlock();
      expect('end');
      if (options.scope) destroyScope();

      return finishNode(ast.forOfStatement(variables, expression, body));
    }
    else {
      raiseUnexpectedToken('\'in\' or \'of\'', token);
    }

  }
}

function parseClassStatement(isPublic) {
  if (isPublic) {
    expect('class');
  }

  var marker;
  var identifier = parseIdentifier();
  var parent;

  if (options.scope) scopeIdentifier(identifier);

  if (trackLocations) marker = createLocationMarker();

  if (consume('extends')) {
    parent = parseIdentifier();
    currentClassParent = parent;

    if (options.scope) scopeIdentifier(parent);
  }

  var block = []
    , statement
    , methods = []
    , members = []
    , constructor;


  while (!isBlockFollow(token)) {
    if (options.scope) createScope();
    statement = parseClassBodyStatement();

    // Statements are only added if they are returned, this allows us to
    // ignore some statements, such as EmptyStatement.
    if (statement) {
      if (statement.type == 'ClassMemberStatement') {
        members.push(statement);
      }
      else if (statement.type == 'ClassMethodStatement') {
        methods.push(statement);
      }
      else if (statement.type == 'ClassConstructorStatement') {
        constructor = statement;
      }

      block.push(statement);
    }
  }

  expect('end');

  currentClassParent = null;
  return finishNode(ast.classStatement(identifier, parent, constructor, members, methods, isPublic))
}

function parseClassBodyStatement(isConstructor) {
  if (trackLocations) marker = createLocationMarker();
  pushLocation(marker);

  var isStatic = consume('static');

  if (token.value == 'constructor') classConstructorToken = token;
  var expression = parseIdentifier();

  var statement;

  if (token.value == '=') {
    var marker;

    var identifier = expression
      , exp;

    validateVar(expression);
    expect('=');
    exp = parseExpectedExpression();

    statement = ast.classMemberStatement(identifier, exp, isStatic);
  }
  else {
    if (expression.name == 'constructor') isInClassConstructor = true;
    isInClassMethod = true;

    statement = parseClassMethodStatement(expression, isStatic);

    isInClassMethod = false;
    isInClassConstructor = false;
  }

  classConstructorToken = null;

  return finishNode(statement);
}

function parseClassMethodStatement(expression, isStatic) {
  var marker;
  var parameters = [];

  if (trackLocations) marker = createLocationMarker();
  pushLocation(marker);

  expect('(');

  // The declaration has arguments
  if (!consume(')')) {
    // Arguments are a comma separated list of identifiers, optionally ending
    // with a vararg.
    while (true) {
      if (Identifier === token.type) {
        var parameter = parseIdentifier();
        // Function parameters are local.
        if (options.scope) scopeIdentifier(parameter);

        if (consume('=')) {
          var exp = parseExpectedExpression();

          parameter.defaultValue = exp;
        }

        parameters.push(parameter);

        if (consume(',')) continue;
        else if (consume(')')) break;
      }
      // No arguments are allowed after a vararg.
      else if (VarargLiteral === token.type) {
        parameters.push(parsePrimaryExpression());
        expect(')');
        break;
      } else {
        raiseUnexpectedToken('<name> or \'...\'', token);
      }
    }
  }

  if (isInClassConstructor) {
    classSuperCalled = false;
  }

  var body = parseBlock();
  expect('end');
  if (options.scope) destroyScope();

  if (isInClassConstructor) {
    if (!classSuperCalled && currentClassParent) {
      raise(classConstructorToken, errors.missingSuperCall, '', classConstructorToken.value);
    }

    return finishNode(ast.classConstructorStatement(parameters, body));
  }

  classSuperCalled = false;

  return finishNode(ast.classMethodStatement(expression, parameters, body, isStatic));
}

// Local statements can either be variable assignments or function
// definitions. If a function definition is found, it will be delegated to
// `parseFunctionDeclaration()` with the isLocal flag.
//
// This AST structure might change into a local assignment with a function
// child.
//
//     local ::= 'local' 'function' Name funcdecl
//        | 'local' Name {',' Name} ['=' exp {',' exp}]

function parseLocalStatement() {
  var name;

  if (Identifier === token.type || token.value == '{') {
    var variables = [];

    // Check for table destructor
    if (consume('{')) {
      do {
        name = parseIdentifier();

        variables.push(name);
      } while (consume(','));

      expect('}');
      expect('=');

      var expression = parseExpectedExpression();

      // Declarations doesn't exist before the statement has been evaluated.
      // Therefore assignments can't use their declarator. And the identifiers
      // shouldn't be added to the scope until the statement is complete.
      if (options.scope) {
        for (var i = 0, l = variables.length; i < l; i++) {
          scopeIdentifier(variables[i]);
        }
      }

      return finishNode(ast.localDestructorStatement(variables, expression));
    }
    else {
      var init = [];
      do {
        name = parseIdentifier();

        variables.push(name);
      } while (consume(','));

      if (consume('=')) {
        do {
          var expression = parseExpectedExpression();
          init.push(expression);
        } while (consume(','));
      }

      // Declarations doesn't exist before the statement has been evaluated.
      // Therefore assignments can't use their declarator. And the identifiers
      // shouldn't be added to the scope until the statement is complete.
      if (options.scope) {
        for (var i = 0, l = variables.length; i < l; i++) {
          scopeIdentifier(variables[i]);
        }
      }

      return finishNode(ast.localStatement(variables, init));
    }
  }
  if (consume('function')) {
    name = parseIdentifier();

    if (options.scope) {
      scopeIdentifier(name);
      createScope();
    }

    // MemberExpressions are not allowed in local function statements.
    return parseFunctionDeclaration(name, true);
  } else {
    raiseUnexpectedToken('<name>', token);
  }
}

function validateVar(node) {
  // @TODO we need something not dependent on the exact AST used. see also isCallExpression()
  if (node.inParens || (['Identifier', 'MemberExpression', 'IndexExpression'].indexOf(node.type) === -1)) {
    raise(token, errors.invalidVar, token.value);
  }
}

//     assignment ::= varlist '=' explist
//     var ::= Name | prefixexp '[' exp ']' | prefixexp '.' Name
//     varlist ::= var {',' var}
//     explist ::= exp {',' exp}
//
//     call ::= callexp
//     callexp ::= prefixexp args | prefixexp ':' Name args

function parseAssignmentOrCallStatement() {
  // Keep a reference to the previous token for better error messages in case
  // of invalid statement
  var previous = token
    , expression, marker;

  if (trackLocations) marker = createLocationMarker();
  expression = parsePrefixExpression();

  if (null == expression) return unexpected(token);
  if ('++' == token.value) {
    validateVar(expression);

    next();
    pushLocation(marker);
    return finishNode(ast.mutationStatement(expression, '+', ast.literal(NumericLiteral, 1, '1')));
  }
  if (',='.indexOf(token.value) >= 0) {
    var variables = [expression]
      , init = []
      , exp;

    validateVar(expression);
    while (consume(',')) {
      exp = parsePrefixExpression();
      if (null == exp) raiseUnexpectedToken('<expression>', token);
      validateVar(exp);
      variables.push(exp);
    }
    expect('=');
    do {
      exp = parseExpectedExpression();
      init.push(exp);
    } while (consume(','));

    pushLocation(marker);
    return finishNode(ast.assignmentStatement(variables, init));
  }
  else {
    if ('+=-=*=/=%=..='.indexOf(token.value) >= 0) {
      var sign = token.value.substring(0, token.value.length - 1);
      validateVar(expression);

      next();
      var exp = parseExpectedExpression();

      pushLocation(marker);
      return finishNode(ast.mutationStatement(expression, sign, exp));
    }
  }
  if (isCallExpression(expression)) {
    pushLocation(marker);
    return finishNode(ast.callStatement(expression));
  }
  if ('TableDestructorStatement' == expression.type) {
    return expression;
  }
  // The prefix expression was neither part of an assignment or a
  // callstatement, however as it was valid it's been consumed, so raise
  // the exception on the previous token to provide a helpful message.
  return unexpected(previous);
}



// ### Non-statements

//     Identifier ::= Name

function parseIdentifier() {
  markLocation();
  var identifier = token.value;
  if (Identifier !== token.type) raiseUnexpectedToken('<name>', token);
  if (identifier == 'self') {
    if (currentClassParent && isInClassConstructor && !classSuperCalled) {
      raise(token, errors.notAllowedBeforeSuper, `'${token.value}'`, token.value);
    }
  }

  next();

  return finishNode(ast.identifier(identifier));
}

function parseSuperExpression() {
  markLocation();
  next();
  classSuperCalled = true;
  return finishNode(ast.superExpression());
}

// Parse the functions parameters and body block. The name should already
// have been parsed and passed to this declaration function. By separating
// this we allow for anonymous functions in expressions.
//
// For local functions there's a boolean parameter which needs to be set
// when parsing the declaration.
//
//     funcdecl ::= '(' [parlist] ')' block 'end'
//     parlist ::= Name {',' Name} | [',' '...'] | '...'

function parseFunctionDeclaration(name, isLocal) {
  var parameters = [];
  expect('(');

  // The declaration has arguments
  if (!consume(')')) {
    // Arguments are a comma separated list of identifiers, optionally ending
    // with a vararg.
    while (true) {
      if (Identifier === token.type) {
        var parameter = parseIdentifier();
        // Function parameters are local.
        if (options.scope) scopeIdentifier(parameter);

        if (consume('=')) {
          var exp = parseExpectedExpression();

          parameter.defaultValue = exp;
        }

        parameters.push(parameter);

        if (consume(',')) continue;
        else if (consume(')')) break;
      }
      // No arguments are allowed after a vararg.
      else if (VarargLiteral === token.type) {
        var temp = lookahead;
        var param = parsePrimaryExpression();
        if (param.type == 'SpreadExpression') {
          unexpected(temp);
        }
        parameters.push(param);
        expect(')');
        break;
      } else {
        raiseUnexpectedToken('<name> or \'...\'', token);
      }
    }
  }

  var body = parseBlock();
  expect('end');
  if (options.scope) destroyScope();

  isLocal = isLocal || false;
  return finishNode(ast.functionStatement(name, parameters, isLocal, body));
}

// Parse the function name as identifiers and member expressions.
//
//     Name {'.' Name} [':' Name]

function parseFunctionName() {
  var base, name, marker;

  if (trackLocations) marker = createLocationMarker();
  base = parseIdentifier();

  if (options.scope) {
    attachScope(base, scopeHasName(base.name));
    createScope();
  }

  while (consume('.')) {
    pushLocation(marker);
    name = parseIdentifier();
    base = finishNode(ast.memberExpression(base, '.', name));
  }

  if (consume(':')) {
    pushLocation(marker);
    name = parseIdentifier();
    base = finishNode(ast.memberExpression(base, ':', name));
    if (options.scope) scopeIdentifierName('self');
  }

  return base;
}

//     tableconstructor ::= '{' [fieldlist] '}'
//     fieldlist ::= field {fieldsep field} fieldsep
//     field ::= '[' exp ']' '=' exp | Name = 'exp' | exp
//
//     fieldsep ::= ',' | ';'

function parseTableConstructor() {
  var fields = []
    , key, value;

  while (true) {
    markLocation();
    if (Punctuator === token.type && consume('[')) {
      key = parseExpectedExpression();
      expect(']');
      expect('=');
      value = parseExpectedExpression();
      fields.push(finishNode(ast.tableKey(key, value)));
    } else if (Identifier === token.type) {
      if ('=' === lookahead.value) {
        key = parseIdentifier();
        next();
        value = parseExpectedExpression();
        fields.push(finishNode(ast.tableKeyString(key, value)));
      } else {
        value = parseExpectedExpression();
        fields.push(finishNode(ast.tableValue(value)));
      }
    } else {
      if (null == (value = parseExpression())) {
        locations.pop();
        break;
      }
      if (value.type == 'SpreadExpression') {
        fields.push(finishNode(ast.tableSpreadExpression(value.expression)));
      }
      else {
        fields.push(finishNode(ast.tableValue(value)));
      }
    }
    if (',;'.indexOf(token.value) >= 0) {
      next();
      continue;
    }
    break;
  }
  expect('}');
  return finishNode(ast.tableConstructorExpression(fields));
}

// Expression parser
// -----------------
//
// Expressions are evaluated and always return a value. If nothing is
// matched null will be returned.
//
//     exp ::= (unop exp | primary | prefixexp ) { binop exp }
//
//     primary ::= nil | false | true | Number | String | '...'
//          | functiondef | tableconstructor
//
//     prefixexp ::= (Name | '(' exp ')' ) { '[' exp ']'
//          | '.' Name | ':' Name args | args }
//

function parseExpression() {
  var expression = parseSubExpression(0);
  return expression;
}

// Parse an expression expecting it to be valid.

function parseExpectedExpression() {
  var expression = parseExpression();
  if (null == expression) raiseUnexpectedToken('<expression>', token);
  else return expression;
}


// Return the precedence priority of the operator.
//
// As unary `-` can't be distinguished from binary `-`, unary precedence
// isn't described in this table but in `parseSubExpression()` itself.
//
// As this function gets hit on every expression it's been optimized due to
// the expensive CompareICStub which took ~8% of the parse time.

function binaryPrecedence(operator) {
  var charCode = operator.charCodeAt(0)
    , length = operator.length;

  if (1 === length) {
    switch (charCode) {
      case 94: return 12; // ^
      case 42: case 47: case 37: return 10; // * / %
      case 43: case 45: return 9; // + -
      case 38: return 6; // &
      case 126: return 5; // ~
      case 124: return 4; // |
      case 60: case 62: return 3; // < >
    }
  } else if (2 === length) {
    switch (charCode) {
      case 47: return 10; // //
      case 46: return 8; // ..
      case 60: case 62:
        if('<<' === operator || '>>' === operator) return 7; // << >>
        return 3; // <= >=
      case 61: case 126: case 33: return 3; // == ~=
      case 111: return 1; // or
      case 124: return 1; // ||
      case 38: return 1; // &&
    }
  } else if (97 === charCode && 'and' === operator) return 2;
  return 0;
}

// Implement an operator-precedence parser to handle binary operator
// precedence.
//
// We use this algorithm because it's compact, it's fast and Lua core uses
// the same so we can be sure our expressions are parsed in the same manner
// without excessive amounts of tests.
//
//     exp ::= (unop exp | primary | prefixexp ) { binop exp }

function parseSubExpression(minPrecedence) {
  var operator = token.value
    // The left-hand side in binary operations.
    , expression, marker;

  if (trackLocations) marker = createLocationMarker();

  // UnaryExpression
  if (isUnary(token)) {
    markLocation();
    next();
    var argument = parseSubExpression(10);
    if (argument == null) raiseUnexpectedToken('<expression>', token);
    expression = finishNode(ast.unaryExpression(operator, argument));
  }

  if (null == expression) {
    // PrimaryExpression
    expression = parsePrimaryExpression();

    // PrefixExpression
    if (null == expression) {
      expression = parsePrefixExpression();
    }
  }
  // This is not a valid left hand expression.
  if (null == expression) return null;

  var precedence;
  while (true) {
    operator = token.value;

    precedence = (Punctuator === token.type || Keyword === token.type) ?
      binaryPrecedence(operator) : 0;

    if (precedence === 0 || precedence <= minPrecedence) break;
    // Right-hand precedence operators
    if ('^' === operator || '..' === operator) precedence--;
    next();

    var right = parseSubExpression(precedence);
    if (null == right) raiseUnexpectedToken('<expression>', token);
    // Push in the marker created before the loop to wrap its entirety.
    if (trackLocations) locations.push(marker);
    expression = finishNode(ast.binaryExpression(operator, expression, right));

  }
  return expression;
}

function parseFatArrowFunction(params) {
  if (consume('=>')) {
    if (options.scope) createScope();
    var body = parseBlock();
    if (options.scope) destroyScope();

    expect('end');
    return ast.fatArrowStatement(params, body);
  }
}

function parseThinArrowFunction(params) {
  if (consume('->')) {
    if (options.scope) createScope();
    var body = parseBlock();
    if (options.scope) destroyScope();

    expect('end');
    return ast.thinArrowStatement([ast.identifier('self')].concat(params), body);
  }
}

//     prefixexp ::= prefix {suffix}
//     prefix ::= Name | '(' exp ')'
//     suffix ::= '[' exp ']' | '.' Name | ':' Name args | args
//
//     args ::= '(' [explist] ')' | tableconstructor | String

function parsePrefixExpression() {
  var base, name, marker;

  if (trackLocations) marker = createLocationMarker();

  // The prefix
  if (Identifier === token.type) {
    name = token.value;
    base = parseIdentifier();
    // Set the parent scope.
    if (options.scope) attachScope(base, scopeHasName(name));
  }
  else if (Keyword == token.type && 'super' == token.value) {
    if (!isInClassMethod) return raise(token, errors.superOutsideClass, null, token.value);
    if (!currentClassParent) return raise(token, errors.superOnlyAllowedDerived, null, token.value);

    name = token.value;
    base = parseSuperExpression();
    // Set the parent scope.
    if (options.scope) attachScope(base, scopeHasName(name));
  }
  /*else if (consume('{')) {
    var variables = [];
    do {
      name = parseIdentifier();

      variables.push(name);
    } while (consume(','));

    expect('}');
    expect('=');

    var expression = parseExpectedExpression();

    // Declarations doesn't exist before the statement has been evaluated.
    // Therefore assignments can't use their declarator. And the identifiers
    // shouldn't be added to the scope until the statement is complete.
    if (options.scope) {
      for (var i = 0, l = variables.length; i < l; i++) {
        scopeIdentifier(variables[i]);
      }
    }

    pushLocation(marker);
    return finishNode(ast.tableDestructorStatement(variables, expression));
  }*/
  else if (consume('(')) {
    if (Identifier == token.type || '...)'.indexOf(token.value) >= 0) {
      var parameters = [];
      var tokens = [];
      var commaTokens = [];

      // The declaration has arguments
      if (!consume(')')) {
        // Arguments are a comma separated list of identifiers, optionally ending
        // with a vararg.

        do {
          if (VarargLiteral === token.type) {
            var temp = lookahead;
            tokens.push(token);

            var param = parsePrimaryExpression();
            if (param.type == 'SpreadExpression') {
              unexpected(temp);
            }
            parameters.push(param);
            break;
          }
          else {
            tokens.push(token);
            var parameter = parseExpectedExpression();
            if (consume('=')) {
              var exp = parseExpectedExpression();
              parameter.defaultValue = exp;
            }

            parameters.push(parameter);
          }

          if (token.value === ',') {
            commaTokens.push(token);
          }
        } while (consume(','));

        expect(')');
      }

      var fatArrowStatement = parseFatArrowFunction(parameters);
      var thinArrowStatement = parseThinArrowFunction(parameters);
      if (fatArrowStatement || thinArrowStatement) {
        pushLocation(marker);

        for (var i in tokens) {
          var t = tokens[i];
          if (t.type != Identifier && t.type != VarargLiteral)
            raiseUnexpectedToken('<name> or \'...\'', t);
        }
        return finishNode(fatArrowStatement || thinArrowStatement);
      }
      else if (commaTokens.length > 0) {
        raiseUnexpectedToken(`')'`, commaTokens[0]);
      }

      base = parameters[0];
      base.inParens = true;


      /*expect('=>');

      if (options.scope) createScope();
      var body = parseBlock();
      if (options.scope) destroyScope();

      expect('end');
      return finishNode(ast.fatArrowStatement(parameters, body));*/
    }
    else {
      base = parseExpectedExpression();
      expect(')');
      base.inParens = true; // XXX: quick and dirty. needed for validateVar
    }
  } else {
    return null;
  }

  // The suffix
  var expression, identifier;
  while (true) {
    if (Punctuator === token.type) {
      switch (token.value) {
        case '[':
          pushLocation(marker);
          next();
          expression = parseExpectedExpression();
          base = finishNode(ast.indexExpression(base, expression));
          expect(']');
          break;
        case '?.':
          pushLocation(marker);
          next();
          identifier = parseIdentifier();
          base = finishNode(ast.safeMemberExpression(base, '.', identifier));
          break;
        case '.':
          pushLocation(marker);
          next();
          identifier = parseIdentifier();
          base = finishNode(ast.memberExpression(base, '.', identifier));
          break;
        case ':':
          pushLocation(marker);
          next();
          identifier = parseIdentifier();
          base = finishNode(ast.memberExpression(base, ':', identifier));
          // Once a : is found, this has to be a CallExpression, otherwise
          // throw an error.
          pushLocation(marker);
          base = parseCallExpression(base);
          break;
        case '(': case '{': // args
          pushLocation(marker);
          base = parseCallExpression(base);
          break;
        default:
          return base;
      }
    } else if (StringLiteral === token.type) {
      pushLocation(marker);
      base = parseCallExpression(base);
    } else {
      break;
    }
  }

  return base;
}

//     args ::= '(' [explist] ')' | tableconstructor | String

function parseCallExpression(base) {
  var first = base;

  if (first.type == 'MemberExpression') {
    while (first) {
      if (!first.base) break;
      first = first.base;
    }
  }

  if (Punctuator === token.type) {
    switch (token.value) {
      case '(':
        next();

        // List of expressions
        var expressions = [];
        var expression = parseExpression();
        if (null != expression) expressions.push(expression);
        while (consume(',')) {
          expression = parseExpectedExpression();
          expressions.push(expression);
        }

        expect(')');

        if (first.type == 'SuperExpression') {
          return finishNode(ast.superCallExpression(base, expressions));
        }

        return finishNode(ast.callExpression(base, expressions));

      case '{':
        markLocation();
        next();
        var table = parseTableConstructor();

        if (first.type == 'SuperExpression') {
          return finishNode(ast.superTableCallExpression(base, table));
        }

        return finishNode(ast.tableCallExpression(base, table));
    }
  } else if (StringLiteral === token.type) {
    if (first.type == 'SuperExpression') {
      return finishNode(ast.superStringCallExpression(base, parsePrimaryExpression()));
    }

    return finishNode(ast.stringCallExpression(base, parsePrimaryExpression()));
  }

  raiseUnexpectedToken('function arguments', token);
}

//     primary ::= String | Numeric | nil | true | false
//          | functiondef | tableconstructor | '...'

function parsePrimaryExpression() {
  var value = token.value,
    type = token.type,
    marker;

  var tok = token;

  if (trackLocations) marker = createLocationMarker();

  if (type == StringLiteral || type == NumericLiteral || type == BooleanLiteral || type == NilLiteral || type == VarargLiteral) {
    pushLocation(marker);
    var raw = input.slice(token.range[0], token.range[1]);
    next();

    if (type == StringLiteral) {
      if (tok.isTemplate) {
        var regexTemplate = /\$\{[a-zA-Z0-9_.]+\}/g
        var match;
        var innerRaw = raw.slice(1, raw.length - 1);

        var expressions = [];
        var lastIdx = 0;
        while (match = regexTemplate.exec(value)) {
          var matchStr = match[0];

          var str = value.substring(lastIdx, match.index);
          var str2 = value.substring(lastIdx, match.index);
          if (str != '') {
            expressions.push(ast.literal(StringLiteral, str, JSON.stringify(str)));
          }
          lastIdx = match.index + matchStr.length;

          expressions.push(ast.identifier(matchStr.slice(2, -1)));
        }

        var str = value.slice(lastIdx);
        if (str != '') {
          expressions.push(ast.literal(StringLiteral, str, JSON.stringify(str)));
        }

        return finishNode(ast.templateStringLiteral(expressions));
      }
    }
    else if (type == VarargLiteral) {
      var exp = parseExpression();

      if (null !== exp)
        return finishNode(ast.spreadExpression(exp))
    }

    return finishNode(ast.literal(type, value, raw));
  } else if (Keyword === type && 'function' === value) {
    pushLocation(marker);
    next();
    if (options.scope) createScope();
    return parseFunctionDeclaration(null);
  } else if (consume('{')) {
    pushLocation(marker);
    return parseTableConstructor();
  }
  else if (token.value == '(') {
  }
}

// Parser
// ------

// Export the main parser.
//
//   - `wait` Hold parsing until end() is called. Defaults to false
//   - `scope` Track identifier scope. Defaults to false.
//   - `locations` Store location information. Defaults to false.
//   - `ranges` Store the start and end character locations. Defaults to
//     false.
//   - `onCreateNode` Callback which will be invoked when a syntax node is
//     created.
//   - `onCreateScope` Callback which will be invoked when a new scope is
//     created.
//   - `onDestroyScope` Callback which will be invoked when the current scope
//     is destroyed.

function parse(_input, _options) {
  if ('undefined' === typeof _options && 'object' === typeof _input) {
    _options = _input;
    _input = undefined;
  }
  if (!_options) _options = {};

  input = _input || '';
  options = extend(defaultOptions, _options);

  // Rewind the lexer
  length = input.length;
  // When tracking identifier scope, initialize with an empty scope.
  scopes = [[]];
  scopeDepth = 0;
  globals = [];
  locations = [];

  tokenIndex = 0;
  tokens = tokenizer.tokenize(input);

  isInClassMethod = false;
  isInClassConstructor = false;
  classSuperCalled = false;
  classConstructorToken = null;

  currentClassParent = null;

  if (!options.wait) return end();
  return this;
}

// Write to the source code buffer without beginning the parse.

function write(_input) {
  input += String(_input);
  length = input.length;
  return this;
}

// Send an EOF and begin parsing.

function end(_input) {
  if ('undefined' !== typeof _input) write(_input);

  // Ignore shebangs.
  if (input && input.substr(0, 2) === '#!') input = input.replace(/^.*/, function (line) {
    return line.replace(/./g, ' ');
  });

  length = input.length;
  trackLocations = options.locations || options.ranges;
  // Initialize with a lookahead token.
  lookahead = nextToken();

  var chunk = parseChunk();
  if (options.scope) chunk.globals = globals;

  if (locations.length > 0)
    throw new Error('Location tracking failed. This is most likely a bug in the parser');

  return chunk;
}

/* vim: set sw=2 ts=2 et tw=79 : */

var parser = {
  version: '0.2.1',
  defaultOptions: defaultOptions,
  tokenTypes: {
    EOF: EOF, StringLiteral: StringLiteral,
    Keyword: Keyword, Identifier: Identifier, NumericLiteral: NumericLiteral,
    Punctuator: Punctuator, BooleanLiteral: BooleanLiteral,
    NilLiteral: NilLiteral, VarargLiteral: VarargLiteral
  },
  errors: errors,
  ast: ast,
  parse: parse,
  write: write,
  end: end,
};

export default parser;
