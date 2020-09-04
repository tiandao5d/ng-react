let ProjectManagementController = function ($scope, Util) {
  "ngInject";
  let arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
  class ListTest extends Util.ListMultiple {
    constructor(){
      super({
        oriItems: arr
      })
    }
    onChange(item){
      console.log(item)
    }
  }
  $scope.listTestCls = new ListTest();
};

module.exports.fn = ProjectManagementController;
module.exports.name = "ProjectManagementController";
