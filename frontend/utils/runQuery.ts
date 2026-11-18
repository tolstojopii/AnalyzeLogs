import { RequestStatus } from "../data/data";
export async function runQuery<T>(
  fn: () => Promise<T>,
  setStatus: (status: RequestStatus) => void,
  setData: (data: T) => void,
  onSuccess?: (data: T) => void,
): Promise<void> {
  setStatus("loading");
  try {
    const data = await fn();
    setStatus("success");
    setData(data);
    onSuccess?.(data)
  } catch (error) {
    setStatus("error");
    console.warn("ошибка", error);
  }
}
