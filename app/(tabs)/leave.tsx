import { Badge, BadgeText } from "@/components/ui/Badge";
import { DrawerMenuButton } from "@/components/layout/drawer";
import { showConfirm } from "@/components/ui/confirm";
import { DateInput } from "@/components/ui/input/DateInput";
import { Colors } from "@/constants/common/Colors";
import {
  DAY_OFF_STATUS,
  DAY_OFF_STATUS_OPTIONS,
  DayOffStatusCode,
  resolveDayOffStatus,
} from "@/constants/enums/dayOffStatus";
import {
  DAY_OFF_TYPE,
  DAY_OFF_TYPE_OPTIONS,
  DayOffTypeCode,
  resolveDayOffType,
} from "@/constants/enums/dayOffType";
import { formatDisplayDate } from "@/features/common";
import { showToastError } from "@/helper/ToastEventEmitter";
import {
  MobileLeaveConfigDto,
  RegisterDayOffDto,
  useLeave,
} from "@/hooks";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
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

interface LeaveRequest {
  id: string;
  type: DayOffTypeCode;
  typeName: string;
  typeLabelKey: string;
  typeIcon: string;
  typeColor: string;
  status: DayOffStatusCode;
  statusLabelKey: string;
  statusAction: "warning" | "success" | "error" | "muted";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  approverName: string;
  submittedAt: string;
}

