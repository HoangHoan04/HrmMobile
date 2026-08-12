import { DrawerMenuButton } from "@/components/layout/drawer";
import { toMonthStart } from "@/components/ui/calendar";
import { Colors } from "@/constants/common/Colors";
import { useSalary } from "@/features/salary/hooks/useSalary";
import type {
  MobileSalaryStatus,
  SalaryPeriodView,
} from "@/features/salary/types";
import { useLanguageStore } from "@/store/languageStore";
import { useThemeStore } from "@/store/themeStore";

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatMoney(n: number) {
  return Math.abs(n).toLocaleString("vi-VN") + " ₫";
}

function resolveItemLabel(
  t: (path: string, params?: Record<string, string | number>) => string,
  label: string,
) {
  if (label.startsWith("salary.")) {
    const translated = t(label);
    return translated === label ? label : translated;
  }
  return label;
}

function findPeriod(
  periods: SalaryPeriodView[],
  month: Date,
): SalaryPeriodView | null {
  const y = month.getFullYear();
  const m = month.getMonth() + 1;
  return periods.find((p) => p.year === y && p.month === m) ?? null;
}

export default function SalaryScreen() {
  const colorScheme = useThemeStore((s) => s.theme);
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { t } = useLanguageStore();
  const { periods, loading, refreshing, refetch } = useSalary();

  const [currentMonth, setCurrentMonth] = useState(() =>
    toMonthStart(new Date()),
  );
  const [amountVisible, setAmountVisible] = useState(true);
  const [incomeExpanded, setIncomeExpanded] = useState(false);
  const [deductionExpanded, setDeductionExpanded] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [didInitMonth, setDidInitMonth] = useState(false);

  useEffect(() => {
    if (didInitMonth || !periods.length) return;
    const latest = periods[0];
    setCurrentMonth(new Date(latest.year, latest.month - 1, 1));
    setDidInitMonth(true);
  }, [periods, didInitMonth]);

  const currentPeriod = useMemo(
    () => findPeriod(periods, currentMonth),
    [periods, currentMonth],
  );

  const prevCalendarMonth = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    [currentMonth],
  );

  const prevPeriod = useMemo(
    () => findPeriod(periods, prevCalendarMonth),
    [periods, prevCalendarMonth],
  );

  const isCurrentCalendarMonth = useMemo(() => {
    const now = new Date();
    return (
      currentMonth.getFullYear() === now.getFullYear() &&
      currentMonth.getMonth() === now.getMonth()
    );
  }, [currentMonth]);

  const netDiff =
    currentPeriod && prevPeriod
      ? currentPeriod.netSalary - prevPeriod.netSalary
      : null;

  const totalIncome = currentPeriod
    ? currentPeriod.incomeItems.reduce((s, i) => s + i.amount, 0)
    : 0;
  const totalDeduction = currentPeriod
    ? currentPeriod.deductionItems.reduce((s, i) => s + i.amount, 0)
    : 0;

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
    setIncomeExpanded(false);
    setDeductionExpanded(false);
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
    setIncomeExpanded(false);
    setDeductionExpanded(false);
  };

  const jumpToPeriod = (p: SalaryPeriodView) => {
    setCurrentMonth(new Date(p.year, p.month - 1, 1));
    setIncomeExpanded(false);
    setDeductionExpanded(false);
  };

  const onRefresh = React.useCallback(() => {
    void refetch();
  }, [refetch]);

  const historyItems: SalaryPeriodView[] = useMemo(() => {
    const others = periods.filter(
      (p) =>
        !(
          p.year === currentMonth.getFullYear() &&
          p.month === currentMonth.getMonth() + 1
        ),
    );
    return showAllHistory ? others : others.slice(0, 3);
  }, [periods, currentMonth, showAllHistory]);

  const statusMeta: Record<
    MobileSalaryStatus,
    { label: string; color: string; bg: string }
  > = {
    paid: { label: t("salary.statusPaid"), color: "#10B981", bg: "#E6F4EA" },
    pending: {
      label: t("salary.statusPending"),
      color: "#F59E0B",
      bg: "#FEF3C7",
    },
    processing: {
      label: t("salary.statusProcessing"),
      color: "#3B82F6",
      bg: "#EFF6FF",
    },
  };

  const mask = "••••••••";

  const openPdf = async () => {
    if (!currentPeriod?.payslipPdfUrl) return;
    try {
      await Linking.openURL(currentPeriod.payslipPdfUrl);
    } catch {
      //! ignore
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
          />
        }
      >
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.textMain }]}>
            {t("salary.title")}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
              onPress={() => setAmountVisible((v) => !v)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={amountVisible ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={theme.textMain}
              />
            </TouchableOpacity>
            <DrawerMenuButton
              style={{ borderRadius: 12, width: 40, height: 40 }}
            />
          </View>
        </View>

        <View style={styles.monthSelectorRow}>
          <TouchableOpacity
            style={[
              styles.monthNavBtn,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={handlePrevMonth}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={theme.primary} />
          </TouchableOpacity>

          <View style={[styles.monthPill, { backgroundColor: theme.primary }]}>
            <Text style={styles.monthPillText}>
              {t("salary.monthLabel", {
                m: currentMonth.getMonth() + 1,
                y: currentMonth.getFullYear(),
              })}
            </Text>
            {isCurrentCalendarMonth && (
              <View style={styles.currentMonthBadge}>
                <Text style={styles.currentMonthBadgeText}>
                  {t("salary.current")}
                </Text>
              </View>
            )}
            <Ionicons
              name="chevron-down-outline"
              size={14}
              color="#FFFFFF"
              style={{ marginLeft: 6 }}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.monthNavBtn,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={handleNextMonth}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {loading && !periods.length ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : !currentPeriod ? (
          <View style={styles.emptyWrap}>
            <Ionicons
              name="wallet-outline"
              size={40}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {t("salary.emptyForMonth", {
                m: currentMonth.getMonth() + 1,
                y: currentMonth.getFullYear(),
              })}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statusBadgeRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusMeta[currentPeriod.status].bg },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusMeta[currentPeriod.status].color },
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: statusMeta[currentPeriod.status].color },
                  ]}
                >
                  {statusMeta[currentPeriod.status].label}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.heroCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.heroLabel, { color: theme.textSecondary }]}>
                {t("salary.netLabel")}
              </Text>

              <Text style={[styles.heroAmount, { color: theme.primary }]}>
                {amountVisible ? formatMoney(currentPeriod.netSalary) : mask}
              </Text>

              {currentPeriod.status === "pending" && (
                <View style={styles.estBadge}>
                  <Text style={styles.estBadgeText}>
                    {t("salary.estimated")}
                  </Text>
                </View>
              )}

              <View
                style={[styles.heroDivider, { backgroundColor: theme.border }]}
              />

              <View style={styles.heroFooterRow}>
                <View style={styles.heroFooterItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={13}
                    color={theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.heroFooterText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {t("salary.payDate", { date: currentPeriod.payDate })}
                  </Text>
                </View>
                <View style={styles.heroFooterItem}>
                  <Ionicons
                    name="trending-up-outline"
                    size={13}
                    color={theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.heroFooterText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {t("salary.gross")}:{" "}
                    {amountVisible
                      ? formatMoney(currentPeriod.grossSalary)
                      : mask}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.accordionCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setIncomeExpanded((v) => !v)}
                activeOpacity={0.7}
              >
                <View style={styles.accordionLeft}>
                  <View
                    style={[
                      styles.accordionIconWrap,
                      { backgroundColor: "#E6F4EA" },
                    ]}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={16}
                      color="#10B981"
                    />
                  </View>
                  <Text
                    style={[styles.accordionTitle, { color: theme.textMain }]}
                  >
                    {t("salary.income")}
                  </Text>
                </View>
                <View style={styles.accordionRight}>
                  <Text style={[styles.accordionTotal, { color: "#10B981" }]}>
                    +{amountVisible ? formatMoney(totalIncome) : mask}
                  </Text>
                  <Ionicons
                    name={incomeExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={theme.textSecondary}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>

              {incomeExpanded && (
                <View
                  style={[
                    styles.accordionBody,
                    { borderTopColor: theme.border },
                  ]}
                >
                  {currentPeriod.incomeItems.map((item, idx) => (
                    <View key={`${item.label}-${idx}`} style={styles.lineRow}>
                      <Text
                        style={[
                          styles.lineLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {resolveItemLabel(t, item.label)}
                      </Text>
                      <Text style={[styles.lineValue, { color: "#10B981" }]}>
                        {amountVisible ? `+${formatMoney(item.amount)}` : mask}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View
              style={[
                styles.accordionCard,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setDeductionExpanded((v) => !v)}
                activeOpacity={0.7}
              >
                <View style={styles.accordionLeft}>
                  <View
                    style={[
                      styles.accordionIconWrap,
                      { backgroundColor: "#FEE2E2" },
                    ]}
                  >
                    <Ionicons
                      name="remove-circle-outline"
                      size={16}
                      color="#EF4444"
                    />
                  </View>
                  <Text
                    style={[styles.accordionTitle, { color: theme.textMain }]}
                  >
                    {t("salary.deduction")}
                  </Text>
                </View>
                <View style={styles.accordionRight}>
                  <Text style={[styles.accordionTotal, { color: "#EF4444" }]}>
                    {amountVisible ? formatMoney(totalDeduction) : mask}
                  </Text>
                  <Ionicons
                    name={deductionExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={theme.textSecondary}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>

              {deductionExpanded && (
                <View
                  style={[
                    styles.accordionBody,
                    { borderTopColor: theme.border },
                  ]}
                >
                  {currentPeriod.deductionItems.map((item, idx) => (
                    <View key={`${item.label}-${idx}`} style={styles.lineRow}>
                      <Text
                        style={[
                          styles.lineLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {resolveItemLabel(t, item.label)}
                      </Text>
                      <Text style={[styles.lineValue, { color: "#EF4444" }]}>
                        {amountVisible ? formatMoney(item.amount) : mask}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {netDiff !== null && prevPeriod && (
              <View
                style={[
                  styles.compareCard,
                  { backgroundColor: theme.cardBg, borderColor: theme.border },
                ]}
              >
                <Ionicons
                  name={netDiff >= 0 ? "trending-up" : "trending-down"}
                  size={18}
                  color={netDiff >= 0 ? "#10B981" : "#EF4444"}
                />
                <Text
                  style={[styles.compareText, { color: theme.textSecondary }]}
                >
                  {t("salary.compareToMonth", { m: prevPeriod.month })}:{" "}
                  <Text
                    style={{
                      color: netDiff >= 0 ? "#10B981" : "#EF4444",
                      fontWeight: "800",
                    }}
                  >
                    {netDiff >= 0
                      ? `▲ ${t("salary.increased")} `
                      : `▼ ${t("salary.decreased")} `}
                    {amountVisible ? formatMoney(Math.abs(netDiff)) : mask}
                  </Text>
                </Text>
              </View>
            )}

            {!!currentPeriod.payslipPdfUrl && (
              <TouchableOpacity
                style={[styles.pdfBtn, { borderColor: theme.primary }]}
                activeOpacity={0.7}
                onPress={openPdf}
              >
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={theme.primary}
                />
                <Text style={[styles.pdfBtnText, { color: theme.primary }]}>
                  {t("salary.viewPdf")}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {periods.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {t("salary.historyTitle")}
            </Text>

            {historyItems.length === 0 ? (
              <Text
                style={[styles.historyEmpty, { color: theme.textSecondary }]}
              >
                {t("salary.noOtherPeriods")}
              </Text>
            ) : (
              historyItems.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.historyRow,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => jumpToPeriod(p)}
                >
                  <View>
                    <Text
                      style={[styles.historyMonth, { color: theme.textMain }]}
                    >
                      {t("salary.monthLabel", { m: p.month, y: p.year })}
                    </Text>
                    <Text
                      style={[
                        styles.historyPayDate,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {t("salary.paidOn", { date: p.payDate })}
                    </Text>
                  </View>

                  <View style={styles.historyRight}>
                    <Text
                      style={[styles.historyAmount, { color: theme.primary }]}
                    >
                      {amountVisible ? formatMoney(p.netSalary) : mask}
                    </Text>
                    <View
                      style={[
                        styles.historyBadge,
                        { backgroundColor: statusMeta[p.status].bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.historyBadgeText,
                          { color: statusMeta[p.status].color },
                        ]}
                      >
                        {statusMeta[p.status].label}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={theme.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              ))
            )}

            {periods.length > 4 && (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => setShowAllHistory((v) => !v)}
              >
                <Text style={[styles.showMoreText, { color: theme.primary }]}>
                  {showAllHistory ? t("common.collapse") : t("common.viewAll")}
                </Text>
                <Ionicons
                  name={showAllHistory ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={theme.primary}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 110 },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 24,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  monthSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  monthPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  monthPillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  currentMonthBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  currentMonthBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },

  statusBadgeRow: {
    alignItems: "center",
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusBadgeText: { fontSize: 12, fontWeight: "700" },

  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    marginBottom: 14,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  estBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  estBadgeText: { fontSize: 11, fontWeight: "700", color: "#F59E0B" },
  heroDivider: { height: 1, marginVertical: 14 },
  heroFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroFooterText: { fontSize: 11, fontWeight: "500" },

  accordionCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  accordionLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  accordionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  accordionTitle: { fontSize: 14, fontWeight: "700" },
  accordionRight: { flexDirection: "row", alignItems: "center" },
  accordionTotal: { fontSize: 14, fontWeight: "800" },
  accordionBody: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lineLabel: { fontSize: 13, fontWeight: "500" },
  lineValue: { fontSize: 13, fontWeight: "700" },

  compareCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  compareText: { fontSize: 13, fontWeight: "500", flex: 1 },

  pdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 13,
    marginBottom: 24,
  },
  pdfBtnText: { fontSize: 13, fontWeight: "700" },

  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 12,
  },
  historyEmpty: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 12,
  },

  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  historyMonth: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  historyPayDate: { fontSize: 11, fontWeight: "400" },
  historyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyAmount: { fontSize: 13, fontWeight: "800" },
  historyBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  historyBadgeText: { fontSize: 10, fontWeight: "700" },

  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
  },
  showMoreText: { fontSize: 13, fontWeight: "700" },
});
