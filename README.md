# Tree-sitter Antlers

Tree-sitter grammar for the Antlers templating language used by Statamic CMS.

## Features

### Antlers Syntax Support

**Core Features:**
- **Variables**: `{{ title }}`, `{{ author:name }}`, `{{ content:meta:description }}`, `{{ $variable }}`
- **Array access**: `{{ items[0] }}`, `{{ users[key] }}`, `{{ products["featured"] }}`
- **Comments**: `{{# comment #}}`, `{{!-- comment --}}`
- **All data types**: Strings, numbers, booleans with full format support

**Advanced Operators:**
- **Ternary**: `{{ condition ? 'true' : 'false' }}`
- **Null coalescing**: `{{ var ?? 'default' }}`
- **Assignment**: `{{ a += b }}`, `{{ x *= 2 }}`, `{{ y ?= z }}`
- **Logical**: `&&`, `||`, `and`, `or`, `xor` -- Issue with or statement
- **All comparison and arithmetic operators**

**Template Features:**
- **Control structures**: `{{ if }}...{{ /if }}`, `{{ unless }}...{{ /unless }}`
- **All collection types**: `{{ collection:blog }}`, `{{ nav:main }}`, `{{ taxonomy:tags }}`
- **Template composition**: `{{ slot:header }}`, `{{ push:scripts }}`, `{{ once }}`
- **Modifiers**: `{{ title | uppercase }}` with parameters
- **PHP integration**: `{{? raw_php ?}}`, `{{$ echo_php $}}`

**Advanced Syntax:**
- **Interpolation**: `{{ collection limit="{count ?? 10}" }}`
- **Multi-statements**: `{{ expr1; expr2; expr3 }}`
- **Array methods**: `{{ data.orderby() }}`, `{{ items.where() }}`
- **All specialized tags**: `{{ cache }}`, `{{ session }}`, `{{ markdown }}`, etc.

### Parser Status

- **~50% Antlers specification coverage**
- **Comprehensive syntax highlighting and editor support**

## Installation

### Prerequisites

- Node.js (for Tree-sitter CLI)
- Tree-sitter CLI: `npm install -g tree-sitter-cli`

### Building the Parser

1. **Clone the repository:**
```bash
git clone https://github.com/Robertsson/tree-sitter-antlers.git
cd tree-sitter-antlers
```

2. **Install dependencies:**
```bash
npm install
```

3. **Generate the parser:**
```bash
tree-sitter generate
```

4. **Test the parser:**
```bash
tree-sitter test
```

5. **Test working functionality:**
```bash
tree-sitter test --include "Simple variables|Variables with colons|Comments"
```

## Usage

### Basic Template Testing

Create a test file `example.antlers.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>{{ title }}</title>
</head>
<body>
    <h1>{{ site_name }}</h1>
    
    {{# Display author information #}}
    <p>By {{ author:name }}</p>
    
    {{!-- Main content area --}}
    <div class="content">
        {{ content:body }}
    </div>
    
    {{ if featured }}
        <div class="featured-badge">Featured</div>
    {{ endif }}
    
    {{ collection from="related" }}
        <a href="{{ url }}">{{ title }}</a>
    {{ /collection }}
</body>
</html>
```

Test parsing:
```bash
tree-sitter parse example.antlers.html
```

### Interactive Development

Use Tree-sitter playground for interactive grammar development:
```bash
tree-sitter playground
```

### Quick Development Workflow

1. **Edit grammar**: Modify `grammar.js`
2. **Regenerate parser**: `tree-sitter generate`
3. **Test changes**: `tree-sitter test`
4. **Debug issues**: `tree-sitter playground`


### Testing

Run specific test suites:
```bash
# Test working features only
tree-sitter test --include "Simple variables|Variables with colons|Comments"

# Test specific file
tree-sitter test --file-name basic-syntax.txt

# Update test expectations
tree-sitter test --update
```

## Query Files

### Syntax Highlighting (`queries/highlights.scm`)

Provides comprehensive syntax highlighting for:
- Variables and identifiers
- Control structure keywords
- Comments and strings
- Operators and delimiters
- Tag names and parameters

### Code Structure (`queries/folds.scm`, `queries/indents.scm`)

- **Folding**: Block structures like if/endif, collection loops
- **Indentation**: Proper indentation for nested structures

### Navigation (`queries/tags.scm`)

Symbol extraction for:
- Variable references
- Tag definitions
- Control structure blocks


## Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make changes and test**
4. **Update test corpus as needed**
5. **Submit a pull request**

### Grammar Changes

When modifying the grammar:

1. Update `grammar.js`
2. Run `tree-sitter generate`
3. Update test corpus in `test/corpus/`
4. Verify all working tests still pass
5. Document any new limitations or features

### Test Corpus Maintenance

- Tests use Tree-sitter format with `===` separators
- Expected output should match actual parser output
- Use `tree-sitter test --update` to refresh expectations
- Document test changes in commit messages

## Performance

- **Parse rate**: ~85 bytes/ms for complex expressions
- **Memory usage**: Optimized for typical template sizes
- **Compatibility**: Works with Tree-sitter 0.20+

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [Tree-sitter](https://tree-sitter.github.io/) - Incremental parsing library
- [Antlers](https://statamic.dev/antlers) - Statamic's templating language
- [Statamic CMS](https://statamic.com/) - The CMS that uses Antlers

---

**Status**: Core functionality working, ready for editor integration with known limitations documented.