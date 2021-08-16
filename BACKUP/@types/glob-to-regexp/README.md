# Installation
> `npm install --save @types/glob-to-regexp`

# Summary
This package contains type definitions for glob-to-regexp (https://github.com/fitzgen/glob-to-regexp#readme).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/glob-to-regexp.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/glob-to-regexp/index.d.ts)
````ts
// Type definitions for glob-to-regexp 0.4
// Project: https://github.com/fitzgen/glob-to-regexp#readme
// Definitions by: whatasoda <https://github.com/whatasoda>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export as namespace GlobToRegExp;

export = GlobToRegExp;

declare function GlobToRegExp(glob: string, options?: GlobToRegExp.Options): RegExp;

declare namespace GlobToRegExp {
    interface Options {
        extended?: boolean | undefined;
        globstar?: boolean | undefined;
        flags   ?: string | undefined;
    }
}

````

### Additional Details
 * Last updated: Tue, 06 Jul 2021 20:33:05 GMT
 * Dependencies: none
 * Global values: `GlobToRegExp`

# Credits
These definitions were written by [whatasoda](https://github.com/whatasoda).