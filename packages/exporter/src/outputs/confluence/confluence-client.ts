import type {
  ConfluenceAttachment,
  ConfluencePage,
  ConfluenceSearchResult,
  ConfluenceSpace,
  NewConfluencePageRequest,
  UpdateConfluencePageRequest,
} from "./confluence-api-types";
import * as path from "node:path";
import fs from "fs";
import { LOGGER } from "../../logger";

export interface ConfluenceClientOptions {
  user: string;
  apiKey: string;
  targetHost: string;
}

export class ConfluenceClient {
  readonly options: ConfluenceClientOptions;

  constructor(opts: ConfluenceClientOptions) {
    this.options = opts;
  }

  async findUniquePage(
    pageName: string,
    spaceKey?: string
  ): Promise<ConfluencePage> {
    LOGGER.verbose(`Locating unique page ${pageName}`);
    const pages = await this.searchForPage(pageName, spaceKey);
    if (pages.size !== 1) {
      throw new Error(
        `Expected to find exactly one page with name ${pageName}, but found ${pages.size}`
      );
    }
    return this.fetchPage(pages.results[0]!.id);
  }

  async searchForPage(
    pageName: string,
    spaceKey?: string
  ): Promise<ConfluenceSearchResult<ConfluencePage>> {
    LOGGER.verbose(`Searching for pages matching '${pageName}'`);
    const response = await fetch(
      this.buildUrl("content", { title: pageName, spaceKey: spaceKey ?? "" }),
      {
        headers: this.getHeaders(),
      }
    );

    return ConfluenceClient.handleResponse(response);
  }

  async fetchPage(id: string): Promise<ConfluencePage> {
    LOGGER.verbose(`Fetching page with ID '${id}'`);
    const response = await fetch(this.buildUrl(`content/${id}`), {
      headers: this.getHeaders(),
    });

    return ConfluenceClient.handleResponse(response);
  }

  async createPage(request: NewConfluencePageRequest): Promise<ConfluencePage> {
    LOGGER.verbose(
      `Creating new page '${request.title}' in space '${request.space.key}'`
    );
    const response = await fetch(this.buildUrl("content"), {
      method: "POST",
      body: JSON.stringify(request),
      headers: this.getHeaders(),
    });

    return ConfluenceClient.handleResponse(response);
  }

  async updatePage(
    pageId: string,
    request: UpdateConfluencePageRequest
  ): Promise<ConfluencePage> {
    LOGGER.verbose(
      `Updating page '${pageId}' with title '${request.title}' in space '${request.space.key}'`
    );
    const response = await fetch(this.buildUrl(`content/${pageId}`), {
      method: "PUT",
      body: JSON.stringify(request),
      headers: this.getHeaders(),
    });

    return ConfluenceClient.handleResponse(response);
  }

  async fetchSpace(spaceId: string): Promise<ConfluenceSpace> {
    LOGGER.verbose(`Fetching space with ID '${spaceId}'`);
    const response = await fetch(this.buildUrl(`space/${spaceId}`), {
      headers: this.getHeaders(),
    });
    return ConfluenceClient.handleResponse(response);
  }

  async deleteAttachment(attachmentId: string) {
    LOGGER.verbose(`Deleting attachment with ID '${attachmentId}'`);
    const response = await fetch(this.buildUrl(`content/${attachmentId}`), {
      method: "DELETE",
      headers: {
        ...this.getHeaders(),
        "X-Atlassian-Token": "no-check",
      },
    });
    return ConfluenceClient.handleResponse(response);
  }

  async getAttachments(pageId: string, start: number = 0, limit: number = 200) {
    LOGGER.verbose(`Fetching attachments from ${start}, limit ${limit}`);
    const target = this.buildUrl(`content/${pageId}/child/attachment`, {
      start: start.toString(),
      limit: limit.toString(),
    });
    const response = await fetch(target, {
      headers: this.getHeaders(),
    });
    return ConfluenceClient.handleResponse<
      ConfluenceSearchResult<ConfluenceAttachment>
    >(response);
  }

  async createAttachment(
    pageId: string,
    localFilePath: string,
    fileName?: string,
    type?: string
  ): Promise<ConfluenceSearchResult<ConfluenceAttachment>> {
    LOGGER.verbose(`Creating attachment from local file '${localFilePath}'`);
    const fileBlob = new Blob([fs.readFileSync(localFilePath)], { type });
    const formData = new FormData();
    formData.set("file", fileBlob, fileName ?? path.basename(localFilePath));
    formData.set("minorEdit", true);

    const response = await fetch(
      this.buildUrl(`content/${pageId}/child/attachment`),
      {
        method: "POST",
        body: formData,
        headers: {
          authorization: this.getHeaders()["authorization"]!,
          "X-Atlassian-Token": "nocheck",
        },
      }
    );

    return ConfluenceClient.handleResponse(response);
  }

  private buildUrl(subPath?: string, searchParams?: Record<string, string>) {
    const paramsString =
      searchParams == null
        ? ""
        : `?${new URLSearchParams(searchParams).toString()}`;
    return `${new URL(
      path.join(this.options.targetHost, subPath ?? "")
    ).toString()}${paramsString}`;
  }

  private getHeaders(): Record<string, string> {
    return {
      authorization: `Basic ${btoa(
        `${this.options.user}:${this.options.apiKey}`
      )}`,
      accept: "application/json",
      "content-type": "application/json",
    };
  }

  private static async handleResponse<T>(
    response: Response,
    failMessage?: string
  ): Promise<T> {
    if (response.ok) {
      const contentType = response.headers.get("content-type");
      if (response.status === 204) {
        return undefined as T;
      }
      if (contentType === "application/json") {
        return (await response.json()) as T;
      } else {
        throw new Error(
          `Received non-JSON response (${contentType}): ${await response.text()}`
        );
      }
    } else {
      throw new Error(
        `Fetch failed for request ${response.url}: ${response.status}, ${
          response.statusText
        }, ${await response.text()}${failMessage ? `\n\n${failMessage}` : ""}`
      );
    }
  }
}
