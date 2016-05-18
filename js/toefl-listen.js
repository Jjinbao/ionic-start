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
        $state.go('tabs.listen-practice.son', {template: 'preload-data', sid: id});
      }
    }])

  .controller('listenTestCtrl', ['$scope', '$ionicHistory', 'sectionService', '$state','$ionicPopup',
    function($scope, $ionicHistory, sectionService, $state,$ionicPopup) {
      var toeflClock;
      $scope.section = sectionService.section;
      $scope.showButton=false;
      $scope.showQuestionBody = false;
      $scope.$watchCollection('section', function(newVal) {
        if (newVal.uuid) {
          $scope.sences = make_up_route_sequence($scope.section);
          if (toeflClock) {
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

      $scope.preLoadRes=function(){

      }

      $scope.queueNum = -1;
      $scope.continue = function() {
        if ($scope.sences.length > ++$scope.queueNum) {
          route_according_to_sequence($scope.sences[$scope.queueNum]);
        }
        $scope.showQuestionBody = false;
        toeflClock.pause();
      }

      $scope.qNumber = 0;
      function route_according_to_sequence(obj) {
        if (obj instanceof ToeflListeningTask) {
          $scope.unit = obj;
          $scope.qNumber = 0;
          $scope.showButton=false;
          $state.go('tabs.listen-test.son', {template: 'listen-to-material'});
        } else {
          $scope.showButton = true;
          $scope.question = $scope.unit.questions[$scope.qNumber++];
          $state.go('tabs.listen-test.son', {template: obj});
        }
      }

      function make_up_route_sequence(section) {
        var sequence = [];
        angular.forEach(section.units, function(unit) {
          sequence.push(unit);
          angular.forEach(unit.questions, function(question) {
            sequence.push('test-question');
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
        $scope.showConfirm();
      }
    }])

  .controller('listenPracticeCtrl', ['$scope', '$ionicHistory', 'sectionService', '$state', 'isTestService', '$stateParams','$ionicPopup','$ionicActionSheet','$timeout',
    function($scope, $ionicHistory, sectionService, $state, isTestService, $stateParams,$ionicPopup,$ionicActionSheet,$timeout) {
      var toeflClock;
      $scope.section = sectionService.section;
      $scope.$watchCollection('section', function(newVal) {
        if (newVal.uuid) {
          $scope.sences = make_up_route_sequence($scope.section);
          $scope.unit=$scope.section.units[0];
        }
      });

      sectionService.retrieve('48C1');


      //listen time out
      $scope.$on('section.timeout', function(event) {
        var sequenceLength = $scope.sences.length - 1;
        route_according_to_sequence($scope.sences[sequenceLength]);
      });

      /*显示题干，开始做题*/
      $scope.$on('question.sound-complete', function() {
        $scope.showQuestionBody = true;

      });

      $scope.$on('listen.again.notic', function(evt, data) {
        if ($scope.question.questionStartPoint > 0 && $scope.question.listenAgainNotice) {
          delete $scope.question.listenAgainNotice;
        }
      });

      $scope.practiceView;
      $scope.changeView=function(index){
        switch (index){
          case 0:
            if($scope.practiceView!='image'){
              $scope.showImage();
            }
            break;
          case 1:
            if($scope.practiceView!='question'){
              $scope.showQuestion();
            }
            break;
          case 2:
            if($scope.practiceView!='script'){
              $scope.showScript();
            }
            break;
        }
      }

      $scope.back = function() {
        if($scope.qNumber>0){
          $scope.qNumber--;
          route_according_to_sequence();
        }
      }

      $scope.next = function() {
        if($scope.qNumber<($scope.unit.questions.length-1)){
          $scope.qNumber++;
          route_according_to_sequence();
        }
      }

      $scope.showAnswer=function(){
        console.log($scope.question.isAnswered());
      }

      $scope.showImage=function(){
        $scope.practiceView='image';
        $state.go('tabs.listen-practice.son', {template: 'practice-image'});
      }

      $scope.showScript=function(){
        $scope.practiceView='script';
        $state.go('tabs.listen-practice.son', {template: 'practice-script'});
      }

      $scope.showQuestion=function(){
        $scope.practiceView='question';
        route_according_to_sequence($scope.sences[$scope.qNumber]);
      }

      //practice change the show
      $scope.showViewMenu = function() {
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
          buttons: [
            { text: '显示图片' },
            { text: '显示问题' },
            {text:'显示原文'}
          ],
          //destructiveText: 'Delete',
          titleText: '界面选择',
          //cancelText: 'Cancel',
          cancel: function() {
            // add cancel code..
          },
          buttonClicked: function(index) {
            $scope.changeView(index);
            return true;
          }
        });
        $timeout(function() {
          hideSheet();
        }, 5000);

      };

      $scope.preLoadRes=function(){

      }

      //listen queues number
      $scope.continue = function() {
        $scope.practiceView='image';
        $scope.showImage();
      }


      //now question number
      $scope.qNumber = 0;
      function route_according_to_sequence(obj) {
        $scope.question = $scope.unit.questions[$scope.qNumber];
        $state.go('tabs.listen-practice.son', {template: $scope.sences[$scope.qNumber]});
      }

      function make_up_route_sequence(section) {
        var sequence = [];
        angular.forEach(section.units, function(unit) {
          angular.forEach(unit.questions, function(question) {
            sequence.push('practice-question');
          })
        });
        return sequence;
      }

      $scope.goBack = function() {
        $ionicHistory.goBack();
      }
    }])


