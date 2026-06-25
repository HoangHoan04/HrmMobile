import initApi from './init';
const rootApi = initApi(process.env.EXPO_PUBLIC_API);
export { rootApi };
