// 环境配置文件
const dev_setting = {
  apiUrl: "https://dev-api.xulin.com.cn",
  nightfuryUrl: "https://xulin-dev.xulin.com.cn/webs",
  photoHost: "https://photo-dev-api.xulin.com.cn",
};
const prod_setting = {
  apiUrl: "https://api.xulin.com.cn",
  nightfuryUrl: "https://xulin.com.cn/webs",
  photoHost: "https://photo-api.xulin.com.cn",
};
const uat_setting = {
  apiUrl: "https://uat-api.xulin.com.cn",
  nightfuryUrl: "https://xulin-uat.xulin.com.cn/webs",
  photoHost: "https://photo-uat-api.xulin.com.cn",
};

function getAPISetting(arr = process.argv) {
  // 默认配置正式环境
  let env = "prod";
  let isBuild = false;
  let apiSetting = prod_setting;
  if (arr.includes("--prod")) {
    env = "prod";
    apiSetting = prod_setting;
  } else if (arr.includes("--dev")) {
    env = "dev";
    apiSetting = dev_setting;
  } else if (arr.includes("--uat")) {
    env = "uat";
    apiSetting = uat_setting;
  }
  if (arr.some((s) => s.endsWith("bin/webpack"))) {
    isBuild = true;
  }
  return { env, isBuild, apiSetting };
}

const config = getAPISetting();
module.exports = config;
