import { useAsync } from "utils/use-async";
import { act, renderHook } from "@testing-library/react-hooks";

// 状态	英文	含义
// 待定	pending	初始状态，异步操作正在进行，尚未有结果
// 已完成	fulfilled	异步操作成功完成，调用了 resolve(value)
// 已拒绝	rejected	异步操作失败，调用了 reject(reason)

const defaultState: ReturnType<typeof useAsync> = {
  stat: "idle",
  data: null,
  error: null,

  isIdle: true,
  isLoading: false,
  isError: false,
  isSuccess: false,

  run: expect.any(Function),
  setData: expect.any(Function),
  setError: expect.any(Function),
  retry: expect.any(Function),
};

const loadingState: ReturnType<typeof useAsync> = {
  ...defaultState,
  stat: "loading",
  isIdle: false,
  isLoading: true,
};

const successState: ReturnType<typeof useAsync> = {
  ...defaultState,
  stat: "success",
  isIdle: false,
  isSuccess: true,
};

test("useAsync 可以异步处理", async () => {
  // 这是一个经典的受控 promose，通过把 res / rej 挂到外部，
  // 测试可以在任意时刻手动决定这个 Promise 何时完成
  let resolve: any, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  // React Hook 不能直接在普通函数里调用，必须满足"在 React 函数组件内部调用"的规则。
  // renderHook 帮你屏蔽了这个限制——它在背后创建了一个临时组件，让你的 Hook 合法运行。
  const { result } = renderHook(() => useAsync());
  expect(result.current).toEqual(defaultState);

  let p: Promise<any>;
  // 所有状态更新的操作都要包裹在 act 的回调函数里
  // 因为状态更新是异步的，所以需要等待，放在 act 中执行后，状态更新才会完成，这个时候可以安全的断言
  act(() => {
    p = result.current.run(promise);
  });
  expect(result.current).toEqual(loadingState);

  const resolvedValue = { mockedValue: "resolved" };
  await act(async () => {
    resolve(resolvedValue);
    await p;
  });
  expect(result.current).toEqual({
    ...successState,
    data: resolvedValue,
  });
});