function formatDays(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function mapLeaveDto(dto: RegisterDayOffDto): LeaveRequest {
  const typeMeta = resolveDayOffType(dto.dayOffType);
  const statusMeta = resolveDayOffStatus(dto.status);

  return {
    id: dto.id,
    type: typeMeta.code as DayOffTypeCode,
    typeName: dto.dayOffConfigName || "",
    typeLabelKey: typeMeta.labelKey,
    typeIcon: typeMeta.icon,
    typeColor: typeMeta.color,
    status: statusMeta.code as DayOffStatusCode,
    statusLabelKey: statusMeta.labelKey,
    statusAction: statusMeta.action,
    startDate: formatDisplayDate(dto.fromDate),
    endDate: formatDisplayDate(dto.toDate),
    days: Number(dto.totalDays) || 0,
    reason: dto.reason || "",
    approverName: dto.approverName || "—",
    submittedAt: formatDisplayDate(dto.createdAt),
  };
}

function toFormOptions(configs: MobileLeaveConfigDto[]): MobileLeaveConfigDto[] {
  if (configs.length > 0) return configs;
  return DAY_OFF_TYPE_OPTIONS.map((item) => ({
    id: "",
    code: item.code,
    name: "",
    dayOffType: item.code,
    defaultDaysPerYear: 0,
    isPaid: item.isPaid,
  }));
}

export default function LeaveScreen() {
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];
  const { t, language } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const {
    leaves: leaveDtos,
    balance,
    configs,
    loading,
    submitting,
    fetchMyList,
    createLeave,
    cancelLeave,
  } = useLeave();

  const leaves = useMemo(() => leaveDtos.map(mapLeaveDto), [leaveDtos]);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formConfigId, setFormConfigId] = useState<string | null>(null);
  const [formType, setFormType] = useState<DayOffTypeCode>(
    DAY_OFF_TYPE.ANNUAL.code as DayOffTypeCode,
  );
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formReason, setFormReason] = useState("");

  const formOptions = useMemo(() => toFormOptions(configs), [configs]);

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
    setFormType(resolveDayOffType(first.dayOffType).code as DayOffTypeCode);
  }, [isCreateOpen, formOptions]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchMyList();
    } catch {
    } finally {
      setRefreshing(false);
    }
  }, [fetchMyList]);

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

  const handleCreateSubmit = async () => {
    if (!formStartDate || !formEndDate || !formReason.trim()) {
      showToastError(t("leave.validationRequired"));
      return;
    }
    if (formEndDate < formStartDate) {
      showToastError(t("leave.validationDateOrder"));
      return;
    }

    try {
      await createLeave({
        dayOffType: formType,
        fromDate: formStartDate,
        toDate: formEndDate,
        reason: formReason.trim(),
        dayOffConfigId: formConfigId || null,
      });
      setIsCreateOpen(false);
      setFormStartDate("");
      setFormEndDate("");
      setFormReason("");
      setFormConfigId(null);
      setFormType(DAY_OFF_TYPE.ANNUAL.code as DayOffTypeCode);
    } catch {}
  };

  const balanceUi = useMemo(() => {
    const total = Number(balance?.annualTotal) || 0;
    const remaining = Number(balance?.annualRemaining) || 0;
    const used = Number(balance?.annualUsed) || 0;
    const sickUsed = Number(balance?.sickUsed) || 0;
    const unpaidUsed = Number(balance?.unpaidUsed) || 0;
    const progress =
      total > 0 ? Math.min(100, Math.max(0, (remaining / total) * 100)) : 0;
    return { total, remaining, used, sickUsed, unpaidUsed, progress };
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

  const groupedLeaves = useMemo(() => {
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
  }, [leaves, selectedFilter, t, language]);

  const hasItems = Object.keys(groupedLeaves).length > 0;

  const typeLabel = (option: MobileLeaveConfigDto) => {
    if (option.name?.trim()) return option.name;
    return t(resolveDayOffType(option.dayOffType || option.code).labelKey);
  };

  const selectFormOption = (option: MobileLeaveConfigDto) => {
    setFormConfigId(option.id || null);
    setFormType(
      resolveDayOffType(option.dayOffType || option.code).code as DayOffTypeCode,
    );
  };

  const isOptionActive = (option: MobileLeaveConfigDto) => {
    if (option.id && formConfigId) return option.id === formConfigId;
    return resolveDayOffType(option.dayOffType || option.code).code === formType;
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
                {t("leave.daysOfTotal", { n: formatDays(balanceUi.total) })}
              </Text>
            </Text>
          </View>

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
                    active
                      ? { color: "#FFFFFF" }
                      : { color: theme.textMain },
                  ]}
                >
                  {filterLabel(code, counts[code])}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading && leaves.length === 0 ? (
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
                  key={item.id}
                  style={[
                    styles.leaveCard,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedLeave(item);
                    setIsDetailOpen(true);
                  }}
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
                        {item.typeName || t(item.typeLabelKey)}
                      </Text>
                    </View>
                    <Badge action={item.statusAction}>
                      <BadgeText>{t(item.statusLabelKey)}</BadgeText>
                    </Badge>
                  </View>

                  <Text
                    style={[styles.dateRangeText, { color: theme.textMain }]}
                  >
                    {item.startDate}{" "}
                    {item.startDate !== item.endDate && `→ ${item.endDate}`} ·{" "}
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
                      {t("leave.submittedAt")}: {item.submittedAt} ·{" "}
                      {t("leave.approver")}: {item.approverName}
                    </Text>

                    {item.status === DAY_OFF_STATUS.PENDING.code && (
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
              {t("leave.emptyTitle")}
            </Text>
            <Text
              style={[styles.emptyStateDesc, { color: theme.textSecondary }]}
            >
              {t("leave.emptyDesc")}
            </Text>
            <TouchableOpacity
              style={[styles.emptyCta, { backgroundColor: theme.primary }]}
              onPress={() => setIsCreateOpen(true)}
            >
              <Text style={styles.emptyCtaText}>{t("leave.createNow")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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

              <View style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: theme.textSecondary }]}
                  >
                    {t("leave.type")}
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.textMain, fontWeight: "800" },
                    ]}
                  >
                    {selectedLeave.typeName || t(selectedLeave.typeLabelKey)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: theme.textSecondary }]}
                  >
                    {t("leave.period")}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.textMain }]}>
                    {selectedLeave.startDate} → {selectedLeave.endDate} (
                    {t("leave.daysCount", { n: selectedLeave.days })})
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: theme.textSecondary }]}
                  >
                    {t("leave.reason")}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.textMain }]}>
                    {selectedLeave.reason}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: theme.textSecondary }]}
                  >
                    {t("leave.approver")}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.textMain }]}>
                    {selectedLeave.approverName}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: theme.textSecondary }]}
                  >
                    {t("leave.status")}
                  </Text>
                  <Badge action={selectedLeave.statusAction}>
                    <BadgeText>{t(selectedLeave.statusLabelKey)}</BadgeText>
                  </Badge>
                </View>
              </View>

              <View style={styles.modalFooter}>
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
                  style={[styles.closeBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setIsDetailOpen(false)}
                >
                  <Text style={styles.closeBtnText}>{t("common.close")}</Text>
                </TouchableOpacity>
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
                <View style={styles.pickerRow}>
                  {formOptions.map((option) => {
                    const active = isOptionActive(option);
                    const key = option.id || option.code || option.dayOffType;
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
                    if (formEndDate && formEndDate < iso) {
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
                  onChange={setFormEndDate}
                />
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
                disabled={submitting}
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
  dateRangeText: { fontSize: 13, fontWeight: "500", marginBottom: 12 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardFooterLabel: { fontSize: 10, fontWeight: "500", flex: 1, marginRight: 8 },
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
  textInput: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
  },
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
