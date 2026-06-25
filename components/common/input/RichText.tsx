import { Textarea } from "./Textarea";
import React from "react";

interface RichTextProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

export const RichText = (props: RichTextProps) => {
  return <Textarea {...props} />;
};
