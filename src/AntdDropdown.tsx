/**
 * 下拉选择， props
 * {id: 1} 条目
 */
// 此组件可以使用的props，因为用的是antd 的 Dropdown组件
// 所以，多余出来的props会自动赋值给antd 的 Dropdown组件
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
  "afterClickClose", // 选中后是否关闭下拉 Boolean
  "menuItemRender", // 单个menu渲染函数 Function
  "children", // 子元素 react el
  "triggerTxt", // 点击按键的文本，也可以是react el
  "selectAll", // 是否有全选按键 Function
  "menuItemTxtRender",
];
import React from "react";
import { FormattedMessage } from "react-intl";
import { Menu, Button, Dropdown } from "antd";
import { ListSelect, LSProps } from "src/AntdSelect";
export class AntdDropdown extends ListSelect {
  afterClickClose: boolean;
  constructor(props: LSProps) {
    super(props);
    let { afterClickClose } = props;
    // 选中后是否收起菜单
    this.afterClickClose =
      typeof afterClickClose === "boolean"
        ? afterClickClose
        : this.multiple
        ? false
        : true;
  }

  onMenuClick(e: any) {
    let item = e.item.props["data-item"];
    this.onToggleItems(item);
    if (this.afterClickClose) {
      this.setState({ visible: false });
    }
    return this;
  }
  render() {
    let {
      menuItemRender,
      children,
      triggerTxt,
      selectAll,
      setShowMenuItems,
      menuItemTxtRender,
    } = this.props;
    let { oriItems, selectItems } = this.getOS();
    let showMenuItems: any[] =
      typeof setShowMenuItems === "function"
        ? setShowMenuItems(oriItems, this)
        : oriItems;
    if (selectAll) {
      let item = { zh_cn: "全选", en_us: "All" };
      item[this.k] = this.allKey;
      showMenuItems = [item, ...showMenuItems];
    }
    let selectedKeys = selectItems.map((o) => o[this.k]);
    if (this.hasAll()) {
      selectedKeys.push(this.allKey);
    }
    // 覆盖了原有的menu样式，为了和原有的angular风格统一
    let menu = (
      <Menu
        className="antd-dropdown-ul"
        multiple={this.multiple}
        selectedKeys={selectedKeys}
        onClick={(e) => this.onMenuClick(e)}
      >
        {showMenuItems.map((item) => {
          return (
            <Menu.Item data-item={item} key={item[this.k]}>
              {menuItemRender ? (
                menuItemRender
              ) : (
                <>
                  <i
                    className={`fa ${
                      selectedKeys.includes(item[this.k])
                        ? this.multiple
                          ? "fa-check-square-o"
                          : "fa-check-circle-o"
                        : this.multiple
                        ? "fa-square-o"
                        : "fa-circle-o"
                    }`}
                  ></i>
                  {item.intlEl ? (
                    item.intlEl
                  ) : item.intlId ? (
                    <FormattedMessage id={item.intlId} />
                  ) : typeof item.zh_cn === "string" &&
                    typeof item.en_us === "string" ? (
                    <FormattedMessage id="global.service" values={item} />
                  ) : menuItemTxtRender ? (
                    menuItemTxtRender(item)
                  ) : (
                    item[this.k]
                  )}
                </>
              )}
            </Menu.Item>
          );
        })}
      </Menu>
    );
    let OProps = this.geoOProps(propsKeys);
    return (
      <Dropdown
        placement="bottomLeft"
        trigger={["click"]}
        getPopupContainer={(el) => (el as any).parentNode}
        {...OProps}
        onVisibleChange={(val) => this.setState({ visible: val })}
        overlay={menu}
        visible={this.state.visible}
      >
        {children ? (
          children
        ) : (
          <Button className="antd-dropdown-btn">
            <span className="antd-dropdown-btn-txt">
              {triggerTxt || <FormattedMessage id="global.choose" />}
            </span>
            <i className="fa fa-angle-down antd-dropdown-btn-fa"></i>
          </Button>
        )}
      </Dropdown>
    );
  }
}
