import {
  isValidCompanyLinkedInProfileUrl,
  generateCanonicalCompanyLinkedInProfileUrl,
  extractCompanyLinkedInProfileName,
} from "../core/companyProfiles";

describe("isValidCompanyLinkedInProfileUrl", () => {
  it("valid", () => {
    expect(
      isValidCompanyLinkedInProfileUrl("https://linkedin.com/company/test")
    ).toBeTruthy();

    expect(
      isValidCompanyLinkedInProfileUrl("http://linkedin.com/company/test")
    ).toBeTruthy();

    expect(
      isValidCompanyLinkedInProfileUrl("linkedin.com/company/test")
    ).toBeTruthy();

    expect(
      isValidCompanyLinkedInProfileUrl("http://www.linkedin.com/company/test")
    ).toBeTruthy();

    expect(
      isValidCompanyLinkedInProfileUrl("HTTP://WWW.LINKEDIN.COM/COMPANY/TEST")
    ).toBeTruthy();
  });

  it("invalid", () => {
    expect(
      isValidCompanyLinkedInProfileUrl("linkedin.com/in/test")
    ).toBeFalsy();

    expect(
      isValidCompanyLinkedInProfileUrl("www.test.com/in/test")
    ).toBeFalsy();
  });
});

describe("generateCanonicalCompanyLinkedInProfileUrl", () => {
  it("normal", () => {
    const url = "https://linkedin.com/company/test";

    expect(
      generateCanonicalCompanyLinkedInProfileUrl(
        "https://linkedin.com/company/test"
      )
    ).toEqual(url);

    expect(
      generateCanonicalCompanyLinkedInProfileUrl(
        "https://linkedin.com/company/TEST"
      )
    ).toEqual(url);

    expect(
      generateCanonicalCompanyLinkedInProfileUrl(
        "https://linkedin.com/company/test?test=1"
      )
    ).toEqual(url);
  });

  it("with tld", () => {
    expect(
      generateCanonicalCompanyLinkedInProfileUrl(
        "https://de.linkedin.com/company/test",
        { keepTld: true }
      )
    ).toEqual("https://de.linkedin.com/company/test");

    expect(
      generateCanonicalCompanyLinkedInProfileUrl(
        "https://www.linkedin.com/company/TEST",
        { keepTld: true }
      )
    ).toEqual("https://www.linkedin.com/company/test");

    expect(
      generateCanonicalCompanyLinkedInProfileUrl(
        "https://linkedin.com/company/TEST",
        { keepTld: true }
      )
    ).toEqual("https://www.linkedin.com/company/test");
  });
});

describe("extractCompanyLinkedInProfileName", () => {
  it("valid", () => {
    expect(
      extractCompanyLinkedInProfileName("https://linkedin.com/company/test")
    ).toEqual("test");

    expect(
      extractCompanyLinkedInProfileName(
        "https://linkedin.com/company/TEST?test=1"
      )
    ).toEqual("TEST");

    expect(
      extractCompanyLinkedInProfileName(
        "https://linkedin.com/company/test#home"
      )
    ).toEqual("test");

    expect(
      extractCompanyLinkedInProfileName(
        "https://linkedin.com/company/test/10/1"
      )
    ).toEqual("test");
  });

  it("invalid", () => {
    expect(
      extractCompanyLinkedInProfileName("https://linkedin.com/in/test")
    ).toEqual("");
  });
});
