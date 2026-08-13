import { getApiErrorMessage } from "@/features/common";
import { showToastError } from "@/helper/ToastEventEmitter";
import { endpoints } from "@/services/api/endpoints";
import { rootApi } from "@/services/api/rootApi";
import { useQuery } from "@tanstack/react-query";

export type ContractDto = {
  id?: string;
  contractNumber?: string | null;
  contractTypeName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  signedDate?: string | null;
};

export type EmployeeFileDto = {
  id?: string;
  fileName?: string | null;
  fileType?: string | null;
  fileUrl?: string | null;
  documentType?: string | null;
  note?: string | null;
  createdAt?: string | null;
};

export type DirectoryPerson = {
  id?: string;
  employeeCode?: string | null;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
};

export type OrgChartNode = {
  id?: string;
  name?: string | null;
  title?: string | null;
  employeeCode?: string | null;
  children?: OrgChartNode[];
  [key: string]: unknown;
};

export function useMyContracts() {
  return useQuery<ContractDto[]>({
    queryKey: ["more", "contracts"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.profile.contracts,
          {},
          { skipErrorToast: true } as any,
        );
        return Array.isArray(data) ? data : [];
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });
}

export function useMyFiles() {
  return useQuery<EmployeeFileDto[]>({
    queryKey: ["more", "files"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.profile.files,
          {},
          { skipErrorToast: true } as any,
        );
        return Array.isArray(data) ? data : [];
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });
}

export function useDirectory(search: string, pageIndex = 1, pageSize = 30) {
  return useQuery<{ items?: DirectoryPerson[]; data?: DirectoryPerson[] } | DirectoryPerson[]>({
    queryKey: ["more", "directory", search, pageIndex, pageSize],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.profile.directory,
          {
            search: search.trim() || null,
            departmentId: null,
            pageIndex,
            pageSize,
          },
          { skipErrorToast: true } as any,
        );
        return data;
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });
}

export function useOrgChart() {
  return useQuery<OrgChartNode | OrgChartNode[]>({
    queryKey: ["more", "org-chart"],
    queryFn: async () => {
      try {
        const { data } = await rootApi.post(
          endpoints.profile.orgChart,
          {},
          { skipErrorToast: true } as any,
        );
        return data;
      } catch (err) {
        showToastError(getApiErrorMessage(err, "phaseM.loadFailed"));
        throw err;
      }
    },
  });
}
