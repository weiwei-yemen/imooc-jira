// 在真实环境中，如果使用firebase这种第三方auth服务的话，本文件不需要开发者开发

import { User } from "types/user";

const apiUrl = process.env.REACT_APP_API_URL;

// 双下划线：标识系统内部、框架内部使用的变量，避免和业务代码中的变量冲突

const localStorageKey = "__auth_provider_token__";

export const getToken = () => window.localStorage.getItem(localStorageKey);

/*
  如何判断{}是解构还是字面量：看位置：
  // = 左边：解构（提取）
  const { user } = response;

  // = 右边：字面量（创建）
  const response = { user: 'Simon' };
  
  // 函数参数：解构（从传入的参数中提取）
  function foo({ user }: { user: User }) {}
*/
export const handleUserResponse = ({ user }: { user: User }) => {
  window.localStorage.setItem(localStorageKey, user.token || "");
  return user;
};

/*
执行流程：fetch 返回 Promise → 主线程立即注册 .then() → 网络线程发送请求 → 
网络线程完成 → 事件循环执行已注册的回调
┌─────────────────────────────────────────────────────────┐
│                     主线程                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  fetch() ──────────────┐                                 │
│    ↓                   │                                 │
│  Promise {pending}      │                                 │
│    ↓                   │                                 │
│  .then(callback) ──────┼──→ [将 callback 存入内部队列]  │
│    ↓                   │                                 │
│  继续执行后续代码       │                                 │
│                         │                                 │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Promise 内部数据结构
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Promise 内部状态                             │
├─────────────────────────────────────────────────────────┤
│  state: "pending" → "fulfilled（执行回调）"                          │
│  onFulfilledCallbacks: [callback1, callback2, ...]       │
└─────────────────────────────────────────────────────────┘
                          │
                          │ 网络线程完成后通知
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   网络线程                               │
├─────────────────────────────────────────────────────────┤
│  1. 建立 TCP 连接                                        │
│  2. 发送 HTTP 请求                                       │
│  3. 等待响应                                             │
│  4. 接收响应数据                                         │
│  5. 通知主线程：Promise resolve                          │
│     ⚠️ 网络线程不执行回调，只是改变状态                   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ 状态改变
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  事件循环                                │
├─────────────────────────────────────────────────────────┤
│  1. 检测到 Promise 状态变为 fulfilled                    │
│  2. 从 Promise 的 onFulfilledCallbacks 取出回调          │
│  3. 将回调放入微任务队列                                 │
│  4. 执行微任务：调用回调函数                             │
└─────────────────────────────────────────────────────────┘
*/

/*
    为什么调用者拿到的是回调中的 promise 而不是 fetch 的 promise？
    等价写法：
      export const login = (data) => {
        const promiseA = fetch(url);        // Promise A
        const promiseB = promiseA.then(callback);  // Promise B
        return promiseB;                    // 返回 Promise B
      }
*/
export const login = (data: { username: string; password: string }) => {
  return fetch(`${apiUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(async (response) => {
    if (response.ok) {
      /*
          return response.json().then(data => handleUserResponse(data)) 
          await 语法可以避免 then 链式调用，向编写同步代码一样编写异步代码
      */
      return handleUserResponse(await response.json());
    } else {
      return Promise.reject(await response.json());
    }
  });
};

export const register = (data: { username: string; password: string }) => {
  return fetch(`${apiUrl}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(async (response) => {
    if (response.ok) {
      return handleUserResponse(await response.json());
    } else {
      return Promise.reject(await response.json());
    }
  });
};

export const logout = async () =>
  window.localStorage.removeItem(localStorageKey);
