"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const urls_1 = require("../utils/urls");
describe("addHttpsIfMissing", () => {
    it("should add the protocol", () => {
        expect((0, urls_1.addHttpsIfMissing)("www.pipelaunch.com")).toEqual("https://www.pipelaunch.com");
    });
    it("not need to add the protocol", () => {
        expect((0, urls_1.addHttpsIfMissing)("http://www.pipelaunch.com")).toEqual("http://www.pipelaunch.com");
        expect((0, urls_1.addHttpsIfMissing)("https://www.pipelaunch.com")).toEqual("https://www.pipelaunch.com");
    });
    it("invalid", () => {
        expect((0, urls_1.addHttpsIfMissing)("")).toEqual("");
    });
});
describe("cleanUrl", () => {
    it("clean", () => {
        expect((0, urls_1.cleanUrl)("pipelaunch.com/test?test=true")).toEqual("pipelaunch.com");
    });
    it("invalid", () => {
        expect((0, urls_1.cleanUrl)("")).toEqual("");
    });
});
//# sourceMappingURL=utils.test.js.map