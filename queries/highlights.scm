(identifier) @variable

((identifier) @constant
 (#match? @constant "^[A-Z][A-Z\\d_]*$"))

"if" @keyword.conditional
"else" @keyword
"for" @keyword.repeat
"in" @keyword
"while" @keyword.repeat
"repeat" @keyword.repeat
"until" @keyword.repeat
"match" @keyword
"case" @keyword
"of" @keyword
"return" @keyword.return
"break" @keyword
"continue" @keyword
"return" @keyword
"local" @keyword
"method" @keyword
"shared" @keyword
"where" @keyword
"yield" @keyword.return
"async" @keyword.coroutine
"is" @keyword.operator
"isnot" @keyword.operator
"and" @keyword.operator
"or" @keyword.operator
"not" @keyword.operator
"inherit" @keyword
"new" @keyword


"<-" @operator
"+" @operator
"-" @operator
"*" @operator
"/" @operator
"%" @operator
"//" @operator
":=" @operator
"<<" @operator
"->" @operator
"=>" @operator
"=" @operator
">" @operator
">=" @operator
"<" @operator
"<=" @operator
"==" @operator
"!=" @operator
"===" @operator
"!==" @operator
"&&" @operator
"||" @operator
"!" @operator
"$" @operator

"." @punctuation.delimiter
";" @punctuation.delimiter
"," @punctuation.delimiter
":" @punctuation.delimiter

"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket

(string) @string

(nil) @constant.builtin
(true) @boolean
(false) @boolean
(float) @number
(integer) @number
(wildcard) @character.special
(vararg) @string.special

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (dot_expression
              field: (identifier) @function.method.call))

(local_statement
  name: (identifier) @function
  [
    (closure)
    (closure_body)
  ])

(method_statement
  name: (dot_expression
          (identifier) @function.method)
  implementation: [
    (closure)
    (closure_body)
  ])

(dot_expression
  field: (identifier) @property)

(tuple
  "(" @punctuation.special
  ")" @punctuation.special)

(comment) @comment
