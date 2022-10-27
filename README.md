<br />
<div align="center">
  <pre>
    <br />
      <h1>Linkedin URL (beta)</h1>
  </pre>
    <br />
    <code><a href="https://github.com/PipeLaunch/lib-linkedin-url/network/members"
      ><img
        src="https://img.shields.io/github/forks/PipeLaunch/lib-linkedin-url?logo=github&label=Forks"
        target="_blank"
        alt="Forks" /></a
  ></code>
    <code><a href="https://github.com/PipeLaunch/lib-linkedin-url/issues"
      ><img
        src="https://img.shields.io/github/issues/PipeLaunch/lib-linkedin-url?logo=github&label=Issues"
        target="_blank"
        alt="Issues" /></a
  ></code>
    <code><a href="https://github.com/PipeLaunch/lib-linkedin-url/stargazers"
      ><img
        src="https://img.shields.io/github/stars/PipeLaunch/lib-linkedin-url?logo=github&label=Stars"
        target="_blank"
        alt="Stars" /></a
  ></code>
    <code><a href="https://github.com/PipeLaunch/lib-linkedin-url/blob/main/LICENSE"
      ><img
        src="https://img.shields.io/github/license/PipeLaunch/lib-linkedin-url?logo=githu&label=License"
        target="_blank"
        alt="License" /></a
  ></code>
    <code><a href="https://www.npmjs.com/package/lib-linkedin-url"
      ><img
        src="https://img.shields.io/npm/v/lib-linkedin-url?logo=npm&label=Npm"
        target="_blank"
        alt="Npm" /></a
  ></code>
</div>

<br />

### Utility library to work with LinkedIn profile URLs: get the canonical url, validate, etc.

## Features

- Supports multiple linkedIn URL formats (including the 'old' ones)
- Written in typescript
- Zero dependencies

## Installation

```sh
# Npm
npm install lib-linkedin-url

# Yarn
yarn add lib-linkedin-url
```

<br />

## Common usage

```js
import {
  extractCompanyLinkedInProfileName,
  isValidCompanyLinkedInProfileUrl,
} from "lib-linkedin-url";

console.log(
  extractCompanyLinkedInProfileName(
    "https://www.linkedin.com/company/pipelaunch/"
  )
);
// pipelaunch

console.log(
  isValidCompanyLinkedInProfileUrl(
    "https://www.linkedin.com/company/pipelaunch/"
  )
);
// true
```

## Features

### Extract the profile from a URL

```js
extractLinkedInProfileName("https://www.linkedin.com/company/pipelaunch/"); // -> pipelaunch

extractLinkedInProfileName("https://www.linkedin.com/in/user/"); // -> user

extractLinkedInProfileName("https://linkedin.com/in/UserR?view=1"); // -> user
```

### Validate LinkedIn profile URL

```js
isValidCompanyLinkedInProfileUrl("https://linkedin.com/company/test"); // -> true

isValidCompanyLinkedInProfileUrl("linkedin.com/in/test"); // -> false (is a not company profile)

isValidLinkedInProfileUrl("https://linkedin.com/in/test"); // -> true
```

## References

- https://stackoverflow.com/questions/8450403/how-to-validate-a-linkedin-public-profile-url

## License

[MIT](LICENSE)
