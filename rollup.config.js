import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import {terser} from "rollup-plugin-terser";
import json from "@rollup/plugin-json";
import dev from "rollup-plugin-dev";

const config = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: './dist/index.esm.js',
        format: 'es',
        sourcemap: true,
      }
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json'
      }),
      terser(),
      dev({
        port: 8888,
      }),
      json()
    ]
  },
  {
    input: "src/index.ts",
    output: [{ file: "./dist/index.d.ts", format: "es" }],
    plugins: [dts()]
  }
]
export default config;