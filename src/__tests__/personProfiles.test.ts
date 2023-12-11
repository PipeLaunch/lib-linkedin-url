import {
  isValidLinkedInProfileUrl,
  generateCanonicalLinkedInProfileUrl,
  extractLinkedInProfileName,
} from "../core/personProfiles";

describe("isValidLinkedInProfileUrl", () => {
  it("valid", () => {
    expect(
      isValidLinkedInProfileUrl("https://linkedin.com/in/test")
    ).toBeTruthy();

    expect(
      isValidLinkedInProfileUrl("http://linkedin.com/in/test")
    ).toBeTruthy();

    expect(isValidLinkedInProfileUrl("LINKEDIN.COM/IN/TEST")).toBeTruthy();

    expect(isValidLinkedInProfileUrl("linkedin.com/in/test")).toBeTruthy();

    // expect(
    //   isValidLinkedInProfileUrl("https://linkedin.com/profile/view?id=test")
    // ).toBeTruthy();

    expect(
      isValidLinkedInProfileUrl("https://linkedin.com/mwlite/in/test")
    ).toBeTruthy();

    expect(
      isValidLinkedInProfileUrl("https://linkedin.com/m/in/test")
    ).toBeTruthy();

    expect(
      isValidLinkedInProfileUrl("https://linkedin.com/in/à-nous-la-lune-")
    ).toBeTruthy();

    expect(
      isValidLinkedInProfileUrl("https://linkedin.com/pub/test/01/01", {
        numeric: true,
      })
    ).toBeTruthy();
  });

  it("invalid", () => {
    expect(
      isValidLinkedInProfileUrl("https://https://linkedin.com/in/test")
    ).toBeFalsy();

    expect(isValidLinkedInProfileUrl("linkedin.com/company/test")).toBeFalsy();

    expect(isValidLinkedInProfileUrl("www.test.com/in/test")).toBeFalsy();
  });
});

describe("generateCanonicalLinkedInProfileUrl", () => {
  it("normal", () => {
    const url = "https://linkedin.com/in/test";

    expect(
      generateCanonicalLinkedInProfileUrl("https://linkedin.com/in/test")
    ).toEqual(url);

    expect(
      generateCanonicalLinkedInProfileUrl("https://linkedin.com/in/TEST")
    ).toEqual(url);

    expect(
      generateCanonicalLinkedInProfileUrl("https://linkedin.com/in/test?test=1")
    ).toEqual(url);
  });

  it("with tld", () => {
    expect(
      generateCanonicalLinkedInProfileUrl("https://de.linkedin.com/in/test", {
        keepTld: true,
      })
    ).toEqual("https://de.linkedin.com/in/test");

    expect(
      generateCanonicalLinkedInProfileUrl("https://www.linkedin.com/in/TEST", {
        keepTld: true,
      })
    ).toEqual("https://www.linkedin.com/in/test");

    expect(
      generateCanonicalLinkedInProfileUrl("https://linkedin.com/in/TEST", {
        keepTld: true,
      })
    ).toEqual("https://www.linkedin.com/in/test");
  });
});

describe("extractLinkedInProfileName", () => {
  it("valid", () => {
    expect(extractLinkedInProfileName("https://linkedin.com/in/test")).toEqual(
      "test"
    );

    expect(
      extractLinkedInProfileName("https://linkedin.com/in/TEST?test=1")
    ).toEqual("TEST");

    expect(
      extractLinkedInProfileName("https://linkedin.com/in/test#home")
    ).toEqual("test");

    expect(
      extractLinkedInProfileName("https://linkedin.com/in/test/10/1")
    ).toEqual("test");
  });

  it("invalid", () => {
    expect(
      extractLinkedInProfileName("https://linkedin.com/company/test")
    ).toEqual("");
  });
});
