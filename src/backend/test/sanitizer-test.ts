import * as chai from "chai";
import { suite, test } from "mocha-typescript";
import { Sanitizer } from "../src/services/sanitizer";

const should = chai.should();

@suite
class SanitizerTest {
  private sanitizer: Sanitizer = new Sanitizer();

  public before() {
    this.sanitizer = new Sanitizer();
  }

  @test("sanitizeMap should properly sanitize data")
  public sanitizeMapTest() {
    // Data
    const SAN_MAP = {
      first: Number,
      second: Boolean,
      third: (val: any) => val,
      fifth: Number,
      sixth: Boolean
    };

    const DATA_MAP = {
      first: "123",
      second: "stuff",
      third: {hello: "moto"},
      fourth: "ignore me",
      fifth: "invalid number",
      sixth: 0
    };

    const EXPECTED_RESULTS = {
      first: 123,
      second: true,
      third: {hello: "moto"},
      fifth: NaN,
      sixth: false
    };

    // Test
    const results = this.sanitizer.sanitizeMap(SAN_MAP, DATA_MAP);

    // Assert
    results.should.deep.equal(EXPECTED_RESULTS);
  }

  @test("sanitize should properly sanitize strings")
  public sanitizeTest() {
    // Data - some trivial examples of SQL injection and XSS attacks
    const DATA_STRINGS = [
      "$username = 1' or '1' = '1'))/*",
      "$username = 1' or '1' = '1",
      "<body onload=alert('test1')>",
      "<IMG SRC=j&#X41vascript:alert('test2')>"
    ];

    const EXPECTED_RESULTS = [
      "$username = 1&#39; or &#39;1&#39; = &#39;1&#39;))&#x2F;*",
      "$username = 1&#39; or &#39;1&#39; = &#39;1",
      "&lt;body onload=alert(&#39;test1&#39;)&gt;",
      "&lt;IMG SRC=j&amp;#X41vascript:alert(&#39;test2&#39;)&gt;"
    ];

    // Test
    const results = DATA_STRINGS.map((val, idx, arr) => this.sanitizer.sanitize(val));

    // Assert
    results.should.deep.equal(EXPECTED_RESULTS);
  }

  @test("sanitize should throw on non-string input")
  public sanitizeThrowTest() {
    const boundFunc = this.sanitizer.sanitize.bind(this, {} as any);
    should.throw(boundFunc);
  }
}
