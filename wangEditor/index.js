const style = `.w-e-bar-item-group .w-e-bar-item-menus-container{margin-top:32px}.w-e-text-placeholder{top:5px}.w-e-text-container [data-slate-editor] {border-top: unset;position:absolute;top:0;bottom:0;left:0;right:0}.w-e-bar-item{padding:0;height:32px;button{padding:4px;min-width:24px}}*{box-sizing:border-box}.w-e-bar{padding:0}.w-e-bar-divider{margin:8px 0;height:16px}.w-e-text-container [data-slate-editor] h1,.w-e-text-container [data-slate-editor] h2,.w-e-text-container [data-slate-editor] h3,.w-e-text-container [data-slate-editor] h4,.w-e-text-container [data-slate-editor] h5,.w-e-text-container [data-slate-editor] p{margin:5px 0}.w-e-text-container{h1{font-size:1.4rem}h2{font-size:1.3rem}h3{font-size:1.2rem}h4{font-size:1.1rem}h5{font-size:1rem}*{scroll-behavior:smooth}}.read-only{#editor-toolbar,.doc-history,.nav{display:none}}:root{--we-border-color:#dddddd;--we-padding-width:5px}.doc{display:flex;margin:0;position:absolute;top:0;bottom:0;left:0;right:0}.click{cursor:pointer;padding:2px 0;white-space:nowrap;text-overflow:ellipsis}input,textarea,button{outline:none;border:1px solid var(--we-border-color);border-radius:3px;padding:3px 8px;line-height:1.15;font-size:inherit}button{cursor:pointer}.doc-store{display:flex;flex-direction:column;resize:horizontal;overflow:hidden;min-width:13rem;max-width:30rem;width:18rem;border-right:1px solid var(--we-border-color);border-top:1px solid var(--we-border-color);fieldset{border-color:var(--we-border-color);border-width:1px;border-bottom:0;border-left:0;border-right:0;overflow:auto;min-width:unset;padding:0 8px;margin:0;margin-bottom:5px}legend{font-size:0.9em;opacity:0.6;border-color:var(--we-border-color)}a{overflow:hidden;white-space:nowrap;max-width:100%;display:block;text-overflow:ellipsis;padding:4px 0}
.doc-achor{flex-shrink: 1;max-height:50vh;overflow:auto;padding:0 8px;a.H2{padding-left:calc(var(--we-padding-width) * 1)}a.H3{padding-left:calc(var(--we-padding-width) * 2)}a.H4{padding-left:calc(var(--we-padding-width) * 3)}a.H5{padding-left:calc(var(--we-padding-width) * 4)}}
.doc-history,.doc-list{max-height:50vh;overflow: auto;flex-shrink: 1;}}.doc-container{flex-grow:1;overflow:hidden;display:flex;flex-direction:column}
.row{display: flex; align-items: center;span{cursor: pointer;margin-right:5px;flex-shrink: 0;}}
.nav{padding:var(--we-padding-width)}.nav,#editor-toolbar{flex-shrink:0;border-top:1px solid var(--we-border-color)}#editor-text-area{border-top:1px solid var(--we-border-color);flex-grow:1;overflow:auto}@media screen and (max-width:600px){.doc{flex-direction:column-reverse}.doc-store{flex-direction:row;max-width:unset;width:unset;max-height:16rem}.doc-achor{flex-grow:1}}`;
document.head.querySelector("style").innerHTML = style;
window.onload = function () {
  var E = window.wangEditor;
  var LANG = location.href.indexOf("lang=en") > 0 ? "en" : "zh-CN"; // 切换语言
  E.i18nChangeLanguage(LANG);
  window.we = E.createEditor({
    selector: "#editor-text-area",
    html: document.querySelector("#doc").innerHTML,
    config: {
      placeholder: "开始编辑...",
      MENU_CONF: {
        uploadImage: {
          fieldName: "上传图片",
          base64LimitSize: 10 * 1024 * 1024 // 10M 以下插入 base64
        }
      },
      timer: null,
      onChange(editor) {
        docAnchor(); //文档导航
        if (!editor.getHtml().endsWith("<p><br></p>")) {
          clearTimeout(this.timer);
          // this.timer = setTimeout(() => editor.insertBreak(), 100);
        }
      }
    }
  });

  window.toolbar = E.createToolbar({
    editor: we,
    selector: "#editor-toolbar",
    config: { excludeKeys: ["lineHeight"] }
  });
  let name = location.search.replace("?", "") || location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
  document.querySelector(`.nav .filename`).value = decodeURI(name);
  document.querySelector(`title`).innerText = document.querySelector(`.nav .filename`).value;
  document.querySelector(".doc-container").addEventListener("click", (e) => {
    //点击元素事件触发元素是id为w-e-textarea-1的元素,且没换行,添加换行
    // console.log(e.target, document.querySelector("#w-e-textarea-1"), we.getHtml());
    if (e.target === document.querySelector("#w-e-textarea-1") && !we.getHtml().endsWith("<p><br></p>")) {
      we.setHtml(we.getHtml() + "<p><br></p>");
    }
  });
  let initDoc = document.querySelector("#doc").innerHTML?.trim();
  we.setHtml(initDoc);
  db.getData((store, result = {}) => {
    let cache = result.doc?.trim();
    let isconfirm = cache; //cache && cache !== initDoc ? confirm("继续上次编辑?") : null;
    isconfirm && we.setHtml(result.doc);
  });
  docHistory();
  getDocs();
};
/**
 * @description 文档导航
 */
