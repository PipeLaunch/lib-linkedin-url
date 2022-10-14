"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generic_1 = require("../core/generic");
describe("extractLinkedInSubdomain", () => {
    it("no tld", () => {
        expect((0, generic_1.extractLinkedInSubdomain)("https://linkedin.com/company/test")).toEqual("");
        expect((0, generic_1.extractLinkedInSubdomain)("https://www.linkedin.com/company/test")).toEqual("");
    });
    it("with tld", () => {
        expect((0, generic_1.extractLinkedInSubdomain)("https://de.linkedin.com/company/test")).toEqual("de");
        expect((0, generic_1.extractLinkedInSubdomain)("HTTPS://DE.LINKEDIN.COM/COMPANY/TEST")).toEqual("de");
    });
});
describe("extractCountryName", () => {
    it("no tld", () => {
        expect((0, generic_1.extractCountryName)("https://linkedin.com/company/test")).toEqual("");
        expect((0, generic_1.extractCountryName)("https://www.linkedin.com/company/test")).toEqual("");
    });
    it("with tld", () => {
        expect((0, generic_1.extractCountryName)("https://de.linkedin.com/company/test")).toEqual("Germany");
    });
});
//# sourceMappingURL=generic.test.js.map