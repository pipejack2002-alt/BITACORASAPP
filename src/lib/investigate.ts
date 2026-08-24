import type { UrlCheck } from "./types";

export type InvestigateHit = {
  title: string;
  url: string;
  hub: string;
  check: UrlCheck;
};

export type InvestigateResponse = {
  query: string;
  hits: InvestigateHit[];
  note: string;
};
