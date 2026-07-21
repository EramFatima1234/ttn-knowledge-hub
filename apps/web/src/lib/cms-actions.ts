import type { MessageInstance } from "antd/es/message/interface";
import { getApiErrorMessage } from "@/lib/api";

export function isFormValidationError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "errorFields" in error);
}

export async function runCmsAction(
  action: () => Promise<unknown>,
  messageApi: MessageInstance,
  successMessage?: string,
): Promise<boolean> {
  try {
    await action();
    if (successMessage) {
      messageApi.success(successMessage);
    }
    return true;
  } catch (error) {
    if (isFormValidationError(error)) {
      return false;
    }
    messageApi.error(getApiErrorMessage(error));
    return false;
  }
}
