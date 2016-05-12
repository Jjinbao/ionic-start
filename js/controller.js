angular.module('app.controllers', [])

  /*听力列表controller*/
  .controller('tpoListenList', ['$scope', '$ionicHistory','$state',
    function($scope, $ionicHistory,$state) {

      $scope.listenSectionList = [
        {name:'Conversation 1',id:'C1'},
        {name:'Lecture 1',id:'L1'},
        {name:'Lecture 2',id:'L2'},
        {name:'Conversation 2',id:'C2'},
        {name:'Lecture 3',id:'L3'},
        {name:'Lecture 4',id:'L4'}
      ];
      $scope.goBack = function() {
        $ionicHistory.goBack();
      }

      $scope.startListen=function(id){
        $state.go('tabs.listen-page.son',{qid:id});
      }
    }])

  .controller('listenQuestionPage',['$scope','$ionicHistory','$compile','$interval','$rootScope',
    function($scope,$ionicHistory,$compile,$interval,$rootScope){
      console.log($rootScope.$stateParams.tid);
      console.log($rootScope.$stateParams.qid);
      $scope.numbers=0;
      $scope.array=['listen-material','answer-question','answer-type','listen-material','answer-question','answer-type','listen-material','answer-question','answer-type','listen-material','answer-question','answer-type'];

      $scope.timer=$interval(function(){
        $scope.numbers++;
        //$scope.nowView=$scope.array[$scope.numbers];
        var query=angular.element(document.querySelector('#view'));
        $compile(angular.element(query).attr('ui-view',$scope.array[$scope.numbers]))($scope);

      },5000);

      $scope.goBack=function(){
        console.log($ionicHistory.viewHistory());
        $ionicHistory.goBack();
      }
  }])
  .controller('listenMaterialCtrl',['$scope','$ionicHistory',function($scope,$ionicHistory){


  }])
  .controller('answerQuestionctrl',['$scope','$ionicHistory',function($scope,$ionicHistory){


  }])
  /*口语列表控制器*/
  .controller('tpoSpeakList', ['$scope', '$ionicHistory','$location',
    function($scope, $ionicHistory,$location) {
      console.log($location.url());

      $scope.speakSectionList = [
        {name:'Question 1',id:'1'},
        {name:'Question 2',id:'2'},
        {name:'Question 3',id:'3'},
        {name:'Question 4',id:'4'},
        {name:'Question 5',id:'5'},
        {name:'Question 6',id:'6'}
      ];
      $scope.goBack = function() {
        $ionicHistory.goBack();
      }
    }])
  .controller('answerPageCtrl',['$scope',function($scope){
    console.log('33333333333333333');
  }])


