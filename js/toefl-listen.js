angular.module('app.listen-controllers', ['checklist-model'])

  /*听力列表controller*/
  .controller('tpoListenList', ['$scope', '$ionicHistory', '$state',
    function($scope, $ionicHistory, $state) {

      $scope.listenSectionList = [
        {name: 'Conversation 1', id: 'C1'},
        {name: 'Lecture 1', id: 'L1'},
        {name: 'Lecture 2', id: 'L2'},
        {name: 'Conversation 2', id: 'C2'},
        {name: 'Lecture 3', id: 'L3'},
        {name: 'Lecture 4', id: 'L4'}
      ];
      $scope.goBack = function() {
        $ionicHistory.goBack();
      }

      $scope.startListen = function(id) {
        $state.go('tabs.listen-page.son', {template: 'preload-data', sid: id});
      }
    }])

  .controller('listenQuestionPage', ['$scope', '$ionicHistory', '$compile', 'sectionService', '$state', 'isTestService', '$stateParams','$ionicPopup',
    function($scope, $ionicHistory, $compile, sectionService, $state, isTestService, $stateParams,$ionicPopup) {
      var toeflClock;
      $scope.section = sectionService.section;
      $scope.testType = isTestService;
      $scope.showButton = !$scope.testType.checked;
      $scope.showQuestionBody = !$scope.testType.checked;
      $scope.$watchCollection('section', function(newVal) {
        if (newVal.uuid) {
          $scope.sences = make_up_route_sequence($scope.section);
          if (toeflClock && $scope.testType.checked) {
            toeflClock.timeLimit = $scope.section.timeLimit;
          }
        }
      });




      sectionService.retrieve('48');

      $scope.$on('toefl-clock', function(event, clock) {
        toeflClock = clock;
        if ($scope.section.uuid) {
          toeflClock.timeLimit = $scope.section.timeLimit;
        }
      });

      //listen time out
      $scope.$on('section.timeout', function(event) {
        var sequenceLength = $scope.sences.length - 1;
        route_according_to_sequence($scope.sences[sequenceLength]);
      });

      /*显示题干，开始做题*/
      $scope.$on('question.sound-complete', function() {
        $scope.showQuestionBody = true;
        toeflClock.start();
      });

      $scope.$on('listen.again.notic', function(evt, data) {
        if ($scope.question.questionStartPoint > 0 && $scope.question.listenAgainNotice) {
          delete $scope.question.listenAgainNotice;
        }
      });

      $scope.choiceView=function(){
        //@todo
      }

      $scope.back = function() {
        //@todo
      }

      $scope.next = function() {
        //@todo
      }

      $scope.showImage=function(){
        //@todo
      }

      $scope.showScript=function(){
        //@todo
      }

      $scope.showQuestion=function(){
        //@todo
      }

      //listen queues number
      $scope.queueNum = -1;
      $scope.continue = function() {
        if ($scope.testType.checked) {
          if ($scope.sences.length > ++$scope.queueNum) {
            route_according_to_sequence($scope.sences[$scope.queueNum]);
          }
          $scope.showQuestionBody = false;
          toeflClock.pause();
        }else{
          $scope.unit=$scope.sences.shift();
          $state.go('tabs.listen-page.son', {template: 'listen-practice-image'});
        }
      }


      //now question number
      $scope.qNumber = 0;
      function route_according_to_sequence(obj) {
        if (obj instanceof ToeflListeningTask) {
          $scope.unit = obj;
          $scope.qNumber = 0;
          $state.go('tabs.listen-page.son', {template: 'listen-to-material'});
        } else {
          $scope.showButton = true;
          $scope.question = $scope.unit.questions[$scope.qNumber++];
          $state.go('tabs.listen-page.son', {template: obj});
        }
      }

      function make_up_route_sequence(section) {
        var sequence = [];
        angular.forEach(section.units, function(unit) {
          sequence.push(unit);
          angular.forEach(unit.questions, function(question) {
            sequence.push('question');
          })
        });
        sequence.push('end-test');
        return sequence;
      }

      $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
          title: '退出提醒',
          template: '还没有完成测试，结果将不会被保存，确认退出？'
        });

        confirmPopup.then(function(res) {
          if(res) {
            $ionicHistory.goBack();
          } else {
            //console.log('You are not sure');
          }
        });
      };


      $scope.goBack = function() {
        if($scope.testType.checked){
          $scope.showConfirm();
        }else{
          $ionicHistory.goBack();
        }
      }
    }])

  .controller('listenMaterialCtrl', ['$scope', '$ionicHistory', function($scope, $ionicHistory) {

  }])
  .controller('answerQuestionctrl', ['$scope', '$ionicHistory', function($scope, $ionicHistory) {


  }])



