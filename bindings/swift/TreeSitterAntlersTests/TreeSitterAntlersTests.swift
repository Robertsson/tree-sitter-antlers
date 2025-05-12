import XCTest
import SwiftTreeSitter
import TreeSitterAntlers

final class TreeSitterAntlersTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_antlers())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Antlers grammar")
    }
}
