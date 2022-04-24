import {
  parse,
  ParseOptions,
} from "https://deno.land/std@0.136.0/flags/mod.ts";
import { copy } from "https://deno.land/std@0.136.0/fs/mod.ts";
import { inc as increment } from "https://deno.land/x/semver@v1.4.0/mod.ts";
import { build, emptyDir } from "https://deno.land/x/dnt@0.22.0/mod.ts";

const NPM_NAME = "node-x12"

await emptyDir("./npm");
await copy("test/test-data", "npm/esm/test/test-data", { overwrite: true });
await copy("test/test-data", "npm/script/test/test-data", { overwrite: true });

function versionHandler(): string {
  switch (true) {
    case args.major:
      return increment(version, "major") ?? version;
    case args.minor:
      return increment(version, "minor") ?? version;
    case args.patch:
      return increment(version, "patch") ?? version;
    case args.premajor:
      return increment(version, "premajor") ?? version;
    case args.preminor:
      return increment(version, "preminor") ?? version;
    case args.prepatch:
      return increment(version, "prepatch") ?? version;
    case args.prerelease:
      return increment(version, "prerelease") ?? version;
  }

  return version;
}

const versionFile = "./.version";
const version = await Deno.readTextFile(versionFile);
const argsOpts: ParseOptions = {
  boolean: true,
  default: {
    major: false,
    minor: false,
    patch: false,
    premajor: false,
    preminor: false,
    prepatch: false,
    prerelease: false,
  },
};
const args = parse(Deno.args, argsOpts);
const newVersion = versionHandler();

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  mappings: {
    "https://deno.land/std@0.136.0/node/stream.ts": "stream",
    "https://deno.land/std@0.136.0/node/string_decoder.ts": "string_decoder",
    "https://deno.land/std@0.136.0/node/crypto.ts": "crypto",
    "https://cdn.skypack.dev/pin/liquidjs@v9.37.0-dA2YkE2JlVe1VjIZ5g3G/mode=imports/optimized/liquidjs.js": {
      name: "liquidjs",
      version: "^9.37.0"
    }
  },
  package: {
    name: NPM_NAME,
    version: newVersion,
    description: "ASC X12 parser, generator, query engine, and mapper; now with support for streams.",
    keywords: [
      "x12",
      "edi",
      "ansi",
      "asc",
      "ecommerce"
    ],
    files: [
      "src/**",
      "mod.js"
    ],
    homepage: `https://github.com/aaronhuggins/${NPM_NAME}#readme`,
    bugs: `https://github.com/aaronhuggins/${NPM_NAME}/issues`,
    license: "MIT",
    author: "Aaron Huggins <aaron.huggins@runbox.com>",
    repository: {
      type: "git",
      url: `https://github.com/aaronhuggins/${NPM_NAME}.git`,
    },
  },
});

// post build steps
await Deno.copyFile("LICENSE.md", "npm/LICENSE.md");
await Deno.copyFile("README.md", "npm/README.md");

if (newVersion === version) {
  console.log(
    `[build_npm] Version did not change; nothing to deploy. ${NPM_NAME} v${version}`,
  );
} else {
  await Deno.writeTextFile(versionFile, newVersion);
  console.log(`[build_npm] ${NPM_NAME} v${newVersion} ready to deploy!`);
}