function docAnchor() {
  var children = document.querySelector("#w-e-textarea-1").children;
  var htm = "";
  for (const el of children) {
    if (el.tagName.startsWith("H")) {
      htm += `<a class=${el.tagName} href="#${el.getAttribute("id")}" title="${el.innerText}">${el.innerText}</a> `;
    }
  }
  document.querySelector(".doc-achor").innerHTML = htm;
}
/**
 * @description 切换整页只读模式
 * @param {boolean} [status] true 只读|false 可写|不传则取反
 * 仅操作 html.read-only 类与 we 开关
 */
function readOnly(status) {
  var el = document.querySelector("html");
  var key = status != undefined ? (status ? 1 : 0) : el.classList.item("read-only") ? 0 : 1;
  console.log(key);
  switch (key) {
    case 1: {
      el.classList.add("read-only");
      we.disable();
      break;
    }
    default: {
      we.enable();
      el.classList.remove("read-only");
      break;
    }
  }
}
var db = {
  open(callback) {
    let dbName = "ax-docs";
    let tableName = "docs";
    const request = indexedDB.open(dbName, 1.0);
    request.onsuccess = (event) => {
      var db = event.target.result;
      const transaction = db.transaction([tableName], "readwrite");
      const store = transaction.objectStore(tableName);
      store.onerror = (event) => {
        alert(`数据表 ${tableName}  打开失败: ${event.target.error}`);
      };
      callback?.(store);
    };
    request.onerror = (event) => {
      alert(`数据库 ${dbName} 打开失败: ${event.target.error}`);
    };
    request.onupgradeneeded = (event) => {
      var db = event.target.result;
      db.createObjectStore(tableName, { keyPath: "id", autoIncrement: true });
    };
  },
  getList(callback) {
    this.open((store) => {
      let req = store.getAll();
      req.onsuccess = (ev) => callback?.(store, req.result);
    });
  },
  getId() {
    return decodeURI(`${location.origin}${location.pathname}${location.search}`);
  },
  getData(callback) {
    this.open((store) => {
      let id = this.getId();
      var req = store.get(id); // key 是你要检索的对象的键
      req.onsuccess = () => callback(store, { id, ...req.result });
    });
  },
  remove(id, callback) {
    this.open((store) => {
      let req = store.delete(id);
      req.onsuccess = (ev) => callback?.(req.result, store);
    });
  },
  save(doc, callback, msg) {
    if (!doc || !doc.trim()) {
      return;
    }
    this.getData((store, result) => {
      var history = result?.history;
      !Array.isArray(history) && (history = []);
      if (!history.find((item) => item.doc == doc)) {
        var max = 15;
        history.length >= max && history.splice(max - 1); // 清除久远数据
        history.unshift({ doc: doc, time: Date.now(), msg }); // 添加新的记录
      }
      var data = { ...result, doc: doc, time: Date.now(), history: history };
      store.onsuccess = () => {};
      var a = store.put(data);
      a.onsuccess = callback;
      a.onerror = (e) => alert("保存失败" + e.error);
    });
  }
};

