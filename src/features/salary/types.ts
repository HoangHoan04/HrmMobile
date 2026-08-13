import { enumData } from "@/constants/enums/enumData";

export interface SalaryLineItemDto {
  id?: string;
  itemType: string;
  itemCode: string;
  itemName: string;
  amount: number;
  displayOrder?: number;
  note?: string | null;
}

export interface SalaryDto {
  id: string;
  employeeId: string;
  employeeCode?: string | null;
  employeeName?: string | null;
  salaryConfigId?: string | null;
  salaryConfigName?: string | null;
  year: number;
  month: number;
  periodCode: string;
  payDate?: string | null;
  status: string;
  companyId?: string | null;
  companyName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  positionId?: string | null;
  positionName?: string | null;
  standardWorkingDays?: number | null;
  actualWorkingDays?: number | null;
  basicSalary: number;
  grossSalary: number;
  totalDeduction: number;
  netSalary: number;
  insuranceSalary?: number | null;
  currency?: string;
  payslipFileUrl?: string | null;
  approvedDate?: string | null;
  approvedBy?: string | null;
  paidDate?: string | null;
  note?: string | null;
  lineItems?: SalaryLineItemDto[];
  incomeItems?: SalaryLineItemDto[];
  deductionItems?: SalaryLineItemDto[];
}

export type MobileSalaryStatus = "paid" | "pending" | "processing";

export interface SalaryPeriodView {
  id: string;
  month: number;
  year: number;
  payDate: string;
  status: MobileSalaryStatus;
  netSalary: number;
  grossSalary: number;
  incomeItems: { label: string; amount: number }[];
  deductionItems: { label: string; amount: number }[];
  payslipPdfUrl?: string;
}

const ITEM_CODE_I18N: Record<string, string> = {
  BASIC: "salary.itemBasic",
  LUNCH: "salary.itemLunch",
  TRANSPORT: "salary.itemTransport",
  KPI: "salary.itemKpi",
  OVERTIME: "salary.itemOvertime",
  BONUS: "salary.itemBonus",
  OTHER_INCOME: "salary.itemOtherIncome",
  BHXH: "salary.itemBhxh",
  BHYT: "salary.itemBhyt",
  BHTN: "salary.itemBhtn",
  PIT: "salary.itemPit",
  ADVANCE: "salary.itemAdvance",
  OTHER_DEDUCTION: "salary.itemOtherDeduction",
};

export function mapApiStatusToUi(status?: string): MobileSalaryStatus {
  const s = (status || "").toUpperCase();
  if (s === enumData.SALARY_STATUS.PAID.value) return "paid";
  if (
    s === enumData.SALARY_STATUS.PROCESSING.value ||
    s === enumData.SALARY_STATUS.APPROVED.value
  ) {
    return "processing";
  }
  return "pending";
}

function formatPayDate(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function mapLineLabel(item: SalaryLineItemDto): string {
  const code = (item.itemCode || "").toUpperCase();
  return ITEM_CODE_I18N[code] || item.itemName || code;
}

export function mapSalaryDtoToPeriod(dto: SalaryDto): SalaryPeriodView {
  const income = (
    dto.incomeItems?.length
      ? dto.incomeItems
      : dto.lineItems?.filter(
          (x) => x.itemType === enumData.SALARY_ITEM_TYPE.INCOME.value,
        ) || []
  ).map((x) => ({ label: mapLineLabel(x), amount: Number(x.amount) || 0 }));
  const deduction = (
    dto.deductionItems?.length
      ? dto.deductionItems
      : dto.lineItems?.filter(
          (x) => x.itemType === enumData.SALARY_ITEM_TYPE.DEDUCTION.value,
        ) || []
  ).map((x) => ({
    label: mapLineLabel(x),
    amount: -Math.abs(Number(x.amount) || 0),
  }));

  return {
    id: dto.id,
    month: dto.month,
    year: dto.year,
    payDate: formatPayDate(dto.payDate || dto.paidDate),
    status: mapApiStatusToUi(dto.status),
    netSalary: Number(dto.netSalary) || 0,
    grossSalary: Number(dto.grossSalary) || 0,
    incomeItems: income,
    deductionItems: deduction,
    payslipPdfUrl: dto.payslipFileUrl || undefined,
  };
}
