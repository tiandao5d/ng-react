function OnConfig(
  $stateProvider,
  $locationProvider,
  $urlRouterProvider,
  $httpProvider
) {
  "ngInject";

  $stateProvider
    .state("project", {
      abstract: true,
      views: {
        main: {
          templateUrl: "project.html",
          controller: "ProjectManagementController as PMCtrl",
        },
        nav: {
          templateUrl: "mynav.html",
          controller: "MyNavbarController as MyNavbarCtrl",
        },
      },
    })
    .state("project.map", {
      url: "/workspace/map",
      views: {
        tableOrMap: {
          templateUrl: "project.map.html",
          controller: "ProjectMapController as PMapCtrl",
        },
      },
      // resolve: {
      //   projectMapPromise: function (DataPreloadService) {
      //     return Promise.all(DataPreloadService.projectMapPromiseArr);
      //   },
      // },
      title: "Workspace",
    });

  $urlRouterProvider.when("/project", "/workspace/map");
  $urlRouterProvider.otherwise("/workspace/map");
}

module.exports = OnConfig;
