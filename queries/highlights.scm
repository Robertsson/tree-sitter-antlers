;; Comments
(antlers_comment) @comment

;; Tag delimiters
"{{" @punctuation.bracket
"}}" @punctuation.bracket

;; Control structures
(if_statement 
  ["if" "elseif" "else" "/if"] @keyword.control.conditional)

(unless_statement
  ["unless" "/unless"] @keyword.control.conditional)

;; Collection and loop structures
(collection_loop) @keyword.control.repeat

(nav_loop) @keyword.control.repeat

(taxonomy_loop) @keyword.control.repeat

(form_loop) @keyword.control.repeat

;; Special tags
(partial_tag) @keyword
(yield_tag) @keyword
(section_tag) @keyword.control.repeat
(scope_tag) @keyword.control.repeat
(asset_tag) @keyword
(glide_tag) @keyword
(dump_tag) @keyword.debug
(switch_statement) @keyword.control.conditional
(user_tag) @keyword

;; Advanced specialized tags
(cache_tag) @keyword.directive
(no_cache_tag) @keyword.directive
(redirect_tag) @keyword.directive
(session_tag) @keyword
(markdown_tag) @keyword
(oauth_tag) @keyword
(locales_tag) @keyword
(svg_tag) @keyword
(template_content_tag) @keyword

;; PHP integration
(php_raw) @embedded.php
(php_echo) @embedded.php

;; Ignore/escape
(ignore_symbol) @comment.ignore

;; Final advanced tags
(slot_tag) @keyword.control.repeat
(push_tag) @keyword.directive
(prepend_tag) @keyword.directive
(once_tag) @keyword.directive

;; Interpolation and advanced syntax
(interpolated_parameter) @embedded
(multi_statement) @statement

;; Void keyword
"void" @constant.builtin

;; Variables and identifiers
(variable) @variable
(parameter_name) @property

;; Strings and literals
(string) @string
(double_quoted_string) @string
(single_quoted_string) @string
(number) @number
(boolean) @constant.builtin

;; Binary operators
["==" "!=" "<" ">" "<=" ">=" "&&" "||" "and" "or" "xor" "+" "-" "*" "/" "**" "%"] @operator

;; Assignment operators
["=" "+=" "-=" "*=" "/=" "%=" "?="] @operator

;; Null coalescing
"??" @operator

;; Ternary operators
["?" ":"] @operator

;; Modifier pipe operator
"|" @operator

;; Unary operators
["!" "-" "+"] @operator

;; Array access
["[" "]"] @punctuation.bracket

;; Array methods
(array_method_call) @function.method

;; Parentheses and brackets
"(" @punctuation.bracket
")" @punctuation.bracket

;; Parameter assignment and delimiters
"=" @operator
":" @punctuation.delimiter

;; Text content
(text) @text

;; Error highlighting
(ERROR) @error