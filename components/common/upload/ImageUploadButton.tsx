import { Colors } from "@/constants/common/Colors";
import { useUpload } from "@/hooks/upload/useUpload";
import { UploadFileResult, UploadMode } from "@/types/upload";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

type ImageUploadButtonProps = {
  value?: string | null;
  fallbackText?: string;
  mode?: UploadMode;
  pickerType?: "image" | "document" | "both";
  size?: number;
  style?: ViewStyle;
  onUploaded?: (result: UploadFileResult) => void;
  onChange?: (url: string) => void;
};

export function ImageUploadButton({
  value,
  fallbackText = "?",
  mode = "image",
  pickerType = "image",
  size = 88,
  style,
  onUploaded,
  onChange,
}: ImageUploadButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const { upload, loading } = useUpload();

  const pickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Quyền truy cập", "Vui lòng cho phép truy cập thư viện ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName || `image-${Date.now()}.jpg`;
    const mimeType = asset.mimeType || "image/jpeg";

    const uploadResult = await upload(
      {
        uri: asset.uri,
        name: fileName,
        mimeType,
        size: asset.fileSize,
      },
      mode,
    );

    onChange?.(uploadResult.fileUrl);
    onUploaded?.(uploadResult);
  }, [mode, onChange, onUploaded, upload]);

  const pickDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    const uploadResult = await upload(
      {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || "application/octet-stream",
        size: asset.size,
      },
      mode === "image" ? "document" : mode,
    );

    onChange?.(uploadResult.fileUrl);
    onUploaded?.(uploadResult);
  }, [mode, onChange, onUploaded, upload]);

  const handlePress = useCallback(() => {
    if (loading) {
      return;
    }

    if (pickerType === "document") {
      void pickDocument();
      return;
    }

    if (pickerType === "both") {
      Alert.alert("Tải file lên", "Chọn loại file", [
        { text: "Ảnh", onPress: () => void pickImage() },
        { text: "Tài liệu", onPress: () => void pickDocument() },
        { text: "Hủy", style: "cancel" },
      ]);
      return;
    }

    void pickImage();
  }, [loading, pickDocument, pickImage, pickerType]);

  return (
    <View style={[styles.wrap, style]}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: theme.primary,
          },
        ]}
      >
        {value ? (
          <Image source={{ uri: value }} style={styles.image} />
        ) : (
          <Text style={[styles.initial, { fontSize: size * 0.38 }]}>
            {fallbackText.charAt(0).toUpperCase()}
          </Text>
        )}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.badge,
          { backgroundColor: theme.primary, borderColor: theme.cardBg },
        ]}
        activeOpacity={0.8}
        onPress={handlePress}
        disabled={loading}
      >
        <Ionicons name="camera" size={13} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    overflow: "hidden",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  initial: {
    fontWeight: "700",
    color: "#4338CA",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
