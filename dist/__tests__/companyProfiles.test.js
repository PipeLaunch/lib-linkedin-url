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
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("http://linkedin.com/school/test")).toBeTruthy();
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("https://www.linkedin.com/company/%C3%A0-nous-la-lune-")).toBeTruthy();
    });
    it("invalid", () => {
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("linkedin.com/in/test")).toBeFalsy();
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("www.test.com/in/test")).toBeFalsy();
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("https://www.linkedin.com/company/")).toBeFalsy();
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("https://www.linkedin.com/school/")).toBeFalsy();
        expect((0, companyProfiles_1.isValidCompanyLinkedInProfileUrl)("https://www.linkedin.com/schol/test")).toBeFalsy();
    });
});
describe("isValidSchoolLinkedInProfileUrl", () => {
    it("valid", () => {
        expect((0, companyProfiles_1.isValidSchoolLinkedInProfileUrl)("https://linkedin.com/school/test")).toBeTruthy();
        expect((0, companyProfiles_1.isValidSchoolLinkedInProfileUrl)("http://linkedin.com/school/test")).toBeTruthy();
        expect((0, companyProfiles_1.isValidSchoolLinkedInProfileUrl)("linkedin.com/school/test")).toBeTruthy();
        expect((0, companyProfiles_1.isValidSchoolLinkedInProfileUrl)("http://www.linkedin.com/school/test")).toBeTruthy();
        expect((0, companyProfiles_1.isValidSchoolLinkedInProfileUrl)("HTTP://WWW.LINKEDIN.COM/school/TEST")).toBeTruthy();
        expect((0, companyProfiles_1.isValidSchoolLinkedInProfileUrl)("http://linkedin.com/school/test")).toBeTruthy();
    });
    it("invalid", () => {
        expect((0, companyProfiles_1.isValidSchoolLinkedInProfileUrl)("linkedin.com/in/test")).toBeFalsy();
        expect((0, companyProfiles_1.isValidSchoolLinkedInProfileUrl)("www.test.com/in/test")).toBeFalsy();
        expect((0, companyProfiles_1.isValidSchoolLinkedInProfileUrl)("https://www.linkedin.com/company/")).toBeFalsy();
        expect((0, companyProfiles_1.isValidSchoolLinkedInProfileUrl)("https://www.linkedin.com/schol/test")).toBeFalsy();
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
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://www.linkedin.com/company/中国投资有限责任公司/")).toEqual("中国投资有限责任公司");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://cn.linkedin.com/company/%E4%B8%AD%E5%9B%BD%E6%8A%95%E8%B5%84%E6%9C%89%E9%99%90%E8%B4%A3%E4%BB%BB%E5%85%AC%E5%8F%B8")).toEqual("%E4%B8%AD%E5%9B%BD%E6%8A%95%E8%B5%84%E6%9C%89%E9%99%90%E8%B4%A3%E4%BB%BB%E5%85%AC%E5%8F%B8");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://linkedin.com/company/test")).toEqual("test");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://linkedin.com/company/TEST?test=1")).toEqual("TEST");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://linkedin.com/company/test#home")).toEqual("test");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://linkedin.com/company/test/10/1")).toEqual("test");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://www.linkedin.com/company/")).toEqual("");
    });
    it("invalid", () => {
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://linkedin.com/in/test")).toEqual("");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://www.linkedin2com/company/test")).toEqual("");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://www.linkedin.com/company/")).toEqual("");
        expect((0, companyProfiles_1.extractCompanyLinkedInProfileName)("https://www.linkedin.com/company//")).toEqual("");
    });
});
//# sourceMappingURL=companyProfiles.test.js.map