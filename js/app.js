angular.module('ionicApp', ['ionic', 'app.listen-controllers', 'app.speak-controllers', 'toefl.service', 'toefl.utils'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    })
  })

  .run(['$rootScope', '$state', '$stateParams',
    function($rootScope, $state, $stateParams) {
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
      .state('tabs.news', {
        url: "/news",
        views: {
          'news-tab': {
            templateUrl: "templates/news.html"
          }
        }
      })
      .state('tabs.set', {
        url: "/set",
        views: {
          'set-tab': {
            templateUrl: "templates/set.html",
            controller:'setCtrl'
          }
        }
      })
      .state('tabs.listen-list', {
        url: "/:tid",
        views: {
          'list-tab': {
            templateUrl: "templates/listen/list.html",
            controller: 'tpoListenList'
          }
        }
      })
      .state('tabs.listen-practice', {
        url: "/:tpoid/:sid",
        views: {
          'list-tab': {
            templateUrl: "templates/listen/practice-root.html",
            controller: 'listenPracticeCtrl'
          }
        }
      })
      .state('tabs.listen-practice.son', {
        url: "/:template",
        views: {
          'practice-root': {
            templateUrl: function(routeParams) {
              return 'templates/listen/' + routeParams.template + '.html'
            }
          }
        }
      })
      .state('tabs.listen-test', {
        url: "/:sid",
        views: {
          'list-tab': {
            templateUrl: "templates/listen/root-page.html",
            controller: 'listenTestCtrl'
          }
        }
      })
      .state('tabs.listen-test.son', {
        url: "/:template",
        views: {
          'listen-root': {
            templateUrl: function(routeParams) {
              return 'templates/listen/' + routeParams.template + '.html'
            },
            controller:'answerCtrl'
          }
        }
      })

      .state('tabs.speak-list', {
        url: "/:tid",
        views: {
          'list-tab': {
            templateUrl: "templates/speak/speak-list.html",
            controller: 'tpoSpeakList'
          }
        }
      })
      .state('tabs.speak-page', {
        url: "/:tpoid/:sid",
        views: {
          'list-tab': {
            templateUrl: "templates/speak/speak-root-page.html",
            controller: 'speakQuestionPage'
          }
        }
      })
      .state('tabs.speak-page.son', {
        url: "/:template",
        views: {
          'speak-root': {
            templateUrl: function(routeParams) {
              return 'templates/speak/' + routeParams.template + '.html'
            }

          }
        }
      });

    $urlRouterProvider.otherwise("/tab/home");
  })

  /*root controller*/
  .controller('rootTabCtrl', ['$scope', function($scope) {
    $scope.tpoNo = '';
    $scope.$on('from.list', function(evt, data) {
      $scope.topNo = data;
    })

  }])

  /*home controller*/
  .controller('homeCtrl', ['$scope', function($scope) {

  }])
  .controller('setCtrl',['$scope',function($scope){
    console.log('setCtrl');
  }])

  /*list controller*/
  .controller('listCtrl', ['$scope', '$state', 'isTestService', function($scope, $state, isTestService) {
    $scope.settingsTest = isTestService;
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
      if (j != 37 && j != 38 && j != 39) {
        $scope.groups[0].items.push(j);
        $scope.groups[1].items.push(j);
      }
    }
    $scope.toggleGroup = function(group) {
      group.show = !group.show;
    };
    $scope.isGroupShown = function(group) {
      return group.show;
    };

    $scope.choiceTpo = function(type, index) {
      $scope.$emit('from.list', index);
      if (type == 'L') {
        if ($scope.settingsTest.checked == true) {
          $state.go('tabs.listen-test.son', {template: 'preload-data', sid: index});
        } else {
          $state.go('tabs.listen-list', {tid: index});
        }
      } else {
        $state.go('tabs.speak-list', {tid: index});
      }
    };
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

