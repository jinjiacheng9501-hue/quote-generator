const STORAGE_KEYS = {
  form: "quote-generator-form-v3",
  template: "quote-generator-template-v3",
};

const defaultTemplate = `
<div class="quote-paper">
  <div class="quote-top">
    <div class="quote-title-block">
      <p class="eyebrow">商业报价单</p>
      <h1>{{quoteTitle}}</h1>
      <div class="quote-meta-inline">
        <span>报价日期：{{quoteDate}}</span>
        <span>供货日期：{{deliveryDate}}</span>
      </div>
    </div>
    <div class="meta-box">
      <div>
        <span>未税金额</span>
        <strong>{{pretaxTotal}}</strong>
      </div>
      <div>
        <span>含税总金额</span>
        <strong>{{grandTotal}}</strong>
      </div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <h3>客户信息</h3>
      <p><span>客户名称：</span>{{customerName}}</p>
      <p><span>联系人：</span>{{customerContact}}</p>
      <p><span>联系电话：</span>{{customerPhone}}</p>
      <p><span>地址：</span>{{customerAddress}}</p>
    </div>
    <div class="info-card">
      <h3>供货方信息</h3>
      <p><span>公司名称：</span>{{supplierName}}</p>
      <p><span>联系人：</span>{{supplierContact}}</p>
      <p><span>联系电话：</span>{{supplierPhone}}</p>
      <p><span>地址：</span>{{supplierAddress}}</p>
    </div>
  </div>

  <table class="quote-table">
    <thead>
      <tr>
        <th style="width:60px;">序号</th>
        <th>产品名称</th>
        <th style="width:90px; text-align:right;">数量</th>
        <th style="width:90px;">单位</th>
        <th style="width:130px; text-align:right;">单价（含税）</th>
        <th style="width:140px; text-align:right;">含税金额</th>
        <th>备注</th>
      </tr>
    </thead>
    <tbody>
      {{tableRows}}
    </tbody>
  </table>

  <div class="summary-grid">
    <div class="summary-card">
      <h3>金额汇总</h3>
      <p><span>未税金额：</span>{{pretaxTotal}}</p>
      <p><span>税率：</span>{{taxRateText}}</p>
      <p><span>税额：</span>{{taxAmount}}</p>
      <p><span>含税总金额：</span><strong>{{grandTotal}}</strong></p>
    </div>
    <div class="summary-card">
      <h3>商务条款</h3>
      <p><span>付款方式：</span>{{paymentMethod}}</p>
      <p><span>报价有效期：</span>{{validityPeriod}}</p>
      <p><span>交货方式：</span>{{deliveryMethod}}</p>
      <p><span>备注条款：</span>{{remarks}}</p>
    </div>
  </div>

  <div class="signature-grid">
    <div class="signature-box seal-box">
      <span>供货方签字 / 盖章</span>
      <div class="seal-slot">
        {{sealHtml}}
      </div>
    </div>
    <div class="signature-box">
      <span>客户确认</span>
    </div>
  </div>

  <div class="quote-foot">报价单生成时间：{{generatedAt}}</div>
</div>`;

