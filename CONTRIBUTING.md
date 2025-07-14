# Contributing to Tree-sitter Antlers

Thank you for your interest in contributing to the Tree-sitter Antlers parser! This document provides guidelines and information for contributors.

## Overview

This project implements a Tree-sitter grammar for the Antlers templating language used by Statamic CMS. The parser focuses on reliable parsing of core Antlers features while documenting limitations imposed by Tree-sitter's LR parser architecture.

## Getting Started

### Prerequisites

- **Node.js** (v14+) for Tree-sitter CLI
- **Tree-sitter CLI**: `npm install -g tree-sitter-cli`
- **Git** for version control
- **Basic understanding** of Tree-sitter grammars and Antlers syntax

### Development Setup

1. **Fork and clone the repository**:
```bash
git clone https://github.com/yourusername/tree-sitter-antlers.git
cd tree-sitter-antlers
```

2. **Install dependencies**:
```bash
npm install
```

3. **Generate initial parser**:
```bash
tree-sitter generate
```

4. **Run tests**:
```bash
tree-sitter test
```

5. **Set up development workflow** (see [`DEVELOPMENT.md`](./DEVELOPMENT.md))

## How to Contribute

### 1. Reporting Issues

Before creating an issue, please:

- Check existing issues to avoid duplicates
- Test with the latest version
- Provide minimal reproduction examples

#### Bug Reports

Include the following information:

```markdown
**Antlers Template Example:**
```antlers
{{ your_template_code_here }}
```

**Expected behavior:**
[Describe what should happen]

**Actual behavior:**
[Describe what actually happens]

**Parser output:**
```
[Include tree-sitter parse output if relevant]
```

**Environment:**
- Tree-sitter version: [version]
- Node.js version: [version]
- Operating system: [OS]
```

#### Feature Requests

For new Antlers syntax support:

- Reference official Antlers documentation
- Provide real-world usage examples
- Consider Tree-sitter LR parser limitations
- Suggest implementation approach if possible

### 2. Code Contributions

#### Workflow

1. **Create a feature branch**:
```bash
git checkout -b feature/your-feature-name
```

2. **Make changes following guidelines below**

3. **Test thoroughly**:
```bash
tree-sitter generate
tree-sitter test
```

4. **Update documentation as needed**

5. **Commit with descriptive messages**:
```bash
git commit -m "Add support for [feature]: brief description

- Specific change 1
- Specific change 2
- Update test corpus for new feature"
```

6. **Push and create pull request**

#### Pull Request Guidelines

- **Title**: Clear, descriptive summary of changes
- **Description**: Explain what changes were made and why
- **Testing**: Include evidence that changes work correctly
- **Documentation**: Update relevant docs for new features
- **Breaking changes**: Clearly mark any breaking changes

## Grammar Development Guidelines

### Core Principles

1. **Reliability over completeness**: Better to have working basic features than broken advanced ones
2. **Clear limitations**: Document what doesn't work and why
3. **Test coverage**: Every feature should have test cases
4. **Performance awareness**: Consider parsing speed and memory usage

### Grammar Structure

The grammar is organized into these sections:

```javascript
// grammar.js structure
module.exports = grammar({
  name: 'antlers',
  
  rules: {
    // Core document structure
    source: $ => repeat(choice($.text, $.antlers_tag, $.antlers_comment)),
    
    // Antlers-specific rules
    antlers_tag: $ => /* tag definitions */,
    antlers_comment: $ => /* comment definitions */,
    
    // Expression system
    expression: $ => /* expression rules */,
    
    // Control structures
    if_statement: $ => /* if/else/endif */,
    
    // Collection and data tags
    collection_loop: $ => /* collection loops */,
    
    // Literals and primitives
    variable: $ => /* variable patterns */,
    string: $ => /* string literals */,
    number: $ => /* number formats */,
  }
});
```

### Modifying the Grammar

#### 1. Understanding Current Limitations

Before making changes, understand these key limitations:

**Choice Precedence Issue**:
```javascript
// This creates ambiguity that Tree-sitter cannot resolve
expression: $ => choice(
  $.variable,           // Can match "title"
  $.variable_with_modifier  // Also wants to match "title | uppercase"
)
```

