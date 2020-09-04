/**
 * antd Select的组件封装，
 * 方便项目内使用
 */
import React, { Component } from "react";
import { Select, Tag, Spin } from "antd";
import { FormattedMessage } from "react-intl";

let propsKeys = [
  "oriItems", // 原始选择项
  "selectItems", // 选中条目
  "defaultValue", // 默认选中项
  "k", // 对比两个条目相等的字段名 String
  "selectInOri", // 选中项目是否必须存在于原始选中项中
  "multiple", // 是否可以多选 Boolean  false
  "max", // 最多可选 Number
  "min", // 最少要选 Number
  "onChangeBefore", // 数据改变之前 返回false 可以阻止更新，Function
  "onError", // 报错监听 Function
  "onChange", // 改变监听 Function

  "setShowMenuItems", // 设置列表展示的数据 Function
  "menuItemRender", // 单个menu渲染函数 Function
  "onSearch", // 所有返回一个列表数据
  "tagRender", // tag渲染
  "tagItemRender", // 单个tag渲染方法
  "menuRender", // 列表渲染
];
export interface LSProps {
  oriItems?: any[]; // 原始选择项
  selectItems?: any[]; // 选中条目
  defaultValue?: any; // 默认选中项
  k?: string; // 对比两个条目相等的字段名 String
  selectInOri?: boolean; // 选中项目是否必须存在于原始选中项中
  multiple?: boolean; // 是否可以多选 Boolean  false
  max?: number; // 最多可选 Number
  min?: number; // 最少要选 Number
  onChangeBefore?: Function; // 数据改变之前 返回false 可以阻止更新，Function
  onError?: Function; // 报错监听 Function
  onChange?: Function; // 改变监听 Function

  setShowMenuItems?: Function; // 设置列表展示的数据 Function
  menuItemRender?: Function; // 单个menu渲染函数 Function
  onSearch?: Function; // 所有返回一个列表数据
  tagRender?: Function; // tag渲染
  tagItemRender?: Function; // 单个tag渲染方法
  menuRender?: Function; // 列表渲染

  afterClickClose?: boolean; // 选中后是否关闭下拉 Boolean
  children?: any; // 子元素 react el
  triggerTxt?: string | React.ReactElement; // 点击按键的文本，也可以是react el
  selectAll?: boolean; // 是否有全选按键 Function
  menuItemTxtRender?: Function;
  [str: string]: any;
}
export interface DState {
  oriItems?: any[];
  selectItems?: any[];
  loading?: boolean;
  visible?: boolean;
}

export class ListSelect extends Component<LSProps, DState> {
  min: number;
  max: number;
  multiple: boolean;
  selectInOri: boolean;
  allKey: "$xl_all";
  k: string;
  constructor(props: LSProps) {
    super(props);
    let { onSearch, selectInOri, multiple, k } = props;
    this.state = this.initState({ loading: false });
    this.multiple = typeof multiple === "boolean" ? multiple : false;
    let { min, max } = this.initMaxMin();
    this.min = min;
    this.max = max;

    this.selectInOri = onSearch
      ? false
      : typeof selectInOri === "boolean"
      ? selectInOri
      : false;
    this.allKey = "$xl_all";
    this.k = k || "id";
  }
  // 格式化oriItems, selectItems, 加以验证功能
  formatOS({ oriItems, selectItems }: DState) {
    let os = this.getOS();
    selectItems = selectItems || os.selectItems;
    oriItems = oriItems || os.oriItems;
    if (selectItems.some((item) => item[this.k] === this.allKey)) {
      this.toggleAll();
      return null;
    }
    // 不允许重复
    selectItems = this.filterRepeat(selectItems);
    // selectItems 数据必须存在于 oriItems中
    if (this.selectInOri) {
      selectItems = this.filterEvery12(selectItems, oriItems);
    }
    // 选中数据不能少于
    if (this.min > 0) {
      if (selectItems.length < this.min) {
        this.emitError("min_err", {
          txt: `选中的数据量不能小于给定的 min: ${this.min}`,
          items: [...selectItems],
          target: this,
        });
        return null;
      }
    }

    // 选中数据不能大于
    if (this.max > 0) {
      if (selectItems.length > this.max) {
        this.emitError("max_err", {
          txt: `选中的数据量不能小于给定的 max: ${this.max}`,
          items: [...selectItems],
          target: this,
        });
        return null;
      }
    }
    return { oriItems, selectItems };
  }
  // 核心函数 处理数据重置
  resetItems(options = {}, eventData?: any) {
    let os = this.formatOS(options);
    // 数据格式化后，发现错误
    if (!os) {
      return this;
    }
    // 更新劫持，如果返回为false，会阻止更新
    let { onChangeBefore } = this.props;
    if (typeof onChangeBefore === "function") {
      if (onChangeBefore(os, this) === false) {
        return this;
      }
    }
    if (eventData) {
      eventData.items = os.selectItems;
      eventData.target = this;
      Object.assign(eventData, os, { target: this });
      this.emitChange(
        this.multiple ? eventData.items : eventData.items[0],
        eventData
      );
    }
    this.setStateOS(os);
    return this;
  }
  // 更新状态
  setStateOS(os: DState) {
    let state: DState = {};
    if ("selectItems" in this.state) {
      state.selectItems = os.selectItems;
    }
    if ("oriItems" in this.state) {
      state.oriItems = os.oriItems;
    }
    // 判断不为空
    for (let k in state) {
      this.setState(state);
      return this;
    }
  }
  // 初始化最大最小值
  initMaxMin() {
    let { min, max } = this.props;
    let { oriItems } = this.getOS();
    let oleg = oriItems.length;
    // 最小选择数量
    min = Math.floor(min);
    min = min > 0 && min <= oleg ? min : 0;
    // 最大选择数量
    max = Math.floor(max);
    max = max > 0 && max < oleg && max > min ? max : 0;
    return { min, max };
  }
  // 初始化state数据
  initState(options = {}) {
    let state: DState = {};
    let props = this.props;
    let selectItems = this.toArr(this.props.defaultValue);
    let oriItems = [...selectItems];
    if (!("selectItems" in props)) {
      state.selectItems = selectItems;
    }
    if (!("oriItems" in props)) {
      state.oriItems = oriItems;
    }
    return Object.assign(state, options);
  }
  // 获取 oriItems 和 selectItems
  // 因为可能是props中，也可能在state中
  getOS() {
    let props = this.props;
    let state = this.state || {};
    let selectItems =
      "selectItems" in props ? props.selectItems : state.selectItems;
    let oriItems = "oriItems" in props ? props.oriItems : state.oriItems;
    return { selectItems, oriItems };
  }

