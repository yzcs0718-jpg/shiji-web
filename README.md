# 拾集 SHIJI

静态收藏管理网页，GitHub Pages 托管。未接入 Supabase 前仅支持访客本地收藏；接入 Supabase 后支持邮箱注册登录及个人云端收藏。

## 配置账号登录
1. 在 Supabase 新建项目，SQL Editor 运行 schema.sql。
2. 在 Authentication > Providers 启用 Email，设置 Site URL 和 Redirect URLs 为 Pages 的完整地址。
3. 把 Supabase Project URL 和 **publishable/anon key** 写入 config.js 的 url / publishableKey。不要填写 secret 或 service_role。
4. GitHub 仓库 Settings > Pages，将 Source 选 GitHub Actions。
5. 测试邮箱验证、登录、两设备同账户同步和不同账户隔离。认证未配置前不应宣称已支持账号登录。

## 使用
添加收藏、搜索、分类、批量删除、导入 JSON、导出备份。访客本地数据和登录用户云端数据隔离。登录不会自动转移访客收藏，需在访客模式先导出再在账号模式导入。

## 平台限制
小红书、抖音、B站私人收藏不能仅靠本网站访问。应使用各平台提供的合法数据接口或手动导入，不收集第三方密码/Cookie。平台收藏自动同步尚未实现。
