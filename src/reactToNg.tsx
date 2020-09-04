// react angular 的各种兼容转接，通讯，预处理等在这里
// 也可以称之为react 的入口文件
import React, { useState, Component } from "react";
import ReactDOM from "react-dom";
import { notification, Alert, ConfigProvider } from "antd";
import { IntlProvider } from "react-intl";
import { reactLangCls } from "src/intl";
import "antd/dist/antd.min.css";

interface ELItem {
  el: Element; // 自定挂载的dom元素，可以是一个查询字符串
  props: object; // 组件的参数props
  component: React.ReactElement; // react 组件
  id: number | string; // 唯一ID，可以是用户提供，如有重复，后面会覆盖前面
}
interface ADDProps {
  component?: React.ReactElement; // react 组件
  props?: object; // 组件参数
  el?: Element | string; // 自定挂载的dom元素，可以是一个查询字符串
  hard?: boolean;
  id?: number | string;
}
class ReactEl {
  els: ELItem[];
  id: number;
  oriGetEls: Function;
  oriSetEls: Function;
  onChange: Function;
  constructor() {
    this.els = []; // 所有react 元素
    this.id = 0; // 自增els的id
    // 用于后面的赋值，state向外暴露
    // 请看组件 ReactToNg
    this.oriGetEls = null;
    this.oriSetEls = null;
  }
  // 获取当前的元素组
  getEls() {
    return [...this.els];
  }
  // 设置新的元素组
  setEls(els) {
    this.els = els;
    this.oriSetEls(els);
    return this;
  }
  emitChange() {
    if (this.onChange) {
      this.onChange();
    }
    return this;
  }
  // 向react根元素中添加新的react元素
  // hard 是否强制更新会先卸载原有的（如果有）；
  add({ component, props = {}, el, hard, id = this.id++ }: ADDProps) {
    el = typeof el === "string" ? document.querySelector(el) : el;
    el = el || document.createElement("div");
    let els = [...this.els];
    // 以 el 或者 id 判断是否为同一次挂载
    let item: ELItem = els.find((item) => item.id === id || item.el === el);
    if (item) {
      if (item.el !== el) {
        ReactDOM.unmountComponentAtNode(item.el as Element);
        if (item.el.parentNode) {
          item.el.parentNode.removeChild(item.el);
        }
      } else if (hard === true) {
        // 强制更新，先卸载
        ReactDOM.unmountComponentAtNode(el);
      }
      Object.assign(item, { el, props, id, component });
    } else {
      item = { el, props, component, id };
      els.push(item);
    }
    this.emitChange();
    this.setEls(els);
    return item;
  }
  // 删除react 元素组中元素
  remove({ component, id, el }: ELItem) {
    let els = [...this.els];
    els = els.filter(
      (item) => item.component === component || item.id === id || item.el === el
    );
    if (els.length !== this.els.length) {
      this.emitChange();
      this.setEls(els);
    }
    return this;
  }
}
const reactElCls = new ReactEl();

// 初始化一个react根元素到dom
function reactToNgInit() {
  let box = document.querySelector(".body_to_div");
  if (!box) {
    box = document.createElement("div");
    box.className = "body_to_div";
    document.body.appendChild(box);
  }
  let el: HTMLElement = document.querySelector(".react_ng_el");
  if (el) {
    return false;
  }
  el = document.createElement("div");
  el.className = "react_ng_el";
  el.style.cssText = `width: 0; height: 0; overflow: hidden;`;
  ReactDOM.render(<ReactToNg />, el);
  box.appendChild(el);
}

// react根元素 后面所有的react元素都基于这个根目录
// 但因为是嵌入到angular项目中，所以所有的后入react元素都是通过ReactDOM.createPortal外部渲染
// els : [{id, el, props, component}]
function ReactToNg() {
  let [els, setEls] = useState([]);
  let [lang, setLang] = useState(reactLangCls.lang);
  reactLangCls.oriSetLang = setLang;
  reactElCls.oriGetEls = () => [...els];
  reactElCls.oriSetEls = setEls;
  return (
    <ConfigProvider locale={reactLangCls.antdLocale[lang]}>
      <IntlProvider locale={lang} messages={reactLangCls[lang]}>
        {els.map((item) => {
          return <PortalCom key={item.id} {...item} />;
        })}
      </IntlProvider>
    </ConfigProvider>
  );
}

// react 外部渲染组件，加入了错误边界
class PortalCom extends Component<any, any> {
  loading: boolean; // 是否处于等待中
  num: number; // 用于方便计算间隔时间
  restartNum: number; // 重新渲染的间隔时间 毫秒
  noRenderNum: number; // 间隔多久出现下一次错误，会视为不可继续渲染 毫秒
  errorNum: number; // 出现错误的次数
  errorMax: number; // 允许错误上线
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMsg: "",
    };
    this.loading = false;
    this.num = 0;
    this.restartNum = 1000;
    this.noRenderNum = 1000;
    this.errorNum = 0;
    this.errorMax = 5;
  }
  static getDerivedStateFromError() {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    this.onErrorFn(error, errorInfo);
  }
  onErrorFn(error?: any, errorInfo?: any) {
    if (this.errorNum > this.errorMax) {
      this.setState({
        errorMsg: "次数太多，不再重新渲染",
      });
      notification.error({
        message: "错误捕获",
        description: "出现不可预知错误次数太多，不再重新渲染",
      });
      return;
    }
    let cnum = +new Date();
    if (cnum - this.num < this.noRenderNum) {
      this.setState({
        errorMsg: "频率太高，不再重新渲染",
      });
      notification.error({
        message: "错误捕获",
        description: "出现不可预知错误频率太高，不再重新渲染",
      });
      return;
    }
    if (!this.loading) {
      this.loading = true;
      // 你同样可以将错误日志上报给服务器
      console.log(error, errorInfo);
      this.setState({
        errorMsg: "错误边界",
      });
      notification.error({
        message: "错误捕获",
        description: "出现不可预知错误，请通知管理员",
      });
      setTimeout(() => {
        this.setState({
          hasError: false,
        });
        this.loading = false;
        this.num = +new Date();
        this.errorNum += 1;
      }, this.restartNum);
    }
  }
  render() {
    let errorEl = this.props.el || document.createElement("div");
    if (this.state.hasError) {
      return ReactDOM.createPortal(
        <Alert
          message={this.state.errorMsg || "错误边界发生"}
          type="error"
          showIcon
        />,
        errorEl
      );
    }
    let { props, el, component: Com } = this.props as any;
    return ReactDOM.createPortal(<Com {...props} />, el);
  }
}

export { reactToNgInit, reactElCls };
