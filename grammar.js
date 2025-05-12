module.exports = grammar({
  name: 'antlers',

  extras: $ => [
    /\s/,
    $.antlers_comment
  ],

  conflicts: $ => [
    [$.directive],
    [$.expression, $.applied_modifier],
    [$.binary_expression, $.applied_modifier]
  ],

  precedences: $ => [
    [
      'binary_operators',
      'conditional',
      'expression',
    ],
  ],

  rules: {
    source: $ => repeat($._node),

    _node: $ => choice(
      $.antlers_tag,
      $.antlers_comment,
      $.text
    ),

    antlers_comment: $ => token(choice(
      seq('{{#', /[^#]*#?[^#]*#?[^}]*?/, '#}}'),
      seq('{{!--', /[^-]*-?[^-]*-?[^-]*?/, '--}}')
    )),

    antlers_tag: $ => seq(
      '{{',
      optional($.whitespace),
      optional(choice(
        $._tag_content,
        $.expression
      )),
      optional($.whitespace),
      '}}'
    ),

    _tag_content: $ => choice(
      $.directive,
      $._modified_expression
    ),

    directive: $ => prec('conditional', choice(
      seq('if', $.whitespace, $.expression),
      seq('elseif', $.whitespace, $.expression),
      'else',
      'endif',
      '/if',
      seq('unless', $.whitespace, $.expression),
      'endunless',
      '/unless',
      seq($.variable, ':', $.variable),
      seq($.variable, ':', $.variable, optional($.whitespace), optional($.expression))
    )),

    variable: $ => /[a-zA-Z_][a-zA-Z0-9_:]*/,

    _modified_expression: $ => prec.right('expression', seq(
      $.expression,
      repeat($.applied_modifier)
    )),

    expression: $ => prec.right('expression', choice(
      seq($.variable, repeat(seq(optional($.whitespace), $.applied_modifier))),
      $.string,
      $.number,
      $.binary_expression,
      seq('(', optional($.whitespace), $.expression, optional($.whitespace), ')')
    )),

    binary_expression: $ => prec.left('binary_operators', seq(
      $.expression,
      $.whitespace,
      choice('==', '!=', '<', '>', '<=', '>=', '&&', '||', '+', '-', '*', '/'),
      $.whitespace,
      $.expression
    )),

    string: $ => choice(
      seq('"', /[^"]*/, '"'),
      seq("'", /[^']*/, "'")
    ),

    number: $ => /[0-9]+(\.[0-9]+)?/,

    applied_modifier: $ => prec.right('expression', seq(
      '|',
      optional($.whitespace),
      $.variable,
      optional(seq(
        ':',
        optional($.whitespace),
        commaSep1(choice($.string, $.number, $.variable, $.expression))
      ))
    )),

    text: $ => /[^{]+/,

    whitespace: $ => /\s+/
  }
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', optional(/\s/), rule)));
}

