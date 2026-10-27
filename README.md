# Gamma Squeeze 正式网站

一套代码同时用于网站和 App。管理后台在网站上，发布一次，网站和 App 同时更新。

- **前端**：`frontend/src` 是原型源码，`frontend/prod.js` 是正式版适配层，负责登录、服务器付费墙、Stripe 和线上发布。`npm run build` 会生成 `public/`。
- **接口**：`api/` 下是 Vercel Serverless 函数，数据存在 Supabase（Postgres）。
- **支付**：Stripe Checkout 负责订阅，Stripe 客户门户负责取消、换卡和发票，Webhook 负责同步订阅状态。

## 一、Supabase（约 10 分钟）

1. 在 supabase.com 新建项目，区域选 US East。
2. 打开 SQL Editor，先运行 `supabase/schema.sql`，再运行 `supabase/seed.sql`。seed 里是示例文章和示例数据，上线前可以删掉或替换。
3. 进入 Authentication → Providers → Email，开启 Email，然后改登录邮件模板：
   - 在 Authentication → Email Templates 的 Magic Link 模板里，把内容改成包含 `{{ .Token }}`（6 位验证码）。
   - 网站用的是验证码登录，不是链接登录。
4. 在 Authentication → URL Configuration 里，把 Site URL 填成你的域名，例如 `https://www.你的域名.com`。
5. 在 Project Settings → API 找到以下三项，后面配置 Vercel 时要用：
   - Project URL
   - anon key
   - service_role key（保密，只放在 Vercel 环境变量里）
6. 给自己开通管理员权限：先在网站上用你的邮箱登录一次，然后在 SQL Editor 里运行：
   `update public.profiles set role = 'admin' where email = '你的邮箱';`

## 二、Stripe（先用测试模式）

1. 在 Products 里新建产品 **Gamma Squeeze Pro**，加两个价格：
   - $29 / 月（按月循环）
   - $199 / 年（按年循环）
   - 记下两个价格 ID（`price_...`）。
2. 在 Coupons 里新建优惠券：金额减免 $100，USD，Duration 选 **Once**。记下优惠券 ID。
3. 在 Settings → Billing → Customer portal 里开启客户门户，允许取消订阅和更新付款方式。
4. 在 Developers → Webhooks 里添加端点：
   - 地址：`https://你的域名/api/webhook`
   - 事件：`checkout.session.completed`、`customer.subscription.created`、`customer.subscription.updated`、`customer.subscription.deleted`
   - 记下签名密钥（`whsec_...`）。
5. 测试模式下用卡号 `4242 4242 4242 4242` 付款。全部跑通后切到 Live 模式，重复第 1、2、4 步，再换成 Live 的密钥。

## 三、Vercel 部署

1. 在 vercel.com 选择 Import 这个 GitHub 仓库，Framework 选 **Other**：
   - Build Command：`npm run build`
   - Output Directory：`public`
2. 在 Settings → Environment Variables 里填入以下变量：

| 变量 | 值 |
|---|---|
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key（保密） |
| `STRIPE_SECRET_KEY` | Stripe 密钥 `sk_test_...` / `sk_live_...`（保密） |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `STRIPE_PRICE_MONTHLY` | 月付价格 ID |
| `STRIPE_PRICE_ANNUAL` | 年付价格 ID |
| `STRIPE_COUPON_NEWUSER` | $100 优惠券 ID |
| `SITE_URL` | `https://www.你的域名.com` |
| `OFFER_MINUTES` | `10`（新用户优惠倒计时分钟数） |

3. 重新部署一次，让环境变量生效。

## 四、接入现有域名

1. 在 Vercel 项目的 Settings → Domains 里添加 `你的域名.com` 和 `www.你的域名.com`。
2. 到域名的 DNS 管理处修改解析。如果域名在 Wix，就在 Wix 的 Domains → Manage DNS Records 里改：
   - `A` 记录：`@` 指向 `76.76.21.21`
   - `CNAME` 记录：`www` 指向 `cname.vercel-dns.com`
   - 以 Vercel 页面上显示的值为准。
3. 改之前把 Wix 原有的 A 记录和 www 记录删掉或替换掉。邮箱用的 MX 记录不要动。
4. 解析通常几分钟到几小时生效，Vercel 会自动配置 HTTPS。

## 五、日常使用

- **发文章**：登录网站，进入 我的 → 进入编辑后台 → 线上发布。正文写法：
  - 空行分段。
  - `## 标题` 开始新的一节，付费墙从第一节开始。
  - `> ` 开头是引语。
  - `[chart:SPX]`、`[spark:US10Y|图注]`、`[curve|图注]`、`[vx]` 插入图表。
- **发快照**：在同一页面的"发布快照"里发。
- **数据栏目**：财报解析、机构持仓、国会交易存在 `datasets` 表里，订阅用户才能读取。正式数据接入后，由导入任务写入；也可以调用 `/api/admin/publish`（kind = dataset）写入。

## 六、App（下一阶段）

`public/` 可以直接作为 Capacitor 的 web 目录，打包成 iOS 和 Android App，接口和账号与网站共用。在 iOS App 内销售订阅要遵守苹果规则：使用苹果内购，或在美国区通过外部链接引导到网站支付。

## 七、Option Edge Index（OEI）

`oei/` 是 OEI 计算引擎（Python），按方法论 v0.1 计算 SPY-OEI、QQQ-OEI、Fair Vol、Edge Spread、VRP 和 30 天预期波动。

- **安装**：`pip install -r oei/requirements.txt`（只需要 numpy）。
- **输入**：每个代码一个文件夹，例如 `data/SPY/`：
  - `chain_<到期日>.csv`：每个到期日一个文件，列为 `strike,call_bid,call_ask,put_bid,put_ask`，至少包含跨 30 天两侧的两个到期日。
  - `prices.csv`：`date,close`，每日收盘价，至少约 300 行。
  - `meta.json`：`{"spot": 672.4, "rate": 0.041, "dividends": [["2026-12-19", 1.85]]}`。
  - 共用的 `data/events.csv`：`date,name`，列出历史和未来的 CPI、FOMC、非农、大型科技股财报日期。
- **运行**：`python3 oei/run.py --data data --asof 2026-10-26` 输出当日快照 JSON；加 `--publish` 并设置环境变量 `GS_API`（网站地址）和 `GS_TOKEN`（管理员登录令牌）即写入网站，网站和 App 同时更新。
- **频率**：每个交易日美东 15:45 用当时的期权报价运行一次。
- **权限**：`/api/oei` 对所有人返回 OEI 和预期波动，Fair Vol、Edge Spread、VRP 和历史明细只返回给订阅用户。
- **数据**：期权报价必须来自授权数据源（如 Cboe DataShop、ORATS、Polygon）。网站在收到第一份正式快照之前显示标注为"示例数据"的读数。
- **测试**：`python3 -m unittest discover -s oei/tests`。

## 测试

```
npm install
npm test        # 接口测试：付费墙、优惠倒计时、Checkout、Webhook 验签与幂等、发布权限
npm run build   # 生成 public/
python3 -m unittest discover -s oei/tests   # OEI 引擎测试
```

## 目前仍是原型级的部分

- 评论、社区、价位提醒和收藏仍保存在用户本机浏览器里，还没有接数据库，下一阶段迁移。
- 行情、财报、机构持仓、国会交易目前是示例数据。正式数据需要授权数据源（期权 OI、一致预期）和官方数据源（SEC 13F、国会申报）。国会申报数据用于商业用途前，请先做法律确认。
