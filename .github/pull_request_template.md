# Pull Request

## Description

Please provide a brief description of the changes in this PR.

## Type of Change

Please mark the relevant option:

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring (no functional changes)
- [ ] Test improvements

## Antlers Syntax Changes

If this PR changes Antlers syntax support, provide examples:

### New syntax supported:
```antlers
{{ new_syntax_example }}
```

### Modified behavior:
```antlers
{{ existing_syntax_that_changed }}
```

## Testing

Please describe the tests that you ran to verify your changes:

- [ ] Ran `tree-sitter generate` successfully
- [ ] Ran `tree-sitter test` and verified results
- [ ] Added new test cases to corpus (if applicable)
- [ ] Updated existing test cases (if applicable)
- [ ] Tested with real Antlers templates
- [ ] Verified editor integration still works

### Test Results

```bash
# Include relevant test output
tree-sitter test --include "relevant_tests"
```

## Grammar Changes

If you modified `grammar.js`, please explain:

### Rules added/modified:
- `rule_name`: Brief description of what it does

### Precedence changes:
- Explain any precedence modifications and why

### Performance impact:
- [ ] No performance impact expected
- [ ] Performance improvement expected
- [ ] Performance regression possible (explain below)

## Documentation

- [ ] Updated README.md (if needed)
- [ ] Updated SYNTAX_FEATURES.md (if adding/changing features)
- [ ] Updated EDITOR_INTEGRATION.md (if affecting editor support)
- [ ] Updated CONTRIBUTING.md (if changing development process)
- [ ] Added/updated code comments

## Query Files

If you modified query files (`queries/*.scm`):

- [ ] Updated `highlights.scm`
- [ ] Updated `indents.scm`
- [ ] Updated `folds.scm`
- [ ] Updated `tags.scm`
- [ ] Tested queries with sample templates

## Breaking Changes

If this is a breaking change, please describe:

### What breaks:
- Description of what no longer works

### Migration path:
- How users can update their code/configuration

### Deprecation notices:
- What should be marked as deprecated

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Related Issues

Closes #(issue_number)
Related to #(issue_number)

## Additional Notes

Add any additional notes for reviewers here.