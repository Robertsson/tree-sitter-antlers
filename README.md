# Tree-sitter Antlers

Tree-sitter grammar for the Antlers templating language used by Statamic CMS.

## Features

| Feature | Status | Notes |
| --- | --- | --- |
| **Variables** | ✅ | Simple, nested, and array access are supported. |
| **Comments** | ✅ | Both `{{# ... #}}` and `{{!-- ... --}}` styles are supported. |
| **Data Types** | ✅ | Strings, numbers (including hex and octal), and booleans are supported. |
| **Operators** | ⚠️ | Most arithmetic, comparison, and logical operators are supported, but there are some precedence issues with `or`. |
| **Control Structures**| ✅ | `if`, `elseif`, `else`, and `unless` are supported. |
| **Loops** | ✅ | `collection`, `nav`, `taxonomy`, and `form` loops are supported. |
| **Modifiers** | ✅ | Modifiers with and without parameters are supported. |
| **PHP Integration** | ✅ | `{{? ... ?}}` and `{{$ ... $}}` are supported. |
| **Interpolation** | ✅ | Interpolation in parameters is supported. |
| **Multi-statements**| ✅ | Multiple statements separated by semicolons are supported. |
| **Array Methods** | ✅ | Array methods like `orderby`, `groupby`, etc. are supported. |
| **Specialized Tags**| ✅ | Most specialized tags like `cache`, `session`, `markdown`, etc. are supported. |

### Parser Status

- **~80% Antlers specification coverage**
- **Comprehensive syntax highlighting and editor support**

## Installation

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

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [Tree-sitter](https://tree-sitter.github.io/) - Incremental parsing library
- [Antlers](https://statamic.dev/antlers) - Statamic's templating language
- [Statamic CMS](https://statamic.com/) - The CMS that uses Antlers
