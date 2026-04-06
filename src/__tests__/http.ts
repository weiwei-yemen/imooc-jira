import { setupServer } from "msw/node";
import { rest } from "msw";
import { http } from "utils/http";

const apiUrl = process.env.REACT_APP_API_URL;

const server = setupServer();

// jest 是对react最友好的一个测试库
// beforeAll 代表执行所有的测试之前，先来执行一下回调函数
beforeAll(() => server.listen());

// 每一个测试跑完以后，都重置mock路由
// 如果不清理，上一个测试的 handler 会残留到下一个测试，可能会导致意外的拦截
afterEach(() => server.resetHandlers());

// 所有的测试跑完后，关闭mock路由
afterAll(() => server.close());

test("http方法发送异步请求", async () => {
  const endpoint = "test-endpoint";
  const mockResult = { mockValue: "mock" };

  // server 是 MSW 创建的 mock 服务器。server.use() 就像是在说：
  // "从这个测试开始，如果遇到某个请求，请按我下面定义的规则返回假数据。"
  server.use(
    // 这里会拦截${apiUrl}/${endpoint}的请求
    rest.get(`${apiUrl}/${endpoint}`, (req, res, ctx) =>
      res(ctx.json(mockResult))
    )
  );

  const result = await http(endpoint);
  expect(result).toEqual(mockResult);
});

test("http请求时会在header里带上token", async () => {
  const token = "FAKE_TOKEN";
  const endpoint = "test-endpoint";
  const mockResult = { mockValue: "mock" };

  let request: any;

  server.use(
    rest.get(`${apiUrl}/${endpoint}`, async (req, res, ctx) => {
      request = req;
      return res(ctx.json(mockResult));
    })
  );
  // toBe：比的是"是不是同一个东西"（地址/引用）
  // toEqual：比的是"长得一不一样"（内容/结构）
  await http(endpoint, { token });
  expect(request.headers.get("Authorization")).toBe(`Bearer ${token}`);
});
