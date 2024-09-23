import path from "path";
import { downloadFile } from "./download-file";
import { sha1sum } from "./sha1sum";
import {
  differentialsContentDirPath,
  differentialsContentFsPath,
  differentialsContentUrlPath,
} from "./file-paths";
import fs from "node:fs/promises";

/**
 * Write viewpoint differential image to base path,
 * and modify the image src to match the new location.
 * @param basePath
 * @param imgTag
 */
export async function writeImg(basePath: string, imgTag: HTMLImageElement) {
  const imgUrl = new URL(imgTag.src);
  let imgPath = imgUrl.pathname;
  if (
    imgUrl.host === "dxd.gateway.idexx.cloud" &&
    imgUrl.pathname === "/pub/ui/images" &&
    imgUrl.searchParams.has("key") &&
    imgUrl.searchParams.get("key") != null
  ) {
    const imgKey = imgUrl.searchParams.get("key")!;
    imgPath = imgKey;
  }

  const bytes = await downloadFile(imgUrl, {
    maxTries: 3,
    timeoutMillis: 6_000,
  });
  const hash = sha1sum(bytes);
  const imgFileExt = path.extname(imgPath);
  const contentFilename = `${hash}${imgFileExt}`;

  const contentFsPath = differentialsContentFsPath(basePath, contentFilename);
  const contentDirPath = differentialsContentDirPath(basePath);
  await fs.mkdir(contentDirPath, { recursive: true });
  await fs.writeFile(contentFsPath, bytes);

  //update image url to point to viewpoint locally rather than internet
  const contentUrlPath = differentialsContentUrlPath(contentFilename);
  imgTag.src = `/${contentUrlPath}`;
  console.log(`${hash} <= ${imgPath}`);
}
