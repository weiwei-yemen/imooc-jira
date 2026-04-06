import { useCallback, useReducer, useState } from "react";
import { useMountedRef } from "utils/index";

interface State<D> {
  error: Error | null;
  data: D | null;
  stat: "idle" | "loading" | "error" | "success";
}

const defaultInitialState: State<null> = {
  stat: "idle",
  data: null,
  error: null,
};

const defaultConfig = {
  throwOnError: false,
};

const useSafeDispatch = <T>(dispatch: (...args: T[]) => void) => {
  const mountedRef = useMountedRef();
  // 如果组件还存在，就调用 dispatch，否则不调用，防止在卸载的组件里调用 setState 函数，导致控制台报错
  // "Can't perform a React state update on an unmounted component."
  return useCallback(
    // 为什么不用 undefined 而用 void 0？
    // 历史原因：在很老的 JavaScript 中，undefined 可以被重新赋值，void 0 是获取真正 undefined 的保险写法
    // 代码风格：在函数式编程中，用 void 0 显式表达"这里故意什么都不返回"，比直接写 undefined 更常见一些
    // 现代代码里写 undefined 也完全没问题，这里两者等价
    (...args: T[]) => (mountedRef.current ? dispatch(...args) : void 0),
    [dispatch, mountedRef]
  );
};

export const useAsync = <D>(
  initialState?: State<D>,
  initialConfig?: typeof defaultConfig
) => {
  const config = { ...defaultConfig, ...initialConfig };
  //   用一句话说：useReducer(reducer, initialState) 就是告诉 React ——
  // "状态一开始长这样，以后每次更新都按 reducer 里的规则来计算新状态。"
  const [state, dispatch] = useReducer(
    // reducer 函数，每次dispatch后会将最新的state传过来
    // action 是一个包含 type 的指令对象，type是action里的一个字段，用来区分"要做什么操作"，
    // 这里不需要区分type，所以直接使用State<D>的局部
    (state: State<D>, action: Partial<State<D>>) => ({ ...state, ...action }),
    // 初始状态，渲染时执行一次
    {
      ...defaultInitialState,
      ...initialState,
    }
  );

  const safeDispatch = useSafeDispatch(dispatch);

  // useState直接传入函数的含义是：惰性初始化；所以，要用useState保存函数，不能直接传入函数
  // https://codesandbox.io/s/blissful-water-230u4?file=/src/App.js
  const [retry, setRetry] = useState(() => () => {});

  const setData = useCallback(
    (data: D) =>
      safeDispatch({
        data,
        stat: "success",
        error: null,
      }),
    [safeDispatch]
  );

  const setError = useCallback(
    (error: Error) =>
      safeDispatch({
        error,
        stat: "error",
        data: null,
      }),
    [safeDispatch]
  );

  // run 用来触发异步请求
  const run = useCallback(
    (promise: Promise<D>, runConfig?: { retry: () => Promise<D> }) => {
      if (!promise || !promise.then) {
        throw new Error("请传入 Promise 类型数据");
      }
      setRetry(() => () => {
        if (runConfig?.retry) {
          run(runConfig?.retry(), runConfig);
        }
      });
      safeDispatch({ stat: "loading" });
      return promise
        .then((data) => {
          setData(data);
          return data;
        })
        .catch((error) => {
          // catch会消化异常，如果不主动抛出，外面是接收不到异常的
          setError(error);
          if (config.throwOnError) return Promise.reject(error);
          return error;
        });
    },
    [config.throwOnError, setData, setError, safeDispatch]
  );

  return {
    isIdle: state.stat === "idle",
    isLoading: state.stat === "loading",
    isError: state.stat === "error",
    isSuccess: state.stat === "success",
    run,
    setData,
    setError,
    // retry 被调用时重新跑一遍run，让state刷新一遍
    retry,
    ...state,
  };
};
