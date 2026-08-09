import { Badge, BadgeText } from "@/components/common/Badge";
import { Colors } from "@/constants/common/Colors";
import { enumData } from "@/constants/enums/enumData";
import { RegisterDayOffDto, useLeave } from "@/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LeaveUiStatus = "pending" | "approved" | "rejected" | "cancelled";
type LeaveUiType = "annual" | "sick" | "unpaid" | "other";

interface LeaveRequest {
  id: string;
  type: LeaveUiType;
  typeName: string;
  typeIcon: string;
  typeColor: string;
  status: LeaveUiStatus;
  statusText: string;
  statusAction: "warning" | "success" | "error" | "muted";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  approverName: string;
  submittedAt: string;
}

function formatDisplayDate(value?: string | null): string {
  if (!value) return "--/--/----";
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("vi-VN");
}

function parseInputDateToIso(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function mapLeaveDto(dto: RegisterDayOffDto): LeaveRequest {
  const typeKey = (dto.dayOffType || "ANNUAL").toUpperCase();
  const typeMeta =
    enumData.DAY_OFF_TYPE[typeKey as keyof typeof enumData.DAY_OFF_TYPE] ||
    enumData.DAY_OFF_TYPE.OTHER;
  const statusKey = (dto.status || "PENDING").toUpperCase();
  const statusMeta =
    enumData.DAY_OFF_STATUS[
      statusKey as keyof typeof enumData.DAY_OFF_STATUS
    ] || enumData.DAY_OFF_STATUS.PENDING;

  const typeUiMap: Record<string, LeaveUiType> = {
    ANNUAL: "annual",
    SICK: "sick",
    UNPAID: "unpaid",
    OTHER: "other",
  };
  const statusUiMap: Record<string, LeaveUiStatus> = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    CANCELLED: "cancelled",
  };

  return {
    id: dto.id,
    type: typeUiMap[typeKey] || "other",
    typeName: dto.dayOffConfigName || typeMeta.label,
    typeIcon: typeMeta.icon,
    typeColor: typeMeta.color,
    status: statusUiMap[statusKey] || "pending",
    statusText: statusMeta.label,
    statusAction: statusMeta.action,
    startDate: formatDisplayDate(dto.fromDate),
    endDate: formatDisplayDate(dto.toDate),
    days: Number(dto.totalDays) || 0,
    reason: dto.reason || "",
    approverName: dto.approverName || "—",
    submittedAt: formatDisplayDate(dto.createdAt),
  };
}

