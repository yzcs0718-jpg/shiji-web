# 拾集：第一阶段抖音 OAuth 接入验收清单

## 完成的开发
- GitHub Pages 授权回调路径：/shiji-web/oauth/callback/
- 对缺少 code/state 及错误回调给出明确提示。
- 页面显示授权尚未连接，不存储 code，不标记账号已绑定。
- Supabase 已有 platform_connections.sql 数据库结构（需要在项目 SQL Editor 执行）。

## 真正联通前不可缺少
1. 由拾集运营者在抖音开放平台申请网站应用与所需 scopes，取得 Client Key、Client Secret。
2. 在抖音后台登记严格一致的回调 URI，具体格式与 query 参数必须核对当前开发平台文档。
3. 在 Supabase Edge Functions 创建 OAuth begin/callback 服务端函数，绑定当前拾集用户，服务端生成并验证短期 state，校验用户身份；服务端使用 Client Secret 换取访问令牌，不暴露给浏览器。
4. 凭真实平台用户身份写入 platform_connections（仅服务端），提供解绑和令牌失效处理。
5. 用两个拾集测试用户分别验证授权、回调、隔离及解绑。
6. 如果接口未授予私人收藏读取 scope，禁止声称已完成私人收藏自动同步。

## 安全原则
- 不要求用户粘贴抖音密码、验证码、Cookie 或授权码。
- 任何平台 Secret 和 access/refresh token 不写入 GitHub Pages / localStorage。
- 不用打开普通抖音官网替代 OAuth 接入。
- 没有平台批准的 Client Key 时，不能生成真实可用的授权 URL。

## 状态
回调占位页已实现。抖音实际 OAuth 登录尚未实现；需应用获批后继续接入。
