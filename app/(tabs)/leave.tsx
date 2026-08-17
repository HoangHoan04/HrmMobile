import { DrawerMenuButton } from "@/components/layout/drawer";
import { Badge, BadgeText } from "@/components/ui/Badge";
import { showConfirm } from "@/components/ui/confirm";
import { DateInput } from "@/components/ui/input/DateInput";
import { Colors } from "@/constants/common/Colors";
import {
  DAY_OFF_STATUS,
  DAY_OFF_STATUS_OPTIONS,
  DayOffStatusCode,
  resolveDayOffStatus,
} from "@/constants/enums/dayOffStatus";
import { enumData } from "@/constants/enums/enumData";

import { formatDisplayDate } from "@/features/common";
import { showToastError } from "@/helper/ToastEventEmitter";
import {
  LeaveSession,
  MobileLeaveConfigDto,
  RegisterDayOffDto,
  useLeave,
  usePermissions,
  useUpload,
} from "@/hooks";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILTER_PENDING_APPROVALS = "pendingApprovals";

const SESSION_OPTIONS: LeaveSession[] = [
  enumData.LEAVE_SESSION.FULL.value as LeaveSession,
  enumData.LEAVE_SESSION.AM.value as LeaveSession,
  enumData.LEAVE_SESSION.PM.value as LeaveSession,
];

interface LeaveRequest {
  id: string;
  typeName: string;
  typeColor: string;
  typeIcon: string;
  status: DayOffStatusCode;
  statusLabelKey: string;
  statusAction: "warning" | "success" | "error" | "muted";
  startDate: string;
  endDate: string;
  days: number;
  session: LeaveSession;
  reason: string;
  attachmentUrl: string;
  employeeName: string;
  approverName: string;
  requestedApproverName: string;
  approverNote: string;
  cancelReason: string;
  approvedAt: string;
  submittedAt: string;
  isPendingApproval: boolean;
}

const CONFIG_UI_FALLBACK = { icon: "briefcase", color: "#3B82F6" } as const;

function resolveConfigUi(config?: MobileLeaveConfigDto | null) {
  const code = String(config?.code || "").toUpperCase();
  if (code.includes("SICK") || code.includes("OM")) {
    return { icon: "medkit", color: "#F59E0B" };
  }
  if (
    code.includes("UNPAID") ||
    code.includes("KHONG") ||
    config?.isPaid === false
  ) {
    return { icon: "wallet-outline", color: "#EF4444" };
  }
  if (code.includes("MATERN") || code.includes("THAI")) {
    return { icon: "heart", color: "#EC4899" };
  }
  if (code.includes("PATERN")) {
    return { icon: "people", color: "#06B6D4" };
  }
  if (
    code.includes("ANNUAL") ||
    code.includes("PHEP") ||
    code.includes("YEAR")
  ) {
    return { icon: "calendar", color: "#10B981" };
  }
  return CONFIG_UI_FALLBACK;
}

