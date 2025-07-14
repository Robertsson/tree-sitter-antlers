#include <tree_sitter/parser.h>
#include <wctype.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>

enum TokenType {
  COLLECTION_KEYWORD,
  NAV_KEYWORD,
  TAXONOMY_KEYWORD,
  FORM_KEYWORD,
  IF_KEYWORD,
  UNLESS_KEYWORD,
  ENTRIES_KEYWORD
};

// Enhanced scanner state to track context
typedef struct {
  bool in_potential_block;
  char last_keyword[32];
  int brace_depth;
} ScannerState;

void *tree_sitter_antlers_external_scanner_create() {
  ScannerState *state = malloc(sizeof(ScannerState));
  state->in_potential_block = false;
  state->last_keyword[0] = '\0';
  state->brace_depth = 0;
  return state;
}

void tree_sitter_antlers_external_scanner_destroy(void *payload) {
  free(payload);
}

unsigned tree_sitter_antlers_external_scanner_serialize(void *payload, char *buffer) {
  ScannerState *state = (ScannerState *)payload;
  if (sizeof(ScannerState) > TREE_SITTER_SERIALIZATION_BUFFER_SIZE) return 0;
  memcpy(buffer, state, sizeof(ScannerState));
  return sizeof(ScannerState);
}

void tree_sitter_antlers_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
  ScannerState *state = (ScannerState *)payload;
  if (length == sizeof(ScannerState)) {
    memcpy(state, buffer, length);
  } else {
    state->in_potential_block = false;
    state->last_keyword[0] = '\0';
    state->brace_depth = 0;
  }
}

static bool scan_keyword(TSLexer *lexer, const char *keyword) {
  for (const char *c = keyword; *c; c++) {
    if (lexer->eof(lexer) || lexer->lookahead != *c) return false;
    lexer->advance(lexer, false);
  }
  return true;
}

static bool is_identifier_char(int32_t c) {
  return iswalnum(c) || c == '_';
}

// Enhanced lookahead to detect potential closing tags with variable matching
static bool has_potential_closing_tag(TSLexer *lexer, const char *keyword, const char *variable_name) {
  // Save current position
  TSLexer saved = *lexer;
  
  // Skip ahead looking for {{ / pattern followed by our keyword:variable
  int chars_read = 0;
  bool found_closing = false;
  
  while (!lexer->eof(lexer) && chars_read < 1000) { // Limit search
    if (lexer->lookahead == '{') {
      lexer->advance(lexer, false);
      chars_read++;
      if (!lexer->eof(lexer) && lexer->lookahead == '{') {
        lexer->advance(lexer, false);
        chars_read++;
        
        // Skip whitespace with proper counter increment
        while (!lexer->eof(lexer) && iswspace(lexer->lookahead) && chars_read < 1000) {
          lexer->advance(lexer, true);
          chars_read++;
        }
        
        // Check for closing tag: /keyword:variable
        if (!lexer->eof(lexer) && lexer->lookahead == '/') {
          lexer->advance(lexer, false);
          chars_read++;
          
          // Save position before trying to match keyword
          TSLexer keyword_start = *lexer;
          
          // Try to match the keyword
          if (scan_keyword(lexer, keyword) && !lexer->eof(lexer)) {
            // Check if there's a colon after the keyword
            if (lexer->lookahead == ':') {
              lexer->advance(lexer, false);
              // Now check if the variable name matches
              if (!lexer->eof(lexer) && scan_keyword(lexer, variable_name)) {
                // Make sure we're at the end of the variable name
                if (lexer->eof(lexer) || !is_identifier_char(lexer->lookahead)) {
                  found_closing = true;
                  break;
                }
              }
            }
          }
          // Reset to position after '/' and continue searching
          *lexer = keyword_start;
        }
      }
    }
    
    // Always advance to prevent infinite loop
    if (!lexer->eof(lexer)) {
      lexer->advance(lexer, false);
      chars_read++;
    } else {
      break;
    }
  }
  
  // Reset to original position
  *lexer = saved;
  
  return found_closing;
}

