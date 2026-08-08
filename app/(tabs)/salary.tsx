import { Colors } from "@/constants/common/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SalaryItem {
  label: string;
  amount: number;
}

interface SalaryPeriod {
  id: string;
  month: number;
  year: number;
  payDate: string;
  status: "paid" | "pending" | "processing";
  netSalary: number;
  grossSalary: number;
  incomeItems: SalaryItem[];
  deductionItems: SalaryItem[];
  payslipPdfUrl?: string;
}

const MOCK_PERIODS: SalaryPeriod[] = [
  {
    id: "2026-07",
    month: 7,
    year: 2026,
    payDate: "05/08/2026",
    status: "paid",
    netSalary: 18_520_000,
    grossSalary: 22_800_000,
    incomeItems: [
      { label: "Lương cơ bản", amount: 18_000_000 },
      { label: "Phụ cấp ăn trưa", amount: 730_000 },
      { label: "Phụ cấp xăng xe", amount: 500_000 },
      { label: "Thưởng KPI", amount: 3_570_000 },
    ],
    deductionItems: [
      { label: "BHXH (8%)", amount: -1_440_000 },
      { label: "BHYT (1.5%)", amount: -270_000 },
      { label: "BHTN (1%)", amount: -180_000 },
      { label: "Thuế TNCN", amount: -2_390_000 },
    ],
  },
  {
    id: "2026-06",
    month: 6,
    year: 2026,
    payDate: "05/07/2026",
    status: "paid",
    netSalary: 17_270_000,
    grossSalary: 21_550_000,
    incomeItems: [
      { label: "Lương cơ bản", amount: 18_000_000 },
      { label: "Phụ cấp ăn trưa", amount: 730_000 },
      { label: "Phụ cấp xăng xe", amount: 500_000 },
      { label: "Thưởng KPI", amount: 2_320_000 },
    ],
    deductionItems: [
      { label: "BHXH (8%)", amount: -1_440_000 },
      { label: "BHYT (1.5%)", amount: -270_000 },
      { label: "BHTN (1%)", amount: -180_000 },
      { label: "Thuế TNCN", amount: -2_390_000 },
    ],
  },
  {
    id: "2026-05",
    month: 5,
    year: 2026,
    payDate: "05/06/2026",
    status: "paid",
    netSalary: 18_100_000,
    grossSalary: 22_380_000,
    incomeItems: [
      { label: "Lương cơ bản", amount: 18_000_000 },
      { label: "Phụ cấp ăn trưa", amount: 730_000 },
      { label: "Phụ cấp xăng xe", amount: 500_000 },
      { label: "Thưởng KPI", amount: 3_150_000 },
    ],
    deductionItems: [
      { label: "BHXH (8%)", amount: -1_440_000 },
      { label: "BHYT (1.5%)", amount: -270_000 },
      { label: "BHTN (1%)", amount: -180_000 },
      { label: "Thuế TNCN", amount: -2_390_000 },
    ],
  },
  {
    id: "2026-04",
    month: 4,
    year: 2026,
    payDate: "05/05/2026",
    status: "paid",
    netSalary: 17_900_000,
    grossSalary: 22_180_000,
    incomeItems: [
      { label: "Lương cơ bản", amount: 18_000_000 },
      { label: "Phụ cấp ăn trưa", amount: 730_000 },
      { label: "Phụ cấp xăng xe", amount: 500_000 },
      { label: "Thưởng KPI", amount: 2_950_000 },
    ],
    deductionItems: [
      { label: "BHXH (8%)", amount: -1_440_000 },
      { label: "BHYT (1.5%)", amount: -270_000 },
      { label: "BHTN (1%)", amount: -180_000 },
      { label: "Thuế TNCN", amount: -2_390_000 },
    ],
  },
];

function formatMoney(n: number) {
  return Math.abs(n).toLocaleString("vi-VN") + " ₫";
}

