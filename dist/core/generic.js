"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCountryName = exports.extractLinkedInSubdomain = void 0;
const tld_1 = require("./../utils/tld");
function extractLinkedInSubdomain(url) {
    var _a;
    if (typeof url !== "string" || !url) {
        return "";
    }
    url = url.toLowerCase();
    const regex = /(?:^https:\/\/)(..)(?:\.linkedin\.com\/)/i;
    const match = url.match(regex);
    if (match && match.length === 2) {
        return (_a = match[1]) !== null && _a !== void 0 ? _a : "";
    }
    return "";
}
exports.extractLinkedInSubdomain = extractLinkedInSubdomain;
function extractCountryName(url) {
    if (typeof url !== "string" || !url) {
        return "";
    }
    const tld = extractLinkedInSubdomain(url);
    if (!tld) {
        return "";
    }
    const find = tld_1.TLD_TABLE.find((item) => item.t === tld);
    if (find) {
        return find.c;
    }
    return "";
}
exports.extractCountryName = extractCountryName;
//# sourceMappingURL=generic.js.map