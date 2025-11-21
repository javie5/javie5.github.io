document.head.querySelector(
  "style"
).innerHTML = `.w-e-bar-item-group .w-e-bar-item-menus-container{margin-top:32px}.w-e-text-placeholder{top:5px}.w-e-text-container [data-slate-editor] {border-top: unset;position:absolute;top:0;bottom:0;left:0;right:0}.w-e-bar-item{padding:0;height:32px;button{padding:4px;min-width:24px}}*{box-sizing:border-box}.w-e-bar{padding:0}.w-e-bar-divider{margin:8px 0;height:16px}.w-e-text-container [data-slate-editor] h1,.w-e-text-container [data-slate-editor] h2,.w-e-text-container [data-slate-editor] h3,.w-e-text-container [data-slate-editor] h4,.w-e-text-container [data-slate-editor] h5,.w-e-text-container [data-slate-editor] p{margin:5px 0}.w-e-text-container{h1{font-size:1.4rem}h2{font-size:1.3rem}h3{font-size:1.2rem}h4{font-size:1.1rem}h5{font-size:1rem}*{scroll-behavior:smooth}}.read-only{#editor-toolbar,.doc-history,.nav{display:none}}:root{--we-border-color:#dddddd;--we-padding-width:5px}.doc{display:flex;margin:0;position:absolute;top:0;bottom:0;left:0;right:0}.click{cursor:pointer;padding:2px 0;white-space:nowrap;text-overflow:ellipsis}input,textarea,button{outline:none;border:1px solid var(--we-border-color);border-radius:3px;padding:3px 8px;line-height:1.15;font-size:inherit}button{cursor:pointer}.doc-store{display:flex;flex-direction:column;resize:horizontal;overflow:hidden;min-width:13rem;max-width:30rem;width:18rem;border-right:1px solid var(--we-border-color);border-top:1px solid var(--we-border-color);fieldset{border-color:var(--we-border-color);border-width:1px;border-bottom:0;border-left:0;border-right:0;overflow:auto;min-width:unset;padding:0 8px;margin:0;margin-bottom:5px}legend{font-size:0.9em;opacity:0.6;border-color:var(--we-border-color)}a{overflow:hidden;white-space:nowrap;max-width:100%;display:block;text-overflow:ellipsis;padding:4px 0}.doc-achor{overflow:auto;padding:0 8px;a.H2{padding-left:calc(var(--we-padding-width) * 1)}a.H3{padding-left:calc(var(--we-padding-width) * 2)}a.H4{padding-left:calc(var(--we-padding-width) * 3)}a.H5{padding-left:calc(var(--we-padding-width) * 4)}}.doc-history{flex-shrink:0}}.doc-container{flex-grow:1;overflow:hidden;display:flex;flex-direction:column}.nav{padding:var(--we-padding-width)}.nav,#editor-toolbar{flex-shrink:0;border-top:1px solid var(--we-border-color)}#editor-text-area{border-top:1px solid var(--we-border-color);flex-grow:1;overflow:auto}@media screen and (max-width:600px){.doc{flex-direction:column-reverse}.doc-store{flex-direction:row;max-width:unset;width:unset;max-height:16rem}.doc-achor{flex-grow:1}}`;
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
  document.querySelector(`.nav .filename`).value = decodeURI(location.pathname.substring(location.pathname.lastIndexOf("/") + 1));
  document.querySelector(`title`).innerText = document.querySelector(`.nav .filename`).value;
  document.querySelector(".doc-container").addEventListener("click", (e) => {
    //点击元素事件触发元素是id为w-e-textarea-1的元素,且没换行,添加换行
    // console.log(e.target, document.querySelector("#w-e-textarea-1"), !we.getHtml().endsWith("<p><br></p>"));
    if (e.target === document.querySelector("#w-e-textarea-1") && !we.getHtml().endsWith("<p><br></p>")) {
      we.setHtml(we.getHtml() + "<p><br></p>");//we.insertBreak();
    }
  });
  docStore();
};

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
 * 切换整页只读模式
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
  objectStore(callback) {
    const request = indexedDB.open("ax-docs", 1.0);
    request.onsuccess = (event) => {
      var db = event.target.result;
      // console.log("[indexedDB onsuccess]");
      const transaction = db.transaction(["docs"], "readwrite");
      const store = transaction.objectStore("docs");
      store.onsuccess = (event) => {
        // console.log("[数据保存 onsuccess]");
      };
      store.onerror = (event) => {
        console.log("[数据保存 onerror]");
      };
      let id = decodeURI(`${location.origin}${location.pathname}`);
      var getRequest = store.get(id); // key 是你要检索的对象的键
      getRequest.onsuccess = () => callback(store, { id, ...getRequest.result });
    };
    request.onerror = (event) => {
      alert(`数据库打开失败: ${event.target.error}`);
    };
    request.onupgradeneeded = (event) => {
      // console.log("[indexedDB onupgradeneeded]");
      var db = event.target.result;
      var store = db.createObjectStore("docs", {
        keyPath: "id",
        autoIncrement: true
      });
    };
  },
  save(doc, callback) {
    if (!doc || !doc.trim()) {
      return;
    }
    this.objectStore((store, result) => {
      var history = result?.history;
      !Array.isArray(history) && (history = []);
      if (!history.find((item) => item.doc == doc)) {
        var max = 5;
        history.length >= max && history.splice(max - 1); // 清除久远数据
        history.unshift({ doc: doc, time: Date.now() }); // 添加新的记录
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
  db.objectStore((store, result = {}) => {
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
function docStore() {
  let el = document.querySelector(".doc-history");
  if (!el) {
    return;
  }
  el.innerHTML = ``;
  db.objectStore((store, result = {}) => {
    if (!result.doc || we.isDisabled()) {
      return;
    }
    var htm = ``;
    for (const his of result.history) {
      if (!his) {
        continue;
      }
      let time = new Date(his.time).toLocaleString();
      htm += `<a class=click  onclick="useHistory(${his.time})" title='${time}'>${time}</a>`;
    }
    // let time = new Date(result.time).toLocaleString();
    // <a class=click  onclick="useHistory()" title='${time}(最近)'>${time}<sapn style='font-size: 0.9em; opacity: 0.6;'>(最近)</sapn></a>
    document.querySelector(".doc-history").innerHTML = `
      <fieldset>
        <legend onclick="docStore()">缓存记录</legend>
        ${htm}
      </fieldset>
      `;
  });
}
window.addEventListener(
  "beforeunload",
  (event) => {
    event.preventDefault();
    saveDoc();
  },
  false
);
function saveDoc() {
  if (we.isDisabled() || we.isEmpty() || document.querySelector("#doc").innerHTML == we.getHtml()) {
    return;
  }
  db.save(we.getHtml(), docStore);
}

function exportDoc() {
  let html = `
<!DOCTYPE html>
<html>
<head>
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
  </div>
  <div class="doc-container">
    <div class="nav">
       <button onclick="saveDoc()">保存</button> <input class='filename' placeholder="文件名"> <button onclick="exportDoc()">导出</button>
    </div>
    <div id="editor-toolbar"></div>
    <div id="editor-text-area"></div>
  </div>
</body>
<script id="doc" type="text/template">${we.getHtml()}</script>
<script src="https://javie5.github.io/wangEditor/index.js"></script>
</html>
`;
  let name = document.querySelector(`.nav .filename`).value || "index.html";
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
