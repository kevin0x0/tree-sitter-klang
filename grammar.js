/**
 * @file Klang grammar for tree-sitter
 * @author Ji, Kaiwen <kevin0x00@163.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check


const PREC = {
  CLASS_LOCAL_LIST: -1,
  CLASS_PAIR: -1,
  VARAEG_ITERATOR: 1,
  PARAMETER_LIST: 1,
  PARAMS_IN_PARENTHESIS: 1,
  OP_OR: 2,
  OP_AND: 3,
  OP_LE: 4,
  OP_LT: 4,
  OP_GE: 4,
  OP_GT: 4,
  OP_EQ: 4,
  OP_NE: 4,
  OP_IS: 4,
  OP_ISNOT: 4,
  OP_CONCAT: 5,
  OP_ADD: 6,
  OP_MINUS: 6,
  OP_MUL: 7,
  OP_DIV: 7,
  OP_MOD: 7,
  OP_IDIV: 7,
  OP_UNARY: 8,
  OP_POST: 9,
};

module.exports = grammar({
  name: "klang",

  word: $ => $.identifier,

  inline: $ => [
    $._unit_expression,
    $._expression,
    $._statement
  ],

  extras: $ => [
    /\s/,
    $.comment,
  ],

  rules: {
    source_file: $ => $._statement_list,

    _statement: $ => choice(
      $.expression_statement,
      $.let_statement,
      $.assign_statement,
      $.if_statement,
      $.for_statement,
      $.while_statement,
      $.repeat_statement,
      $.match_statement,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.local_statement,
      $.method_statement
    ),

    _statement_list: $ => repeat1(seq($._statement, optional(';'))),
    _expression_list: $ => prec.right(seq(
      $._expression,
      repeat(seq(',', $._expression)),
      optional(',')
    )),
    _expression_list_not_group: $ => seq($._expression, ',', optional($._expression_list)),
    _statement_block: $ => choice(seq('{', $._statement_list, '}'), $._statement),


    expression_statement: $ => prec.right(seq($._expression_list)),

    let_statement: $ => seq('let', $._expression_list, '=', $._expression_list),

    assign_statement: $ => prec.right(seq($._expression_list, '=', $._expression_list)),

    if_statement: $ => prec.right(seq(
      'if',
      $._expression,
      ':',
      $._statement_block,
      optional(seq(
        'else',
        optional(':'),
        $._statement_block
      ))
    )),



    // iterator
    _iterator: $ => choice(
      $.integer_iterator,
      $.vararg_iterator,
      $.generic_iterator
    ),

    integer_iterator: $ => seq(
      field('pattern', $._expression),
      '=',
      field('begin', $._expression),
      ',',
      field('end', $._expression),
      optional(seq(',', field('step', $._expression)))
    ),

    vararg_iterator: $ => prec(PREC.VARAEG_ITERATOR, seq(
      field('patterns', $._expression_list),
      $._in,
      field('vararg', $.vararg)
    )),

    generic_iterator: $ => seq(
      field('patterns', $._expression_list),
      $._in,
      field('object', $._expression)
    ),



    for_statement: $ => seq('for', $._iterator, ':', $._statement_block),

    while_statement: $ => seq(
      'while',
      field('condition', $._expression),
      ':',
      field('body', $._statement_block)
    ),

    repeat_statement: $ => prec.right(seq(
      'repeat',
      optional(':'),
      field('body', $._statement_block),
      optional(seq(
        'until',
        field('condition', $._expression)
      ))
    )),

    match_case: $ => seq(
      field('pattern', $._expression),
      ':',
      field('body', $._statement_block),
      optional(';')
    ),
    _match_list: $ => repeat1($.match_case),

    match_statement: $ => seq(
      'match',
      field('object', $._expression),
      ':',
      '{',
      $._match_list,
      '}'
    ),

    return_statement: $ => seq('return', $._expression_list),

    break_statement: $ => prec.right(seq('break', optional(field('label', $.identifier)))),

    continue_statement: $ => prec.right(seq('continue', optional(field('label', $.identifier)))),

    local_statement: $ => seq('local', field('name', $.identifier), $._expression),

    method_statement: $ => seq(
      'method',
      field('name', $._expression),
      '=',
      field('implementation', $._expression)
    ),



    _expression: $ => choice(
      $._normal_expression,
      $.walrus_expression,
      $.where_expression,
      $.append_expression,
      $.yield_expression,
      $.async_expression,
      $.case_expression,
      $.closure_body,
      $.closure
    ),

    walrus_expression: $ => prec.right(seq(
      field('pattern', $._normal_expression),
      ':=',
      field('value', $._expression)
    )),

    where_expression: $ => prec.right(seq(
      $._normal_expression,
      'where',
      field('body', $._statement_block)
    )),

    append_expression: $ => prec.right(seq(
      $._normal_expression,
      '<<',
      $._expression_list
    )),

    yield_expression: $ => prec.right(seq('yield', optional($._expression_list))),

    async_expression: $ => prec.right(seq('async', optional($._expression_list))),

    case: $ => seq(
      field('pattern', $._expression),
      '=',
      field('value', $._expression)
    ),
    _case_list: $ => prec.right(seq(
      $.case,
      repeat(seq(',', $.case))
    )),
    case_expression: $ => seq(
      'case',
      field('object', $._expression),
      'of',
      $._case_list
    ),

    closure_body: $ => choice(
      seq('->', field('body', $._expression)),
      seq('=>', field('body', $._statement_block))
    ),

    _params_in_parenthesis: $ => prec(PREC.PARAMS_IN_PARENTHESIS, seq(
      '(',
      field('parameter', optional($._expression_list_not_group)),
      ')'
    )),
    parameter_list: $ => prec(PREC.PARAMETER_LIST, choice(
      $._params_in_parenthesis,
      field('parameter', $._expression)
    )),
    closure: $ => seq($.parameter_list, alias($.closure_body, '_hidden')),



    _normal_expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.inherit_expression,
      $.index_expression,
      $.dot_expression,
      $.call_expression,
      $._unit_expression
    ),

    binary_expression: $ => {
      let ops = [
        [$._or, PREC.OP_OR],
        [$._and, PREC.OP_AND],
        ['<=', PREC.OP_LE],
        ['<', PREC.OP_LT],
        ['>=', PREC.OP_GE],
        ['>', PREC.OP_GT],
        ['==', PREC.OP_EQ],
        ['!=', PREC.OP_NE],
        [$._is, PREC.OP_IS],
        [$._isnot, PREC.OP_ISNOT],
        ['..', PREC.OP_CONCAT],
        ['+', PREC.OP_ADD],
        ['-', PREC.OP_MINUS],
        ['*', PREC.OP_MUL],
        ['/', PREC.OP_DIV],
        ['%', PREC.OP_MOD],
        ['//', PREC.OP_IDIV],
      ];
      return choice(...ops.map(([op, opprec]) => prec.left(opprec, seq(
        field('left', $._normal_expression),
        field('operator', op),
        field('right', $._normal_expression)
      ))));
    },

    unary_expression: $ => prec(PREC.OP_UNARY, seq(
      field('operator', choice('-', '$', $._not, '+')),
      field('operand', $._normal_expression)
    )),

    inherit_expression: $ => seq('inherit', $._normal_expression, $.class),

    index_expression: $ => prec(PREC.OP_POST, seq(
      field('operand', $._normal_expression),
      token.immediate('['),
      field('key', $._expression),
      ']'
    )),

    dot_expression: $ => prec(PREC.OP_POST, seq(
      field('object', $._normal_expression),
      '.',
      field('field', $.identifier)
    )),

    argument_list: $ => $._expression_list,
    call_expression: $ => prec(PREC.OP_POST, seq(
      field('function', $._normal_expression),
      field('arguments', choice(
        seq(token.immediate('('), optional($.argument_list), ')'),
        $._unit_expression
      ))
    )),

    _unit_expression: $ => choice(
      $.identifier,
      $.wildcard,
      $.integer,
      $.float,
      $.string,
      $.true,
      $.false,
      $.nil,
      $.vararg,
      $.tuple,
      $.array,
      $.array_comprehension,
      $.map,
      $.map_comprehension,
      $.class,
      $.new_expression,
      $.group_expression
    ),

    group_expression: $ => seq('(', $._expression, ')'),



    identifier: $ => /[A-Za-z_][A-Za-z0-9_]*|'([^']|\\.)*'/,
    wildcard: $ => '_',
    integer: $ => /0[0-7]*|[1-9][0-9]*|0[xX][A-Fa-f0-9]+/,
    float: $ => /[0-9]+\.[0-9]+/,
    string: $ => choice(/"([^"]|\\[^x]|\\x[A-Za-z0-9]{2})*"/, /`[^`]*`/),
    true: $ => 'true',
    false: $ => 'false',
    nil: $ => 'nil',
    vararg: $ => '...',

    tuple: $ => seq('(', optional($._expression_list_not_group), ')'),

    _comprehension_item: $ => choice($._iterator, $.let_statement, $._expression),
    comprehension_list: $ => repeat1(seq($._comprehension_item, optional(';'))),

    array: $ => seq('[', optional($._expression_list), ']'),
    array_comprehension: $ => seq('[', $._expression_list, '|', $.comprehension_list, ']'),

    pair: $ => seq(field('key', $._expression), ':', field('value', $._expression)),
    _pairs: $ => seq($.pair, repeat(seq(',', $.pair)), optional(',')),
    map: $ => seq('{', choice($._pairs, ':'), '}'),
    map_comprehension: $ => seq('{', $._pairs, '|', $.comprehension_list, '}'),

    class_local_list: $ => prec(PREC.CLASS_LOCAL_LIST, seq(
      'local',
      field('field', $.identifier),
      repeat(seq(',', field('field', $.identifier)))
    )),
    class_pair: $ => prec(PREC.CLASS_PAIR, seq(
      field('field', $.identifier),
      '=',
      field('value', $._expression)
    )),
    class_shared_list: $ => seq(
      optional('shared'),
      $.class_pair,
      repeat(seq(',', $.class_pair))
    ),
    class_method: $ => seq('method', $.class_pair),
    _class_item: $ => choice(
      $.class_local_list,
      $.class_shared_list,
      $.class_method
    ),
    'class': $ => seq(
      '{',
      repeat(seq($._class_item, optional(';'))),
      '}'
    ),

    _dot_chain: $ => prec.right(seq($.identifier, repeat(seq('.', $.identifier)))),
    new_expression: $ => prec.right(seq(
      'new',
      field('class', choice(
        seq('(', $._expression, ')'),
        $._dot_chain
      )),
      optional(field('parameters', $._params_in_parenthesis))
    )),

    
    _in: $ => choice('in', '<-'),
    _is: $ => choice('is', '==='),
    _isnot: $ => choice('isnot', '!=='),
    _and: $ => choice('and', '&&'),
    _or: $ => choice('or', '||'),
    _not: $ => choice('not', '!'),

    comment: $ => /--[^\r\n]*/,
  }
});