static bool scan_for_keyword(TSLexer *lexer, const char *keyword, enum TokenType token_type, const bool *valid_symbols, ScannerState *state) {
  if (!valid_symbols[token_type]) {
    return false;
  }

  // Save current position
  TSLexer saved_lexer = *lexer;
  
  // Try to match the keyword
  if (!scan_keyword(lexer, keyword)) {
    *lexer = saved_lexer;
    return false;
  }
  
  // Check that the keyword is followed by a non-identifier character
  if (is_identifier_char(lexer->lookahead)) {
    *lexer = saved_lexer;
    return false;
  }
  
  // For collection, nav, taxonomy, form, entries keywords
  if (token_type == COLLECTION_KEYWORD || token_type == NAV_KEYWORD || 
      token_type == TAXONOMY_KEYWORD || token_type == FORM_KEYWORD ||
      token_type == ENTRIES_KEYWORD) {
    
    if (lexer->lookahead == ':') {
      // Special case: form:errors should be handled by form_errors rule, not form_keyword
      if (token_type == FORM_KEYWORD) {
        // Check if followed by "errors"
        TSLexer temp_lexer = *lexer;
        temp_lexer.advance(&temp_lexer, false); // skip ':'
        if (scan_keyword(&temp_lexer, "errors")) {
          // This is form:errors, don't emit form_keyword token
          *lexer = saved_lexer;
          return false;
        }
      }
      
      // For colon syntax, we need to distinguish between:
      // 1. Loops: {{ nav:main }}...{{ /nav:main }} -> nav_keyword  
      // 2. Variables: {{ nav:main }} (single tag) -> variable (field access)
      // 
      // Strategy: Look ahead to see if there's a corresponding closing tag
      // If we find a closing tag, treat as keyword (loop construct)
      // If no closing tag found, treat as variable (single tag)
      
      // Extract the keyword string for lookahead
      const char *keyword_str = "";
      switch (token_type) {
        case NAV_KEYWORD: keyword_str = "nav"; break;
        case COLLECTION_KEYWORD: keyword_str = "collection"; break;
        case TAXONOMY_KEYWORD: keyword_str = "taxonomy"; break;
        case FORM_KEYWORD: keyword_str = "form"; break;
        case ENTRIES_KEYWORD: keyword_str = "entries"; break;
        default: keyword_str = ""; break;
      }
      
      // Extract the variable name after the colon
      TSLexer var_pos = *lexer;
      var_pos.advance(&var_pos, false); // skip ':'
      
      // Read the variable name into a buffer
      char variable_name[64] = {0};
      int var_len = 0;
      while (is_identifier_char(var_pos.lookahead) && var_len < 63) {
        variable_name[var_len++] = var_pos.lookahead;
        var_pos.advance(&var_pos, false);
      }
      variable_name[var_len] = '\0';
      
      // Use enhanced lookahead function to detect if this is a loop construct
      if (has_potential_closing_tag(lexer, keyword_str, variable_name)) {
        // Found potential closing tag - treat as keyword for loop construct
        lexer->result_symbol = token_type;
        lexer->mark_end(lexer);
        return true;
      } else {
        // No closing tag found - treat as variable for single tag
        *lexer = saved_lexer;
        return false;
      }
    } else if (iswspace(lexer->lookahead)) {
      // For directive keywords followed by whitespace, don't emit keyword tokens
      // This allows the grammar to use the variable + tag_parameters rule instead
      *lexer = saved_lexer;
      return false;
    } else {
      // Not followed by : or space, treat as regular variable
      *lexer = saved_lexer;
      return false;
    }
  }
  
  // For if, unless: must be followed by whitespace
  if (token_type == IF_KEYWORD || token_type == UNLESS_KEYWORD) {
    if (!iswspace(lexer->lookahead)) {
      *lexer = saved_lexer;
      return false;
    }
    lexer->result_symbol = token_type;
    lexer->mark_end(lexer);
    return true;
  }
  
  // Default case
  lexer->result_symbol = token_type;
  lexer->mark_end(lexer);
  return true;
}

bool tree_sitter_antlers_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  ScannerState *state = (ScannerState *)payload;
  
  // Skip whitespace at the beginning
  while (!lexer->eof(lexer) && iswspace(lexer->lookahead)) {
    lexer->advance(lexer, true);
  }
  
  
  // Try to match each keyword with enhanced context awareness
  if (scan_for_keyword(lexer, "collection", COLLECTION_KEYWORD, valid_symbols, state)) return true;
  if (scan_for_keyword(lexer, "nav", NAV_KEYWORD, valid_symbols, state)) return true;
  if (scan_for_keyword(lexer, "taxonomy", TAXONOMY_KEYWORD, valid_symbols, state)) return true;
  if (scan_for_keyword(lexer, "form", FORM_KEYWORD, valid_symbols, state)) return true;
  if (scan_for_keyword(lexer, "if", IF_KEYWORD, valid_symbols, state)) return true;
  if (scan_for_keyword(lexer, "unless", UNLESS_KEYWORD, valid_symbols, state)) return true;
  if (scan_for_keyword(lexer, "entries", ENTRIES_KEYWORD, valid_symbols, state)) return true;
  
  return false;
}