const els = {
  customerName: document.getElementById("customerName"),
  customerContact: document.getElementById("customerContact"),
  customerPhone: document.getElementById("customerPhone"),
  customerAddress: document.getElementById("customerAddress"),
  quoteDate: document.getElementById("quoteDate"),
  deliveryDate: document.getElementById("deliveryDate"),
  validityPeriod: document.getElementById("validityPeriod"),
  supplierName: document.getElementById("supplierName"),
  supplierContact: document.getElementById("supplierContact"),
  supplierPhone: document.getElementById("supplierPhone"),
  supplierAddress: document.getElementById("supplierAddress"),
  paymentMethod: document.getElementById("paymentMethod"),
  deliveryMethod: document.getElementById("deliveryMethod"),
  remarks: document.getElementById("remarks"),
  taxRatePreset: document.getElementById("taxRatePreset"),
  taxRateCustom: document.getElementById("taxRateCustom"),
  sealFile: document.getElementById("sealFile"),
  clearSealBtn: document.getElementById("clearSealBtn"),
  sealPreview: document.getElementById("sealPreview"),
  sealPreviewEmpty: document.getElementById("sealPreviewEmpty"),
  itemsBody: document.getElementById("itemsBody"),
  addRowBtn: document.getElementById("addRowBtn"),
  generateBtn: document.getElementById("generateBtn"),
  printBtn: document.getElementById("printBtn"),
  pretaxTotal: document.getElementById("pretaxTotal"),
  grandTotal: document.getElementById("grandTotal"),
  templateEditor: document.getElementById("templateEditor"),
  templateFile: document.getElementById("templateFile"),
  restoreTemplateBtn: document.getElementById("restoreTemplateBtn"),
  saveTemplateBtn: document.getElementById("saveTemplateBtn"),
  quotePreview: document.getElementById("quotePreview"),
  rowTemplate: document.getElementById("rowTemplate"),
};