function useHistory(time) {
  db.getData((store, result = {}) => {
    let doc = time ? result?.history?.find?.((item) => item.time == time)?.doc : result?.doc;
    if (!doc || we.isDisabled()) {
      return;
    }
    let isconfirm = confirm("替换编辑内容?");
    if (!isconfirm) {
      return;
    }
    we.setHtml(doc);
  });
}

/**
 * @description 获取文档列表
 * @returns
 */
function getDocs() {
  db.getList((store, result = []) => {
    console.log("===", result, store);
    var htm = ``;
    for (const item of result) {
      let id = item.id;
      let time = new Date(item.time).toLocaleString(); //<br/>${time}
      htm += `<div class='row'><span onclick="docRemove('${id}')">删除</span> <a class=click  href="${id}" title='${id}'>${id}</a></div>`;
    }
    // let time = new Date(result.time).toLocaleString();
    // <a class=click  onclick="useHistory()" title='${time}(最近)'>${time}<sapn style='font-size: 0.9em; opacity: 0.6;'>(最近)</sapn></a>
    document.querySelector(".doc-list").innerHTML = `
      <fieldset>
        <legend onclick="docHistory()">文档列表</legend>
        ${htm}
      </fieldset>
      `;
  });
}

/**
 * @description 文档历史记录
 * @returns
 */
function docHistory() {
  let el = document.querySelector(".doc-history");
  if (!el) {
    return;
  }
  el.innerHTML = ``;
  db.getData((store, result = {}) => {
    if (!result.doc || we.isDisabled()) {
      return;
    }
    var htm = ``;
    for (const his of result.history) {
      if (!his) {
        continue;
      }
      let time = new Date(his.time).toLocaleString();
      htm += `<a class=click  onclick="useHistory(${his.time})" title='${time}'>${time}<br/>${his.msg || ""}</a>`;
    }
    // let time = new Date(result.time).toLocaleString();
    // <a class=click  onclick="useHistory()" title='${time}(最近)'>${time}<sapn style='font-size: 0.9em; opacity: 0.6;'>(最近)</sapn></a>
    document.querySelector(".doc-history").innerHTML = `
      <fieldset>
        <legend onclick="docHistory()">缓存记录</legend>
        ${htm}
      </fieldset>
      `;
  });
}
window.addEventListener(
  "beforeunload",
  (event) => {
    // event.preventDefault();
    docSave("自动保存[页面离开]");
  }
  // false
);
function docSave(msg) {
  if (we.isDisabled() || we.isEmpty() || document.querySelector("#doc").innerHTML == we.getHtml()) {
    return;
  }
  db.save(we.getHtml(), docHistory, msg);
}

