import React from 'react'
import ReactDOM from 'react-dom'
// 一个提示工具，动画效果基于animate.min.js
type ANIType = "" | "warning" | "error" | "success" | "info" | "normal";
type ANIItem = [string, string];
interface DOptions {
  html?: string;
  timer?: number;
  curAni?: ANIItem;
  toBox?: HTMLElement;
  type?: ANIType;
}
class NGUIToast {
  aniArr: ANIItem[];
  typeArr: ANIType[];
  defAni: ANIItem;
  hasAni: boolean;
  defOption: DOptions;
  constructor(defOption?: DOptions) {
    // 给定的animate.css的动画对应，一个是出一个是入
    this.aniArr = [
      ["bounceIn", "bounceOut"],
      ["fadeIn", "fadeOut"],
      ["fadeInDown", "fadeOutDown"],
      ["fadeInLeft", "fadeOutLeft"],
      ["fadeInRight", "fadeOutRight"],
      ["fadeInUp", "fadeOutUp"],
      ["flipInX", "flipOutX"],
      ["flipInY", "flipOutY"],
      ["lightSpeedIn", "lightSpeedOut"],
      ["rotateInDownLeft", "rotateOutDownLeft"],
      ["rotateInDownRight", "rotateOutDownRight"],
      ["rotateInUpLeft", "rotateOutUpLeft"],
      ["rotateInUpRight", "rotateOutUpRight"],
      ["zoomIn", "zoomOut"],
      ["zoomInDown", "zoomOutDown"],
      ["zoomInLeft", "zoomOutLeft"],
      ["zoomInRight", "zoomOutRight"],
      ["zoomInUp", "zoomOutUp"],
      ["rollIn", "rollOut"],
    ];
    this.typeArr = ["warning", "error", "success", "info", "normal"];
    // this.defAni = this.randomAni();
    this.defAni = ["fadeInUp", "fadeOutUp"];
    this.hasAni = "animation" in document.body.style;
    this.defOption = {
      html: "啥也没有",
      timer: 3000,
      curAni: this.defAni,
      toBox: document.body,
      type: "", // 'warning' 'error' 'success' 'info'，样式
    };
    Object.assign(this.defOption, defOption || {});
  }
  randomArrItem(arr: any[]) {
    let max = arr.length - 1;
    let min = 0;
    return arr[Math.floor(Math.random() * (max - min + 1) + min)];
  }
  randomAni() {
    // 随机选择一个动画
    return this.randomArrItem(this.aniArr);
  }
  randomType() {
    return this.randomArrItem(this.typeArr);
  }
  open(option: DOptions | string = {}) {
    if (typeof option === "string") {
      // 直接默认显示字符
      option = { html: option };
    }
    option = Object.assign({}, this.defOption, option);
    let outIndex: any;
    let div = document.createElement("div");

    let toBox =
      typeof option.toBox === "string"
        ? document.querySelector(option.toBox)
        : option.toBox;
    let curAni = option.curAni; // 可以自定义动画
    let timer = option.timer; // 消失的时间
    let html = option.html; // 显示的内容，可以是html
    let type = option.type; // 类型显示不同的颜色'warning' 'error' 'success' 'info'，也可以当成类名添加
    let hasAni = this.hasAni;
    if (type) {
      div.classList.add(type);
    }
    div.innerHTML = html;
    if (this.hasAni) {
      // 支持动画
      div.classList.add(curAni[0], "animated", "ngui-show", "ngui-toast");
      div.addEventListener("click", () => {
        clearTimeout(outIndex);
        div.classList.remove(curAni[0], curAni[1], "animated", "ngui-show");
        div.classList.add(curAni[1], "animated");
      });
      div.addEventListener("animationend", animationend);
    } else {
      // 不支持动画
      div.classList.add("ngui-toast");
      div.addEventListener("click", () => {
        clearTimeout(outIndex);
        toBox.removeChild(div);
      });
      timerBind();
    }
    div.addEventListener("mouseenter", () => {
      // 悬浮清除计时
      clearTimeout(outIndex);
    });
    div.addEventListener("mouseleave", () => {
      // 离开绑定计时
      timerBind();
    });
    toBox.appendChild(div);
    (div as any).nguiToastOption = option;
    function animationend() {
      if (div.classList.contains("ngui-show")) {
        timerBind();
      } else {
        toBox.removeChild(div);
      }
    }
    function timerBind() {
      // 延迟绑定
      outIndex = setTimeout(() => {
        if (hasAni) {
          div.classList.remove(curAni[0], curAni[1], "animated", "ngui-show");
          div.classList.add(curAni[1], "animated");
        } else {
          toBox.removeChild(div);
        }
      }, timer);
    }
    return div;
  }
}

let toast = function (options: any) {
  const defaultNGUIToastCls = new NGUIToast();
  toast = function (options) {
    if (!options) {
      return toast;
    }
    if ( React.isValidElement(options) ) {
      let rel = options;
      options = {html: '_'};
      options.rel = rel;
    } else if ( React.isValidElement(options.html) ) {
      let rel = options.html;
      options.html = '_'
      options.rel = rel;
    }
    let div = defaultNGUIToastCls.open(options);
    if ( options.rel ) {
      ReactDOM.render(options.rel, div)
    }
  };
  toast(options);
};
export { toast, NGUIToast };
