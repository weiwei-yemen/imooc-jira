import React, { ReactNode, useCallback } from "react";
import * as auth from "auth-provider";
import { http } from "utils/http";
import { useMount } from "utils";
import { useAsync } from "utils/use-async";
import { FullPageErrorFallback, FullPageLoading } from "components/lib";
import { User } from "types/user";
import { useQueryClient } from "react-query";

interface AuthForm {
  username: string;
  password: string;
}

// 页面刷新后会丢失登录状态，每次刷新调用该方法初始化 user 信息
const bootstrapUser = async () => {
  let user = null;
  const token = auth.getToken();
  if (token) {
    const data = await http("me", { token });
    user = data.user;
  }
  return user;
};

// AuthContext定义context 会提供哪些数据，provider 定义如何提供这些数据
const AuthContext = React.createContext<
  | {
      user: User | null;
      register: (form: AuthForm) => Promise<void>;
      login: (form: AuthForm) => Promise<void>;
      logout: () => Promise<void>;
    }
  | undefined
>(undefined);
AuthContext.displayName = "AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    data: user, // 重命名
    error,
    isLoading,
    isIdle,
    isError,
    run,
    setData: setUser, // 重命名
  } = useAsync<User | null>();
  const queryClient = useQueryClient();

  /*
    point free风格
    等价于：const login = (form: AuthForm) => {
            return auth.login(form).then((user) => setUser(user));
          };
  */
  const login = (form: AuthForm) => auth.login(form).then(setUser);
  const register = (form: AuthForm) => auth.register(form).then(setUser);
  const logout = () =>
    auth.logout().then(() => {
      setUser(null);
      queryClient.clear();
    });

  useMount(
    useCallback(() => {
      run(bootstrapUser());
    }, [])
  );



// AuthProvider渲染流程：
// ┌─────────────────────────────────────────────────────────┐
// │  第 1 次渲染（组件挂载）                                   │
// ├─────────────────────────────────────────────────────────┤
// │  1. 执行 AuthProvider 函数体                               │
// │     ├─ isError = false (初始值)                          │
// │     ├─ error = null (初始值)                            │
// │     └─ useMount 注册 useEffect                           │
// │  2. 返回 JSX: <FullPageLoading />                        │
// │  3. React 渲染 DOM                                        │
// │  4. 执行 useEffect (useMount 触发)                       │
// │     └─ run(bootstrapUser()) ← 开始执行异步请求            │
// └─────────────────────────────────────────────────────────┘

// ┌─────────────────────────────────────────────────────────┐
// │  bootstrapUser 执行过程（异步）                            │
// ├─────────────────────────────────────────────────────────┤
// │  bootstrapUser() 执行                                      │
// │    ├─ 获取 token                                          │
// │    ├─ 调用 API                                           │
// │    └─ 返回 user 数据                                      │
// │                                                          │
// │  如果成功 → setData(user) → stat = "success"            │
// │  如果失败 → setError(error) → stat = "error"            │
// │           ↓                                              │
// │      React 触发重新渲染                                    │
// └─────────────────────────────────────────────────────────┘

// ┌─────────────────────────────────────────────────────────┐
// │  第 2 次渲染（bootstrapUser 失败后）                       │
// ├─────────────────────────────────────────────────────────┤
// │  1. 执行 AuthProvider 函数体                               │
// │     ├─ isError = true (最新值) ← 已更新                   │
// │     ├─ error = Error 对象 (最新值) ← 已更新               │
// │  2. 执行 if (isError) ← 条件成立                          │
// │  3. 返回 JSX: <FullPageErrorFallback error={error} />     │
// │  4. React 渲染 DOM                                        │
// └─────────────────────────────────────────────────────────┘


  if (isIdle || isLoading) {
    return <FullPageLoading />;
  }

  /**
   * 为什么这里可以使用 error？
   * 这里是在组件渲染时执行的，当组件渲染时可以确保获取到最新的状态
   * 而logon 中的是在异步函数中内部执行的，不能确保获取到最新的状态
   */
  if (isError) {
    return <FullPageErrorFallback error={error} />;
  }

  /*
    - AuthContext下包括 Provider 和 Consumer
    - 这里返回的 Provider 组件，并且是AuthContext下的 Provider 组件，因为一个应用中可能不止一个 Context
   */
  return (
    <AuthContext.Provider
      children={children}
      value={{ user, login, register, logout }}
    />
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth必须在AuthProvider中使用");
  }
  return context;
};
