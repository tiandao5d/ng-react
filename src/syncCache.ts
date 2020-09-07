// 异步请求缓存
// fn 一个promise的异步函数，会将返回值缓存
// 同时多次请求时，会等待第一次的返回结果之后在执行列队请求
// 参考vue react异步执行原理，避免多次发送一毛一样的请求
interface SCItem {
  key: string;
  args: any;
  res: any;
  ts: number;
  err: any;
  cbs: any[];
}
function syncCache(fn: Function) {
  // 列队等待的数据
  let cacheData = {};
  let args = Array.prototype.slice.call(arguments, 1);
  let that = this;
  // 缓存时间毫秒数，超过这个时间会重新请求
  let cacheTime = 60 * 60 * 1000;

  // 以key为唯一值，加入缓存列队，args为fn的执行参数
  function addCacheQueue(key: string, args: any) {
    let item: SCItem = cacheData[key];
    let curTime = +new Date();
    // 已经执行过异步函数，得到异步返回值了，在缓存时间内，所以直接返回内容
    if (item) {
      if (item.res) {
        if (curTime - item.ts < cacheTime) {
          // 如果经常使用，则继续缓存，重置上次缓存时间
          //  称之为频率缓存
          item.ts = curTime;
          return Promise.resolve(item.res);
        } else {
          item = null;
        }
      } else if (item.err) {
        item = null;
      }
    }
    return new Promise((resolve) => {
      // 已经执行了异步函数，但是没有返回，记录列队
      if (item) {
        item.cbs.push(resolve);
      } else {
        // 执行异步函数
        item = {
          key,
          args,
          ts: 0, // 记录时间戳
          res: null, // 记录正确返回
          err: null, // 记录错误返回
          cbs: [resolve],
        };
        // 加入列队数据，向前添加
        cacheData[key] = item;
        tryFn(item);
      }
    });
  }

  // 执行函数
  function tryFn(item: SCItem) {
    return fn
      .apply(that, item.args)
      .then((res: any) => {
        item.res = res;
        // 请求成功后开始记录缓存时间
        item.ts = +new Date();
        return res;
      })
      .catch((err: any) => {
        item.err = err;
        return err;
      })
      .finally(() => {
        // 执行列队回调
        item.cbs.forEach((cb: (arg0: any, arg1: any) => any) =>
          cb(item.res, item.err)
        );
        // 置空列队回调
        item.cbs = [];
        return 0;
      });
  }

  return function () {
    // 用户的fn函数的执行参数
    let newArgs = Array.prototype.slice.call(arguments);
    // 可以为缓存的唯一值
    let key = newArgs.pop();
    newArgs = args.concat(newArgs);
    // 判断key有效，也就是函数的最后一个参数是可以用来当成key的，自定义key
    // 无效的话直接将参数转成字符串作为key
    if (!(key && typeof key === "string" && key.startsWith("_XLKEY"))) {
      newArgs.push(key);
      key = JSON.stringify(newArgs); // 参数为key值，用于缓存的key
    }
    return addCacheQueue(key, newArgs);
  };
}
