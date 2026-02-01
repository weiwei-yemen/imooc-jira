import React from "react";
import { useAuth } from "context/auth-context";
import { Form, Input } from "antd";
import { LongButton } from "unauthenticated-app/index";
import { useAsync } from "utils/use-async";

// interface Base {
//   id: number
// }
//
// interface Advance extends Base {
//   name: string
// }
//
// const test = (p: Base) => {
// }
//
// // 鸭子类型(duck typing)：面向接口编程 而不是 面向对象编程
// const a = {id: 1, name: 'jack'}
// test(a)
// const apiUrl = process.env.REACT_APP_API_URL;

export const LoginScreen = ({
  onError,
}: {
  onError: (error: Error) => void;
}) => {
  const { login } = useAuth();
  const { run, isLoading, error } = useAsync(undefined, { throwOnError: true });

  // HTMLFormElement extends Element
  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      await run(login(values));
    } catch (e: any) {
      onError(e);
    }

    /* 
      这为什么不能下面这么写？登录成功后，error 会被重置为 null
      原因在于 react 的状态更新是异步的
      - run 内部调用 setError(error)
      - React 将状态更新加入调度队列
      - await run(...) 返回
      - if (error) 立即执行（此时新状态可能还未渲染）
      - React 完成状态更新和重新渲染
     */

    // await run(login(values));
    // if (error) {
    //   onError(error);
    // }
  };

  return (
    <Form onFinish={handleSubmit}>
      <Form.Item
        name={"username"}
        rules={[{ required: true, message: "请输入用户名" }]}
      >
        <Input placeholder={"用户名"} type="text" id={"username"} />
      </Form.Item>
      <Form.Item
        name={"password"}
        rules={[{ required: true, message: "请输入密码" }]}
      >
        <Input placeholder={"密码"} type="password" id={"password"} />
      </Form.Item>
      <Form.Item>
        <LongButton loading={isLoading} htmlType={"submit"} type={"primary"}>
          登录
        </LongButton>
      </Form.Item>
    </Form>
  );
};