  // 过滤出给原始组件的props
  geoOProps(ks) {
    let obj = {};
    for (let k in this.props) {
      if (!ks.includes(k)) {
        obj[k] = this.props[k];
      }
    }
    return obj;
  }
  // 转换为数组
  toArr(item) {
    return item instanceof Array ? item : item ? [item] : [];
  }
  // 差集，1有，2没有
  filterSome1(items1, items2, k = this.k) {
    return items1.filter((o) => !items2.some((oo) => o[k] === oo[k]));
  }
  // 交集，1和2同时拥有
  filterEvery12(items1, items2, k = this.k) {
    return items1.filter((o) => items2.some((oo) => o[k] === oo[k]));
  }
  emitError(...args) {
    let { onError } = this.props;
    if (typeof onError === "function") {
      onError(...args);
    }
  }
  emitChange(...args) {
    let { onChange } = this.props;
    if (typeof onChange === "function") {
      onChange(...args);
    }
  }
  // 去重
  filterRepeat(items, k = this.k) {
    return items.reduce((arr, item) => {
      if (!arr.some((o) => o[k] === item[k])) {
        arr.push(item);
      }
      return arr;
    }, []);
  }
  // 判断是否全选
  hasAll(k = this.k) {
    let { oriItems, selectItems } = this.getOS();
    return (
      oriItems.length === selectItems.length &&
      oriItems.every((o) => selectItems.some((oo) => o[k] === oo[k]))
    );
  }
  // 切换全选状态
  toggleAll() {
    if (this.hasAll()) {
      this.clearItems();
    } else {
      this.allItems();
    }
    return this;
  }
  // 全选数据
  allItems() {
    let { oriItems } = this.getOS();
    let selectItems = [...oriItems];
    if (this.max > 0) {
      selectItems = selectItems.slice(0, this.max);
    }
    this.resetItems(
      {
        selectItems,
      },
      {
        type: "all",
      }
    );
    return this;
  }
  // 清空数据
  clearItems() {
    let { oriItems } = this.getOS();
    let selectItems = [];
    if (this.min > 0) {
      selectItems = oriItems.slice(0, this.min);
    }
    this.resetItems(
      {
        selectItems,
      },
      {
        type: "clear",
      }
    );
    return this;
  }
  // 判断指定项目是否是选中的状态
  hasSelect(item, k = this.k) {
    let { selectItems } = this.getOS();
    let items = this.toArr(item);
    return items.every((o1) => selectItems.some((o2) => o1[k] === o2[k]));
  }
  // 添加选中
  onSelectItems(item) {
    let { selectItems } = this.getOS();
    let items = this.toArr(item);
    items = this.filterSome1(items, selectItems);
    // 当前选中没有的，才有添加的意义
    if (!items.length) {
      return this;
    }
    if (this.multiple) {
      // 单选
      selectItems = items.slice(0, 1);
    } else {
      selectItems = [...selectItems, ...items];
    }

    this.resetItems({ selectItems }, { type: "select" });
  }
  // 删除选中
  onRemoveItems(item) {
    let { selectItems } = this.getOS();
    let items = this.toArr(item);
    items = this.filterEvery12(items, selectItems);
    // 当前选中有的，才有删除的意义
    if (!items.length) {
      return this;
    }
    selectItems = this.filterSome1(selectItems, items);
    this.resetItems({ selectItems }, { type: "remove" });
  }
  // 切换选中与不选中
  onToggleItems(item) {
    let { selectItems } = this.getOS();
    let items = this.toArr(item);
    // 多选
    // 过滤出选中状态中没有的数据才有添加的意义
    let addItems = this.filterSome1(items, selectItems);
    // 过滤出选中状态中有的数据，才有删除的意义
    let removeItems = this.filterEvery12(items, selectItems);
    if (addItems.length || removeItems.length) {
      // 有需要添加的数据
      if (addItems.length) {
        if (this.multiple) {
          // 多选
          selectItems = [...selectItems, ...addItems];
        } else {
          // 单选
          selectItems = addItems.slice(0, 1);
        }
      }
      // 有需要删除的数据
      if (removeItems.length) {
        selectItems = this.filterSome1(selectItems, removeItems);
      }
      this.resetItems({ selectItems }, { type: "toggle" });
    }
    return this;
  }
}
export class AntdSelect extends ListSelect {
  selectRef: any;
  constructor(props) {
    super(props);
    this.selectRef = React.createRef();
  }
  // 针对antd 的 Select元素，转换
  getOriSelectItems(selectItems) {
    selectItems = selectItems || this.getOS().selectItems;
    return selectItems.map(({ label }) => label.props["data-item"]);
  }
  // 针对antd 的 Select元素，转换
  toLabelInValue(val) {
    let selectItems = val.map((item) => {
      return {
        key: item[this.k],
        value: item[this.k],
        label: this.labelRe(item),
      };
    });
    return selectItems;
  }

