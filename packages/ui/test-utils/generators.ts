import faker from "faker";
import type { Location } from "react-router-dom";

const randomLocation = (provided: Partial<Location>) => ({
  state: {},
  key: faker.datatype.string(15),
  pathname: faker.internet.domainWord(),
  search: `?${faker.random.alpha({ count: 5 })}=${faker.random.alpha({
    count: 3,
  })}`,
  hash: `#${faker.random.alpha({ count: 10 })}`,
  ...provided,
});

export { randomLocation };
