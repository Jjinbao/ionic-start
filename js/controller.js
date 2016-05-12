angular.module('app.controllers', [])

  /*听力列表controller*/
  .controller('tpoListenList', ['$scope', '$ionicHistory', '$stateParams',
    function($scope, $ionicHistory) {

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
    }])
  /*口语列表控制器*/
  .controller('tpoSpeakList', ['$scope', '$ionicHistory', '$stateParams',
    function($scope, $ionicHistory) {

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


