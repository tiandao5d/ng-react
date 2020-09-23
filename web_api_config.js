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

let env = "";
const apiSetting = getAPISetting();
function getAPISetting(arr = process.argv) {
  if (arr.includes("--prod")) {
    env = "prod";
    return prod_setting;
  }
  if (arr.includes("--dev")) {
    env = "dev";
    return dev_setting;
  }
  if (arr.includes("--uat")) {
    env = "uat";
    return uat_setting;
  }
}

module.exports = { apiSetting, env };
