import React from "react";

type FallbackRender = (props: { error: Error | null }) => React.ReactElement;

// https://github.com/bvaughn/react-error-boundary
// React 的 Error Boundary 机制目前只能用 class 组件实现。
export class ErrorBoundary extends React.Component<
  // React.PropsWithChildren<P> 是 React 提供的 TypeScript 工具类型，
  // 作用是在你自定义的 props 类型 P 上自动追加 children 属性。
  // type PropsWithChildren<P> = P & { children?: ReactNode };
  // 也就是说，它把你的原始 props 和 { children?: ReactNode } 合并在一起。
  React.PropsWithChildren<{ fallbackRender: FallbackRender }>,
  // 这里是申明状态的类型
  { error: Error | null }
> {
  // 这里是初始化状态
  state = { error: null };

  // 当子组件抛出异常，这里会接收到并且调用
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    // 只要组件被写成嵌套形式（<Comp>...</Comp>），children 就会出现在 props 里，可以直接解构使用。
    const { fallbackRender, children } = this.props;
    if (error) {
      return fallbackRender({ error });
    }
    return children;
  }
}
