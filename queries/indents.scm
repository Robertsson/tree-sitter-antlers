;; Increase indent after opening control structures
[
  (if_statement)
  (unless_statement)
  (collection_loop)
  (nav_loop)
  (taxonomy_loop)
  (form_loop)
] @indent

;; Decrease indent at specific keywords
[
  "endif"
  "endunless"
  "else"
  "elseif"
] @outdent