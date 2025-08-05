/**
 * @file Antlers tree sitter grammar
 * @author Tree-sitter Antlers Contributors
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'antlers',

  externals: $ => [
    $.collection_keyword,
    $.nav_keyword,
    $.taxonomy_keyword,
    $.form_keyword,
    $.if_keyword,
    $.unless_keyword,
    $.entries_keyword
  ],

  extras: $ => [
    /\s/,
    $.antlers_comment
  ],


  conflicts: $ => [
    [$.parameter_value, $.primary_expression],
    [$.expression_with_modifiers, $.primary_expression],
    [$._tag_content, $.expression_with_modifiers],
    [$.parameter, $.binary_expression]
    // Temporarily removed binary/unary conflicts to test automatic resolution
    // [$.binary_expression, $.unary_expression],
    // [$.ternary_expression, $.unary_expression]
  ],

  precedences: $ => [
    [
      'parentheses',
      'unary', 
      'exponentiation',
      'multiplicative',
      'additive',
      'comparison',
      'logical',
      'bitwise',
      'coalescing',
      'ternary',
      'assignment',
      'modifier'
    ]
  ],

  rules: {
    source: $ => repeat($._node),

    _node: $ => choice(
      $.antlers_comment,
      $.php_raw,
      $.php_echo,
      prec(2, $.if_statement),
      prec(2, $.unless_statement),
      prec(10, $.collection_loop),
      prec(2, $.nav_loop),
      prec(2, $.taxonomy_loop),
      prec(2, $.form_loop),
      prec(3, $.form_errors),
      prec(2, $.entries_loop),
      prec(2, $.recursive_pattern),
      prec(2, $.partial_tag),
      prec(2, $.yield_tag),
      prec(2, $.section_tag),
      prec(2, $.scope_tag),
      prec(2, $.asset_tag),
      prec(2, $.glide_tag),
      prec(2, $.dump_tag),
      prec(2, $.switch_statement),
      prec(2, $.user_tag),
      prec(2, $.cache_tag),
      prec(2, $.no_cache_tag),
      prec(2, $.redirect_tag),
      prec(2, $.session_tag),
      prec(2, $.markdown_tag),
      prec(2, $.oauth_tag),
      prec(2, $.locales_tag),
      prec(2, $.svg_tag),
      prec(2, $.template_content_tag),
      prec(2, $.slot_tag),
      prec(2, $.push_tag),
      prec(2, $.prepend_tag),
      prec(2, $.once_tag),
      prec(1, $.antlers_tag),
      $.text
    ),

    antlers_comment: $ => token(choice(
      seq('{{#', repeat(choice(/[^#]/, /#[^}]/, /#}[^}]/)), '#}}'),
      seq('{{!--', repeat(choice(/[^-]/, /-[^-]/, /--[^}]/)), '--}}')
    )),

    php_raw: $ => token(seq('{{?', /[\s\S]*?/, '?}}')),

    php_echo: $ => token(seq('{{$', /[\s\S]*?/, '$}}')),

    antlers_tag: $ => seq(
      '{{',
      optional(/\s*/),
      $._tag_content,
      optional(/\s*/),
      '}}'
    ),

    _tag_content: $ => choice(
      $.multi_statement,
      prec(3, $.directive_tag),
      $.expression_with_modifiers
    ),

    multi_statement: $ => prec(2, seq(
      choice($.expression_with_modifiers, $.directive_tag),
      repeat1(seq(';', optional(/\s*/), choice($.expression_with_modifiers, $.directive_tag)))
    )),

    directive_tag: $ => prec(3, choice(
      // Regular variable with parameters (for non-keyword directive tags) - try first
      prec.dynamic(15, seq($.variable, $.tag_parameters)),
      seq($.variable, ':', $.variable, optional($.tag_parameters)),
      seq('/', $.variable),
      seq('/', $.variable, ':', $.variable),
      // External keywords with parameters
      seq($.collection_keyword, $.tag_parameters),
      seq($.nav_keyword, $.tag_parameters),
      seq($.taxonomy_keyword, $.tag_parameters),
      seq($.form_keyword, $.tag_parameters),
      seq($.entries_keyword, $.tag_parameters)
    )),



    tag_parameters: $ => prec.dynamic(10, repeat1($.parameter)),

    parameter: $ => prec.dynamic(10, choice(
      seq($.parameter_name, '=', $.parameter_value),
      seq(':', $.parameter_name, '=', $.parameter_value)
    )),

    parameter_name: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    parameter_value: $ => choice(
      $.string,
      $.number,
      $.variable,
      $.interpolated_parameter,
      'void'
    ),

    interpolated_parameter: $ => seq(
      '{',
      $.expression,
      '}'
    ),

    variable: $ => choice(
      $.simple_variable,
      $.nested_variable,
      $.array_access_variable
    ),

    simple_variable: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    nested_variable: $ => seq(
      $.simple_variable,
      repeat1(seq(
        choice(':', '.'),
        $.simple_variable
      ))
    ),

    array_access_variable: $ => seq(
      $.simple_variable,
      repeat1(seq(
        '[',
        choice($.simple_variable, $.number, $.string),
        ']'
      ))
    ),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,



    expression_with_modifiers: $ => seq(
      $.expression,
      repeat($.applied_modifier)
    ),

    applied_modifier: $ => seq(
      token(prec(10, '|')),
      $.modifier_name,
      optional($.modifier_parameters)
    ),

    expression: $ => choice(
      $.ternary_expression,
      $.binary_expression,
      $.parenthesized_expression,
      $.unary_expression,
      prec(-1, $.primary_expression)
    ),

    ternary_expression: $ => prec.right('ternary', seq(
      $.expression,
      '?',
      $.expression,
      ':',
      $.expression
    )),


    primary_expression: $ => choice(
      $.array_method_call,
      $.variable,
      $.string,
      $.number,
      $.boolean
    ),

    array_method_call: $ => seq(
      $.variable,
      '.',
      choice(
        seq('orderby', '(', ')'),
        seq('groupby', '(', ')'),
        seq('where', '(', ')'),
        seq('take', '(', ')'),
        seq('skip', '(', ')'),
        seq('merge', '(', ')'),
        seq('pluck', '(', ')')
      )
    ),

    array_access: $ => alias(seq(
      $.variable,
      '[',
      choice(
        $.number,
        $.string,
        $.variable
      ),
      ']'
    ), $.variable),

    binary_expression: $ => choice(
      prec.right('exponentiation', seq(
        field('left', $.expression),
        token(prec(1, '**')),
        field('right', $.expression)
      )),
      
      prec.left('multiplicative', seq(
        field('left', $.expression),
        choice(
          token(prec(1, '*')),
          token(prec(1, '/')),
          token(prec(1, '%'))
        ),
        field('right', $.expression)
      )),
      
      prec.left('additive', seq(
        field('left', $.expression),
        choice(
          token(prec(1, '+')),
          token(prec(1, '-'))
        ),
        field('right', $.expression)
      )),
      
      prec.left('comparison', seq(
        field('left', $.expression),
        choice(
          token(prec(1, '===')),
          token(prec(1, '!==')),
          token(prec(1, '==')),
          token(prec(1, '!=')),
          token(prec(1, '<>')),
          token(prec(1, '<')),
          token(prec(1, '>')),
          token(prec(1, '<=')),
          token(prec(1, '>='))
        ),
        field('right', $.expression)
      )),
      
      prec.left('logical', seq(
        field('left', $.expression),
        choice(
          token(prec(1, '&&')),
          token(prec(15, '||')),
          token(prec(1, 'and')),
          token(prec(1, 'or')),
          token(prec(1, 'xor'))
        ),
        field('right', $.expression)
      )),

      // Antlers-specific bitwise operators
      prec.left('bitwise', seq(
        field('left', $.expression),
        choice(
          token(prec(1, 'bwa')),
          token(prec(1, 'bwo')),
          token(prec(1, 'bxor'))
        ),
        field('right', $.expression)
      )),

      // Null coalescing operator
      prec.left('coalescing', seq(
        field('left', $.expression),
        token(prec(1, '??')),
        field('right', $.expression)
      )),

      // Assignment operators
      prec.right('assignment', seq(
        field('left', $.expression),
        choice(
          token(prec(-1, '=')), // Lower precedence for simple assignment
          token(prec(1, '+=')),
          token(prec(1, '-=')),
          token(prec(1, '*=')),
          token(prec(1, '/=')),
          token(prec(1, '%=')),
          token(prec(1, '?='))
        ),
        field('right', $.expression)
      ))
    ),

    unary_expression: $ => prec.right('unary', choice(
      seq('!', $.expression),
      seq(token(prec(2, '-')), $.expression),
      seq(token(prec(2, '+')), $.expression)
    )),

    parenthesized_expression: $ => prec('parentheses', seq(
      '(',
      $.expression,
      ')'
    )),

    modifier_name: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    modifier_parameters: $ => choice(
      // Colon syntax: modifier:param  
      seq(
        token(prec(10, ':')),
        choice(
          alias(/[a-zA-Z_][a-zA-Z0-9_]*/, $.variable),
          $.number
        )
      ),
      // Function syntax: modifier('param1', 'param2')
      seq(
        '(',
        optional(seq(
          choice($.string, $.number, $.boolean, $.variable),
          repeat(seq(
            ',',
            optional(/\s*/),  
            choice($.string, $.number, $.boolean, $.variable)
          ))
        )),
        ')'
      )
    ),



    string: $ => choice(
      $.double_quoted_string,
      $.single_quoted_string
    ),

    double_quoted_string: $ => seq(
      '"',
      repeat(choice(
        $.string_escape_sequence,
        /[^"\\]/
      )),
      '"'
    ),

    single_quoted_string: $ => seq(
      "'",
      repeat(choice(
        $.string_escape_sequence,
        /[^'\\]/
      )),
      "'"
    ),

    string_escape_sequence: $ => seq(
      '\\',
      choice(
        /[\\'"nrtbf]/,  // Common escape sequences
        /u[0-9a-fA-F]{4}/,  // Unicode escape
        /x[0-9a-fA-F]{2}/,  // Hex escape
        /[0-7]{1,3}/,       // Octal escape
        /./                 // Any other character
      )
    ),

    number: $ => token(prec(3, choice(
      // Scientific notation (must come first)
      /-?(?:[0-9](?:[0-9_]*[0-9])?(?:\.[0-9](?:[0-9_]*[0-9])?)?|\.[0-9](?:[0-9_]*[0-9])?)[eE][+-]?[0-9](?:[0-9_]*[0-9])?/,
      
      // Hexadecimal
      /-?0[xX][0-9a-fA-F](?:[0-9a-fA-F_]*[0-9a-fA-F])?/,
      
      // Octal
      /-?0[0-7](?:[0-7_]*[0-7])?/,
      
      // Float (with decimal point)
      /-?(?:[0-9](?:[0-9_]*[0-9])?)?\.?[0-9](?:[0-9_]*[0-9])?/,
      
      // Integer
      /-?[0-9](?:[0-9_]*[0-9])?/
    ))),

    boolean: $ => choice('true', 'false'),

    if_statement: $ => prec.right(seq(
      seq('{{', /\s*/, $.if_keyword, /\s+/, $.expression, /\s*/, '}}'),
      repeat($._node),
      repeat(prec.right(seq(
        seq('{{', /\s*/, 'elseif', /\s+/, $.expression, /\s*/, '}}'),
        repeat($._node)
      ))),
      optional(seq(
        seq('{{', /\s*/, 'else', /\s*/, '}}'),
        repeat($._node)
      )),
      seq('{{', /\s*/, '/if', /\s*/, '}}')
    )),

    unless_statement: $ => seq(
      seq('{{', /\s*/, $.unless_keyword, /\s+/, $.expression, /\s*/, '}}'),
      repeat($._node),
      seq('{{', /\s*/, '/unless', /\s*/, '}}')
    ),

    collection_loop: $ => choice(
      // Collection with colon syntax: {{ collection:handle }}...{{ /collection:handle }}
      seq(
        seq('{{', /\s*/, $.collection_keyword, ':', $.variable, optional($.tag_parameters), /\s*/, '}}'),
        repeat($._node),
        seq('{{', /\s*/, '/', $.collection_keyword, ':', $.variable, /\s*/, '}}')
      ),
      
      // Collection with from parameter: {{ collection from="handle" }}...{{ /collection }}
      seq(
        seq('{{', /\s*/, $.collection_keyword, /\s+/, $.tag_parameters, /\s*/, '}}'),
        repeat($._node),
        seq('{{', /\s*/, '/', $.collection_keyword, /\s*/, '}}')
      )
    ),

    nav_loop: $ => choice(
      // Nav with colon syntax: {{ nav:handle }}...{{ /nav:handle }}
      seq(
        seq('{{', /\s*/, $.nav_keyword, ':', $.variable, optional($.tag_parameters), /\s*/, '}}'),
        repeat($._node),
        seq('{{', /\s*/, '/', $.nav_keyword, ':', $.variable, /\s*/, '}}')
      ),
      
      // Nav with from parameter: {{ nav from="handle" }}...{{ /nav }}
      seq(
        seq('{{', /\s*/, $.nav_keyword, /\s+/, $.tag_parameters, /\s*/, '}}'),
        repeat($._node),
        seq('{{', /\s*/, '/', $.nav_keyword, /\s*/, '}}')
      ),
      
      // Breadcrumbs navigation: {{ nav:breadcrumbs }}...{{ /nav:breadcrumbs }}
      seq(
        seq('{{', /\s*/, $.nav_keyword, ':', 'breadcrumbs', optional($.tag_parameters), /\s*/, '}}'),
        repeat($._node),
        seq('{{', /\s*/, '/', $.nav_keyword, ':', 'breadcrumbs', /\s*/, '}}')
      )
    ),

    taxonomy_loop: $ => choice(
      // Taxonomy with colon syntax: {{ taxonomy:handle }}...{{ /taxonomy:handle }}
      seq(
        seq('{{', /\s*/, $.taxonomy_keyword, ':', $.variable, optional($.tag_parameters), /\s*/, '}}'),
        repeat($._node),
        seq('{{', /\s*/, '/', $.taxonomy_keyword, ':', $.variable, /\s*/, '}}')
      ),
      
      // Taxonomy with from parameter: {{ taxonomy from="handle" }}...{{ /taxonomy }}
      seq(
        seq('{{', /\s*/, $.taxonomy_keyword, /\s+/, $.tag_parameters, /\s*/, '}}'),
        repeat($._node),
        seq('{{', /\s*/, '/', $.taxonomy_keyword, /\s*/, '}}')
      )
    ),

    form_loop: $ => choice(
      // Form with colon syntax: {{ form:handle }}...{{ /form:handle }}
      seq(
        seq('{{', /\s*/, $.form_keyword, ':', $.variable, optional($.tag_parameters), /\s*/, '}}'),
        repeat($._node),
        seq('{{', /\s*/, '/', $.form_keyword, ':', $.variable, /\s*/, '}}')
      ),
      
      // Form with from parameter: {{ form from="handle" }}...{{ /form }}
      seq(
        seq('{{', /\s*/, $.form_keyword, /\s+/, $.tag_parameters, /\s*/, '}}'),
        repeat($._node),
        seq('{{', /\s*/, '/', $.form_keyword, /\s*/, '}}')
      )
    ),

    recursive_pattern: $ => choice(
      // Basic recursive: {{ *recursive children* }}
      seq('{{', /\s*/, '*recursive', /\s+/, 'children', '*', /\s*/, '}}'),
      
      // Recursive with scoped variable: {{ *recursive children:variable* }}
      seq('{{', /\s*/, '*recursive', /\s+/, 'children', ':', $.variable, '*', /\s*/, '}}')
    ),

    form_errors: $ => seq(
      seq('{{', /\s*/, 'form', ':', 'errors', optional($.tag_parameters), /\s*/, '}}'),
      repeat($._node),
      seq('{{', /\s*/, '/', 'form', ':', 'errors', /\s*/, '}}')
    ),

    entries_loop: $ => seq(
      seq('{{', /\s*/, $.entries_keyword, optional($.tag_parameters), /\s*/, '}}'),
      repeat($._node),
      seq('{{', /\s*/, '/', $.entries_keyword, /\s*/, '}}')
    ),

    // Special tags
    partial_tag: $ => choice(
      // Partial include: {{ partial:src="template" }}
      seq('{{', /\s*/, 'partial', ':', $.variable, optional($.tag_parameters), /\s*/, '}}'),
      // Partial with parameters: {{ partial src="template" }}
      seq('{{', /\s*/, 'partial', $.tag_parameters, /\s*/, '}}')
    ),

    yield_tag: $ => choice(
      // Named yield: {{ yield:content }}
      seq('{{', /\s*/, 'yield', ':', $.variable, /\s*/, '}}'),
      // Basic yield: {{ yield }}
      seq('{{', /\s*/, 'yield', /\s*/, '}}')
    ),

    section_tag: $ => seq(
      seq('{{', /\s*/, 'section', ':', $.variable, /\s*/, '}}'),
      repeat($._node),
      seq('{{', /\s*/, '/', 'section', ':', $.variable, /\s*/, '}}')
    ),

    scope_tag: $ => seq(
      seq('{{', /\s*/, 'scope', optional($.tag_parameters), /\s*/, '}}'),
      repeat($._node),
      seq('{{', /\s*/, '/', 'scope', /\s*/, '}}')
    ),

    asset_tag: $ => choice(
      // Asset with colon syntax: {{ asset:handle }}
      seq('{{', /\s*/, 'asset', ':', $.variable, optional($.tag_parameters), /\s*/, '}}'),
      // Asset with parameters: {{ asset src="image.jpg" }}
      seq('{{', /\s*/, 'asset', $.tag_parameters, /\s*/, '}}')
    ),

    glide_tag: $ => choice(
      // Glide with colon syntax: {{ glide:src }}
      seq('{{', /\s*/, 'glide', ':', $.variable, optional($.tag_parameters), /\s*/, '}}'),
      // Glide with parameters: {{ glide src="image.jpg" width="300" }}
      seq('{{', /\s*/, 'glide', $.tag_parameters, /\s*/, '}}')
    ),

    dump_tag: $ => choice(
      // Dump variable: {{ dump:variable }}
      seq('{{', /\s*/, 'dump', ':', $.variable, /\s*/, '}}'),
      // Dump everything: {{ dump }}
      seq('{{', /\s*/, 'dump', /\s*/, '}}')
    ),

    switch_statement: $ => seq(
      '{{', /\s*/, 'switch', '(',
      optional(seq(
        $.switch_case,
        repeat(seq(',', optional(/\s*/), $.switch_case))
      )),
      ')', /\s*/, '}}'
    ),

    switch_case: $ => seq(
      '(',
      $.expression,
      ')',
      '=>',
      choice($.string, $.number, $.boolean, $.variable)
    ),

    user_tag: $ => choice(
      // User permission: {{ user:can "permission" }}
      seq('{{', /\s*/, 'user', ':', 'can', /\s+/, $.string, /\s*/, '}}'),
      // User is: {{ user:is "role" }}
      seq('{{', /\s*/, 'user', ':', 'is', /\s+/, $.string, /\s*/, '}}'),
      // User in: {{ user:in "group" }}
      seq('{{', /\s*/, 'user', ':', 'in', /\s+/, $.string, /\s*/, '}}'),
      // User with parameters: {{ user:can permission="edit" }}
      seq('{{', /\s*/, 'user', ':', choice('can', 'is', 'in'), $.tag_parameters, /\s*/, '}}')
    ),

    // Additional specialized tags
    cache_tag: $ => seq(
      seq('{{', /\s*/, 'cache', optional($.tag_parameters), /\s*/, '}}'),
      repeat($._node),
      seq('{{', /\s*/, '/', 'cache', /\s*/, '}}')
    ),

    no_cache_tag: $ => seq(
      seq('{{', /\s*/, 'no_cache', /\s*/, '}}'),
      repeat($._node),
      seq('{{', /\s*/, '/', 'no_cache', /\s*/, '}}')
    ),

    redirect_tag: $ => seq('{{', /\s*/, 'redirect', $.tag_parameters, /\s*/, '}}'),

    session_tag: $ => choice(
      seq('{{', /\s*/, 'session', ':', $.variable, /\s*/, '}}'),
      seq('{{', /\s*/, 'session', $.tag_parameters, /\s*/, '}}')
    ),

    markdown_tag: $ => seq(
      seq('{{', /\s*/, 'markdown', /\s*/, '}}'),
      repeat($._node),
      seq('{{', /\s*/, '/', 'markdown', /\s*/, '}}')
    ),

    oauth_tag: $ => seq('{{', /\s*/, 'oauth', ':', $.variable, optional($.tag_parameters), /\s*/, '}}'),

    locales_tag: $ => choice(
      seq('{{', /\s*/, 'locales', /\s*/, '}}'),
      seq('{{', /\s*/, 'locales', $.tag_parameters, /\s*/, '}}')
    ),

    svg_tag: $ => seq('{{', /\s*/, 'svg', $.tag_parameters, /\s*/, '}}'),

    template_content_tag: $ => seq('{{', /\s*/, 'template_content', /\s*/, '}}'),

    slot_tag: $ => seq(
      seq('{{', /\s*/, 'slot', ':', $.variable, /\s*/, '}}'),
      repeat($._node),
      seq('{{', /\s*/, '/', 'slot', ':', $.variable, /\s*/, '}}')
    ),

    push_tag: $ => seq(
      seq('{{', /\s*/, 'push', ':', $.variable, /\s*/, '}}'),
      repeat($._node),
      seq('{{', /\s*/, '/', 'push', ':', $.variable, /\s*/, '}}')
    ),

    prepend_tag: $ => seq(
      seq('{{', /\s*/, 'prepend', ':', $.variable, /\s*/, '}}'),
      repeat($._node),
      seq('{{', /\s*/, '/', 'prepend', ':', $.variable, /\s*/, '}}')
    ),

    once_tag: $ => seq(
      seq('{{', /\s*/, 'once', /\s*/, '}}'),
      repeat($._node),
      seq('{{', /\s*/, '/', 'once', /\s*/, '}}')
    ),

    ignore_symbol: $ => token(seq('@', /[^{]*/)),

    text: $ => choice(
      $.ignore_symbol,
      /[^{@]+/
    )
  }
});

// Helper for comma-separated list (at least one)
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', optional(/\s*/), rule)));
}

// Helper for comma-separated list (zero or more)
function commaSep(rule) {
  return optional(commaSep1(rule));
}