  // antd select组件数据变化
  onAntdSelectChange(selectItems) {
    selectItems = this.toArr(selectItems);
    selectItems = this.getOriSelectItems(selectItems);
    this.resetItems({ selectItems }, { type: "change" });
  }
  // antd select组件搜索
  onAntdSearch(kw) {
    if (!(typeof kw === "string" && kw)) {
      return Promise.resolve();
    }
    let { onSearch } = this.props;
    let { oriItems } = this.getOS();
    this.setState({ loading: true });
    return onSearch(kw)
      .then((res) => {
        oriItems = res;
      })
      .finally(() => {
        if ("oriItems" in this.props) {
          this.resetItems({ oriItems }, { type: "search_finally" });
        } else {
          this.resetItems({ oriItems });
        }
        this.setState({ loading: false });
      });
  }
  dropdownRender(menu) {
    let { loading } = this.state;
    let { menuRender } = this.props;
    return loading ? (
      <div style={{ padding: "15px", textAlign: "center" }}>
        <Spin />
      </div>
    ) : typeof menuRender === "function" ? (
      menuRender(menu, this)
    ) : (
      menu
    );
  }
  tagRender(props) {
    const { label, closable, onClose } = props;
    let item = label && label.props && label.props["data-item"];
    let { tagRender, tagItemRender } = this.props;
    return tagRender ? (
      tagRender(item, props)
    ) : (
      <Tag closable={closable} onClose={onClose}>
        {tagItemRender ? tagItemRender(item) : label}
      </Tag>
    );
  }
  labelRe(item) {
    let { menuItemRender } = this.props;
    let txt =
      typeof item.zh_cn === "string" && typeof item.en_us === "string" ? (
        <FormattedMessage id="global.service" values={item} />
      ) : (
        item[this.k]
      );
    return (
      <span data-item={item}>
        {menuItemRender ? menuItemRender(item) : txt}
      </span>
    );
  }
  render() {
    let { onSearch, setShowMenuItems } = this.props;
    let { oriItems, selectItems } = this.getOS();
    let OProps = this.geoOProps(propsKeys);
    let antdSelectProps: any = {
      ...OProps,
      ref: this.selectRef,
      allowClear: this.multiple ? true : false,
      // 模式，多选，单选
      mode: this.multiple ? "multiple" : undefined,
      // key value数据格式
      labelInValue: true,
      // 多选时的数据渲染
      tagRender: (props) => this.tagRender(props),
      // 触发改变
      onChange: (items) => this.onAntdSelectChange(items),
    };
    if (onSearch) {
      // 搜索回调
      antdSelectProps.onSearch = (kw) => this.onAntdSearch(kw);
      antdSelectProps.filterOption = false;
    }
    // 列表渲染
    antdSelectProps.dropdownRender = (menu) => this.dropdownRender(menu);
    // 可以设置menu显示列表
    let showMenuItems =
      typeof setShowMenuItems === "function"
        ? setShowMenuItems(this.state, this)
        : oriItems;
    antdSelectProps.value = this.toLabelInValue(selectItems);
    antdSelectProps.options = showMenuItems.map((item) => {
      return {
        value: item[this.k],
        label: this.labelRe(item),
      };
    });
    return <Select {...antdSelectProps} />;
  }
}
