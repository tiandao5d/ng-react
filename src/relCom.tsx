import React, { useState } from "react";
import { AntdDropdown } from "src/AntdDropdown";
import { AntdSelect } from "src/AntdSelect";
import { FormattedMessage } from "react-intl";
import { Space, Button } from "antd";
import { NGUIToast } from "./toast";

let oriItems = [
  { id: 1, zh_cn: "中文1", en_us: "react1" },
  { id: 2, zh_cn: "中文2", en_us: "react2" },
  { id: 3, zh_cn: "中文3", en_us: "react3" },
];
let toastCls = new NGUIToast();
export function RelTestView() {
  let [num, setNum] = useState(0);
  function btnclick() {
    toastCls.open({
      html: "随便一些内容",
      type: toastCls.randomType(),
      curAni: toastCls.randomAni(),
    });
  }
  function btnerror() {
    setNum(num + 1);
  }
  if (num > 0) {
    throw new Error("I crashed!");
  }
  return (
    <div>
      <h4>
        <FormattedMessage
          id="global.service"
          values={{ zh_cn: "react 主题", en_us: "react UI" }}
        />
      </h4>
      <div style={{ height: "15px" }}></div>
      <div>项目中的列表选择太多，才抽离了antd的组件继续封装，更加便于在项目中使用</div>
      <div>详情参见：AntdSelect.tsx和AntdDropdown.tsx文件</div>
      <div style={{ height: "15px" }}></div>
      <Space>
        <AntdDropdown oriItems={oriItems} />
        <AntdSelect
          oriItems={oriItems}
          style={{ width: "200px" }}
          placeholder={
            <FormattedMessage
              id="global.service"
              values={{
                zh_cn: "react的antd选择工具",
                en_us: "react antd select",
              }}
            />
          }
        />
      </Space>
      <div style={{ height: "15px" }}></div>
      <div>错误边界，发生后会延迟重新渲染组件，如果超过五次将不再重新渲染，频率太高也不再重新渲染</div>
      <div style={{ height: "15px" }}></div>
      <Space>
        <Button type="primary" onClick={btnclick}>
          <FormattedMessage
            id="global.service"
            values={{ zh_cn: "提示工具", en_us: "toast" }}
          />
        </Button>
        <Button type="primary" onClick={btnerror}>
          <FormattedMessage
            id="global.service"
            values={{ zh_cn: "错误边界", en_us: "error toast" }}
          />
          {num}
        </Button>
      </Space>
      <div style={{ height: "15px" }}></div>
    </div>
  );
}
