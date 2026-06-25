const tintColorLight = "#1A477C"; // Màu Navy chủ đạo (Light) - Tinh tế, chuyên nghiệp
const tintColorDark = "#2E6BB0"; // Màu Navy sáng hơn một chút (Dark) - Đảm bảo độ tương phản trên nền tối

export const Colors = {
  light: {
    primary: tintColorLight,
    primaryActive: "#113054", // Navy đậm hơn khi click/active
    background: "#F4F7FA", // Xám thiên xanh nhẹ (Slate Light) giúp nổi bật các khối thẻ màu trắng
    cardBg: "#FFFFFF",
    textMain: "#0F172A", // Xanh đen đậm (Slate 900) thay vì đen tuyền, nhìn sang hơn
    textSecondary: "#64748B", // Xám xanh phụ (Slate 500)
    border: "#E2E8F0", // Viền mỏng nhẹ thanh lịch
    success: "#10B981", // Xanh lá dịu mắt
    warning: "#F59E0B",
    danger: "#EF4444",
  },
  dark: {
    primary: tintColorDark,
    primaryActive: "#4A8CD6", // Màu Navy sáng hơn nữa khi active trong tối
    background: "#0F172A", // Nền đen Navy sẫm (Midnight Slate) cực đẹp, không bị đen kịt
    cardBg: "#1E293B", // Thẻ nổi lên có tone xanh xám sẫm đồng bộ
    textMain: "#F8FAFC", // Chữ trắng kem giảm mỏi mắt
    textSecondary: "#94A3B8", // Xám phụ
    border: "#334155", // Viền tối tinh tế
    success: "#34D399",
    warning: "#FBBF24",
    danger: "#F87171",
  },
};
