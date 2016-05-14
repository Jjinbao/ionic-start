angular.module('app.controllers', ['checklist-model'])

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
        $state.go('tabs.listen-page.son',{template:'listen-to-material',sid:id});
      }
    }])

  .controller('listenQuestionPage',['$scope','$ionicHistory','$compile','sectionService','$state',
    function($scope,$ionicHistory,$compile,sectionService,$state){
      $scope.section=sectionService.section;
      $scope.sences=['question','question'];

      $scope.$watchCollection('section',function(newVal){
        if(newVal.uuid){
          $scope.unit=newVal.units[0];
          $scope.question=newVal.units[0].questions[0];
          $scope.sences=make_up_route_sequence($scope.section);
          //$scope.initView();
          //$scope.continue();
        }
      });
      sectionService.retrieve('listensection');

      /*显示题干，开始做题*/
      $scope.showQuestionBody = false;
      $scope.$on('question.sound-complete', function() {
        $scope.showQuestionBody = true;
      });

      $scope.back=function(){
        //@todo
      }

      $scope.number=-1;
      $scope.continue=function(){
        $scope.number++;
        $scope.question=$scope.section.units[0].questions[$scope.number];
        $state.go('tabs.listen-page.son',{template:$scope.sences[$scope.number]});
        $scope.showQuestionBody = false;
      }

      $scope.goBack=function(){
        console.log($ionicHistory.viewHistory());
        $ionicHistory.goBack();
      }

      function route_according_to_sequence(obj) {
        if (obj instanceof ToeflListeningUnit) {
          $scope.unit = obj;
          //$location.path('/listening/listen-to-material');
        }
      }

      function make_up_route_sequence(section) {
        var sequence = [];
        /*if (section.directions) {
          sequence.push('/listening/directions');
          toolbar_buttons.push({continue: true});
        }
        if (section.putOnHeadsetNotice) {
          sequence.push('/listening/put-on-headset');
          toolbar_buttons.push({continue: true});
        }*/
        angular.forEach(section.units, function(unit) {
          //sequence.push(unit);
          //sequence.push('/listening/ready-to-answer');
          angular.forEach(unit.questions, function(question) {
            sequence.push('question');
          })
        });
        return sequence;
      }
  }])

  .controller('speakQuestionPage',['$scope',function($scope){
    //@for speak part
  }])

  .directive('toeflClock', ['$interval', function($interval) {
    return {
      restrict: 'CE',
      templateUrl: 'templates/toefl-clock.html',
      scope: {},

      controller: ['$scope', function($scope) {
        var elapsed_time, start_time, intervalId;

        // Start a new clock whenever the time limit changes.
        $scope.$watch('timeLimit', function(value) {
          if (value > 0) {
            elapsed_time = 0;
            update_clock_time();
            $scope.enableButton();
          }
        });
        $scope.$watch('startTicking', function(value) {
          if (value) {
            start_time = Date.now();

            // Start ticking and save the timeoutId for canceling
            intervalId = $interval(function() {
              calculate_elapsed_time();
              update_clock_time();
            }, 500);
          }
          else {
            calculate_elapsed_time();
            start_time = null;
            cancel_interval();
          }
        });

        $scope.$on('$destroy', function() {
          cancel_interval();
        });

        var controller = {
          set timeLimit(value) {
            if (value > 0) {
              $scope.timeLimit = 0;
              $scope.timeLimit = value;
            }
          },
          set timeoutEvent(value) {
            $scope.timeoutEvent = value;
          },
          set timeout(fn) {
            $scope.timeout = fn;
          },
          start: function() {
            if (!$scope.startTicking) {
              $scope.startTicking = true;
            }
          },
          pause: function() {
            if ($scope.startTicking) {
              $scope.startTicking = false;
            }
          },
          hide: function() {
            $scope.hideClock();
          }
        };
        $scope.$emit('toefl-clock', controller);
        return controller;

        function cancel_interval() {
          if (intervalId) {
            $interval.cancel(intervalId);
            intervalId = null;
          }
        }

        function calculate_elapsed_time() {
          if (start_time) {
            var current = Date.now();
            elapsed_time += (current - start_time);
            start_time = current;
          }
        }

        function update_clock_time() {
          var remaining_seconds = $scope.timeLimit - Math.round(elapsed_time / 1000);
          if (remaining_seconds <= 0) {
            remaining_seconds = 0;
            cancel_interval();
            $scope.disableButton();
          }
          $scope.showClock(remaining_seconds);

          if (remaining_seconds === 0) {
            if ($scope.timeoutEvent) {
              $scope.$emit($scope.timeoutEvent);
            }
            if ($scope.timeout) {
              $scope.timeout();
            }
          }
        }
      }],

      link: function($scope, element) {
        var hide_clock = false;
        element.css({display: 'none'})
          .find('button')
          .attr('disabled', 'disabled')
          .on('click', function() {
            show_or_hide_time();
          });

        $scope.showClock = function(seconds) {
          element.css({display: 'block'})
            .find('label').text(format_remaining_seconds(seconds));
        };
        $scope.hideClock = function() {
          element.css({display: 'none'});
        };
        $scope.disableButton = function() {
          element.find('button').attr('disabled', 'disabled');
        };
        $scope.enableButton = function() {
          element.find('button').removeAttr('disabled');
        };

        function show_or_hide_time() {
          hide_clock = ! hide_clock;
          if (hide_clock) {
            element.find('label').css({display: 'none'});
            element.find('button').text('SHOW TIME');
          }
          else {
            element.find('label').css({display: null});
            element.find('button').text('HIDE TIME');
          }
        }

        function format_remaining_seconds(num_seconds) {
          var seconds = num_seconds % 60;
          if (seconds < 10) {
            seconds = '0' + seconds;
          }
          var minutes = Math.floor(num_seconds / 60) % 60;
          if (minutes < 10) {
            minutes = '0' + minutes;
          }
          var hours = Math.floor(num_seconds / 3600);
          return hours + ' : ' + minutes + ' : ' + seconds;
        }
      }
    };
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


