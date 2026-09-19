export type Filters = {
  countries: string[];
  departments: string[];
  roles: string[];
  currencies: string[];
  default_base_currency: string;
};

export type FiltersResponse = {
  data: Filters;
};
