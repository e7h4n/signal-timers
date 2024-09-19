// @ts-check
import * as fs from "node:fs";
import * as path from "node:path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import { dts } from "rollup-plugin-dts";

/** @type {import('./package.json')} */
const pkg = JSON.parse(
    fs.readFileSync("./package.json", { encoding: "utf-8" }),
);

/** @type { import('rollup').RollupOptions } */
const configCommon = {
    external: [],
    input: "./src/index.ts",
    onwarn: (warning) => {
        throw new Error(warning?.message);
    },
};
const extensions = [".js", ".jsx", ".ts", ".tsx"];
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const projectRootDir = path.resolve(__dirname);

/** @type { Array<import('rollup').RollupOptions> } */
const config = [
    {
        ...configCommon,
        plugins: [
            // Allows node_modules resolution
            nodeResolve({ extensions }),
            babel({
                exclude: "node_modules/**", // only transpile our source code
                extensions: [".ts", ".js"],
                babelHelpers: "bundled",
                configFile: path.resolve(projectRootDir, "./babel.config.json"),
            }),
        ],
        output: [
            {
                file: pkg.exports["."].require,
                format: "cjs",
            },
            {
                file: pkg.exports["."].import,
                format: "es",
            },
        ],
    },
    {
        ...configCommon,
        plugins: [
            dts({
                respectExternal: true,
                tsconfig: path.resolve(projectRootDir, "./tsconfig.json"),
                //   compilerOptions: {
                //       // see https://github.com/unjs/unbuild/pull/57/files
                //       preserveSymlinks: false,
                //   },
            }),
        ],
        output: [
            {
                file: pkg.exports["."].require.replace(/\.cjs$/, ".d.cts"),
            },
            {
                file: pkg.exports["."].import.replace(/\.js$/, ".d.ts"),
            },
        ],
    },
];

export default config;