export default function SalaryScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [currentPeriodId, setCurrentPeriodId] = useState(MOCK_PERIODS[0].id);
  const [amountVisible, setAmountVisible] = useState(true);
  const [incomeExpanded, setIncomeExpanded] = useState(false);
  const [deductionExpanded, setDeductionExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const currentPeriod = useMemo(
    () => MOCK_PERIODS.find((p) => p.id === currentPeriodId) ?? MOCK_PERIODS[0],
    [currentPeriodId],
  );

  const prevPeriod = useMemo(() => {
    const idx = MOCK_PERIODS.findIndex((p) => p.id === currentPeriodId);
    return idx >= 0 && idx < MOCK_PERIODS.length - 1
      ? MOCK_PERIODS[idx + 1]
      : null;
  }, [currentPeriodId]);

  const netDiff = prevPeriod
    ? currentPeriod.netSalary - prevPeriod.netSalary
    : null;

  const totalIncome = currentPeriod.incomeItems.reduce(
    (s, i) => s + i.amount,
    0,
  );
  const totalDeduction = currentPeriod.deductionItems.reduce(
    (s, i) => s + i.amount,
    0,
  );

  const handlePrevPeriod = () => {
    const idx = MOCK_PERIODS.findIndex((p) => p.id === currentPeriodId);
    if (idx < MOCK_PERIODS.length - 1) {
      setCurrentPeriodId(MOCK_PERIODS[idx + 1].id);
      setIncomeExpanded(false);
      setDeductionExpanded(false);
    }
  };

  const handleNextPeriod = () => {
    const idx = MOCK_PERIODS.findIndex((p) => p.id === currentPeriodId);
    if (idx > 0) {
      setCurrentPeriodId(MOCK_PERIODS[idx - 1].id);
      setIncomeExpanded(false);
      setDeductionExpanded(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const historyItems = showAllHistory
    ? MOCK_PERIODS.slice(1)
    : MOCK_PERIODS.slice(1, 4);

  const statusMeta = {
    paid: { label: "Đã thanh toán", color: "#10B981", bg: "#E6F4EA" },
    pending: { label: "Chưa thanh toán", color: "#F59E0B", bg: "#FEF3C7" },
    processing: { label: "Đang xử lý", color: "#3B82F6", bg: "#EFF6FF" },
  };
  const sm = statusMeta[currentPeriod.status];

  const mask = "••••••••";

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
            Bảng lương
          </Text>
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
        </View>

        <View style={styles.periodRow}>
          <TouchableOpacity
            style={[
              styles.periodNavBtn,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={handlePrevPeriod}
          >
            <Ionicons name="chevron-back" size={18} color={theme.primary} />
          </TouchableOpacity>

          <View style={[styles.periodPill, { backgroundColor: theme.primary }]}>
            <Text style={styles.periodPillText}>
              Kỳ lương Tháng {currentPeriod.month}/{currentPeriod.year}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.periodNavBtn,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            onPress={handleNextPeriod}
          >
            <Ionicons name="chevron-forward" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statusBadgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: sm.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: sm.color }]} />
            <Text style={[styles.statusBadgeText, { color: sm.color }]}>
              {sm.label}
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
            THỰC NHẬN (NET)
          </Text>

          <Text style={[styles.heroAmount, { color: theme.primary }]}>
            {amountVisible ? formatMoney(currentPeriod.netSalary) : mask}
          </Text>

          {currentPeriod.status === "pending" && (
            <View style={styles.estBadge}>
              <Text style={styles.estBadgeText}>Dự kiến</Text>
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
                style={[styles.heroFooterText, { color: theme.textSecondary }]}
              >
                Ngày trả: {currentPeriod.payDate}
              </Text>
            </View>
            <View style={styles.heroFooterItem}>
              <Ionicons
                name="trending-up-outline"
                size={13}
                color={theme.textSecondary}
              />
              <Text
                style={[styles.heroFooterText, { color: theme.textSecondary }]}
              >
                Gross:{" "}
                {amountVisible ? formatMoney(currentPeriod.grossSalary) : mask}
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
                <Ionicons name="add-circle-outline" size={16} color="#10B981" />
              </View>
              <Text style={[styles.accordionTitle, { color: theme.textMain }]}>
                Thu nhập
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
              style={[styles.accordionBody, { borderTopColor: theme.border }]}
            >
              {currentPeriod.incomeItems.map((item, idx) => (
                <View key={idx} style={styles.lineRow}>
                  <Text
                    style={[styles.lineLabel, { color: theme.textSecondary }]}
                  >
                    {item.label}
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
              <Text style={[styles.accordionTitle, { color: theme.textMain }]}>
                Khấu trừ
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
              style={[styles.accordionBody, { borderTopColor: theme.border }]}
            >
              {currentPeriod.deductionItems.map((item, idx) => (
                <View key={idx} style={styles.lineRow}>
                  <Text
                    style={[styles.lineLabel, { color: theme.textSecondary }]}
                  >
                    {item.label}
                  </Text>
                  <Text style={[styles.lineValue, { color: "#EF4444" }]}>
                    {amountVisible ? formatMoney(item.amount) : mask}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {netDiff !== null && (
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
            <Text style={[styles.compareText, { color: theme.textSecondary }]}>
              So với tháng {prevPeriod!.month}:{" "}
              <Text
                style={{
                  color: netDiff >= 0 ? "#10B981" : "#EF4444",
                  fontWeight: "800",
                }}
              >
                {netDiff >= 0 ? "▲ tăng " : "▼ giảm "}
                {amountVisible ? formatMoney(Math.abs(netDiff)) : mask}
              </Text>
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.pdfBtn, { borderColor: theme.primary }]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="document-text-outline"
            size={18}
            color={theme.primary}
          />
          <Text style={[styles.pdfBtnText, { color: theme.primary }]}>
            Xem phiếu lương chi tiết (PDF)
          </Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          LỊCH SỬ PHIẾU LƯƠNG
        </Text>

        {historyItems.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.historyRow,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
            activeOpacity={0.7}
            onPress={() => {
              setCurrentPeriodId(p.id);
              setIncomeExpanded(false);
              setDeductionExpanded(false);
            }}
          >
            <View>
              <Text style={[styles.historyMonth, { color: theme.textMain }]}>
                Tháng {p.month}/{p.year}
              </Text>
              <Text
                style={[styles.historyPayDate, { color: theme.textSecondary }]}
              >
                Trả ngày {p.payDate}
              </Text>
            </View>

            <View style={styles.historyRight}>
              <Text style={[styles.historyAmount, { color: theme.primary }]}>
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
        ))}

        {MOCK_PERIODS.length > 4 && (
          <TouchableOpacity
            style={styles.showMoreBtn}
            onPress={() => setShowAllHistory((v) => !v)}
          >
            <Text style={[styles.showMoreText, { color: theme.primary }]}>
              {showAllHistory ? "Thu gọn" : "Xem tất cả"}
            </Text>
            <Ionicons
              name={showAllHistory ? "chevron-up" : "chevron-down"}
              size={14}
              color={theme.primary}
            />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 110 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  periodNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  periodPill: {
    flex: 1,
    marginHorizontal: 10,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  periodPillText: {
    color: "#FFFFFF",
    fontSize: 13,
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
