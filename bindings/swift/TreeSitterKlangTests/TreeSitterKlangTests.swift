import XCTest
import SwiftTreeSitter
import TreeSitterKlang

final class TreeSitterKlangTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_klang())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Klang grammar")
    }
}
