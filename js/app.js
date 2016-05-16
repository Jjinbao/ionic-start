angular.module('ionicApp', ['ionic', 'app.listen-controllers','app.speak-controllers', 'toefl.service','toefl.utils'])

  .run(['$rootScope', '$state', '$stateParams',
    function ($rootScope, $state, $stateParams) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
    }])

  .config(['$ionicConfigProvider', function($ionicConfigProvider) {
    $ionicConfigProvider.platform.ios.tabs.style('standard');
    $ionicConfigProvider.platform.ios.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.platform.android.tabs.position('bottom');
    $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
    $ionicConfigProvider.platform.android.navBar.alignTitle('center');
    $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
    $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');
    $ionicConfigProvider.platform.ios.views.transition('ios');
    $ionicConfigProvider.platform.android.views.transition('android');
  }])

  .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $stateProvider
      .state('tabs', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html",
        controller: 'rootTabCtrl'
      })
      .state('tabs.home', {
        url: "/home",
        views: {
          'home-tab': {
            templateUrl: "templates/home.html",
            controller: 'homeCtrl'
          }
        }
      })
      .state('tabs.list', {
        url: "/list",
        views: {
          'list-tab': {
            templateUrl: "templates/list.html",
            controller: 'listCtrl'
          }
        }
      })

      .state('tabs.listen-list', {
        url: "/:tid",
        views: {
          'list-tab': {
            templateUrl: "templates/listen/listen-list.html",
            controller: 'tpoListenList'
          }
        }
      })
      .state('tabs.listen-page', {
        url: "/:sid",
        views: {
          'list-tab': {
            templateUrl: "templates/listen/listen-root-page.html",
            controller:'listenQuestionPage'
          }
        }
      })
      .state('tabs.listen-page.son', {
        url: "/:template",
        views: {
          'listen-root': {
            templateUrl:function(routeParams){
              return 'templates/listen/'+routeParams.template+'.html'
            },
            controller:'listenMaterialCtrl'

          }
        }
      })

      .state('tabs.speak-list', {
        url: "/speak-list",
        views: {
          'list-tab': {
            templateUrl: "templates/speak/speak-list.html",
            controller: 'tpoSpeakList'
          }
        }
      })
      .state('tabs.speak-page', {
        url: "/:sid",
        views: {
          'list-tab': {
            templateUrl: "templates/speak/speak-root-page.html",
            controller:'speakQuestionPage'
          }
        }
      })
      .state('tabs.speak-page.son', {
        url: "/:template",
        views: {
          'speak-root': {
            templateUrl:function(routeParams){
              return 'templates/speak/'+routeParams.template+'.html'
            }

          }
        }
      })

    $urlRouterProvider.otherwise("/tab/list");
  })

  /*root controller*/
  .controller('rootTabCtrl', ['$scope', function($scope) {
    $scope.tpoNo = 'list';
    $scope.$on('from.list', function(evt, data) {
      $scope.topNo = 'TPO ' + data;
    })

  }])

  /*home controller*/
  .controller('homeCtrl', ['$scope', function($scope) {

  }])

  /*list controller*/
  .controller('listCtrl', ['$scope', '$state', function($scope, $state) {
    $scope.topNo = '';
    $scope.groups = [];
    $scope.groups[0] = {
      name: 'L',
      items: [],
      show: false
    }
    $scope.groups[1] = {
      name: 'S',
      items: [],
      show: false
    }
    for (var j = 48; j > 0; j--) {
      $scope.groups[0].items.push(j);
      $scope.groups[1].items.push(j);
    }
    $scope.toggleGroup = function(group) {
      group.show = !group.show;
    };
    $scope.isGroupShown = function(group) {
      return group.show;
    };

    $scope.choiceTpo = function(type, index) {
      console.log(type);
      console.log(index);
      $scope.$emit('from.list', index);
      if (type == 'L') {
        $state.go('tabs.listen-list', {tid: index});
      } else {
        $state.go('tabs.speak-list', {tid: index});
      }
    }
  }])

  .directive('hideTabs', function($rootScope) {
    return {
      restrict: 'A',
      link: function(scope, element, attributes) {
        scope.$on('$ionicView.beforeEnter', function() {
          scope.$watch(attributes.hideTabs, function(value) {
            $rootScope.hideTabs = value;
          });
        });

        scope.$on('$ionicView.beforeLeave', function() {
          $rootScope.hideTabs = false;
        });
      }
    };
  });

