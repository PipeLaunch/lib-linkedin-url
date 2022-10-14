"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const personProfiles_1 = require("../core/personProfiles");
describe("isValidLinkedInProfileUrl", () => {
    it("valid", () => {
        expect((0, personProfiles_1.isValidLinkedInProfileUrl)("https://linkedin.com/in/test")).toBeTruthy();
        expect((0, personProfiles_1.isValidLinkedInProfileUrl)("http://linkedin.com/in/test")).toBeTruthy();
        expect((0, personProfiles_1.isValidLinkedInProfileUrl)("LINKEDIN.COM/IN/TEST")).toBeTruthy();
        expect((0, personProfiles_1.isValidLinkedInProfileUrl)("linkedin.com/in/test")).toBeTruthy();
        expect((0, personProfiles_1.isValidLinkedInProfileUrl)("https://linkedin.com/mwlite/in/test")).toBeTruthy();
        expect((0, personProfiles_1.isValidLinkedInProfileUrl)("https://linkedin.com/m/in/test")).toBeTruthy();
        expect((0, personProfiles_1.isValidLinkedInProfileUrl)("https://linkedin.com/pub/test/01/01", {
            numeric: true,
        })).toBeTruthy();
    });
    it("invalid", () => {
        expect((0, personProfiles_1.isValidLinkedInProfileUrl)("https://https://linkedin.com/in/test")).toBeFalsy();
        expect((0, personProfiles_1.isValidLinkedInProfileUrl)("linkedin.com/company/test")).toBeFalsy();
        expect((0, personProfiles_1.isValidLinkedInProfileUrl)("www.test.com/in/test")).toBeFalsy();
    });
});
describe("generateCanonicalLinkedInProfileUrl", () => {
    it("normal", () => {
        const url = "https://linkedin.com/in/test";
        expect((0, personProfiles_1.generateCanonicalLinkedInProfileUrl)("https://linkedin.com/in/test")).toEqual(url);
        expect((0, personProfiles_1.generateCanonicalLinkedInProfileUrl)("https://linkedin.com/in/TEST")).toEqual(url);
        expect((0, personProfiles_1.generateCanonicalLinkedInProfileUrl)("https://linkedin.com/in/test?test=1")).toEqual(url);
    });
    it("with tld", () => {
        expect((0, personProfiles_1.generateCanonicalLinkedInProfileUrl)("https://de.linkedin.com/in/test", {
            keepTld: true,
        })).toEqual("https://de.linkedin.com/in/test");
        expect((0, personProfiles_1.generateCanonicalLinkedInProfileUrl)("https://www.linkedin.com/in/TEST", {
            keepTld: true,
        })).toEqual("https://www.linkedin.com/in/test");
        expect((0, personProfiles_1.generateCanonicalLinkedInProfileUrl)("https://linkedin.com/in/TEST", {
            keepTld: true,
        })).toEqual("https://www.linkedin.com/in/test");
    });
});
describe("extractLinkedInProfileName", () => {
    it("valid", () => {
        expect((0, personProfiles_1.extractLinkedInProfileName)("https://linkedin.com/in/test")).toEqual("test");
        expect((0, personProfiles_1.extractLinkedInProfileName)("https://linkedin.com/in/TEST?test=1")).toEqual("TEST");
        expect((0, personProfiles_1.extractLinkedInProfileName)("https://linkedin.com/in/test#home")).toEqual("test");
        expect((0, personProfiles_1.extractLinkedInProfileName)("https://linkedin.com/in/test/10/1")).toEqual("test");
    });
    it("invalid", () => {
        expect((0, personProfiles_1.extractLinkedInProfileName)("https://linkedin.com/company/test")).toEqual("");
    });
});
//# sourceMappingURL=personProfiles.test.js.map