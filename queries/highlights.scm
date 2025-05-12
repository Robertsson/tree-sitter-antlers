;; Comments
(antlers_comment) @comment

;; Tags
(antlers_tag) @tag

;; Directives (like if/else/unless)
(directive) @keyword

;; Expressions and variables
(expression) @variable
(variable) @variable

;; Strings and numbers
(string) @string
(number) @number

;; Operators
(binary_expression
  operator: (_) @operator)

(applied_modifier
  "|" @operator
  (variable) @function)

;; Fallback text
(text) @text