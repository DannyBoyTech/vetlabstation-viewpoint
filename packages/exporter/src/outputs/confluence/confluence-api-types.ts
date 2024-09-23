export interface ConfluencePage {
  id: string;
  type: string;
  title: string;
  version: {
    number: number;
    minorEdit?: boolean;
  };
  body: {
    storage: {
      value: string;
      representation: string;
    };
  };
  space: ConfluenceSpace;
}

export interface NewConfluencePageRequest
  extends Omit<ConfluencePage, "id" | "version"> {
  ancestors?: {
    id: string;
  }[];
}

export interface UpdateConfluencePageRequest
  extends Omit<ConfluencePage, "id"> {
  ancestors?: {
    id: string;
  }[];
}

export interface ConfluenceSpace {
  key: string;
}

export interface ConfluencePageSearchResult {
  id: string;
  type: string;
  title: string;
}

export interface ConfluenceSearchResult<T> {
  size: number;
  results: T[];
  _links: {
    next?: string;
  };
}

export interface ConfluenceAttachment {
  id: string;
  title: string;
  type: string;
  status: string;
  space: ConfluenceSpace;
  version: {
    number: number;
  };
}