const defaults = {
  customerContact: "",
  customerPhone: "",
  customerAddress: "",
  supplierName: "扬州博瑞克仪器仪表科技有限公司",
  supplierContact: "金嘉诚",
  supplierPhone: "13328132156",
  supplierAddress: "江苏省扬州市宝应经济开发区金湾路220号",
  paymentMethod: "请联系确认",
  deliveryMethod: "请联系确认",
  validityPeriod: "报价有效期 7 天",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(value) {
  const number = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(number);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toNumber(value) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function cleanText(value, fallback = "—") {
  const text = String(value ?? "").trim();
  return text ? escapeHtml(text) : fallback;
}

function calculateLineTotal(qty, unitPrice) {
  return toNumber(qty) * toNumber(unitPrice);
}

function getTaxRateValue() {
  const preset = els.taxRatePreset.value;
  if (preset === "custom") {
    return Math.max(0, toNumber(els.taxRateCustom.value) / 100);
  }
  return Math.max(0, toNumber(preset));
}

function getTaxRateText(rateValue) {
  return `${(rateValue * 100).toFixed(rateValue === 0 ? 0 : 2)}%`;
}

function getQuoteTitle() {
  const customer = els.customerName.value.trim();
  return customer ? `${customer}报价单` : "报价单";
}

function createRow(data = {}) {
  const fragment = els.rowTemplate.content.cloneNode(true);
  const row = fragment.querySelector("tr");
  const product = fragment.querySelector(".item-product");
  const qty = fragment.querySelector(".item-qty");
  const unit = fragment.querySelector(".item-unit");
  const price = fragment.querySelector(".item-price");
  const subtotal = fragment.querySelector(".item-subtotal");
  const remark = fragment.querySelector(".item-remark");
  const removeBtn = fragment.querySelector(".remove-row");

  product.value = data.productName ?? "";
  qty.value = data.quantity ?? 1;
  unit.value = data.unit ?? "个";
  price.value = data.unitPrice ?? 0;
  remark.value = data.remark ?? "";
  subtotal.textContent = formatCurrency(calculateLineTotal(qty.value, price.value));

  const recalc = () => {
    subtotal.textContent = formatCurrency(calculateLineTotal(qty.value, price.value));
    updateTotals();
    saveFormState();
  };

  product.addEventListener("input", recalc);
  qty.addEventListener("input", recalc);
  unit.addEventListener("input", saveFormState);
  price.addEventListener("input", recalc);
  remark.addEventListener("input", saveFormState);

  removeBtn.addEventListener("click", () => {
    row.remove();
    if (!els.itemsBody.querySelector(".item-row")) {
      els.itemsBody.appendChild(createRow());
    }
    updateTotals();
    saveFormState();
  });

  return fragment;
}

function getRowsData() {
  return [...els.itemsBody.querySelectorAll(".item-row")].map((row) => {
    const productName = row.querySelector(".item-product").value.trim();
    const quantity = toNumber(row.querySelector(".item-qty").value);
    const unit = row.querySelector(".item-unit").value.trim();
    const unitPrice = toNumber(row.querySelector(".item-price").value);
    const remark = row.querySelector(".item-remark").value.trim();
    return {
      productName,
      quantity,
      unit,
      unitPrice,
      remark,
      subtotal: quantity * unitPrice,
    };
  });
}

function getSealHtml() {
  const src = localStorage.getItem("quote-generator-seal-v3");
  if (!src) return "";
  return `<img class="seal-image" src="${src}" alt="公司印章" />`;
}

function updateSealPreview() {
  const src = localStorage.getItem("quote-generator-seal-v3");
  if (src) {
    els.sealPreview.src = src;
    els.sealPreview.style.display = "block";
    els.sealPreviewEmpty.style.display = "none";
  } else {
    els.sealPreview.removeAttribute("src");
    els.sealPreview.style.display = "none";
    els.sealPreviewEmpty.style.display = "block";
  }
}

function computeSummary() {
  const rows = getRowsData();
  const taxRate = getTaxRateValue();
  const grandTotal = rows.reduce((sum, item) => sum + item.subtotal, 0);
  const pretaxTotal = taxRate === 0 ? grandTotal : grandTotal / (1 + taxRate);
  const taxAmount = grandTotal - pretaxTotal;
  return { rows, taxRate, pretaxTotal, taxAmount, grandTotal };
}

function updateTotals() {
  const summary = computeSummary();
  els.pretaxTotal.textContent = formatCurrency(summary.pretaxTotal);
  els.grandTotal.textContent = formatCurrency(summary.grandTotal);
  document.title = getQuoteTitle();
  return summary;
}

function buildTableRows(rows) {
  if (!rows.length) {
    return `<tr><td class="row-empty" colspan="7">暂无产品</td></tr>`;
  }

  return rows
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${cleanText(item.productName)}</td>
          <td class="num">${Number.isFinite(item.quantity) ? item.quantity.toFixed(0) : "0"}</td>
          <td>${cleanText(item.unit, "个")}</td>
          <td class="num">${formatCurrency(item.unitPrice)}</td>
          <td class="num">${formatCurrency(item.subtotal)}</td>
          <td>${cleanText(item.remark, "—")}</td>
        </tr>
      `
    )
    .join("");
}

function fillTemplate(template, data) {
  return template
    .replaceAll("{{quoteTitle}}", cleanText(data.quoteTitle, "报价单"))
    .replaceAll("{{quoteDate}}", cleanText(data.quoteDate))
    .replaceAll("{{customerName}}", cleanText(data.customerName, "未填写"))
    .replaceAll("{{customerContact}}", cleanText(data.customerContact, "—"))
    .replaceAll("{{customerPhone}}", cleanText(data.customerPhone, "—"))
    .replaceAll("{{customerAddress}}", cleanText(data.customerAddress, "—"))
    .replaceAll("{{supplierName}}", cleanText(data.supplierName))
    .replaceAll("{{supplierContact}}", cleanText(data.supplierContact))
    .replaceAll("{{supplierPhone}}", cleanText(data.supplierPhone))
    .replaceAll("{{supplierAddress}}", cleanText(data.supplierAddress))
    .replaceAll("{{deliveryDate}}", cleanText(data.deliveryDate, "未填写"))
    .replaceAll("{{paymentMethod}}", cleanText(data.paymentMethod, "—"))
    .replaceAll("{{validityPeriod}}", cleanText(data.validityPeriod, "—"))
    .replaceAll("{{deliveryMethod}}", cleanText(data.deliveryMethod, "—"))
    .replaceAll("{{remarks}}", cleanText(data.remarks, "无"))
    .replaceAll("{{generatedAt}}", cleanText(data.generatedAt, "—"))
    .replaceAll("{{tableRows}}", data.tableRows)
    .replaceAll("{{pretaxTotal}}", cleanText(data.pretaxTotal, "¥0.00"))
    .replaceAll("{{taxRate}}", cleanText(data.taxRate, "0%"))
    .replaceAll("{{taxRateText}}", cleanText(data.taxRateText, "0%"))
    .replaceAll("{{taxAmount}}", cleanText(data.taxAmount, "¥0.00"))
    .replaceAll("{{grandTotal}}", cleanText(data.grandTotal, "¥0.00"))
    .replaceAll("{{sealHtml}}", data.sealHtml || "");
}

function getFormState() {
  const summary = computeSummary();
  const taxRateText = getTaxRateText(summary.taxRate);
  return {
    quoteTitle: getQuoteTitle(),
    quoteDate: els.quoteDate.value || todayISO(),
    customerName: els.customerName.value,
    customerContact: els.customerContact.value,
    customerPhone: els.customerPhone.value,
    customerAddress: els.customerAddress.value,
    supplierName: els.supplierName.value,
    supplierContact: els.supplierContact.value,
    supplierPhone: els.supplierPhone.value,
    supplierAddress: els.supplierAddress.value,
    deliveryDate: els.deliveryDate.value,
    paymentMethod: els.paymentMethod.value,
    validityPeriod: els.validityPeriod.value,
    deliveryMethod: els.deliveryMethod.value,
    remarks: els.remarks.value,
    rows: summary.rows,
    pretaxTotal: formatCurrency(summary.pretaxTotal),
    taxRate: taxRateText,
    taxRateText,
    taxAmount: formatCurrency(summary.taxAmount),
    grandTotal: formatCurrency(summary.grandTotal),
    generatedAt: new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    sealHtml: getSealHtml(),
  };
}

function renderQuote() {
  const template = els.templateEditor.value.trim() || defaultTemplate;
  const state = getFormState();
  const html = fillTemplate(template, {
    ...state,
    tableRows: buildTableRows(state.rows),
  });
  els.quotePreview.innerHTML = html;
  updateTotals();
  updateSealPreview();
  saveFormState();
}

function saveFormState() {
  const state = {
    customerName: els.customerName.value,
    customerContact: els.customerContact.value,
    customerPhone: els.customerPhone.value,
    customerAddress: els.customerAddress.value,
    quoteDate: els.quoteDate.value,
    deliveryDate: els.deliveryDate.value,
    validityPeriod: els.validityPeriod.value,
    supplierName: els.supplierName.value,
    supplierContact: els.supplierContact.value,
    supplierPhone: els.supplierPhone.value,
    supplierAddress: els.supplierAddress.value,
    paymentMethod: els.paymentMethod.value,
    deliveryMethod: els.deliveryMethod.value,
    remarks: els.remarks.value,
    taxRatePreset: els.taxRatePreset.value,
    taxRateCustom: els.taxRateCustom.value,
    rows: getRowsData(),
  };
  localStorage.setItem(STORAGE_KEYS.form, JSON.stringify(state));
}

function loadFormState() {
  const raw = localStorage.getItem(STORAGE_KEYS.form);
  if (!raw) return false;

  try {
    const state = JSON.parse(raw);
    els.customerName.value = state.customerName || "";
    els.customerContact.value = state.customerContact || "";
    els.customerPhone.value = state.customerPhone || "";
    els.customerAddress.value = state.customerAddress || "";
    els.quoteDate.value = state.quoteDate || todayISO();
    els.deliveryDate.value = state.deliveryDate || todayISO();
    els.validityPeriod.value = state.validityPeriod || defaults.validityPeriod;
    els.supplierName.value = state.supplierName || defaults.supplierName;
    els.supplierContact.value = state.supplierContact || defaults.supplierContact;
    els.supplierPhone.value = state.supplierPhone || defaults.supplierPhone;
    els.supplierAddress.value = state.supplierAddress || defaults.supplierAddress;
    els.paymentMethod.value = state.paymentMethod || defaults.paymentMethod;
    els.deliveryMethod.value = state.deliveryMethod || defaults.deliveryMethod;
    els.remarks.value = state.remarks || "";
    els.taxRatePreset.value = state.taxRatePreset || "0.13";
    els.taxRateCustom.value = state.taxRateCustom || "13";
    els.itemsBody.innerHTML = "";
    const rows = Array.isArray(state.rows) && state.rows.length ? state.rows : [{}];
    rows.forEach((row) => els.itemsBody.appendChild(createRow(row)));
    return true;
  } catch {
    return false;
  }
}

function saveTemplate() {
  localStorage.setItem(STORAGE_KEYS.template, els.templateEditor.value);
}

function loadTemplate() {
  const cached = localStorage.getItem(STORAGE_KEYS.template);
  els.templateEditor.value = cached || defaultTemplate;
}

function applyTaxRateUi() {
  const isCustom = els.taxRatePreset.value === "custom";
  els.taxRateCustom.disabled = !isCustom;
  els.taxRateCustom.closest(".field").classList.toggle("is-disabled", !isCustom);
}

function attachFormListeners() {
  [
    els.customerName,
    els.customerContact,
    els.customerPhone,
    els.customerAddress,
    els.quoteDate,
    els.deliveryDate,
    els.validityPeriod,
    els.supplierName,
    els.supplierContact,
    els.supplierPhone,
    els.supplierAddress,
    els.paymentMethod,
    els.deliveryMethod,
    els.remarks,
    els.taxRateCustom,
  ].forEach((el) => {
    el.addEventListener("input", () => {
      saveFormState();
      updateTotals();
    });
  });

  els.taxRatePreset.addEventListener("change", () => {
    applyTaxRateUi();
    saveFormState();
    updateTotals();
  });

  els.templateEditor.addEventListener("input", saveTemplate);
}

function loadSeal() {
  const src = localStorage.getItem("quote-generator-seal-v3");
  if (src) {
    els.sealPreview.src = src;
  }
  updateSealPreview();
}

function init() {
  loadTemplate();
  const loaded = loadFormState();
  if (!loaded) {
    els.quoteDate.value = todayISO();
    els.deliveryDate.value = todayISO();
    els.validityPeriod.value = defaults.validityPeriod;
    els.supplierName.value = defaults.supplierName;
    els.supplierContact.value = defaults.supplierContact;
    els.supplierPhone.value = defaults.supplierPhone;
    els.supplierAddress.value = defaults.supplierAddress;
    els.paymentMethod.value = defaults.paymentMethod;
    els.deliveryMethod.value = defaults.deliveryMethod;
    els.taxRatePreset.value = "0.13";
    els.taxRateCustom.value = "13";
    els.itemsBody.appendChild(createRow({ quantity: 1, unit: "个", unitPrice: 0 }));
  }

  attachFormListeners();
  applyTaxRateUi();
  loadSeal();
  updateTotals();
  renderQuote();
}

els.addRowBtn.addEventListener("click", () => {
  els.itemsBody.appendChild(createRow());
  saveFormState();
});

els.generateBtn.addEventListener("click", renderQuote);

els.printBtn.addEventListener("click", () => {
  renderQuote();
  window.print();
});

els.restoreTemplateBtn.addEventListener("click", () => {
  els.templateEditor.value = defaultTemplate;
  saveTemplate();
  renderQuote();
});

els.saveTemplateBtn.addEventListener("click", () => {
  saveTemplate();
  renderQuote();
});

els.templateFile.addEventListener("change", async () => {
  const file = els.templateFile.files?.[0];
  if (!file) return;
  const text = await file.text();
  els.templateEditor.value = text;
  saveTemplate();
  renderQuote();
});

els.sealFile.addEventListener("change", async () => {
  const file = els.sealFile.files?.[0];
  if (!file) return;
  if (file.type !== "image/png") {
    alert("请上传 PNG 格式的印章图片。");
    els.sealFile.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem("quote-generator-seal-v3", String(reader.result || ""));
    updateSealPreview();
    renderQuote();
  };
  reader.readAsDataURL(file);
});

els.clearSealBtn.addEventListener("click", () => {
  localStorage.removeItem("quote-generator-seal-v3");
  els.sealFile.value = "";
  updateSealPreview();
  renderQuote();
});

init();
