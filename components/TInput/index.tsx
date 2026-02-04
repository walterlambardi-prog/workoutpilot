import React from "react";
import { InputProps, Label, Input as TamaguiInput, YStack } from "tamagui";

export interface TInputProps extends InputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Custom Input component built with Tamagui
 *
 * @example
 * ```tsx
 * <TInput
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 * />
 *
 * <TInput
 *   label="Password"
 *   error="Password is required"
 *   secureTextEntry
 * />
 * ```
 */
export const TInput: React.FC<TInputProps> = ({
  label,
  error,
  helperText,
  ...props
}) => {
  return (
    <YStack gap="$1">
      {label && (
        <Label htmlFor={props.id} fontSize="$4" fontWeight="600" color="$color">
          {label}
        </Label>
      )}
      <TamaguiInput
        size="$4"
        borderWidth={1}
        borderColor={error ? "$error" : "$borderColor"}
        backgroundColor="$background"
        color="$color"
        placeholderTextColor="$placeholderColor"
        borderRadius="$3"
        focusStyle={{
          borderColor: error ? "$error" : "$borderColorFocus",
          borderWidth: 2,
        }}
        {...props}
      />
      {error && (
        <Label fontSize="$2" color="$error">
          {error}
        </Label>
      )}
      {!error && helperText && (
        <Label fontSize="$2" color="$placeholderColor">
          {helperText}
        </Label>
      )}
    </YStack>
  );
};

export default TInput;
