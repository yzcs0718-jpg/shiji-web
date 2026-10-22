# 拾集免费大模型接入指南（Groq）

当前状态：仓库已加入 `supabase/functions/shiji-ai-classify/index.ts`，网站已加入“✨ AI智能分类”按钮。**函数还需由 Supabase 管理员部署并配置服务端密钥，才会真正工作。**

## 1. 申请免费模型 API Key
前往 https://console.groq.com/ 注册，创建 API key。查看当时可用的免费模型与额度。代码当前选择 `openai/gpt-oss-20b`，如该模型不可用，替换函数中的 model 参数。

## 2. 在 Supabase 设置机密
在你的 Supabase 项目进入 Edge Functions > Secrets，新增：
`GROQ_API_KEY` = 你自己的 Groq API Key。
**不要将这个密钥发给别人或提交到 GitHub。** 仅需新增这个 secret；Supabase 自动提供 SUPABASE_URL 和 SUPABASE_ANON_KEY（若部署环境未自动提供，请按项目设置确认）。

## 3. 部署 Edge Function
在 Supabase 仪表盘 > Edge Functions，新建/部署函数 `shiji-ai-classify`。
将仓库文件 `supabase/functions/shiji-ai-classify/index.ts` 全部复制到函数编辑器并部署；保持 **Verify JWT = ON**。如果网页控制台不支持从 GitHub 自动部署，也可在电脑上使用 Supabase CLI：
```bash
supabase login
supabase link --project-ref qoxqazzrjgriuyqvdxcv
supabase functions deploy shiji-ai-classify
```
函数部署成功后地址为：
`https://qoxqazzrjgriuyqvdxcv.supabase.co/functions/v1/shiji-ai-classify`

## 4. 使用
登录拾集 -> 添加有真实标题的收藏（或者导入 JSON）-> 点击“✨ AI智能分类”。
每次只处理至多 12 条未分类/待整理收藏。分类基于文字标题，不读取视频画面。若提示额度受限、网络错误或服务未配置，可选择“规则分类”。

## 5. 隐私与成本
使用 AI 时，收藏的标题会发送给 Groq 进行分类；不会传递平台登录 Cookie 或第三方密码。请在对外开放前告知用户。
此版本没有服务端逐账号频次配额：公开运营之前，需要添加请求限流和日用量记录，避免免费额度耗尽或潜在付费风险。Groq 的免费额度/模型供应可能变化，必须以控制台实际状态为准。

## 6. 自测
- 未登录 -> 点击 AI -> 提示登录
- 登录 -> 添加标题“新手减脂训练入门” -> AI -> 检查分类为健身运动（不是固定保证）
- 登录账号 A -> 仅处理 A 的收藏；切换 B -> 仅处理 B
- 暂停/删除 GROQ_API_KEY -> 函数提示尚未配置
- 免费额度耗尽 -> 显示额度受限，规则分类可用
