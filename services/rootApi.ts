import { getApiBaseUrl, logApiConfig } from "./apiConfig";
import initApi from "./init";

logApiConfig();
const rootApi = initApi(getApiBaseUrl());
export { rootApi };
