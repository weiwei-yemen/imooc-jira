import React, { useState } from "react";
import { RegisterScreen } from "unauthenticated-app/register";
import { LoginScreen } from "unauthenticated-app/login";
import { Button, Card, Divider } from "antd";
import styled from "@emotion/styled";
import logo from "assets/logo.svg";
import left from "assets/left.svg";
import right from "assets/right.svg";
import { useDocumentTitle } from "utils";
import { ErrorBox } from "components/lib";

export default function UnauthenticatedApp() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useDocumentTitle("请登录注册以继续");

  return (
    <Container>
      <Header />
      <Background />
      <ShadowCard>
        <Title>{isRegister ? "请注册" : "请登录"}</Title>
        <ErrorBox error={error} />
        {isRegister ? (
          <RegisterScreen onError={setError} />
        ) : (
          <LoginScreen onError={setError} />
        )}
        <Divider />
        <Button type={"link"} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "已经有账号了？直接登录" : "没有账号？注册新账号"}
        </Button>
      </ShadowCard>
    </Container>
  );
}

export const LongButton = styled(Button)`
  width: 100%;
`;

const Title = styled.h2`
  margin-bottom: 2.4rem;
  color: rgb(94, 108, 132);
`;

// 什么这里定义的 div 和下面的 Card 会在同一行显示？

// 当元素设置 position: absolute; 后：
// 1. 脱离正常文档流 - 不再占据原本的空间位置
// 2. 不影响其他元素的布局 - 其他元素会当它不存在

const Background = styled.div`
  position: absolute; // 脱离文档流
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: left bottom, right bottom;
  // 中间的 Cart 是 40rem,减去 3.2 是为了让图片和 Card 保持一点距离，美观
  background-size: calc(((100vw - 40rem) / 2) - 3.2rem),
    calc(((100vw - 40rem) / 2) - 3.2rem), cover;
  background-image: url(${left}), url(${right});
`;

/*
  background: url(${logo}) no-repeat center 等价于：
  background-image: url(${logo});
  background-repeat: no-repeat;
  background-position: center;
*/

/*
padding: 5rem 0;的作用是什么

1. <Header /> 是自闭合标签，里面没有任何子内容                                          
2. 没有设置 height 或 min-height                                                        
3. CSS 中背景图片不会撑开容器高度 - background 只是装饰，不会影响元素的实际尺寸         
                                                                                        
当有 padding: 5rem 0 时：                                                               
- 上下各 5rem 的内边距，使 Header 高度为 10rem                                          
- 背景图片在这个 10rem × 100% 的区域内显示                                              
                                                                                        
当注释掉 padding: 5rem 0 后：                                                           
- Header 没有子内容 + 没有高度 + 没有 padding                                           
- 高度塌陷为 0                                                                          
- 即使设置了 background，0 高度的元素也无法显示任何背景  
*/

// 为什么没有 width: 100%; 整个header就不会显示了？

// 关键问题：align-items: center 与空元素的交互
//   1. Container 是 flex 容器，设置了 align-items: center
//   2. Header 是空元素（<Header /> 没有子内容）
//   3. 在 Flex 布局中，当子元素没有明确宽度时：
//     - flex 子元素的宽度会收缩以适应其内容
//     - 因为 Header 是空的，没有内容撑起宽度
//     - 即使有 padding: 5rem 0，宽度会塌陷为 0（或接近 0）
//   4. 结果：Header 变成 0 宽度 × 10 高度 的窄条，虽然背景图片理论上应该显示，但因为宽度为 0
//    而不可见

const Header = styled.header`
  background: url(${logo}) no-repeat center;
  padding: 5rem 0;
  background-size: 8rem; // 指图片的宽度
  width: 100%;
`;

/*
  text-align对那些元素起作用？

  text-align: center 不仅对文字起作用，它会对该容器内的所有行内级内容（inline-level content）生效。
  具体规则：

  会生效的元素：

  ✓ 文字内容
  ✓ 行内元素（inline）：<span>, <a>, <img> 等
  ✓ 行内块级元素（inline-block）：设置了 display: inline-block 的元素
  不会生效的元素：

  ✗ 块级元素（block）：<div>, <p>, <h1>~<h6> 等
  ✗ flex/grid 容器的直接子元素
  在 ShadowCard 中的实际效果：

  标题文字 <Title> (h2) - 会生效，因为 h2 默认是 block，但其内部文字会居中
  Button - antd 的 Button 默认是 display: inline-block，所以会被居中
  表单输入框 - antd 的 Input 也是 inline-block，会被居中

  为什么标题文字 <Title> (h2)也能居中？
    ShadowCard 设置了 text-align: center
    Title (h2) 作为子元素，继承了这个属性
    Title 虽然是块级元素（自己不会居中），但它继承了 text-align: center
    因此 Title 内部的文本内容会居中显示
 */

/*
  height and min-height ?
  height: 56rem	固定高度，内容超出时会被裁剪或产生滚动条
  min-height: 56rem	最小高度 56rem，内容多时自动扩展
*/
const ShadowCard = styled(Card)`
  width: 40rem; // 卡片宽度:40rem(约640px)
  min-height: 56rem; // 最小高度:56rem(约896px)
  padding: 3.2rem 4rem; // 内边距:上下3.2rem,左右4rem
  border-radius: 0.3rem; // 圆角:0.3rem,使卡片边角稍微圆润
  box-sizing: border-box; // 盒模型:padding 和 border 包含在 width 内
  box-shadow: rgba(0, 0, 0, 0.1) 0 0 10px; // 阴影:10px模糊半径的黑色半透明阴影,制造悬浮效果
  text-align: center; // 文本对齐：居中对齐
`;

const Container = styled.div`
  display: flex; // 启用 Flexbox 布局
  flex-direction: column; // 子元素垂直排列（从上到下）
  align-items: center; // 子元素在水平方向居中
  min-height: 100vh; // 容器最小高度为视口高度 (100vh = 100% viewport height)
`;
