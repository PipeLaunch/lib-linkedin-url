"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const companyProfiles_1 = require("../core/companyProfiles");
describe("isValidCompanyLinkedInProfileUrl", () => {
    it("valid", () => {
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("https://linkedin.com/company/test")).toBeTruthy();
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("http://linkedin.com/company/test")).toBeTruthy();
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("linkedin.com/company/test")).toBeTruthy();
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("http://www.linkedin.com/company/test")).toBeTruthy();
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("HTTP://WWW.LINKEDIN.COM/COMPANY/TEST")).toBeTruthy();
    });
    it("invalid", () => {
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("linkedin.com/in/test")).toBeFalsy();
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("www.test.com/in/test")).toBeFalsy();
    });
});
describe("generateCanonicalCompanyLinkedInProfileUrl", () => {
    it("normal", () => {
        const url = "https://linkedin.com/company/test";
        expect((0, companyProfiles_1.generateCanonicalCompanyLinkedInProfileUrl)("https://linkedin.com/company/test")).toEqual(url);
        expect((0, companyProfiles_1.generateCanonicalCompanyLinkedInProfileUrl)("https://linkedin.com/company/TEST")).toEqual(url);
        expect((0, companyProfiles_1.generateCanonicalCompanyLinkedInProfileUrl)("https://linkedin.com/company/test?test=1")).toEqual(url);
    });
    it("with tld", () => {
        expect((0, companyProfiles_1.generateCanonicalCompanyLinkedInProfileUrl)("https://de.linkedin.com/company/test", { keepTld: true })).toEqual("https://de.linkedin.com/company/test");
        expect((0, companyProfiles_1.generateCanonicalCompanyLinkedInProfileUrl)("https://www.linkedin.com/company/TEST", { keepTld: true })).toEqual("https://www.linkedin.com/company/test");
        expect((0, companyProfiles_1.generateCanonicalCompanyLinkedInProfileUrl)("https://linkedin.com/company/TEST", { keepTld: true })).toEqual("https://www.linkedin.com/company/test");
    });
});
describe("extractCompanyLinkedInProfileName", () => {
    it("valid", () => {
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://linkedin.com/company/test")).toEqual("test");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://linkedin.com/company/TEST?test=1")).toEqual("TEST");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://linkedin.com/company/test#home")).toEqual("test");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://linkedin.com/company/test/10/1")).toEqual("test");
    });
    it("invalid", () => {
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://linkedin.com/in/test")).toEqual("");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://www.linkedin2com/company/test")).toEqual("");
    });
});
//# sourceMappingURL=companyProfiles.test.js.map