import qs from "qs";
import * as auth from "auth-provider";
import { useAuth } from "context/auth-context";
import { useCallback } from "react";

const apiUrl = process.env.REACT_APP_API_URL;

interface Config extends RequestInit {
  token?: string;
  data?: object;
}

export const http = async (
  endpoint: string,
  // 当一个参数有默认值时会自动变成可选参数
  { data, token, headers, ...customConfig }: Config = {}
) => {
  const config = {
    method: "GET",
    headers: {
      /*
        Authorization: Bearer <token> - 这是 RFC 标准规定的固定格式
        Bearer 是 OAuth 2.0 标准中定义的一种认证方案，表示"持有者即拥有者"（bearer means "holder"）
       */
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": data ? "application/json" : "",
    },
    ...customConfig,
  };

  if (config.method.toUpperCase() === "GET") {
    endpoint += `?${qs.stringify(data)}`;
  } else {
    config.body = JSON.stringify(data || {});
  }

  // axios 和 fetch 的表现不一样，axios可以直接在返回状态不为2xx的时候抛出异常
  return window
    .fetch(`${apiUrl}/${endpoint}`, config)
    .then(async (response) => {
      if (response.status === 401) {
        await auth.logout();
        window.location.reload();
        return Promise.reject({ message: "请重新登录" });
      }
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        return Promise.reject(data);
      }
    });
};

// JS 中的typeof，是在runtime时运行的
// return typeof 1 === 'number'

// TS 中的typeof，是在静态环境运行的
// return (...[endpoint, config]: Parameters<typeof http>) =>
export const useHttp = () => {
  const { user } = useAuth();

  return (...[endpoint, config]: Parameters<typeof http>) =>
    http(endpoint, { ...config, token: user?.token });

  // utility type 的用法：用泛型给它传入一个其他类型，然后utility type对这个类型进行某种操作
  // return useCallback(
  //   // ...[endpoint, config] 数组结构，将数组结构结构成多个参数，方便调用者调用
  //   (...[endpoint, config]: Parameters<typeof http>) =>
  //     http(endpoint, { ...config, token: user?.token }),
  //   [user?.token]
  // );
};

// 类型别名、Utility Type 讲解

// 联合类型
let myFavoriteNumber: string | number;
myFavoriteNumber = "seven";
myFavoriteNumber = 7;
// TS2322: Type '{}' is not assignable to type 'string | number'.
// myFavoriteNumber = {}
let jackFavoriteNumber: string | number;

// 类型别名在很多情况下可以和interface互换
// interface Person {
//   name: string
// }
// type Person = { name: string }
// const xiaoMing: Person = {name: 'xiaoming'}

// 类型别名, interface 在这种情况下没法替代type
type FavoriteNumber = string | number;
let roseFavoriteNumber: FavoriteNumber = "6";

// interface 也没法实现Utility type
type Person = {
  name: string;
  age: number;
};
// 所有属性可选
const xiaoMing: Partial<Person> = {};
// 删除指定的属性
const shenMiRen: Omit<Person, "name" | "age"> = {};

//选取指定的类型
type PersonOnlyName = Pick<Person, "name" | "age">;

// 从联合类型中排除
type PersonKeys = keyof Person;
type Age = Exclude<PersonKeys, "name">;

// Partial 的实现
type Partial<T> = {
  [P in keyof T]?: T[P];
};
