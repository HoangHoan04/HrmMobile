import initApi from "./init";
import { getApiBaseUrl, logApiConfig } from "./apiConfig";

logApiConfig();
const rootApi = initApi(getApiBaseUrl());
export { rootApi };
