package tree_sitter_antlers_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_antlers "https.com//bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_antlers.Language())
	if language == nil {
		t.Errorf("Error loading Antlers grammar")
	}
}
