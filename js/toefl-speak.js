/**
 * Created by lenovo on 2016/5/16.
 */
angular.module('app.speak-controllers', [])
  .controller('tpoSpeakList', ['$scope', '$ionicHistory', '$location', '$state',
    function($scope, $ionicHistory, $location, $state) {
      console.log($location.url());

      $scope.speakSectionList = [
        {name: 'Question 1', id: '1'},
        {name: 'Question 2', id: '2'},
        {name: 'Question 3', id: '3'},
        {name: 'Question 4', id: '4'},
        {name: 'Question 5', id: '5'},
        {name: 'Question 6', id: '6'}
      ];
      $scope.goBack = function() {
        $ionicHistory.goBack();
      }
      $scope.startSpeak = function(id) {
        $state.go('tabs.speak-page.son', {template: 'type-intro', sid: id});
      }
    }])

  .controller('speakQuestionPage', ['$scope', '$ionicHistory', function($scope, $ionicHistory) {
    $scope.goBack = function() {
      $ionicHistory.goBack();
    }
  }])