function docExport() {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=0.75,minimum-scale=0.5,maximum-scale=1" />
  <title>web文档</title>
  <link href="https://unpkg.com/@wangeditor/editor@5.1.23/dist/css/style.css" rel="stylesheet">
  <script src="https://unpkg.com/@wangeditor/editor@5.1.23/dist/index.js"></script>
  <style></style>
</head>
<body class="doc">
  <div class='doc-store'>
    <div class='doc-achor'></div>
    <div class='doc-history'></div>
    <div class='doc-list'></div>
  </div>
  <div class="doc-container">
    <div class="nav">
      <button onclick="docAdd()">添加</button>
      <button onclick="docSave('手动保存')">保存</button> 
      <input class='filename' placeholder="文件名"> 
      <button onclick="docExport()">导出</button>
      <button onclick="exportMarkdown()">导出MD</button>
      <button onclick="importMarkdown()">导入MD</button>
      <button onclick="copyMarkdown()">复制MD</button>
    </div>
    <div id="editor-toolbar"></div>
    <div id="editor-text-area"></div>
    
  </div>
</body>
<script id="doc" type="text/template">${we.getHtml()}</script>
<script src="https://javie5.github.io/wangEditor/index.js"></script>
</html>
<!--
🤖 AI 协作协议

【文档格式说明】
- 本文件是一个自包含的 HTML 文档
- 实际文档内容存储在 <script id="doc" type="text/template"> 标签内
- 文档内容是类似HTML格式的内容;（wangeditor插件实例输出的内容:wangEditor.createEditor().getHtml()）

【AI 任务】
1. 解析 <script id="doc"...> 标签内的内容
2. 理解其中的内容
3. 根据用户对话要求修改内容
4. 用户要求输出文档时保持完整HTML文件结构(依据用户对话上传的html内容格式)
5. 只替换 <script id="doc"...> 标签内的内容，其余不变

【输出要求】
- 返回完整的.html文件,文件名默认保持原名
- 修改的文档内容依然符合wangeditor插件格式要求;通过wangEditor.setHtml()能正常回显
- 如果不能解析出文档内容;输出问题,原因

【文档功能说明(文档编辑场景ai不用调整具体业务逻辑,只用于辅助理解用户诉求)】
- ./lib/index.js:本地开发时的业务代码
- https://javie5.github.io/wangEditor/index.js:部署到github时./lib/index.js对应的文件
- 当前文档业务核心功能在index.js实现;
- index.js内docExport函数已实现了文档导出功能;we为wangEditor插件实例()
  function docExport() {
    let html = \`...省略的文档布局内容
    <script id="doc" type="text/template">\${we.getHtml()}</script>
    <script src="https://javie5.github.io/wangEditor/index.js"></script>
    </html>
    \`;
    let name = document.querySelector(".nav .filename").value || "index.html";
    !name.endsWith(".html") && (name += ".html");
    name = prompt("保存文档", name);
    if (!name) {
      return;
    }
    var url = URL.createObjectURL(new Blob([html]));
    var a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", name);
    a.click();
  }
-->
`;
  let name = document.querySelector(".nav .filename").value || "index.html";
  !name.endsWith(".html") && (name += ".html");
  name = prompt("保存文档", name);
  if (!name) {
    return;
  }
  var url = URL.createObjectURL(new Blob([html]));
  var a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", name);
  a.click();
}
/**
 * @description 添加文档
 */
function docAdd() {
  let name = prompt("添加(打开)文档");
  name && (location.search = name);
}
/**
 * @description 删除文档
 */
function docRemove(id) {
  id = id || db.getId();
  let name = prompt("删除文档", id);
  name &&
    db.remove(id, (result, store) => {
      // console.log("删除文档", result, store);
      getDocs(); //db.getId() == id ? (location.search = "") :
    });
}
// ==================== Markdown 支持（新增） ====================
let turndownSvc = null;

function getTurndown() {
  if (!turndownSvc) {
    turndownSvc = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
      emDelimiter: "*"
    });
    // 自定义表格转换规则（Turndown 默认不支持表格）
    turndownSvc.addRule("table", {
      filter: "table",
      replacement: function (content, node) {
        let md = "\n";
        const rows = node.querySelectorAll("tr");
        rows.forEach((row, rowIdx) => {
          const cells = row.querySelectorAll("th, td");
          const cellContents = Array.from(cells).map((cell) => {
            return cell.innerText.trim().replace(/\|/g, "\\|");
          });
          md += "| " + cellContents.join(" | ") + " |\n";
          if (rowIdx === 0 && cells.length) {
            md += "|" + cellContents.map(() => " --- ").join("|") + "|\n";
          }
        });
        return md + "\n";
      }
    });
  }
  return turndownSvc;
}

/**
 * 将当前编辑器内容转换为 Markdown
 */
function getMarkdownFromEditor() {
  const html = we.getHtml();
  const turndown = getTurndown();
  let md = turndown.turndown(html);
  // 清理多余空行
  md = md.replace(/\n{3,}/g, "\n\n").trim();
  return md;
}

/**
 * 导出为 .md 文件
 */
function exportMarkdown() {
  const md = getMarkdownFromEditor();
  const name = document.querySelector(".nav .filename").value || "document";
  const fileName = name.replace(/\.html?$/i, "") + ".md";
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 导入 .md 文件，转换为 HTML 并加载到编辑器
 */
function importMarkdown() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".md,.markdown,.txt";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const mdContent = ev.target.result;
      if (typeof marked !== "undefined") {
        // marked 配置：支持 GFM 表格、换行等
        marked.setOptions({ breaks: true, gfm: true });
        // marked.parse 返回 Promise (异步)
        const html = marked.parse(mdContent);
        we.setHtml(html);
        docSave("从 Markdown 导入");
        alert("✅ 导入成功");
      } else {
        alert("Markdown 解析库未加载，请刷新页面重试");
      }
    };
    reader.readAsText(file, "UTF-8");
  };
  input.click();
}

/**
 * 复制 Markdown 到剪贴板（方便与 AI 交互）
 */
