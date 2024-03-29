import {
  isValidCompanyLinkedInProfileUrl,
  generateCanonicalCompanyLinkedInProfileUrl,
  extractCompanyLinkedInProfileName,
  isValidSchoolLinkedInProfileUrl,
} from "../core/companyProfiles";

describe("isValidCompanyLinkedInProfileUrl", () => {
  it("valid", () => {
    expect(
      isValidCompanyLinkedInProfileUrl("https://linkedin.com/company/test")
    ).toBeTruthy();

    // https://www.linkedin.com/company/%E4%B8%AD%E5%9B%BD%E6%8A%95%E8%B5%84%E6%9C%89%E9%99%90%E8%B4%A3%E4%BB%BB%E5%85%AC%E5%8F%B8/?originalSubdomain=cn
    expect(
      isValidCompanyLinkedInProfileUrl(
        "https://cn.linkedin.com/company/%E4%B8%AD%E5%9B%BD%E6%8A%95%E8%B5%84%E6%9C%89%E9%99%90%E8%B4%A3%E4%BB%BB%E5%85%AC%E5%8F%B8"
      )
    ).toBeTruthy();

    expect(
      isValidCompanyLinkedInProfileUrl(
        "https://www.linkedin.com/company/microsoft/about/"
      )
    ).toBeTruthy();

    expect(
      isValidCompanyLinkedInProfileUrl(
        "https://www.linkedin.com/company/microsoft?feedView=all"
      )
    ).toBeTruthy();

    expect(
      isValidCompanyLinkedInProfileUrl(
        "https://www.linkedin.com/company/microsoft/posts/?feedView=all"
      )
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

    expect(
      isValidCompanyLinkedInProfileUrl("http://linkedin.com/school/test")
    ).toBeTruthy();

    expect(
      isValidCompanyLinkedInProfileUrl(
        "https://www.linkedin.com/company/à-nous-la-lune-"
      )
    ).toBeTruthy();
  });

  it("invalid", () => {
    expect(
      isValidCompanyLinkedInProfileUrl("linkedin.com/in/test")
    ).toBeFalsy();

    expect(
      isValidCompanyLinkedInProfileUrl("www.test.com/in/test")
    ).toBeFalsy();

    expect(
      isValidCompanyLinkedInProfileUrl("https://www.linkedin.com/company/")
    ).toBeFalsy();

    // expect(
    //   isValidCompanyLinkedInProfileUrl("https://www.linkedin.com/company/%")
    // ).toBeFalsy();

    expect(
      isValidCompanyLinkedInProfileUrl("https://www.linkedin.com/school/")
    ).toBeFalsy();

    expect(
      isValidCompanyLinkedInProfileUrl("https://www.linkedin.com/schol/test")
    ).toBeFalsy();
  });
});

describe("isValidSchoolLinkedInProfileUrl", () => {
  it("valid", () => {
    expect(
      isValidSchoolLinkedInProfileUrl("https://linkedin.com/school/test")
    ).toBeTruthy();

    expect(
      isValidSchoolLinkedInProfileUrl("http://linkedin.com/school/test")
    ).toBeTruthy();

    expect(
      isValidSchoolLinkedInProfileUrl("linkedin.com/school/test")
    ).toBeTruthy();

    expect(
      isValidSchoolLinkedInProfileUrl("http://www.linkedin.com/school/test")
    ).toBeTruthy();

    expect(
      isValidSchoolLinkedInProfileUrl("HTTP://WWW.LINKEDIN.COM/school/TEST")
    ).toBeTruthy();

    expect(
      isValidSchoolLinkedInProfileUrl("http://linkedin.com/school/test")
    ).toBeTruthy();
  });

  it("invalid", () => {
    expect(isValidSchoolLinkedInProfileUrl("linkedin.com/in/test")).toBeFalsy();

    expect(isValidSchoolLinkedInProfileUrl("www.test.com/in/test")).toBeFalsy();

    expect(
      isValidSchoolLinkedInProfileUrl("https://www.linkedin.com/company/")
    ).toBeFalsy();

    expect(
      isValidSchoolLinkedInProfileUrl("https://www.linkedin.com/schol/test")
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
      extractCompanyLinkedInProfileName(
        "https://www.linkedin.com/company/中国投资有限责任公司/"
      )
    ).toEqual("中国投资有限责任公司");

    expect(
      extractCompanyLinkedInProfileName(
        "https://cn.linkedin.com/company/%E4%B8%AD%E5%9B%BD%E6%8A%95%E8%B5%84%E6%9C%89%E9%99%90%E8%B4%A3%E4%BB%BB%E5%85%AC%E5%8F%B8"
      )
    ).toEqual(
      "%E4%B8%AD%E5%9B%BD%E6%8A%95%E8%B5%84%E6%9C%89%E9%99%90%E8%B4%A3%E4%BB%BB%E5%85%AC%E5%8F%B8"
    );

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

    expect(
      extractCompanyLinkedInProfileName("https://www.linkedin.com/company/")
    ).toEqual("");
  });

  it("invalid", () => {
    expect(
      extractCompanyLinkedInProfileName("https://linkedin.com/in/test")
    ).toEqual("");

    expect(
      extractCompanyLinkedInProfileName("https://www.linkedin2com/company/test")
    ).toEqual("");

    expect(
      extractCompanyLinkedInProfileName("https://www.linkedin.com/company/")
    ).toEqual("");

    expect(
      extractCompanyLinkedInProfileName("https://www.linkedin.com/company//")
    ).toEqual("");
  });
});