function formatDays(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function normalizeSession(value?: string | null): LeaveSession {
  const raw = String(value || enumData.LEAVE_SESSION.FULL.value).toUpperCase();
  if (raw === enumData.LEAVE_SESSION.AM.value) {
    return enumData.LEAVE_SESSION.AM.value as LeaveSession;
  }
  if (raw === enumData.LEAVE_SESSION.PM.value) {
    return enumData.LEAVE_SESSION.PM.value as LeaveSession;
  }
  return enumData.LEAVE_SESSION.FULL.value as LeaveSession;
}

function mapLeaveDto(
  dto: RegisterDayOffDto,
  configs: MobileLeaveConfigDto[] = [],
  isPendingApproval = false,
): LeaveRequest {
  const statusMeta = resolveDayOffStatus(dto.status);
  const config =
    configs.find((c) => c.id === dto.dayOffConfigId) ??
    configs.find(
      (c) =>
        !!dto.dayOffConfigName &&
        c.name.trim().toLowerCase() ===
          String(dto.dayOffConfigName).trim().toLowerCase(),
    );
  const typeUi = resolveConfigUi(config);

  return {
    id: dto.id,
    typeName: dto.dayOffConfigName || config?.name || "",
    typeColor: typeUi.color,
    typeIcon: typeUi.icon,
    status: statusMeta.code as DayOffStatusCode,
    statusLabelKey: statusMeta.labelKey,
    statusAction: statusMeta.action,
    startDate: formatDisplayDate(dto.fromDate),
    endDate: formatDisplayDate(dto.toDate),
    days: Number(dto.totalDays) || 0,
    session: normalizeSession(dto.session),
    reason: dto.reason || "",
    attachmentUrl: dto.attachmentUrl || "",
    employeeName: dto.employeeName || dto.employeeCode || "—",
    approverName: dto.approverName || "—",
    requestedApproverName: dto.requestedApproverName || "—",
    approverNote: dto.approverNote || "",
    cancelReason: dto.cancelReason || "",
    approvedAt: formatDisplayDate(dto.approvedAt),
    submittedAt: formatDisplayDate(dto.createdAt),
    isPendingApproval,
  };
}

function toFormOptions(
  configs: MobileLeaveConfigDto[],
): MobileLeaveConfigDto[] {
  return configs.filter((c) => !!c.id);
}

function sessionLabelKey(session: LeaveSession): string {
  if (session === enumData.LEAVE_SESSION.AM.value) return "leave.sessionAm";
  if (session === enumData.LEAVE_SESSION.PM.value) return "leave.sessionPm";
  return "leave.sessionFull";
}

export default function LeaveScreen() {
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];
  const { t, language } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const { upload, loading: uploading } = useUpload();
  const {
    leaves: leaveDtos,
    pendingApprovals: pendingApprovalDtos,
    balance,
    configs,
    loading,
    submitting,
    fetchMyList,
    refreshAll,
    previewDays,
    createLeave,
    cancelLeave,
    approveLeave,
    rejectLeave,
  } = useLeave();
  const { canApproveLeave } = usePermissions();

  const leaves = useMemo(
    () => leaveDtos.map((d) => mapLeaveDto(d, configs)),
    [leaveDtos, configs],
  );
  const pendingApprovals = useMemo(
    () =>
      canApproveLeave
        ? pendingApprovalDtos.map((d) => mapLeaveDto(d, configs, true))
        : [],
    [canApproveLeave, pendingApprovalDtos, configs],
  );

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formConfigId, setFormConfigId] = useState<string | null>(null);
  const [formSession, setFormSession] = useState<LeaveSession>("FULL");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formReason, setFormReason] = useState("");
  const [formAttachmentUrl, setFormAttachmentUrl] = useState("");
  const [previewTotalDays, setPreviewTotalDays] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [approverNote, setApproverNote] = useState("");

  const formOptions = useMemo(() => toFormOptions(configs), [configs]);

  const selectedConfig = useMemo(() => {
    if (formConfigId) {
      return formOptions.find((c) => c.id === formConfigId) || null;
    }
    return formOptions[0] || null;
  }, [formConfigId, formOptions]);

  const requireAttachment = !!selectedConfig?.requireAttachment;
  const deductBalance = !!selectedConfig?.deductBalance;

  useFocusEffect(
    useCallback(() => {
      fetchMyList().catch(() => undefined);
    }, [fetchMyList]),
  );

  useEffect(() => {
    if (!isCreateOpen) return;
    const first = formOptions[0];
    if (!first) return;
    setFormConfigId(first.id || null);
  }, [isCreateOpen, formOptions]);

  useEffect(() => {
    if (formSession === "AM" || formSession === "PM") {
      if (formStartDate && formEndDate !== formStartDate) {
        setFormEndDate(formStartDate);
      }
    }
  }, [formSession, formStartDate, formEndDate]);

  useEffect(() => {
    if (!isCreateOpen || !formStartDate || !formEndDate) {
      setPreviewTotalDays(null);
      return;
    }
    if (formEndDate < formStartDate) {
      setPreviewTotalDays(null);
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    previewDays(formStartDate, formEndDate, formSession)
      .then((result) => {
        if (!cancelled) {
          setPreviewTotalDays(result ? result.totalDays : null);
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isCreateOpen, formStartDate, formEndDate, formSession, previewDays]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    const startedAt = Date.now();
    const MIN_SPINNER_MS = 450;

    void (async () => {
      try {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
        await (refreshAll ?? fetchMyList)();
      } catch {
        //! lỗi từng API đã toast trong hook (nếu có)
      } finally {
        const remain = MIN_SPINNER_MS - (Date.now() - startedAt);
        if (remain > 0) {
          await new Promise((r) => setTimeout(r, remain));
        }
        setRefreshing(false);
      }
    })();
  }, [refreshAll, fetchMyList]);

  const resetCreateForm = () => {
    setFormStartDate("");
    setFormEndDate("");
    setFormReason("");
    setFormAttachmentUrl("");
    setFormConfigId(null);
    setFormSession("FULL");
    setPreviewTotalDays(null);
  };

  const handleCancelLeave = (id: string) => {
    showConfirm({
      title: t("leave.cancelTitle"),
      message: t("leave.cancelConfirm"),
      variant: "warning",
      buttons: [
        { text: t("common.no"), style: "cancel" },
        {
          text: t("leave.cancelAction"),
          style: "destructive",
          onPress: async () => {
            try {
              await cancelLeave(id);
              setIsDetailOpen(false);
            } catch {}
          },
        },
      ],
    });
  };

  const handleApprove = (id: string) => {
    showConfirm({
      title: t("leave.approve"),
      message: t("leave.approveConfirm"),
      variant: "confirm",
      buttons: [
        { text: t("common.no"), style: "cancel" },
        {
          text: t("leave.approve"),
          style: "default",
          onPress: async () => {
            try {
              await approveLeave({
                id,
                approverNote: approverNote.trim() || null,
              });
              setIsDetailOpen(false);
              setApproverNote("");
            } catch {}
          },
        },
      ],
    });
  };

  const handleReject = (id: string) => {
    if (!approverNote.trim()) {
      showToastError(t("leave.rejectNoteRequired"));
      return;
    }
    showConfirm({
      title: t("leave.reject"),
      message: t("leave.rejectConfirm"),
      variant: "warning",
      buttons: [
        { text: t("common.no"), style: "cancel" },
        {
          text: t("leave.reject"),
          style: "destructive",
          onPress: async () => {
            try {
              await rejectLeave({
                id,
                approverNote: approverNote.trim(),
              });
              setIsDetailOpen(false);
              setApproverNote("");
            } catch {}
          },
        },
      ],
    });
  };

  const handleUploadAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const uploadResult = await upload(
        {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || "application/octet-stream",
          size: asset.size,
        },
        "document",
      );
      setFormAttachmentUrl(uploadResult.fileUrl);
    } catch {}
  };

  const handleCreateSubmit = async () => {
    if (!formConfigId) {
      showToastError(t("leave.configRequired"));
      return;
    }
    if (!formStartDate || !formEndDate || !formReason.trim()) {
      showToastError(t("leave.validationRequired"));
      return;
    }
    if (formEndDate < formStartDate) {
      showToastError(t("leave.validationDateOrder"));
      return;
    }
    if (
      (formSession === "AM" || formSession === "PM") &&
      formStartDate !== formEndDate
    ) {
      showToastError(t("leave.sessionSingleDay"));
      return;
    }
    if (requireAttachment && !formAttachmentUrl.trim()) {
      showToastError(t("leave.attachmentRequired"));
      return;
    }

    const requestDays =
      previewTotalDays != null
        ? previewTotalDays
        : ((await previewDays(formStartDate, formEndDate, formSession))
            ?.totalDays ?? 0);

    if (deductBalance && requestDays > 0) {
      const remaining = Number(balance?.annualRemaining) || 0;
      if (requestDays > remaining) {
        showToastError(
          t("leave.insufficientBalance", {
            remaining: formatDays(remaining),
            request: formatDays(requestDays),
          }),
        );
        return;
      }
    }

    try {
      await createLeave({
        fromDate: formStartDate,
        toDate:
          formSession === "AM" || formSession === "PM"
            ? formStartDate
            : formEndDate,
        session: formSession,
        reason: formReason.trim(),
        dayOffConfigId: formConfigId,
        attachmentUrl: formAttachmentUrl.trim() || null,
      });
      setIsCreateOpen(false);
      resetCreateForm();
    } catch {}
  };

  const balanceUi = useMemo(() => {
    const total = Number(balance?.annualTotal) || 0;
    const remaining = Number(balance?.annualRemaining) || 0;
    const used = Number(balance?.annualUsed) || 0;
    const pending = Number(balance?.annualPending) || 0;
    const sickUsed = Number(balance?.sickUsed) || 0;
    const unpaidUsed = Number(balance?.unpaidUsed) || 0;
    const progress =
      total > 0 ? Math.min(100, Math.max(0, (remaining / total) * 100)) : 0;
    return { total, remaining, used, pending, sickUsed, unpaidUsed, progress };
  }, [balance]);

  const counts = useMemo(() => {
    const next: Record<DayOffStatusCode, number> = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };
    leaves.forEach((l) => {
      next[l.status] += 1;
    });
    return next;
  }, [leaves]);

  const isPendingApprovalsFilter = selectedFilter === FILTER_PENDING_APPROVALS;

  const groupedLeaves = useMemo(() => {
    if (isPendingApprovalsFilter) {
      const groups: { [key: string]: LeaveRequest[] } = {};
      pendingApprovals.forEach((item) => {
        const parts = item.submittedAt.split("/");
        const monthStr =
          parts.length === 3
            ? t("leave.monthGroup", { m: parts[1], y: parts[2] })
            : t("leave.other");
        if (!groups[monthStr]) groups[monthStr] = [];
        groups[monthStr].push(item);
      });
      return groups;
    }

    const filtered = leaves.filter((l) => {
      if (selectedFilter === "all") return true;
      return l.status === selectedFilter;
    });

    const groups: { [key: string]: LeaveRequest[] } = {};
    filtered.forEach((item) => {
      const parts = item.submittedAt.split("/");
      const monthStr =
        parts.length === 3
          ? t("leave.monthGroup", { m: parts[1], y: parts[2] })
          : t("leave.other");
      if (!groups[monthStr]) {
        groups[monthStr] = [];
      }
      groups[monthStr].push(item);
    });

    return groups;
  }, [
    leaves,
    pendingApprovals,
    selectedFilter,
    isPendingApprovalsFilter,
    t,
    language,
  ]);

  const hasItems = Object.keys(groupedLeaves).length > 0;

  const typeLabel = (option: MobileLeaveConfigDto) => {
    return option.name?.trim() || option.code;
  };

  const selectFormOption = (option: MobileLeaveConfigDto) => {
    setFormConfigId(option.id || null);
  };

  const isOptionActive = (option: MobileLeaveConfigDto) => {
    return selectedConfig?.id === option.id;
  };

  const filterLabel = (code: DayOffStatusCode, n: number) => {
    if (code === DAY_OFF_STATUS.PENDING.code) {
      return t("leave.filterPending", { n });
    }
    if (code === DAY_OFF_STATUS.APPROVED.code) {
      return t("leave.filterApproved", { n });
    }
    if (code === DAY_OFF_STATUS.REJECTED.code) {
      return t("leave.filterRejected", { n });
    }
    return t("leave.filterCancelled", { n });
  };

  const openDetail = (item: LeaveRequest) => {
    setSelectedLeave(item);
    setApproverNote("");
    setIsDetailOpen(true);
  };

  const setSession = (session: LeaveSession) => {
    setFormSession(session);
    if ((session === "AM" || session === "PM") && formStartDate) {
      setFormEndDate(formStartDate);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            progressBackgroundColor={theme.cardBg}
            progressViewOffset={insets.top}
          />
        }
      >
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.textMain }]}>
            {t("leave.title")}
          </Text>
          <DrawerMenuButton />
        </View>

        <View
          style={[
            styles.balanceCard,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <View style={styles.balanceHeader}>
            <Text style={[styles.balanceTitle, { color: theme.textSecondary }]}>
              {t("leave.annualRemaining")}
            </Text>
            <Text style={[styles.balanceNum, { color: theme.primary }]}>
              {formatDays(balanceUi.remaining)}{" "}
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                {balanceUi.total > 0
                  ? t("leave.daysOfTotal", { n: formatDays(balanceUi.total) })
                  : t("leave.daysOfTotalNone")}
              </Text>
            </Text>
          </View>

          {balanceUi.total <= 0 && (
            <Text
              style={[
                styles.balanceSubText,
                { color: theme.warning, marginBottom: 8 },
              ]}
            >
              {t("leave.notAllocated")}
            </Text>
          )}

          <View
            style={[
              styles.progressBg,
              {
                backgroundColor: colorScheme === "dark" ? "#2B2E33" : "#E5E7EB",
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.primary,
                  width: `${balanceUi.progress}%`,
                },
              ]}
            />
          </View>

          <Text style={[styles.balancePending, { color: theme.warning }]}>
            {t("leave.annualPending", { n: formatDays(balanceUi.pending) })}
          </Text>

          <Text style={[styles.balanceSubText, { color: theme.textSecondary }]}>
            {t("leave.sickUnpaidSummary", {
              sick: formatDays(balanceUi.sickUsed),
              unpaid: formatDays(balanceUi.unpaidUsed),
            })}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "all"
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "all"
                  ? { color: "#FFFFFF" }
                  : { color: theme.textMain },
              ]}
            >
              {t("common.all")}
            </Text>
          </TouchableOpacity>

          {canApproveLeave ? (
            <TouchableOpacity
              style={[
                styles.filterChip,
                isPendingApprovalsFilter
                  ? {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    }
                  : {
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                    },
              ]}
              onPress={() => setSelectedFilter(FILTER_PENDING_APPROVALS)}
            >
              <Text
                style={[
                  styles.filterText,
                  isPendingApprovalsFilter
                    ? { color: "#FFFFFF" }
                    : { color: theme.textMain },
                ]}
              >
                {t("leave.filterPendingApprovals", {
                  n: pendingApprovals.length,
                })}
              </Text>
            </TouchableOpacity>
          ) : null}

          {DAY_OFF_STATUS_OPTIONS.map((status) => {
            const code = status.code as DayOffStatusCode;
            const active = selectedFilter === code;
            return (
              <TouchableOpacity
                key={code}
                style={[
                  styles.filterChip,
                  active
                    ? {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      }
                    : {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                      },
                ]}
                onPress={() => setSelectedFilter(code)}
              >
                <Text
                  style={[
                    styles.filterText,
                    active ? { color: "#FFFFFF" } : { color: theme.textMain },
                  ]}
                >
                  {filterLabel(code, counts[code])}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading &&
        !refreshing &&
        leaves.length === 0 &&
        !isPendingApprovalsFilter ? (
          <View style={styles.emptyStateContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text
              style={[
                styles.emptyStateDesc,
                { color: theme.textSecondary, marginTop: 12 },
              ]}
            >
              {t("leave.loading")}
            </Text>
          </View>
        ) : hasItems ? (
          Object.keys(groupedLeaves).map((monthGroup) => (
            <View key={monthGroup} style={styles.monthSection}>
              <Text
                style={[styles.monthGroupTitle, { color: theme.textSecondary }]}
              >
                {monthGroup}
              </Text>
              {groupedLeaves[monthGroup].map((item) => (
                <TouchableOpacity
                  key={`${item.isPendingApproval ? "pa" : "my"}-${item.id}`}
                  style={[
                    styles.leaveCard,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => openDetail(item)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.typeIconWrap,
                          { backgroundColor: item.typeColor + "15" },
                        ]}
                      >
                        <Ionicons
                          name={item.typeIcon as any}
                          size={16}
                          color={item.typeColor}
                        />
                      </View>
                      <Text
                        style={[
                          styles.leaveTypeName,
                          { color: theme.textMain },
                        ]}
                      >
                        {item.typeName || "—"}
                      </Text>
                    </View>
                    <Badge action={item.statusAction}>
                      <BadgeText>{t(item.statusLabelKey)}</BadgeText>
                    </Badge>
                  </View>

                  {item.isPendingApproval && (
                    <Text
                      style={[
                        styles.employeeText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {t("leave.employee")}: {item.employeeName}
                    </Text>
                  )}

                  <Text
                    style={[styles.dateRangeText, { color: theme.textMain }]}
                  >
                    {item.startDate}{" "}
                    {item.startDate !== item.endDate && `→ ${item.endDate}`} ·{" "}
                    {t(sessionLabelKey(item.session))} ·{" "}
                    <Text style={{ fontWeight: "700", color: theme.primary }}>
                      {t("leave.daysCount", { n: item.days })}
                    </Text>
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text
                      style={[
                        styles.cardFooterLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {t("leave.submittedAt")}: {item.submittedAt}
                      {!item.isPendingApproval
                        ? ` · ${t("leave.approver")}: ${item.approverName}`
                        : ""}
                    </Text>

                    {item.isPendingApproval ? (
                      <View style={styles.cardActionRow}>
                        <TouchableOpacity
                          style={[
                            styles.cardApproveBtn,
                            { borderColor: "#16A34A" },
                          ]}
                          onPress={() => openDetail(item)}
                        >
                          <Text style={styles.cardApproveBtnText}>
                            {t("leave.approve")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.cardCancelBtn,
                            { borderColor: "#EF4444" },
                          ]}
                          onPress={() => openDetail(item)}
                        >
                          <Text style={styles.cardCancelBtnText}>
                            {t("leave.reject")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      item.status === DAY_OFF_STATUS.PENDING.code && (
                        <TouchableOpacity
                          style={[
                            styles.cardCancelBtn,
                            { borderColor: "#EF4444" },
                          ]}
                          onPress={() => handleCancelLeave(item.id)}
                        >
                          <Text style={styles.cardCancelBtnText}>
                            {t("leave.cancelAction")}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={theme.textSecondary + "40"}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.textMain }]}>
              {isPendingApprovalsFilter
                ? t("leave.pendingApprovalsEmpty")
                : t("leave.emptyTitle")}
            </Text>
            {!isPendingApprovalsFilter && (
              <>
                <Text
                  style={[
                    styles.emptyStateDesc,
                    { color: theme.textSecondary },
                  ]}
                >
                  {t("leave.emptyDesc")}
                </Text>
                <TouchableOpacity
                  style={[styles.emptyCta, { backgroundColor: theme.primary }]}
                  onPress={() => setIsCreateOpen(true)}
                >
                  <Text style={styles.emptyCtaText}>
                    {t("leave.createNow")}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {!isPendingApprovalsFilter && (
        <TouchableOpacity
          style={[
            styles.fabBtn,
            { backgroundColor: theme.primary, bottom: 96 + insets.bottom },
          ]}
          activeOpacity={0.85}
          onPress={() => setIsCreateOpen(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.fabBtnText}>{t("leave.create")}</Text>
        </TouchableOpacity>
      )}

      {selectedLeave && (
        <Modal
          visible={isDetailOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsDetailOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: theme.cardBg }]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.textMain }]}>
                  {t("leave.detailTitle")}
                </Text>
                <TouchableOpacity onPress={() => setIsDetailOpen(false)}>
                  <Ionicons name="close" size={24} color={theme.textMain} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  {selectedLeave.isPendingApproval && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {t("leave.employee")}
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: theme.textMain }]}
                      >
                        {selectedLeave.employeeName}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {t("leave.type")}
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.textMain, fontWeight: "800" },
                      ]}
                    >
                      {selectedLeave.typeName || "—"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {t("leave.session")}
                    </Text>
                    <Text
                      style={[styles.detailValue, { color: theme.textMain }]}
                    >
                      {t(sessionLabelKey(selectedLeave.session))}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {t("leave.period")}
                    </Text>
                    <Text
                      style={[styles.detailValue, { color: theme.textMain }]}
                    >
                      {selectedLeave.startDate} → {selectedLeave.endDate} (
                      {t("leave.daysCount", { n: selectedLeave.days })})
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {t("leave.reason")}
                    </Text>
                    <Text
                      style={[styles.detailValue, { color: theme.textMain }]}
                    >
                      {selectedLeave.reason}
                    </Text>
                  </View>

                  {!!selectedLeave.attachmentUrl && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {t("leave.attachment")}
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: theme.primary }]}
                        numberOfLines={2}
                      >
                        {selectedLeave.attachmentUrl}
                      </Text>
                    </View>
                  )}

                  {!selectedLeave.isPendingApproval && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {t("leave.approver")}
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: theme.textMain }]}
                      >
                        {selectedLeave.approverName}
                      </Text>
                    </View>
                  )}

                  {!!selectedLeave.approvedAt &&
                    selectedLeave.approvedAt !== "--/--/----" && (
                      <View style={styles.detailRow}>
                        <Text
                          style={[
                            styles.detailLabel,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {t("leave.approvedAt")}
                        </Text>
                        <Text
                          style={[
                            styles.detailValue,
                            { color: theme.textMain },
                          ]}
                        >
                          {selectedLeave.approvedAt}
                        </Text>
                      </View>
                    )}

                  {!!selectedLeave.approverNote && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {t("leave.approverNote")}
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: theme.textMain }]}
                      >
                        {selectedLeave.approverNote}
                      </Text>
                    </View>
                  )}

                  {!!selectedLeave.cancelReason && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {t("leave.cancelReason")}
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: theme.textMain }]}
                      >
                        {selectedLeave.cancelReason}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {t("leave.status")}
                    </Text>
                    <Badge action={selectedLeave.statusAction}>
                      <BadgeText>{t(selectedLeave.statusLabelKey)}</BadgeText>
                    </Badge>
                  </View>

                  {selectedLeave.isPendingApproval && (
                    <View style={styles.inputGroup}>
                      <Text
                        style={[
                          styles.inputLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {t("leave.approverNote")}
                      </Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            height: 72,
                            color: theme.textMain,
                            borderColor: theme.border,
                            backgroundColor: theme.background,
                          },
                        ]}
                        placeholder={t("leave.approverNotePlaceholder")}
                        placeholderTextColor={theme.textSecondary}
                        multiline
                        value={approverNote}
                        onChangeText={setApproverNote}
                      />
                    </View>
                  )}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                {selectedLeave.isPendingApproval ? (
                  <>
                    <TouchableOpacity
                      style={[styles.cancelBtn, { borderColor: "#EF4444" }]}
                      onPress={() => handleReject(selectedLeave.id)}
                      disabled={submitting}
                    >
                      <Text style={styles.cancelBtnText}>
                        {t("leave.reject")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.closeBtn, { backgroundColor: "#16A34A" }]}
                      onPress={() => handleApprove(selectedLeave.id)}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.closeBtnText}>
                          {t("leave.approve")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {selectedLeave.status === DAY_OFF_STATUS.PENDING.code && (
                      <TouchableOpacity
                        style={[styles.cancelBtn, { borderColor: "#EF4444" }]}
                        onPress={() => handleCancelLeave(selectedLeave.id)}
                      >
                        <Text style={styles.cancelBtnText}>
                          {t("leave.cancelRequest")}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[
                        styles.closeBtn,
                        { backgroundColor: theme.primary },
                      ]}
                      onPress={() => setIsDetailOpen(false)}
                    >
                      <Text style={styles.closeBtnText}>
                        {t("common.close")}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      <Modal
        visible={isCreateOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCreateOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.cardBg, maxHeight: "90%" },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textMain }]}>
                {t("leave.createTitle")}
              </Text>
              <TouchableOpacity onPress={() => setIsCreateOpen(false)}>
                <Ionicons name="close" size={24} color={theme.textMain} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  {t("leave.formType")}
                </Text>
                {formOptions.length === 0 ? (
                  <Text
                    style={[styles.balanceSubText, { color: theme.warning }]}
                  >
                    {t("leave.noConfigs")}
                  </Text>
                ) : (
                  <View style={styles.pickerRow}>
                    {formOptions.map((option) => {
                      const active = isOptionActive(option);
                      const key = option.id || option.code;
                      return (
                        <TouchableOpacity
                          key={key}
                          style={[
                            styles.pickerChip,
                            active && {
                              backgroundColor: theme.primary,
                              borderColor: theme.primary,
                            },
                          ]}
                          onPress={() => selectFormOption(option)}
                        >
                          <Text
                            style={[
                              styles.pickerChipText,
                              active
                                ? { color: "#FFFFFF" }
                                : { color: theme.textMain },
                            ]}
                          >
                            {typeLabel(option)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  {t("leave.session")}
                </Text>
                <View style={styles.pickerRow}>
                  {SESSION_OPTIONS.map((session) => {
                    const active = formSession === session;
                    return (
                      <TouchableOpacity
                        key={session}
                        style={[
                          styles.pickerChip,
                          active && {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                          },
                        ]}
                        onPress={() => setSession(session)}
                      >
                        <Text
                          style={[
                            styles.pickerChipText,
                            active
                              ? { color: "#FFFFFF" }
                              : { color: theme.textMain },
                          ]}
                        >
                          {t(sessionLabelKey(session))}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  {t("leave.fromDate")}
                </Text>
                <DateInput
                  value={formStartDate}
                  label={t("leave.fromDate")}
                  placeholder={t("leave.datePlaceholder")}
                  presentation="inline"
                  onChange={(iso) => {
                    setFormStartDate(iso);
                    if (
                      formSession === "AM" ||
                      formSession === "PM" ||
                      (formEndDate && formEndDate < iso)
                    ) {
                      setFormEndDate(iso);
                    }
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  {t("leave.toDate")}
                </Text>
                <DateInput
                  value={formEndDate}
                  label={t("leave.toDate")}
                  placeholder={t("leave.datePlaceholder")}
                  presentation="inline"
                  minDate={formStartDate || undefined}
                  onChange={(iso) => {
                    if (formSession === "AM" || formSession === "PM") {
                      setFormEndDate(formStartDate || iso);
                      return;
                    }
                    setFormEndDate(iso);
                  }}
                />
              </View>

              <View style={styles.previewRow}>
                {previewLoading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Text style={[styles.previewText, { color: theme.primary }]}>
                    {t("leave.previewDays", {
                      n: formatDays(previewTotalDays ?? 0),
                    })}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  {t("leave.reasonLabel")}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      height: 80,
                      color: theme.textMain,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  placeholder={t("leave.reasonPlaceholder")}
                  placeholderTextColor={theme.textSecondary}
                  multiline={true}
                  numberOfLines={3}
                  value={formReason}
                  onChangeText={setFormReason}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  {requireAttachment
                    ? t("leave.attachmentLabelRequired")
                    : t("leave.attachmentLabel")}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: theme.textMain,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  placeholder={t("leave.attachmentPlaceholder")}
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                  value={formAttachmentUrl}
                  onChangeText={setFormAttachmentUrl}
                />
                <TouchableOpacity
                  style={[
                    styles.uploadBtn,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  onPress={handleUploadAttachment}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <>
                      <Ionicons
                        name="cloud-upload-outline"
                        size={16}
                        color={theme.primary}
                      />
                      <Text
                        style={[styles.uploadBtnText, { color: theme.primary }]}
                      >
                        {t("leave.uploadAttachment")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                onPress={() => setIsCreateOpen(false)}
                disabled={submitting}
              >
                <Text
                  style={[styles.modalCancelText, { color: theme.textMain }]}
                >
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  { backgroundColor: theme.primary },
                ]}
                onPress={handleCreateSubmit}
                disabled={submitting || uploading}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    {t("leave.submit")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 110 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  balanceCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  balanceNum: { fontSize: 24, fontWeight: "800" },
  progressBg: {
    height: 8,
    borderRadius: 4,
    marginVertical: 14,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  balancePending: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  balanceSubText: { fontSize: 12, fontWeight: "500" },
  filterScroll: { paddingBottom: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  filterText: { fontSize: 12, fontWeight: "700" },
  monthSection: { marginBottom: 20 },
  monthGroupTitle: { fontSize: 13, fontWeight: "800", marginBottom: 12 },
  leaveCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  typeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  leaveTypeName: { fontSize: 14, fontWeight: "700" },
  employeeText: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  dateRangeText: { fontSize: 13, fontWeight: "500", marginBottom: 12 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardFooterLabel: { fontSize: 10, fontWeight: "500", flex: 1, marginRight: 8 },
  cardActionRow: { flexDirection: "row", gap: 6 },
  cardApproveBtn: {
    borderWidth: 1.2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cardApproveBtnText: { color: "#16A34A", fontSize: 11, fontWeight: "700" },
  cardCancelBtn: {
    borderWidth: 1.2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cardCancelBtnText: { color: "#EF4444", fontSize: 11, fontWeight: "700" },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },
  emptyCta: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  emptyCtaText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  fabBtn: {
    position: "absolute",
    bottom: 96,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  fabBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: { width: "100%", borderRadius: 24, padding: 20, maxWidth: 400 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  modalBody: { gap: 16, marginBottom: 20 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: { fontSize: 13, fontWeight: "500" },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  modalFooter: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: { color: "#EF4444", fontSize: 14, fontWeight: "700" },
  closeBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  inputGroup: { gap: 6, marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: "700" },
  pickerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pickerChip: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pickerChipText: { fontSize: 11, fontWeight: "700" },
  previewRow: { marginBottom: 14, minHeight: 20, justifyContent: "center" },
  previewText: { fontSize: 14, fontWeight: "800" },
  textInput: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  uploadBtn: {
    marginTop: 4,
    height: 42,
    borderWidth: 1.5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadBtnText: { fontSize: 13, fontWeight: "700" },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelText: { fontSize: 14, fontWeight: "700" },
  modalSubmitBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modalSubmitText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
