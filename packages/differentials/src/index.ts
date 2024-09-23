import { program } from "commander";
import { generateDifferentials } from "./ivls-differentials-builder";
import { unLink, anchorTags, imgTags } from "./html-utils";
import assert from "node:assert";
import { writeI18nFiles } from "./i18n-writer";
import {
  WritableDifferentialCollection,
  isDxDLocaleKey,
  vpLocaleKey,
} from "./global";
import { writeImg } from "./img-writer";
import { differentialsContentDirPath } from "./file-paths";
import { removeDirContents } from "./fs-utils";

async function main(_args: string[]) {
  program
    .name("differentials")
    .description("viewpoint differentials script")
    .argument("<dxd-export-zip>", "DxD export zip file")
    .argument("<output-dir>", "output directory for generated content")
    .action(generate);

  await program.parseAsync(process.argv);
}

async function generate(dxdExportZip: string, outputRoot: string) {
  const i18nContent: WritableDifferentialCollection = {};

  //each time the differentials process runs, it will import all referenced content.
  //Because of that, we remove the content directory here
  //so that we do not accumulate old content as references change over time.
  await removeDirContents(differentialsContentDirPath(outputRoot));

  for await (const diff of generateDifferentials(dxdExportZip)) {
    assert(isDxDLocaleKey(diff.locale), "must be recognized dxd locale");
    const vpLocale = vpLocaleKey(diff.locale);

    if (vpLocale == null) continue;

    //make links in differentials content unclickable
    anchorTags(diff.content).forEach(unLink);

    //download image content from differentials into local directory
    //the file is renamed based on hash of content to keep paths short and prevent duplicates
    //the file extension is preserved to help browser identify the correct mime type
    const imgs = imgTags(diff.content);

    for (const imgTag of imgs) {
      await writeImg(outputRoot, imgTag);
    }

    if (i18nContent[vpLocale] == null) {
      i18nContent[vpLocale] = {};
    }

    i18nContent[vpLocale]![diff.code] = diff.content;
  }

  await writeI18nFiles(outputRoot, i18nContent);
}

main(process.argv.slice(2)).catch((e) => {
  console.error(e);
  process.exit(1);
});
