// eventType 事件名称， eventKey 事件名称空间， eventFn 事件绑定的函数，
// mode 事件绑定的模式, on 正常监听 once 只执行一次的监听
// mode ronce 只能绑定一个函数的监听， eventKey下数组只能有一个绑定函数后面的会覆盖前面的
// data结构 {eventType: {eventKey: [ { eventFn, mode } ]}}
/**
 * let xlEventCls = new XLEvents();
 * // 一下a为事件名称，b为命名空间
 * // 会触发a事件名称下的所有命名空间
 * xlEventCls.emit('a', 1, 2);
 * // 支付触发a事件名下的b命名空间
 * xlEventCls.emit('a.b', 1, 2);
 * // 普通监听，执行一次会多出一个函数监听
 * xlEventCls.on('a.b',()=>{});
 * xlEventCls.on('a.b',()=>{}, 'on');
 * // 只会触发一次的监听，触发一次后会删除监听
 * // 同一事件名称中的同一个命名空间可以有多个once的类型
 * xlEventCls.once('a.b',()=>{});
 * xlEventCls.on('a.b',()=>{}, 'once');
 * // 防止重复监听
 * // 和普通的差不多，只是在同一个事件名称下的同一个命名空间只会触发最后一次的监听函数
 * // 为了防止重复监听带来的副作用
 * xlEventCls.ronce('a.b',()=>{});
 * xlEventCls.on('a.b',()=>{}, 'ronce');
 * // 监听时也可以不加命名空间，会默认给命名空间 $xl_default_ll，事件名称也是一样默认 $xl_default_ll
 * // 所以请不要给出和 $xl_default_ll 一样的命名，否则可能会出现BUG
 */
type Mode = "on" | "once" | "ronce";
interface XLEItem {
  eventFn: Function;
  mode: Mode;
}
interface XLEData {
  [eventType: string]: {
    [eventKey: string]: XLEItem[];
  };
}
class XLEvents {
  data: XLEData;
  modeArr: string[];
  dkey: string;
  constructor() {
    // 数据函数存储
    this.data = {};
    // 可用的事件监听模式
    this.modeArr = ["on", "once", "ronce"];
    // 如果碰巧名称一样，那抱歉了，bug
    this.dkey = "$xl_default_ll";
  }
  formatType(type: string, isd?: boolean) {
    let arr = type.split(".");
    let eventType = arr[0] || this.dkey; // 事件名称
    // 触发和删除时无需给默认值，会触发所有的命名空间
    // 监听时需要给默认值，以便于辨识
    let eventKey = arr[1] ? arr[1] : isd ? this.dkey : ''; // 事件命名空间
  
    // 事件属性下的所有命名空间对象，是个对象
    let tItem = this.data[eventType] ? { ...this.data[eventType] } : {};
    // 单个命名空间对象数据，是个数组XLEItem[]
    let kItem = tItem[eventKey] ? [...tItem[eventKey]] : [];
    return { eventType, eventKey, tItem, kItem };
  }
  // 监听时如果没有事件名称或命名空间，都会给默认值
  on(type: any, eventFn: Function, mode: Mode = "on") {
    let { eventType, eventKey, tItem, kItem } = this.formatType(type, true);
    if (!this.modeArr.includes(mode)) {
      mode = "on";
    }
    if (
      typeof eventFn === "function" &&
      !kItem.some((item) => item.eventFn === eventFn)
    ) {
      let eItem: XLEItem = { eventFn, mode };
      // 只会监听一个函数，后面的函数监听会覆盖前面的
      // 同一个命名空间只能有一个 'ronce' 的属性
      // 但是可以同时存在多个其他类型的监听
      if (mode === "ronce") {
        kItem = kItem.filter((o) => o.mode !== "ronce");
      }
      kItem.push(eItem);
    }
    tItem[eventKey] = kItem;
    this.data[eventType] = tItem;
    return this;
  }
  ronce(type: any, eventFn: any) {
    return this.on(type, eventFn, "ronce");
  }
  once(type: any, eventFn: any) {
    return this.on(type, eventFn, "once");
  }
  emitKItem(kItem: any[], args: any[]) {
    kItem = kItem.filter((eItem: { eventFn: any; mode: string }) => {
      let fn = eItem.eventFn;
      try {
        fn(...args);
      } catch (error) {
        console.log(error);
        return false;
      }
      // 只监听一次的，之后会直接删除
      if (eItem.mode === "once") {
        return false;
      }
      return true;
    });
    return kItem;
  }

  // 触发时，如果没有命名空间
  // 会触发此事件下所有的事件绑定
  emit(type: any, ...args: any[]) {
    let { eventType, eventKey, tItem, kItem } = this.formatType(type);
    // 触发此事件下所有的事件绑定
    if (!eventKey) {
      for (let k in tItem) {
        if (tItem[k] && tItem[k].length) {
          tItem[k] = this.emitKItem(tItem[k], args);
        }
      }
      this.data[eventType] = tItem;
      return this;
    }
    if (kItem && kItem.length) {
      kItem = this.emitKItem(kItem, args);
      tItem[eventKey] = kItem;
      this.data[eventType] = tItem;
    }
    return this;
  }

  // 解除绑定时， 如果没有命名空间
  // 则清空此事件下所有的监听
  off(type: any, eventFn?: Function) {
    let { eventType, eventKey, tItem, kItem } = this.formatType(type);
    // 清空此事件下所有的事件绑定
    if (!eventKey) {
      this.data[eventType] = {};
      return this;
    }
    if (kItem && kItem.length) {
      if (typeof eventFn === "function") {
        // 删掉单个监听
        kItem = kItem.filter((item) => item.eventFn !== eventFn);
      } else {
        // 删除整个组的
        kItem = [];
      }
      tItem[eventKey] = kItem;
      this.data[eventType] = tItem;
    }
    return this;
  }
}
export { XLEvents };
