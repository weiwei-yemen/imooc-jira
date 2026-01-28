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

  if (isIdle || isLoading) {
    return <FullPageLoading />;
  }

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
