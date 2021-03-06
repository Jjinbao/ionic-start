angular.module('app.listen-controllers', ['checklist-model'])

  /*听力列表controller*/
  .controller('tpoListenList', ['$scope', '$ionicHistory', '$state', '$stateParams',
    function($scope, $ionicHistory, $state, $stateParams) {
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
        $state.go('tabs.listen-practice.son', {template: 'preload-data', sid: id, tpoid: $stateParams.tid});
      }
    }])

  .controller('listenTestCtrl', ['$scope', '$ionicHistory', 'sectionService', '$state', '$ionicPopup', '$location',
    function($scope, $ionicHistory, sectionService, $state, $ionicPopup, $location) {
      var toeflClock;
      $scope.section = sectionService.section;
      $scope.showButton = false;
      $scope.showQuestionBody = false;
      $scope.canButtonUsed = false;
      $scope.$watchCollection('section', function(newVal) {
        if (newVal.uuid) {
          $scope.sences = make_up_route_sequence($scope.section);
          console.log($scope.section);
          if (toeflClock) {
            toeflClock.timeLimit = $scope.section.timeLimit;
          }
        }
      });

      sectionService.retrieve('table');

      $scope.$on('toefl-clock', function(event, clock) {
        toeflClock = clock;
        toeflClock.timeout = end_section;
        if ($scope.section.uuid) {
          toeflClock.timeLimit = $scope.section.timeLimit;
        }
      });

      function end_section() {
        toeflClock.hide();
        $scope.queueNum = $scope.sences.length - 1;
        $scope.showButton = false;
        route_according_to_sequence($scope.sences[$scope.queueNum]);
      }

      //listen time out
      $scope.$on('section.timeout', function(event) {
        $scope.queueNum = $scope.sences.length - 1;
        $scope.showButton = false;
        route_according_to_sequence($scope.sences[$scope.queueNum]);
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

      $scope.$watchCollection('question.userAnswer', function(newValue) {
        if (newValue && newValue[0]) {
          for(var i=0;i<newValue.length;i++){
            if(!newValue[i]){
              $scope.canButtonUsed = false;
              break;
            }else{
              $scope.canButtonUsed = true;
            }
          }
        }
      })

      $scope.$watchCollection('question.answer', function(newValue) {
        if (newValue && newValue[0] && (newValue.length == $scope.question.numAnswers)) {
          $scope.canButtonUsed = true;
        }else{
          $scope.canButtonUsed = false;
        }
      })

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
          $scope.showButton = false;
          $state.go('tabs.listen-test.son', {template: 'listen-to-material'});
        } else if (obj == 'ready-answer') {
          $state.go('tabs.listen-test.son', {template: obj});
        }else{
          $scope.showButton = true;
          $scope.canButtonUsed = false;
          $scope.question = $scope.unit.questions[$scope.qNumber++];
          $state.go('tabs.listen-test.son', {template: obj});
        }
      }

      function make_up_route_sequence(section) {
        var sequence = [];
        angular.forEach(section.units, function(unit) {
          sequence.push(unit);
          sequence.push('ready-answer');
          angular.forEach(unit.questions, function(question) {
            sequence.push('test-question');
          })
        });
        sequence.push('end-test');
        console.log(sequence);
        return sequence;
      }

      $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
          title: '退出提醒',
          template: '还没有完成测试，结果将不会被保存，确认退出？'
        });

        confirmPopup.then(function(res) {
          if (res) {
            $ionicHistory.goBack();
          } else {

          }
        });
      };

      $scope.goBack = function() {
        if ($scope.queueNum == ($scope.sences.length - 1)) {
          $ionicHistory.goBack();
        } else {
          $scope.showConfirm();
        }

      }
    }])

  .controller('answerCtrl', ['$scope', '$stateParams', function($scope, $stateParams) {
    if ($stateParams.template == 'end-test') {
      $scope.resultQuestions = [];
      $scope.resultQuestions = dealQuestions($scope.section);
    }
    function dealQuestions(obj) {
      var question = [];
      angular.forEach(obj.units, function(unit) {
        angular.forEach(unit.questions, function(q) {
          if(q.questionType=='CategoryTable'){
            q.answer= q.userAnswer;
          }
          question.push(q);
        })
      });
      return question;
    }
  }])

  .controller('listenPracticeCtrl', ['$scope', '$ionicHistory', 'sectionService', '$state', 'isTestService', '$stateParams', '$ionicPopup', '$ionicActionSheet', '$timeout',
    function($scope, $ionicHistory, sectionService, $state, isTestService, $stateParams, $ionicPopup, $ionicActionSheet, $timeout) {
      $scope.section = sectionService.section;
      $scope.canButtonUsed = true;//控制跳转按钮可不可用
      $scope.$watchCollection('section', function(newVal) {
        if (newVal.uuid) {
          $scope.sences = make_up_route_sequence($scope.section);
        }
      });
      sectionService.retrieve('sequence');

      /*显示题干，开始做题*/
      $scope.$on('question.sound-complete', function() {
        $scope.canButtonUsed = false;
        $scope.$broadcast('can.againplay.sound', '');
      });

      $scope.practiceView;
      $scope.changeView = function(index) {
        switch (index) {
          case 0:
            if ($scope.practiceView != 'image') {
              $scope.showImage();
            }
            break;
          case 1:
            if ($scope.practiceView != 'question') {
              $scope.canButtonUsed = true;
              $scope.showQuestion();
            }
            break;
          case 2:
            if ($scope.practiceView != 'script') {
              $scope.showScript();
            }
            break;
        }
      }

      $scope.back = function() {
        $scope.canButtonUsed = true;
        $scope.$broadcast('stop.and.disabled', 'stop');
        if ($scope.qNumber > 0) {
          $scope.qNumber--;
          route_according_to_sequence();
        }
      }

      $scope.next = function() {
        $scope.canButtonUsed = true;
        $scope.$broadcast('stop.and.disabled', 'stop');
        if ($scope.qNumber < ($scope.unit.questions.length - 1)) {
          $scope.qNumber++;
          route_according_to_sequence();
        }
      }

      $scope.showImage = function() {
        $scope.practiceView = 'image';
        $scope.$broadcast('can.againplay.sound', '');
        $state.go('tabs.listen-practice.son', {template: 'practice-image'});
      }

      $scope.showScript = function() {
        $scope.practiceView = 'script';
        $scope.$broadcast('can.againplay.sound', '');
        $state.go('tabs.listen-practice.son', {template: 'practice-script'});
      }

      $scope.showQuestion = function() {
        $scope.$broadcast('stop.and.disabled', 'stop');
        $scope.practiceView = 'question';
        route_according_to_sequence($scope.sences[$scope.qNumber]);
      }

      $scope.showViewMenu = function() {
        var hideSheet = $ionicActionSheet.show({
          buttons: [
            {text: '显示图片'},
            {text: '显示问题'},
            {text: '显示原文'}
          ],

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
      //listen queues number
      $scope.continue = function() {
        $scope.practiceView = 'image';
        $scope.showImage();
        $scope.unit = $scope.section.units[0];
      }

      $scope.correctAnswer = [];
      $scope.showAnswer = function() {
        $scope.question.showAnswer = true;
      }

      //now question number
      $scope.qNumber = 0;
      function route_according_to_sequence(obj) {
        $scope.question = $scope.unit.questions[$scope.qNumber];
        $state.go('tabs.listen-practice.son', {template: $scope.sences[$scope.qNumber]});
      }

      function make_up_route_sequence(section) {
        console.log(section);
        var sequence = [];
        angular.forEach(section.units, function(unit) {
          angular.forEach(unit.questions, function(question) {
            sequence.push('practice-question');
          })
        });
        return sequence;
      }

      $scope.testIndex=function(index){
        console.log(index);
      }

      $scope.goBack = function() {
        $ionicHistory.goBack();
      }
    }])


