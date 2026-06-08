# 网页报价单生成器

一个本地可用的报价单网页，使用纯 `HTML + CSS + JavaScript` 实现。

## 功能

- 填写客户信息、供货方信息、产品明细、税率、电子印章
- 支持添加多行产品
- 自动计算未税金额、税额和含税总金额
- 支持上传模板、保存模板、恢复默认模板
- 支持生成可打印报价单
- 打印时可另存为 PDF

## 目录结构

```text
quote-generator/
├─ index.html
├─ styles.css
├─ app.js
├─ README.md
└─ templates/
   └─ default-template.html
```

## 怎么运行

最简单的方法：

1. 找到 `index.html`
2. 双击打开
3. 浏览器里就能直接使用

### 电脑启动本地服务

如果你想让手机也访问，建议在项目目录里运行本地服务：

```powershell
python -m http.server 8000 --bind 0.0.0.0
```

然后电脑浏览器打开：

```text
http://localhost:8000
```

## 手机怎么访问

1. 先确保电脑和手机连的是同一个 Wi-Fi
2. 在电脑上启动本地服务，命令见上面
3. 在电脑上查看局域网 IP

你可以在 Windows 里运行：

```powershell
ipconfig
```

找到当前 Wi-Fi 网卡对应的 `IPv4 地址`，例如 `192.168.1.23`

4. 在手机浏览器打开：

```text
http://电脑局域网IP:8000
```

例如：

```text
http://192.168.1.23:8000
```

## 怎么使用

1. 填写客户名称、联系人、电话、地址
2. 填写供货方信息、付款方式、交货方式、报价有效期
3. 在产品表格里输入产品名称、数量、单位、单价（含税）、备注
4. 选择税率，或者切换到“自定义”并手动输入
5. 点击 `+ 添加一行产品` 增加更多产品
6. 点击 `一键生成报价单` 查看预览
7. 点击 `打印 / 导出 PDF`，在打印窗口里选择 `另存为 PDF`

## 手机端使用提示

- 手机屏幕下，表单会自动变成单列，不会横向溢出
- 产品明细表保留横向滑动，方便查看所有列
- 按钮和输入框已尽量做大，适合手指点击
- 如果手机浏览器打印不方便，可以先在电脑上导出 PDF，再发送到手机

## 怎么修改模板

### 方法 1：直接在页面里改

1. 在右侧的“模板内容”里修改 HTML 片段
2. 点击 `保存当前模板`
3. 再点 `一键生成报价单`

### 方法 2：上传模板文件

1. 准备一个 `.html` 或 `.txt` 模板文件
2. 点击 `上传模板文件（HTML 片段）`
3. 选择你的文件
4. 模板会自动替换到页面里

### 方法 3：改内置模板文件

内置模板示例在：

- `templates/default-template.html`

你可以直接编辑它，然后把内容复制回右侧模板编辑框。

## 可用占位符

- `{{quoteTitle}}`
- `{{quoteDate}}`
- `{{customerName}}`
- `{{customerContact}}`
- `{{customerPhone}}`
- `{{customerAddress}}`
- `{{supplierName}}`
- `{{supplierContact}}`
- `{{supplierPhone}}`
- `{{supplierAddress}}`
- `{{deliveryDate}}`
- `{{paymentMethod}}`
- `{{validityPeriod}}`
- `{{deliveryMethod}}`
- `{{remarks}}`
- `{{tableRows}}`
- `{{pretaxTotal}}`
- `{{taxRate}}`
- `{{taxRateText}}`
- `{{taxAmount}}`
- `{{grandTotal}}`
- `{{generatedAt}}`
- `{{sealHtml}}`

## 小提示

- 页面会记住你上一次填写的内容和模板
- 如果想恢复默认模板，点 `恢复内置模板`
- 打印时如果要导出 PDF，直接选浏览器里的 `另存为 PDF`