export default function LeaveScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const {
    leaves: leaveDtos,
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
  const [formType, setFormType] = useState<
    "ANNUAL" | "SICK" | "UNPAID" | "OTHER"
  >("ANNUAL");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formReason, setFormReason] = useState("");

  useFocusEffect(
    useCallback(() => {
      fetchMyList().catch(() => undefined);
    }, [fetchMyList]),
  );

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
    Alert.alert(
      "Hủy đơn",
      "Bạn có chắc chắn muốn hủy đơn xin này không?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelLeave(id);
              setIsDetailOpen(false);
            } catch {}
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleCreateSubmit = async () => {
    const fromDate = parseInputDateToIso(formStartDate);
    const toDate = parseInputDateToIso(formEndDate);
    if (!fromDate || !toDate || !formReason.trim()) {
      Alert.alert(
        "Lỗi",
        "Vui lòng nhập đầy đủ từ ngày, đến ngày (DD/MM/YYYY) và lý do.",
      );
      return;
    }

    try {
      await createLeave({
        dayOffType: formType,
        fromDate,
        toDate,
        reason: formReason.trim(),
      });
      setIsCreateOpen(false);
      setFormStartDate("");
      setFormEndDate("");
      setFormReason("");
      setFormType("ANNUAL");
    } catch {}
  };

  const balance = useMemo(() => {
    const approvedAnnual = leaves
      .filter((l) => l.type === "annual" && l.status === "approved")
      .reduce((sum, l) => sum + l.days, 0);
    const sickUsed = leaves
      .filter((l) => l.type === "sick" && l.status === "approved")
      .reduce((sum, l) => sum + l.days, 0);
    const total = 12;
    const remaining = Math.max(0, total - approvedAnnual);
    return { total, used: approvedAnnual, remaining, sickUsed };
  }, [leaves]);

  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let cancelled = 0;

    leaves.forEach((l) => {
      if (l.status === "pending") pending++;
      else if (l.status === "approved") approved++;
      else if (l.status === "rejected") rejected++;
      else if (l.status === "cancelled") cancelled++;
    });

    return { pending, approved, rejected, cancelled };
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
        parts.length === 3 ? `Tháng ${parts[1]}/${parts[2]}` : "Khác";
      if (!groups[monthStr]) {
        groups[monthStr] = [];
      }
      groups[monthStr].push(item);
    });

    return groups;
  }, [leaves, selectedFilter]);

  const hasItems = Object.keys(groupedLeaves).length > 0;

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
            Đơn Từ
          </Text>
        </View>

        <View
          style={[
            styles.balanceCard,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <View style={styles.balanceHeader}>
            <Text style={[styles.balanceTitle, { color: theme.textSecondary }]}>
              PHÉP NĂM CÒN LẠI
            </Text>
            <Text style={[styles.balanceNum, { color: theme.primary }]}>
              {balance.remaining}{" "}
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                / {balance.total} ngày
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
                  width: `${(balance.remaining / balance.total) * 100}%`,
                },
              ]}
            />
          </View>

          <Text style={[styles.balanceSubText, { color: theme.textSecondary }]}>
            Nghỉ ốm: đã dùng {balance.sickUsed} ngày · Nghỉ không lương: 0 ngày
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
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "pending"
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() => setSelectedFilter("pending")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "pending"
                  ? { color: "#FFFFFF" }
                  : { color: theme.textMain },
              ]}
            >
              Đang duyệt ({counts.pending})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "approved"
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() => setSelectedFilter("approved")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "approved"
                  ? { color: "#FFFFFF" }
                  : { color: theme.textMain },
              ]}
            >
              Đã duyệt ({counts.approved})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "rejected"
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() => setSelectedFilter("rejected")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "rejected"
                  ? { color: "#FFFFFF" }
                  : { color: theme.textMain },
              ]}
            >
              Từ chối ({counts.rejected})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "cancelled"
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={() => setSelectedFilter("cancelled")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "cancelled"
                  ? { color: "#FFFFFF" }
                  : { color: theme.textMain },
              ]}
            >
              Đã hủy ({counts.cancelled})
            </Text>
          </TouchableOpacity>
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
              Đang tải đơn từ...
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
                        {item.typeName}
                      </Text>
                    </View>
                    <Badge action={item.statusAction}>
                      <BadgeText>{item.statusText}</BadgeText>
                    </Badge>
                  </View>

                  <Text
                    style={[styles.dateRangeText, { color: theme.textMain }]}
                  >
                    {item.startDate}{" "}
                    {item.startDate !== item.endDate && `→ ${item.endDate}`} ·{" "}
                    <Text style={{ fontWeight: "700", color: theme.primary }}>
                      {item.days} ngày
                    </Text>
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text
                      style={[
                        styles.cardFooterLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Gửi lúc: {item.submittedAt} · Người duyệt:{" "}
                      {item.approverName}
                    </Text>

                    {item.status === "pending" && (
                      <TouchableOpacity
                        style={[
                          styles.cardCancelBtn,
                          { borderColor: "#EF4444" },
                        ]}
                        onPress={() => handleCancelLeave(item.id)}
                      >
                        <Text style={styles.cardCancelBtnText}>Hủy đơn</Text>
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
              Không có đơn từ nào
            </Text>
            <Text
              style={[styles.emptyStateDesc, { color: theme.textSecondary }]}
            >
              Bạn chưa gửi đơn từ nào hoặc bộ lọc hiện tại không khớp dữ liệu.
            </Text>
            <TouchableOpacity
              style={[styles.emptyCta, { backgroundColor: theme.primary }]}
              onPress={() => setIsCreateOpen(true)}
            >
              <Text style={styles.emptyCtaText}>Tạo đơn ngay</Text>
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
        <Text style={styles.fabBtnText}>Tạo đơn</Text>
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
                  Chi tiết đơn từ
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
                    Loại đơn
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.textMain, fontWeight: "800" },
                    ]}
                  >
                    {selectedLeave.typeName}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: theme.textSecondary }]}
                  >
                    Thời gian
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.textMain }]}>
                    {selectedLeave.startDate} → {selectedLeave.endDate} (
                    {selectedLeave.days} ngày)
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: theme.textSecondary }]}
                  >
                    Lý do
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.textMain }]}>
                    {selectedLeave.reason}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: theme.textSecondary }]}
                  >
                    Người duyệt
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.textMain }]}>
                    {selectedLeave.approverName}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text
                    style={[styles.detailLabel, { color: theme.textSecondary }]}
                  >
                    Trạng thái
                  </Text>
                  <Badge action={selectedLeave.statusAction}>
                    <BadgeText>{selectedLeave.statusText}</BadgeText>
                  </Badge>
                </View>
              </View>

              <View style={styles.modalFooter}>
                {selectedLeave.status === "pending" && (
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: "#EF4444" }]}
                    onPress={() => handleCancelLeave(selectedLeave.id)}
                  >
                    <Text style={styles.cancelBtnText}>Hủy yêu cầu</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setIsDetailOpen(false)}
                >
                  <Text style={styles.closeBtnText}>Đóng</Text>
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
                Tạo đơn mới
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
                  Loại đơn từ
                </Text>
                <View style={styles.pickerRow}>
                  {(["ANNUAL", "SICK", "UNPAID", "OTHER"] as const).map(
                    (type) => {
                      const active = formType === type;
                      const labels = {
                        ANNUAL: "Nghỉ phép",
                        SICK: "Nghỉ ốm",
                        UNPAID: "Không lương",
                        OTHER: "Khác",
                      };
                      return (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.pickerChip,
                            active && {
                              backgroundColor: theme.primary,
                              borderColor: theme.primary,
                            },
                          ]}
                          onPress={() => setFormType(type)}
                        >
                          <Text
                            style={[
                              styles.pickerChipText,
                              active
                                ? { color: "#FFFFFF" }
                                : { color: theme.textMain },
                            ]}
                          >
                            {labels[type]}
                          </Text>
                        </TouchableOpacity>
                      );
                    },
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  Từ ngày
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
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={theme.textSecondary}
                  value={formStartDate}
                  onChangeText={setFormStartDate}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  Đến ngày
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
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={theme.textSecondary}
                  value={formEndDate}
                  onChangeText={setFormEndDate}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  Lý do nghỉ
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
                  placeholder="Nhập lý do cụ thể..."
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
                  Hủy
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
                  <Text style={styles.modalSubmitText}>Gửi đơn</Text>
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
