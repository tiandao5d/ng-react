var Util = function ($http, $q) {
  "ngInject";
  that = this;

  // 没有全面测试使用，应该没有问题
  // 见太多的列表选择，就写了这个类
  // 用于列表选择，多选
  class ListMultiple {
    constructor(options = {}) {
      this.min = options.min || 0;
      this.max = options.max || 0;
      if (this.min > 0 && this.max > 0 && this.max < this.min) {
        this.min = 0;
        this.max = 0;
        console.log("参数错误，min 不能大于 max");
      }
      this.dOptions = { ...options };
      this.resetItems({}, { type: "$_lm_init" });
    }

    // 重置项目数据
    resetItems(options = {}, eventData) {
      options = { ...this.dOptions, ...options };
      this.dOptions = options;
      let selectInOri =
        typeof options.selectInOri === "boolean"
          ? options.selectInOri
          : typeof this.selectInOri === "boolean"
          ? this.selectInOri
          : false;
      let oriItems = options.oriItems || this.oriItems || [];
      let selectItems = options.selectItems || this.selectItems || [];
      let k =
        options.k || this.k || (oriItems[0] && oriItems[0].id ? "id" : "");

      // 有从属关系，selectItems 的数据必须存在于 oriItems中
      if (selectInOri) {
        selectItems = this.filterEvery12(selectItems, oriItems);
      }
      // oriItems - selectItems = listItems
      let listItems = this.filterSome1(oriItems, selectItems);
      if (!(eventData && eventData.type === "$_lm_init")) {
        // 选中数据不能少于
        if (this.min > 0) {
          if (selectItems.length < this.min) {
            this.onError("min_err", {
              txt: `选中的数据量不能小于给定的 min: ${this.min}`,
              items: [...selectItems],
            });
            return this;
          }
        }

        // 选中数据不能大于
        if (this.max > 0) {
          if (selectItems.length > this.max) {
            this.onError("max_err", {
              txt: `选中的数据量不能小于给定的 max: ${this.max}`,
              items: [...selectItems],
            });
            return this;
          }
        }
      }

      // 原始列表数据
      this.oriItems = [...oriItems];
      // 选中列表数据
      this.selectItems = [...selectItems];
      // 原始 - 选中
      this.listItems = [...listItems];
      // 对比两个列表项目相等的 key 值
      this.k = k;
      // 是否有从属关系，selectItems中元素 是否必须是存在于 oriItems中
      this.selectInOri = selectInOri;
      if (eventData && eventData.type !== "$_lm_init") {
        eventData.target = this;
        this.emitChange(eventData.type, eventData);
      }
      return this;
    }
    // 差集，1有，2没有
    filterSome1(items1, items2, k = this.k) {
      if (k) {
        return items1.filter((o) => !items2.some((oo) => o[k] === oo[k]));
      }
      return items1.filter((o) => !items2.some((oo) => o === oo));
    }
    // 交集，1和2同时拥有
    filterEvery12(items1, items2, k = this.k) {
      if (k) {
        return items1.filter((o) => items2.some((oo) => o[k] === oo[k]));
      }
      return items1.filter((o) => items2.some((oo) => o === oo));
    }
    hasSelect(item, k = this.k) {
      // 判断指定项目是否是选中的状态
      if (k) {
        return this.selectItems.some((o) => o[k] === item[k]);
      }
      return this.selectItems.some((o) => o === item);
    }
    // 简单的数据转化，因为这里是对数组进行操作
    toArr(item) {
      let items = null;
      if (item instanceof Array) {
        items = item;
      } else {
        items = [item];
      }
      return items;
    }
    onError() {}
    onChange() {}
    emitChange() {
      this.onChange(...arguments);
      return this;
    }
    hasAll(k = this.k) {
      // 判断是否全选
      if (k) {
        return (
          this.oriItems.length === this.selectItems.length &&
          this.oriItems.every((o) =>
            this.selectItems.some((oo) => o[k] === oo[k])
          )
        );
      }
      return (
        this.oriItems.length === this.selectItems.length &&
        this.oriItems.every((o) => this.selectItems.some((oo) => o === oo))
      );
    }
    toggleAll() {
      // 切换全选状态
      if (this.hasAll()) {
        this.clearItems();
      } else {
        this.allItems();
      }
      return this;
    }
    allItems() {
      // 全选数据
      this.resetItems(
        {
          selectItems: this.oriItems,
          oriItems: this.oriItems,
        },
        {
          type: "all",
        }
      );
      return this;
    }
    clearItems() {
      // 清空数据
      this.resetItems(
        {
          selectItems: [],
        },
        {
          type: "clear",
        }
      );
      return this;
    }
    onToggleItems(item) {
      // 切换选中与不选中
      let items = this.toArr(item);
      // 过滤出选中状态中没有的数据才有添加的意义
      let addItems = this.filterSome1(items, this.selectItems);
      // 过滤出选中状态中有的数据，才有删除的意义
      let removeItems = this.filterEvery12(items, this.selectItems);
      // 有需要添加的数据
      if (addItems.length) {
        this.onSelectItems(addItems);
      }
      // 有需要删除的数据
      if (removeItems.length) {
        this.onRemoveItems(removeItems);
      }
      return this;
    }
    onSelectItems(item) {
      let items = this.toArr(item); // 转数组
      // 过滤出选中状态中没有的数据才有添加的意义
      items = this.filterSome1(items, this.selectItems);
      if (items.length) {
        let selectItems = [...this.selectItems, ...items];
        this.resetItems(
          {
            selectItems,
          },
          {
            type: "select",
            items: [...items],
          }
        );
      }
      return this;
    }
    onRemoveItems(item) {
      let items = this.toArr(item);
      // 过滤出选中状态中有的数据，才有删除的意义
      items = this.filterEvery12(items, this.selectItems);
      if (items.length) {
        let selectItems = this.filterSome1(this.selectItems, items);
        this.resetItems(
          {
            selectItems,
          },
          {
            type: "remove",
            items: [...items],
          }
        );
      }
      return this;
    }
  }
  that.ListMultiple = ListMultiple;

  // 用于列表选择，单选
  class ListRadio extends ListMultiple {
    constructor(options) {
      super(options);
    }
    onSelectItems(item) {
      let items = this.toArr(item); // 转数组
      // 过滤出选中状态中没有的数据才有添加的意义
      items = this.filterSome1(items, this.selectItems);
      if (items.length) {
        let selectItems = [...items];
        selectItems.length = 1;
        this.resetItems(
          {
            selectItems,
          },
          {
            type: "select",
            items: [...items],
          }
        );
      }
      return this;
    }
  }
  that.ListRadio = ListRadio;

  class SearchListMultiple extends ListMultiple {
    constructor(options = {}) {
      super(options);
      this.isLoading = false;
      this.kw = options.kw || "";
      // selectItems 不一定要存在于 oriItems中
      this.selectInOri = false;
      this.kwChange = angular._throttle(this.kwChange);
    }
    onSearchFinally() {}
    // 必须的函数
    onSearch() {
      return Promise.resolve([]);
    }
    kwChange(kw = this.kw) {
      this.isLoading = true;
      return this.onSearch(kw)
        .then((res) => {
          this.resetItems({
            oriItems: [...res],
          });
        })
        .finally(() => {
          this.isLoading = false;
          this.onSearchFinally();
        });
    }
  }
  that.SearchListMultiple = SearchListMultiple;

  class SearchListRadio extends SearchListMultiple {
    constructor(options) {
      super(options);
    }
    onSelectItems(item) {
      let items = this.toArr(item); // 转数组
      // 过滤出选中状态中没有的数据才有添加的意义
      items = this.filterSome1(items, this.selectItems);
      if (items.length) {
        let selectItems = [...items];
        selectItems.length = 1;
        this.resetItems(
          {
            selectItems,
          },
          {
            type: "select",
            items: [...items],
          }
        );
      }
    }
  }
  that.SearchListRadio = SearchListRadio;
};

module.exports.fn = Util;
module.exports.name = "Util";
