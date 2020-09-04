/**
 * 全球化翻译
 * 根据组件进行引入翻译
 * 这里写的是一些全局方便使用的
 * 全局的请在前缀加上global
 */
import a_zh_cn from "antd/es/locale/zh_CN";
import a_en_us from "antd/es/locale/en_US";
const en_us = {
  "global.service": "{en_us}",
  "global.search": "Enter a search……",
  "global.edit": "Edit",
  "global.delete": "Delete",
  "global.save": "Save",
  "global.cancel": "Cancel",
  "global.ok": "Ok",
  "global.choose": "Please Choose……",
};
const zh_cn = {
  "global.service": "{zh_cn}",
  "global.edit": "编辑",
  "global.search": "输入搜索……",
  "global.delete": "删除",
  "global.save": "保存",
  "global.cancel": "取消",
  "global.ok": "确定",
  "global.choose": "请选择……",
};

// 语言 全球化
class ReactLang {
  lang: string;
  antdLocale: any;
  oriSetLang: Function;
  constructor() {
    this.lang = this.getNgLang();
    this["zh-CN"] = zh_cn;
    this["en-US"] = en_us;
    this.antdLocale = {
      "zh-CN": a_zh_cn,
      "en-US": a_en_us,
    };
    // 用于后面的赋值，state向外暴露
    // 请看组件 ReactToNg
    this.oriSetLang = null;
  }
  addLangData({ zh_cn, en_us }) {
    this["zh-CN"] = Object.assign(this["zh-CN"], zh_cn || {});
    this["en-US"] = Object.assign(this["en-US"], en_us || {});
  }
  toggle() {
    let lang = this.lang === "zh-CN" ? "en-US" : "zh-CN";
    this.setLang(lang)
  }
  setLang(lang?: string) {
    lang = lang || this.getNgLang();
    this.lang = lang;
    localStorage.setItem("language", lang)
    this.oriSetLang(lang);
  }
  // react angular 语言关键字对照
  rcNgLangeKV() {
    return {
      "zh-cn": "zh-CN",
      "en-us": "en-US",
    };
  }
  getNgLang() {
    let obj = this.rcNgLangeKV();
    let lang = localStorage.getItem("language") || "zh-CN";
    return obj[lang] || "zh-CN"; // 默认zh-CN
  }
}
let reactLangCls = new ReactLang();
export { reactLangCls };
