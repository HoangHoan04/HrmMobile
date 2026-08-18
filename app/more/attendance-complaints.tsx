import { DateInput } from "@/components/ui/input/DateInput";
import { Colors } from "@/constants/common/Colors";
import { enumData } from "@/constants/enums/enumData";
import { useAttendanceComplaint } from "@/features/attendance/hooks/useAttendanceComplaint";
import type {
  AttendanceComplaintDto,
  AttendanceComplaintType,
} from "@/features/attendance/types";
import {
  MoreCard,
  MoreListShell,
} from "@/features/more/components/MoreListShell";
import { showToastError } from "@/helper/ToastEventEmitter";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export default function AttendanceComplaintsScreen() {
  const theme = Colors[useThemeStore((s) => s.theme)];
  const { t } = useLanguageStore();
  const {
    myList,
    loadingList,
    refetchList,
    createComplaint,
    creating,
    cancelComplaint,
    cancelling,
  } = useAttendanceComplaint(true);

  const [formOpen, setFormOpen] = useState(false);
  const [workDate, setWorkDate] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [complaintType, setComplaintType] =
    useState<AttendanceComplaintType>("FORGOT_BOTH");
  const [requestedCheckIn, setRequestedCheckIn] = useState("08:00");
  const [requestedCheckOut, setRequestedCheckOut] = useState("17:30");
  const [reason, setReason] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const complaintTypes = Object.values(enumData.ATTENDANCE_COMPLAINT_TYPE);

  const showCheckIn =
    complaintType === "FORGOT_CHECK_IN" ||
    complaintType === "FORGOT_BOTH" ||
    complaintType === "WRONG_TIME" ||
    complaintType === "OTHER";

  const showCheckOut =
    complaintType === "FORGOT_CHECK_OUT" ||
    complaintType === "FORGOT_BOTH" ||
    complaintType === "WRONG_TIME" ||
    complaintType === "OTHER";

  const submit = async () => {
    if (!workDate) {
      showToastError(t("checkin.complaint.reasonRequired"));
      return;
    }
    const cleanReason = reason.trim();
    if (!cleanReason) {
      showToastError(t("checkin.complaint.reasonRequired"));
      return;
    }
    if (
      showCheckIn &&
      requestedCheckIn &&
      !TIME_REGEX.test(requestedCheckIn.trim())
    ) {
      showToastError(t("checkin.complaint.invalidTime"));
      return;
    }
    if (
      showCheckOut &&
      requestedCheckOut &&
      !TIME_REGEX.test(requestedCheckOut.trim())
    ) {
      showToastError(t("checkin.complaint.invalidTime"));
      return;
    }

    try {
      await createComplaint({
        workDate,
        complaintType,
        requestedCheckInTime: showCheckIn
          ? requestedCheckIn.trim() || null
          : null,
        requestedCheckOutTime: showCheckOut
          ? requestedCheckOut.trim() || null
          : null,
        reason: cleanReason,
        attachmentUrl: attachmentUrl.trim() || null,
      });
      setReason("");
      setAttachmentUrl("");
      setFormOpen(false);
    } catch {
      //! toasted
    }
  };

  const handleCancel = (item: AttendanceComplaintDto) => {
    Alert.alert(t("common.confirm"), t("checkin.complaint.cancelConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.confirm"),
        style: "destructive",
        onPress: async () => {
          try {
            await cancelComplaint(item.id);
          } catch {}
        },
      },
    ]);
  };

  const filteredList = useMemo(() => {
    if (filterStatus === "ALL") return myList;
    return myList.filter((x) => x.status === filterStatus);
  }, [myList, filterStatus]);

  const resolveTypeName = (type: AttendanceComplaintType) => {
    const meta = complaintTypes.find((c) => c.code === type);
    return meta ? t(meta.labelKey) : type;
  };

  const resolveStatusMeta = (status: string) => {
    switch (status) {
      case "APPROVED":
        return { label: t("common.approved"), color: "#16A34A", bg: "#DCFCE7" };
      case "REJECTED":
        return { label: t("common.rejected"), color: "#DC2626", bg: "#FEE2E2" };
      case "CANCELLED":
        return {
          label: t("common.cancelled"),
          color: "#64748B",
          bg: "#F1F5F9",
        };
      default:
        return { label: t("common.pending"), color: "#D97706", bg: "#FEF3C7" };
    }
  };

  return (
    <MoreListShell
      loading={loadingList && myList.length === 0}
      refreshing={loadingList}
      onRefresh={() => void refetchList()}
      empty={false}
      headerExtra={
        <View style={{ gap: 12, marginBottom: 14 }}>
          <TouchableOpacity
            style={[
              styles.toggleFormBtn,
              {
                backgroundColor: formOpen ? theme.cardBg : theme.primary,
                borderColor: formOpen ? theme.border : theme.primary,
                borderWidth: 1,
              },
            ]}
            onPress={() => setFormOpen((prev) => !prev)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={formOpen ? "close-circle-outline" : "add-circle-outline"}
              size={20}
              color={formOpen ? theme.textMain : "#fff"}
            />
            <Text
              style={[
                styles.toggleFormText,
                { color: formOpen ? theme.textMain : "#fff" },
              ]}
            >
              {formOpen ? t("common.cancel") : t("checkin.complaint.action")}
            </Text>
          </TouchableOpacity>

          {formOpen ? (
            <View
              style={[
                styles.form,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.formTitle, { color: theme.textMain }]}>
                {t("checkin.complaint.title")}
              </Text>
              <Text
                style={[styles.formSubtitle, { color: theme.textSecondary }]}
              >
                {t("checkin.complaint.subtitle")}
              </Text>

              <DateInput
                value={workDate}
                label={t("common.date")}
                placeholder={t("common.date")}
                presentation="inline"
                onChange={setWorkDate}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t("checkin.complaint.typeLabel")}
              </Text>
              <View style={styles.typeWrap}>
                {complaintTypes.map((item) => {
                  const active = complaintType === item.code;
                  return (
                    <TouchableOpacity
                      key={item.code}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor: active
                            ? theme.primary + "1A"
                            : theme.background,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() =>
                        setComplaintType(item.code as AttendanceComplaintType)
                      }
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          {
                            color: active ? theme.primary : theme.textSecondary,
                            fontWeight: active ? "700" : "500",
                          },
                        ]}
                      >
                        {t(item.labelKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {showCheckIn ? (
                <View>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    {t("checkin.complaint.requestedCheckIn")}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.textMain,
                        borderColor: theme.border,
                        backgroundColor: theme.background,
                      },
                    ]}
                    placeholder="08:00"
                    placeholderTextColor={theme.textSecondary}
                    value={requestedCheckIn}
                    onChangeText={setRequestedCheckIn}
                  />
                </View>
              ) : null}

              {showCheckOut ? (
                <View>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    {t("checkin.complaint.requestedCheckOut")}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.textMain,
                        borderColor: theme.border,
                        backgroundColor: theme.background,
                      },
                    ]}
                    placeholder="17:30"
                    placeholderTextColor={theme.textSecondary}
                    value={requestedCheckOut}
                    onChangeText={setRequestedCheckOut}
                  />
                </View>
              ) : null}

              <View>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  {t("checkin.complaint.reason")} *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.reasonInput,
                    {
                      color: theme.textMain,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  placeholder={t("checkin.complaint.reasonPlaceholder")}
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  value={reason}
                  onChangeText={setReason}
                />
              </View>

              <View>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  {t("checkin.complaint.evidence")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textMain,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  placeholder="https://..."
                  placeholderTextColor={theme.textSecondary}
                  value={attachmentUrl}
                  onChangeText={setAttachmentUrl}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                onPress={submit}
                disabled={creating}
                activeOpacity={0.8}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {t("checkin.complaint.submit")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.filterRow}>
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => {
              const active = filterStatus === st;
              const labelMap: Record<string, string> = {
                ALL: t("common.all"),
                PENDING: t("common.pending"),
                APPROVED: t("common.approved"),
                REJECTED: t("common.rejected"),
              };
              return (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? theme.primary : theme.cardBg,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setFilterStatus(st)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: active ? "#fff" : theme.textSecondary },
                    ]}
                  >
                    {labelMap[st]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      }
    >
      {filteredList.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons
            name="document-text-outline"
            size={48}
            color={theme.textSecondary}
            style={{ opacity: 0.5, marginBottom: 8 }}
          />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {t("common.noData")}
          </Text>
        </View>
      ) : (
        filteredList.map((item) => {
          const statusMeta = resolveStatusMeta(item.status);
          return (
            <MoreCard key={item.id}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardDate, { color: theme.textMain }]}>
                    {item.workDate ? item.workDate.slice(0, 10) : "—"}
                  </Text>
                  <Text style={[styles.cardType, { color: theme.primary }]}>
                    {resolveTypeName(item.complaintType)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusMeta.bg },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: statusMeta.color }]}
                  >
                    {statusMeta.label}
                  </Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                {item.requestedCheckInTime ? (
                  <View style={styles.timeItem}>
                    <Text
                      style={[styles.timeLabel, { color: theme.textSecondary }]}
                    >
                      {t("checkin.complaint.requestedCheckInShort")}:
                    </Text>
                    <Text style={[styles.timeVal, { color: theme.textMain }]}>
                      {item.requestedCheckInTime}
                    </Text>
                  </View>
                ) : null}
                {item.requestedCheckOutTime ? (
                  <View style={styles.timeItem}>
                    <Text
                      style={[styles.timeLabel, { color: theme.textSecondary }]}
                    >
                      {t("checkin.complaint.requestedCheckOutShort")}:
                    </Text>
                    <Text style={[styles.timeVal, { color: theme.textMain }]}>
                      {item.requestedCheckOutTime}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.reasonWrap}>
                <Text
                  style={[styles.reasonLabel, { color: theme.textSecondary }]}
                >
                  {t("checkin.complaint.reason")}:
                </Text>
                <Text style={[styles.reasonVal, { color: theme.textMain }]}>
                  {item.reason}
                </Text>
              </View>

              {item.approverNote ? (
                <View
                  style={[
                    styles.approverNoteWrap,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.approverNoteLabel,
                      { color: statusMeta.color },
                    ]}
                  >
                    {t("common.approverNote")}:
                  </Text>
                  <Text
                    style={[styles.approverNoteVal, { color: theme.textMain }]}
                  >
                    {item.approverNote}
                  </Text>
                </View>
              ) : null}

              {item.status === "PENDING" ? (
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: "#EF4444" }]}
                  onPress={() => handleCancel(item)}
                  disabled={cancelling}
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  <Text style={styles.cancelBtnText}>
                    {t("common.cancelRequest")}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </MoreCard>
          );
        })
      )}
    </MoreListShell>
  );
}

const styles = StyleSheet.create({
  toggleFormBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  toggleFormText: {
    fontSize: 14,
    fontWeight: "700",
  },
  form: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  formSubtitle: {
    fontSize: 12,
    marginTop: -4,
    marginBottom: 4,
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  typeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeChip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeChipText: {
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  reasonInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  submitBtn: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardDate: {
    fontSize: 15,
    fontWeight: "800",
  },
  cardType: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  timeRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeLabel: {
    fontSize: 12,
  },
  timeVal: {
    fontSize: 12,
    fontWeight: "700",
  },
  reasonWrap: {
    marginTop: 8,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  reasonVal: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  approverNoteWrap: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  approverNoteLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  approverNoteVal: {
    fontSize: 12,
    lineHeight: 16,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    marginTop: 12,
  },
  cancelBtnText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "700",
  },
});
