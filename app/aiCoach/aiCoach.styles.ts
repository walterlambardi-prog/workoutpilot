import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 160,
    gap: 12,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    lineHeight: 32,
  },
  subtitle: {
    opacity: 0.82,
    marginTop: 6,
  },
  suggestionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  suggestionChip: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  suggestionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  messagesCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    maxWidth: "100%",
  },
  bubbleAssistant: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxWidth: "88%",
  },
  bubbleUser: {
    alignSelf: "flex-end",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxWidth: "88%",
  },
  metaRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  metaName: {
    fontSize: 11,
    fontWeight: "700",
  },
  metaTime: {
    fontSize: 11,
  },
  metaNameUser: {
    fontSize: 11,
    fontWeight: "700",
  },
  metaTimeUser: {
    fontSize: 11,
  },
  assistantText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  levelPrompt: {
    gap: 10,
  },
  levelPromptTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  levelOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  levelOptionButton: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  levelOptionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  profilePrompt: {
    gap: 12,
  },
  profilePromptTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  profileFields: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  profileFieldBlock: {
    flex: 1,
    minWidth: 140,
    gap: 6,
  },
  profileFieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
  profileInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  profileSubmit: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  profileSubmitDisabled: {
    opacity: 0.6,
  },
  profileSubmitText: {
    fontSize: 14,
    fontWeight: "700",
  },
  planPreview: {
    gap: 10,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  planBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  planList: {
    gap: 8,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  planDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  planActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  planActionButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  planActionGhost: {
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  planActionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  planActionGhostText: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 13,
    lineHeight: 18,
  },
  inputBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  inputInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});
