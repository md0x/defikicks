import { build, analyzeMetafile } from "esbuild";

const go = async () => {
  let result = await build({
    entryPoints: ["./lit-ceramic-stream/toBundle.js"],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: "./lit-ceramic-stream/bundled.js",
    sourceRoot: "./",
    platform: "node",
    metafile: true,
    external: ["ethers"],
    inject: ["./lit-ceramic-stream/esbuild-shims.js"],
  });
  // let text = await analyzeMetafile(result.metafile);
  // console.log(text);
};

go();
