import { beforeAll, afterAll, describe, expect } from "vitest";
import {
  PersonalNameProps,
  useFormatPersonalNameReversed,
} from "./LocalizationHooks";
import { render } from "../../../test-utils/test-utils";
import i18n from "i18next";

describe("useFormatPersonalNameReversed", () => {
  beforeAll(() => {
    // Add a temporary test locale that uses a different format to verify
    i18n.addResourceBundle("test_lng", "translation", {
      general: {
        personalNameReversed: "{{lastName}} | {{firstName}} | {{middleName}}",
        personalNameReversed_lastOnly: "|{{lastName}}|",
        personalNameReversed_firstOnly: "{{firstName}} | {{middleName}}",
      },
    });
  });

  afterAll(() => {
    i18n.removeResourceBundle("test_lng", "translation");
  });

  const CASES: {
    names: PersonalNameProps;
    formatted: string;
    locale: string;
  }[] = [
    {
      names: { firstName: "John", middleName: "Jacob", lastName: "Smith" },
      formatted: "Smith, John Jacob",
      locale: "en",
    },
    {
      names: { firstName: "John", lastName: "Smith" },
      formatted: "Smith, John",
      locale: "en",
    },
    {
      names: { middleName: "Jacob", lastName: "Smith" },
      formatted: "Smith",
      locale: "en",
    },
    {
      names: { firstName: "John", middleName: "Jacob" },
      formatted: "John Jacob",
      locale: "en",
    },
    {
      names: { firstName: "John", middleName: "Jacob", lastName: "Smith" },
      formatted: "Smith | John | Jacob",
      locale: "test_lng",
    },
    {
      names: { firstName: "John", lastName: "Smith" },
      formatted: "Smith | John |",
      locale: "test_lng",
    },
    {
      names: { lastName: "Smith" },
      formatted: "|Smith|",
      locale: "test_lng",
    },
  ];

  function TestBed({ names }: { names: PersonalNameProps }) {
    const formatName = useFormatPersonalNameReversed();
    return <div data-testid="formatted-name">{formatName(names)}</div>;
  }

  it.each(CASES)(
    "formats $name to $formatted for locale $locale",
    async ({ names, formatted, locale }) => {
      await i18n.changeLanguage(locale);
      const { getByTestId } = render(<TestBed names={names} />);
      expect(await getByTestId("formatted-name")).toHaveTextContent(formatted);
    }
  );
});