**Lexical Conflicts**:
```javascript
// Variable regex conflicts with keywords
variable: $ => /[a-zA-Z_][a-zA-Z0-9_.:]*/  // Matches "collection:blog"
directive_tag: $ => seq('collection', ':', $.variable)  // Never reached
```

#### 2. Making Grammar Changes

**Step-by-step process**:

1. **Understand the existing structure**:
```bash
tree-sitter playground  # Interactive exploration
```

2. **Make incremental changes**:
```javascript
// Good: Small, testable changes
variable: $ => choice(
  $.simple_variable,
  $.nested_variable
)

// Avoid: Large, complex changes that break everything
```

3. **Test immediately**:
```bash
tree-sitter generate
tree-sitter test --include "Simple variables"
```

4. **Debug issues**:
```bash
tree-sitter test --debug  # Detailed parsing info
tree-sitter playground    # Interactive debugging
```

#### 3. Grammar Best Practices

**Precedence and Associativity**:
```javascript
// Use explicit precedence for binary operators
expression: $ => choice(
  $.primary_expression,
  prec.left(1, seq($.expression, '+', $.expression)),
  prec.left(2, seq($.expression, '*', $.expression))
)
```

**Optional vs Choice**:
```javascript
// Good: Use optional for truly optional elements
tag: $ => seq('{{', optional($.whitespace), $.content, optional($.whitespace), '}}')

// Avoid: Using choice for optional elements
tag: $ => choice(
  seq('{{', $.content, '}}'),
  seq('{{', $.whitespace, $.content, '}}'),
  // ... many combinations
)
```

**Regex Patterns**:
```javascript
// Good: Specific, non-conflicting patterns
identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/
number: $ => /\d+(\.\d+)?/

// Avoid: Overly broad patterns that conflict
variable: $ => /[a-zA-Z_][a-zA-Z0-9_.:]*/ // Conflicts with keywords
```

## Test Development

### Test Corpus Structure

Tests use Tree-sitter's corpus format:

```
==================
Test name
==================

{{ template_code }}

---

(expected_parse_tree
  (nodes_here))
```

### Writing Good Tests

#### 1. Test Categories

- **Basic syntax**: Core features that must work
- **Edge cases**: Boundary conditions and unusual input
- **Error recovery**: How parser handles invalid syntax
- **Performance**: Large or complex templates

#### 2. Test Organization

```
test/corpus/
├── basic-syntax.txt      # Core working features
├── strings-numbers.txt   # Data types
├── control-structures.txt # If/else, loops
├── comments.txt          # Comment syntax
├── whitespace.txt        # Spacing variations
├── collections.txt       # Collection loops
├── navigation.txt        # Navigation features
├── taxonomy-forms.txt    # Taxonomy and forms
└── error-recovery.txt    # Error handling
```

#### 3. Maintaining Tests

**When grammar changes**:

1. **Run tests first**:
```bash
tree-sitter test
```

2. **Update failing tests**:
```bash
tree-sitter test --update
```

3. **Review changes manually**:
```bash
git diff test/corpus/
```

4. **Ensure changes are intentional**:
- New node types should be expected
- Lost functionality should be documented
- Structural changes should be justified

**Test quality guidelines**:

```
==================
Good test: Specific feature
==================

{{ author:name }}

---

(source
  (text)
  (antlers_tag
    (expression
      (primary_expression
        (variable))))
  (text))

==================
Avoid: Overly complex test
==================

{{ if author:name && featured || draft && admin:edit }}
  <div>{{ content | markdown | truncate:100 }}</div>
{{ else }}
  <span>{{ fallback | default:"None" }}</span>
{{ endif }}

// This test covers too many features and will break frequently
```

## Documentation Guidelines

### Required Documentation Updates

When adding features, update these files:

1. **`README.md`** - Overview and basic usage
2. **`SYNTAX_FEATURES.md`** - Detailed feature documentation
3. **`EDITOR_INTEGRATION.md`** - Editor-specific setup (if relevant)
4. **`ZED_INTEGRATION.md`** - Zed-specific instructions (if relevant)
5. **Test corpus files** - Comprehensive test coverage

### Documentation Standards

#### Feature Documentation

