"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUrl = exports.addHttpsIfMissing = void 0;
function addHttpsIfMissing(url) {
    if (typeof url !== "string" || !url) {
        return "";
    }
    const regex = /^https?:\/\//gi;
    if (url.match(regex)) {
        return url;
    }
    return `https://${url}`;
}
exports.addHttpsIfMissing = addHttpsIfMissing;
function cleanUrl(url) {
    if (typeof url !== "string" || !url) {
        return "";
    }
    const clean = url
        .replace(/\?.*$/, "")
        .replace(/\/.*$/, "")
        .replace(/#.*$/, "");
    return clean.toString();
}
exports.cleanUrl = cleanUrl;
//# sourceMappingURL=urls.js.map