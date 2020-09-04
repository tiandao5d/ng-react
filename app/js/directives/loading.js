var loading = function ($window) {
  "ngInject";
  return {
    restrict: "EA",
    templateUrl: "loading.html",
    link: function (scope, element, attrs) {},
  };
};

module.exports.name = "loading";
module.exports.fn = loading;
