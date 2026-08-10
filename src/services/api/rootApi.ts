import { getApiBaseUrl, logApiConfig } from "./apiConfig";
import initApi from "./client";

logApiConfig();
const rootApi = initApi(getApiBaseUrl());
export { rootApi };
