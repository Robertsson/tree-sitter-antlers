#!/bin/bash

echo "=== Checking Tree-sitter Test Results ==="

# Run tests and capture exit code
echo "Running tests..."
npm run test
exit_code=$?

echo ""
echo "Exit code: $exit_code"

if [ $exit_code -eq 0 ]; then
    echo "✅ SUCCESS: All tests passed! (Silent success)"
else
    echo "❌ FAILURE: Tests failed with exit code $exit_code"
fi

echo ""
echo "=== Running tests ==="
tree-sitter test 

echo ""
echo "=== Test file count ==="
find test/corpus -name "*.txt" | wc -l
echo "test files found"

echo ""
echo "=== Listing test files ==="
ls -la test/corpus/