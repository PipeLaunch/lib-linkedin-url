import { addHttpsIfMissing, cleanUrl } from "../utils/urls";

describe("addHttpsIfMissing", () => {
  it("should add the protocol", () => {
    expect(addHttpsIfMissing("www.pipelaunch.com")).toEqual(
      "https://www.pipelaunch.com"
    );
  });

  it("not need to add the protocol", () => {
    expect(addHttpsIfMissing("http://www.pipelaunch.com")).toEqual(
      "http://www.pipelaunch.com"
    );
    expect(addHttpsIfMissing("https://www.pipelaunch.com")).toEqual(
      "https://www.pipelaunch.com"
    );
  });

  it("invalid", () => {
    expect(addHttpsIfMissing("")).toEqual("");
  });
});

describe("cleanUrl", () => {
  it("clean", () => {
    expect(cleanUrl("pipelaunch.com/test?test=true")).toEqual("pipelaunch.com");
  });

  it("invalid", () => {
    expect(cleanUrl("")).toEqual("");
  });
});