async function copyMarkdown() {
  const md = getMarkdownFromEditor();
  try {
    await navigator.clipboard.writeText(md);
    alert("✅ 已复制 Markdown 格式内容到剪贴板");
  } catch (err) {
    alert("复制失败，请手动复制");
  }
}
// ==================== 新增：Ctrl+S 保存 + 拖拽打开 .html/.md 文件 ====================

// ========== Ctrl+S 保存 ==========
window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    docSave("快捷键 Ctrl+S");
  }
});

// ========== 拖拽打开文件（支持 .html 和 .md，使用自定义 select 弹窗选择模式） ==========
const dropZone = document.body;
dropZone.addEventListener("dragover", (e) => e.preventDefault());
dropZone.addEventListener("dragleave", (e) => e.preventDefault());
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length === 0) return;
  const file = files[0];
  const fileName = file.name.toLowerCase();

  const isHtml = fileName.endsWith(".html");
  const isMd = fileName.endsWith(".md") || fileName.endsWith(".markdown") || fileName.endsWith(".txt");

  if (!isHtml && !isMd) {
    alert("请拖入 .html 或文本类型文件(.md,.txt等类型)");
    return;
  }

  // 动态生成选择模式的自定义弹框
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
    z-index: 10000;
  `;
  const panel = document.createElement("div");
  panel.style.cssText = `
    background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    min-width: 260px; text-align: center; font-family: system-ui, sans-serif;
  `;
  panel.innerHTML = `
    <div style="margin-bottom: 16px; font-weight: bold;">选择导入模式</div>
    <select id="import-mode-select" style="width: 100%; padding: 8px; margin-bottom: 20px; border-radius: 4px; border: 1px solid #ccc;">
      <option value="overwrite">覆盖当前内容</option>
      <option value="append">追加到当前内容末尾</option>
    </select>
    <div>
      <button id="import-confirm-btn" style="margin-right: 12px; padding: 6px 16px; cursor: pointer;">确认</button>
      <button id="import-cancel-btn" style="padding: 6px 16px; cursor: pointer;">取消</button>
    </div>
  `;
  modal.appendChild(panel);
  document.body.appendChild(modal);

  // 清理弹框的函数
  const closeModal = () => modal.remove();

  // 确认按钮逻辑
  const confirmBtn = panel.querySelector("#import-confirm-btn");
  const cancelBtn = panel.querySelector("#import-cancel-btn");
  const modeSelect = panel.querySelector("#import-mode-select");

  const handleConfirm = () => {
    const mode = modeSelect.value; // 'overwrite' 或 'append'
    const isOverwrite = mode === "overwrite";
    closeModal();

    // 读取文件并处理
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      const processContent = (newHtml) => {
        const currentHtml = window.we.getHtml();
        let finalHtml;
        if (isOverwrite) {
          finalHtml = newHtml;
        } else {
          // 追加：确保原内容末尾有换行分隔
          const separator = currentHtml.trim().endsWith("<p><br></p>") ? "" : "<p><br></p>";
          finalHtml = currentHtml + separator + newHtml;
        }
        window.we.setHtml(finalHtml);
        const docScript = document.getElementById("doc");
        if (docScript) docScript.innerHTML = finalHtml;
        if (typeof docSave === "function") docSave(`拖拽导入 (${isOverwrite ? "覆盖" : "追加"})`);
        alert(`✅ 已${isOverwrite ? "覆盖" : "追加"}文档：${file.name}`);
      };

      if (isHtml) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");
        const templateScript = doc.querySelector('script[id="doc"][type="text/template"]');
        let newHtml = "";
        if (templateScript && templateScript.innerHTML) {
          newHtml = templateScript.innerHTML;
        } else {
          newHtml = doc.body ? doc.body.innerHTML : "<p>无法解析文档内容</p>";
        }
        processContent(newHtml);
      } else if (isMd) {
        if (typeof marked === "undefined") {
          alert("Markdown 解析库未加载，请刷新页面重试");
          return;
        }
        marked.setOptions({ breaks: true, gfm: true });
        let html = marked.parse(content);
        processContent(html);
      }
    };
    reader.onerror = () => alert("读取文件失败");
    reader.readAsText(file, "UTF-8");
  };

  confirmBtn.addEventListener("click", handleConfirm);
  cancelBtn.addEventListener("click", closeModal);
  // 点击遮罩层也可关闭
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
});
