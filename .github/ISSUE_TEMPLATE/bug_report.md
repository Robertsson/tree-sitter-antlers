---
name: Bug report
about: Create a report to help us improve the parser
title: ''
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**Antlers Template Code**
Provide the minimal Antlers template code that reproduces the issue:

```antlers
{{ your_template_code_here }}
```

**Expected behavior**
A clear and concise description of what you expected to happen.

**Actual behavior**
A clear and concise description of what actually happened.

**Parser output (if applicable)**
If you can run `tree-sitter parse`, please include the output:

```
(paste tree-sitter parse output here)
```

**Environment:**
 - Tree-sitter version: [e.g. 0.20.8]
 - Node.js version: [e.g. 18.17.0]
 - OS: [e.g. macOS 13.4, Ubuntu 22.04, Windows 11]
 - Editor (if applicable): [e.g. Neovim, VSCode, Zed]

**Additional context**
Add any other context about the problem here.

**Test case**
If possible, provide a test case in Tree-sitter corpus format:

```
==================
Test name
==================

{{ your_template_code }}

---

(expected_parse_tree
  (nodes_here))
```