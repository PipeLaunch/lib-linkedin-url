import { extractLinkedInSubdomain, extractCountryName } from "../core/generic";

describe("extractLinkedInSubdomain", () => {
  it("no tld", () => {
    expect(
      extractLinkedInSubdomain("https://linkedin.com/company/test")
    ).toEqual("");

    expect(
      extractLinkedInSubdomain("https://www.linkedin.com/company/test")
    ).toEqual("");
  });

  it("with tld", () => {
    expect(
      extractLinkedInSubdomain("https://de.linkedin.com/company/test")
    ).toEqual("de");

    expect(
      extractLinkedInSubdomain("HTTPS://DE.LINKEDIN.COM/COMPANY/TEST")
    ).toEqual("de");
  });
});

describe("extractCountryName", () => {
  it("no tld", () => {
    expect(extractCountryName("https://linkedin.com/company/test")).toEqual("");

    expect(extractCountryName("https://www.linkedin.com/company/test")).toEqual(
      ""
    );
  });

  it("with tld", () => {
    expect(extractCountryName("https://de.linkedin.com/company/test")).toEqual(
      "Germany"
    );
  });
});
