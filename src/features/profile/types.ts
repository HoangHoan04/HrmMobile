import { pickString } from "@/features/common";

export type MobileProfileStats = {
  workDaysThisMonth?: number | null;
  leaveDaysRemaining?: number | null;
  leaveDaysThisMonth?: number | null;
  onTimeDays?: number | null;
  lateDays?: number | null;
  absentDays?: number | null;
};

export type MobileProfile = {
  id: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
  type?: string | null;

  employeeId?: string | null;
  employeeCode?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  permanentAddress?: string | null;
  companyEmail?: string | null;

  companyId?: string | null;
  companyName?: string | null;
  company?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  branch?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  department?: string | null;
  partId?: string | null;
  partName?: string | null;
  part?: string | null;
  positionId?: string | null;
  positionName?: string | null;
  position?: string | null;

  joinDate?: string | null;
  status?: string | null;
  level?: string | null;
  workingMode?: string | null;
  contractType?: string | null;

  bankAccountNumber?: string | null;
  bankName?: string | null;

  stats?: MobileProfileStats | null;
};

export function normalizeMobileProfile(raw: any): MobileProfile | null {
  if (!raw || typeof raw !== "object") return null;

  const emp = raw.employee || raw.Employee || null;
  const statsRaw = raw.stats || raw.Stats || {};

  const fullName =
    pickString(raw.fullName, raw.FullName, emp?.fullName, emp?.FullName) ||
    [
      pickString(emp?.lastName, emp?.LastName, raw.lastName),
      pickString(emp?.firstName, emp?.FirstName, raw.firstName),
    ]
      .filter(Boolean)
      .join(" ") ||
    null;

  const companyName = pickString(
    raw.companyName,
    raw.CompanyName,
    raw.company,
    raw.Company,
  );
  const branchName = pickString(
    raw.branchName,
    raw.BranchName,
    raw.branch,
    raw.Branch,
  );
  const departmentName = pickString(
    raw.departmentName,
    raw.DepartmentName,
    raw.department,
    raw.Department,
  );
  const partName = pickString(raw.partName, raw.PartName, raw.part, raw.Part);
  const positionName = pickString(
    raw.positionName,
    raw.PositionName,
    raw.position,
    raw.Position,
  );

  return {
    id: String(raw.id || raw.Id || ""),
    username: pickString(raw.username, raw.Username) || "",
    email: pickString(raw.email, raw.Email, emp?.email, emp?.Email),
    phone: pickString(
      raw.phone,
      raw.Phone,
      raw.phoneNumber,
      raw.PhoneNumber,
      emp?.phone,
      emp?.Phone,
    ),
    phoneNumber: pickString(
      raw.phoneNumber,
      raw.PhoneNumber,
      raw.phone,
      emp?.phone,
    ),
    type: pickString(raw.type, raw.Type),
    employeeId: pickString(raw.employeeId, raw.EmployeeId, emp?.id, emp?.Id),
    employeeCode: pickString(
      raw.employeeCode,
      raw.EmployeeCode,
      emp?.code,
      emp?.Code,
    ),
    fullName,
    firstName: pickString(
      raw.firstName,
      raw.FirstName,
      emp?.firstName,
      emp?.FirstName,
    ),
    lastName: pickString(
      raw.lastName,
      raw.LastName,
      emp?.lastName,
      emp?.LastName,
    ),
    gender: pickString(raw.gender, raw.Gender, emp?.gender, emp?.Gender),
    avatarUrl: pickString(
      raw.avatarUrl,
      raw.AvatarUrl,
      emp?.avatarUrl,
      emp?.AvatarUrl,
    ),
    dateOfBirth: pickString(
      raw.dateOfBirth,
      raw.DateOfBirth,
      emp?.dayOfBirth,
      emp?.DayOfBirth,
    ),
    address: pickString(
      raw.address,
      raw.Address,
      emp?.nowAddress,
      emp?.NowAddress,
      emp?.permanentAddress,
      emp?.PermanentAddress,
    ),
    permanentAddress: pickString(
      raw.permanentAddress,
      raw.PermanentAddress,
      emp?.permanentAddress,
      emp?.PermanentAddress,
    ),
    companyEmail: pickString(
      raw.companyEmail,
      raw.CompanyEmail,
      emp?.companyEmail,
      emp?.CompanyEmail,
    ),
    companyId: pickString(raw.companyId, raw.CompanyId, emp?.companyId),
    companyName,
    company: companyName,
    branchId: pickString(raw.branchId, raw.BranchId, emp?.branchId),
    branchName,
    branch: branchName,
    departmentId: pickString(
      raw.departmentId,
      raw.DepartmentId,
      emp?.departmentId,
    ),
    departmentName,
    department: departmentName,
    partId: pickString(raw.partId, raw.PartId, emp?.partId),
    partName,
    part: partName,
    positionId: pickString(raw.positionId, raw.PositionId, emp?.positionId),
    positionName,
    position: positionName,
    joinDate: pickString(
      raw.joinDate,
      raw.JoinDate,
      emp?.joinDate,
      emp?.JoinDate,
    ),
    status: pickString(raw.status, raw.Status, emp?.status, emp?.Status),
    level: pickString(raw.level, raw.Level, emp?.level, emp?.Level),
    workingMode: pickString(
      raw.workingMode,
      raw.WorkingMode,
      emp?.workingMode,
      emp?.WorkingMode,
    ),
    contractType: pickString(
      raw.contractType,
      raw.ContractType,
      emp?.contractType,
      emp?.ContractType,
    ),
    bankAccountNumber: pickString(
      raw.bankAccountNumber,
      raw.BankAccountNumber,
      emp?.bankAccountNumber,
      emp?.BankAccountNumber,
    ),
    bankName: pickString(
      raw.bankName,
      raw.BankName,
      emp?.bankName,
      emp?.BankName,
    ),
    stats: {
      workDaysThisMonth:
        statsRaw.workDaysThisMonth ?? statsRaw.WorkDaysThisMonth ?? null,
      leaveDaysRemaining:
        statsRaw.leaveDaysRemaining ?? statsRaw.LeaveDaysRemaining ?? null,
      leaveDaysThisMonth:
        statsRaw.leaveDaysThisMonth ?? statsRaw.LeaveDaysThisMonth ?? null,
      onTimeDays: statsRaw.onTimeDays ?? statsRaw.OnTimeDays ?? null,
      lateDays: statsRaw.lateDays ?? statsRaw.LateDays ?? null,
      absentDays: statsRaw.absentDays ?? statsRaw.AbsentDays ?? null,
    },
  };
}
