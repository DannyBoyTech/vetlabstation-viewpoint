import fs from "fs";

export interface OutputWriter {
  setTargetPage(
    parentPageTitle: string | undefined,
    pageTitle: string
  ): Promise<unknown>;

  createPage(
    parentPageTitle: string | undefined,
    newPageTitle: string,
    content: string
  ): Promise<unknown>;

  updatePage(
    currentPageTitle: string,
    updatedPageTitle: string,
    content: string
  ): Promise<unknown>;

  createTableOfContentsElement(buildUrl?: string): Promise<string>;

  createImageElement(
    localImagePath: string,
    fileName: string,
    type?: string
  ): Promise<string>;

  createTableElement(
    title: string,
    columnHeaders: string[],
    opts?: { bodyId?: string }
  ): Promise<string>;

  createTableRowElement(opts?: { rowId?: string }): Promise<string>;

  createTableCellElement(
    content: string,
    opts?: { cellId?: string }
  ): Promise<string>;
}

export class LocalOutput implements OutputWriter {
  private readonly tableIds: Record<string, string> = {};

  async createTableCellElement(
    content: string,
    opts?: { cellId?: string | undefined } | undefined
  ): Promise<string> {
    return `
      <td ${getOptionalId(opts?.cellId)}>${content}</td>
    `;
  }

  async createTableRowElement(
    opts?: { rowId?: string | undefined } | undefined
  ): Promise<string> {
    return `
      <tr ${getOptionalId(opts?.rowId)}></tr>
    `;
  }

  async createTableElement(
    title: string,
    columnHeaders: string[],
    opts: { bodyId?: string | undefined }
  ): Promise<string> {
    const anchorId = opts.bodyId == null ? undefined : `${opts.bodyId}-anchor`;
    if (anchorId != null) {
      this.tableIds[title] = anchorId;
    }
    return `
          <div style="margin-top: 20px;" ${getOptionalId(anchorId)}>
            <h2>${title}</h2>
            <table>
              <tbody ${getOptionalId(opts?.bodyId)}>
                <tr>
                  ${columnHeaders
                    .map((header) => `<th>${header}</th>`)
                    .join("")}
                </tr>
              </tbody>
            </table>
          </div>
        `;
  }

  async setTargetPage(_title: string): Promise<void> {
    // Nothing to do
  }

  async createImageElement(localImagePath: string): Promise<string> {
    const base64 = Buffer.from(fs.readFileSync(localImagePath)).toString(
      "base64"
    );
    return `<img style="width: 500px" src="data:image/png;base64,${base64}" />`;
  }

  async createTableOfContentsElement(): Promise<string> {
    return `
      <style>
        body {
         font-family: Arial, sans-serif;
        }
        table, th, td {
          border: 1px solid black;
          border-collapse: collapse;
        }
      </style>
      <div style="margin-top: 20px;">
        <h2>Table of Contents</h2>
        <ul>
          ${Object.keys(this.tableIds)
            .map(
              (name) => `<li><a href="#${this.tableIds[name]}">${name}</a></li>`
            )
            .join("")}
        </ul>
      </div>
`;
  }

  async createPage(
    _parentPageTitle: string | undefined,
    _newPageTitle: string,
    _content: string
  ): Promise<void> {
    return this.updatePage(_newPageTitle, _newPageTitle, _content);
  }

  async updatePage(
    _currentPageTitle: string,
    _updatedPageTitle: string,
    _content: string
  ): Promise<void> {
    return fs.writeFileSync(
      `${_updatedPageTitle.replaceAll(" ", "_")}.html`,
      _content
    );
  }
}

function getOptionalId(id: string | undefined): string {
  return id == null ? "" : `id="${id}"`;
}