```markdown
### ✅ Feature Name

Description of the feature and its purpose.

```antlers
{{ example_syntax }}
{{ another:example }}
```

**Parser support**: ✅ Full support / ⚠️ Partial support / ❌ Not supported
**Test coverage**: ✅ Comprehensive / ⚠️ Basic / ❌ Missing
**Limitations**: [Describe any limitations]
**Workarounds**: [Provide alternatives if feature is limited]
```

#### API Documentation

- Use clear, consistent terminology
- Provide working examples
- Document parameters and return values
- Include error conditions and edge cases

## Release Process

### Version Management

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes to grammar or API
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, no new features

### Release Checklist

Before releasing a new version:

1. **Run full test suite**:
```bash
tree-sitter test
tree-sitter test --stat all  # Performance metrics
```

2. **Update documentation**:
- Version numbers in relevant files
- Changelog with new features and fixes
- Update feature support matrices

3. **Test editor integrations**:
- Verify query files work correctly
- Test with sample templates
- Check for regressions

4. **Performance validation**:
```bash
tree-sitter test --stat total-only
```

5. **Create release**:
- Tag version: `git tag v0.1.0`
- Push tags: `git push --tags`
- Create GitHub release with changelog

## Troubleshooting Common Issues

### Grammar Development Issues

#### "Unresolved conflict" errors

```bash
tree-sitter generate
# Error: Unresolved conflict for symbol 'variable'
```

**Solution approach**:
1. Identify conflicting rules
2. Use precedence declarations
3. Restructure grammar to avoid ambiguity
4. Consider alternative syntax approaches

#### "Reduce/reduce conflict" warnings

Tree-sitter generated parser but with warnings about conflicts.

**Investigation steps**:
```bash
tree-sitter generate --debug
tree-sitter test --debug-graph
open log.html  # View conflict graph
```

#### Test failures after grammar changes

**Systematic approach**:
1. Run specific test: `tree-sitter test --include "test_name"`
2. Check what changed: `tree-sitter test --update && git diff`
3. Verify changes are intentional
4. Update test expectations if correct

### Performance Issues

#### Slow parsing warnings

```bash
tree-sitter test
# Warning: Slow parse rate (85.825 bytes/ms)
```

**Optimization strategies**:
1. Simplify complex regex patterns
2. Reduce choice alternatives
3. Use precedence instead of many choices
4. Profile with larger test files

## Code Review Guidelines

### For Contributors

- **Self-review**: Check your own changes before submitting
- **Test coverage**: Ensure new features are tested
- **Documentation**: Update relevant documentation
- **Performance**: Consider impact on parsing speed

### For Reviewers

- **Functionality**: Does the change work as intended?
- **Tests**: Are there adequate tests for the changes?
- **Grammar quality**: Are the grammar rules well-structured?
- **Documentation**: Is documentation updated appropriately?
- **Breaking changes**: Are any breaking changes clearly marked?

## Community Guidelines

### Communication

- **Be respectful**: Treat all contributors with respect
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Grammar development can be complex and time-consuming
- **Ask questions**: Don't hesitate to ask for clarification

### Getting Help

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas
- **Documentation**: Check existing documentation first
- **Examples**: Provide minimal reproduction cases

## Advanced Topics

### Understanding Tree-sitter Internals

For complex grammar development, understanding Tree-sitter's LR parser:

- [Tree-sitter documentation](https://tree-sitter.github.io/)
- [LR parsing concepts](https://en.wikipedia.org/wiki/LR_parser)
- [Conflict resolution strategies](https://tree-sitter.github.io/tree-sitter/creating-parsers#precedence)

### Grammar Design Patterns

- **Layered approach**: Build simple features first, add complexity gradually
- **Error recovery**: Plan for malformed input handling
- **Performance considerations**: Avoid pathological parsing cases

### Query Development

For syntax highlighting and other editor features:

- [Tree-sitter queries documentation](https://tree-sitter.github.io/tree-sitter/using-parsers#pattern-matching-with-queries)
- [Query examples from other grammars](https://github.com/nvim-treesitter/nvim-treesitter/tree/master/queries)

---

Thank you for contributing to Tree-sitter Antlers! Your contributions help make Antlers template development better for everyone.