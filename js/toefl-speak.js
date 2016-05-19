/**
 * Created by lenovo on 2016/5/16.
 */
angular.module('app.speak-controllers', [])
  .controller('tpoSpeakList', ['$scope', '$ionicHistory', '$location', '$state', '$stateParams',
    function($scope, $ionicHistory, $location, $state, $stateParams) {
      //console.log($location.url());
      $scope.navTime = false;
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
        /*if (id == 1 || id == 2) {
          $state.go('tabs.speak-page.son', {template: 'ready-recording', sid: id,tpoid});//嵌套跳转
        }
        if (id == 3 || id == 4) {
          $state.go('tabs.speak-page.son', {template: 'read-material', sid: id});//嵌套跳转
        }
        if (id == 5 || id == 6) {
          $state.go('tabs.speak-page.son', {template: 'speaking-listen', sid: id});//嵌套跳转
        }
        $scope.id = id;*/
        $state.go('tabs.speak-page.son', {template: 'ready-recording', sid: id, tpoid:$stateParams.tid});
      }
    }])

  .controller('speakQuestionPage', ['$scope', '$ionicHistory', 'sectionService', '$location', '$state',
    function($scope, $ionicHistory, sectionService, $location, $state) {
      //console.log($location.search().id)

      var speakClock;
      var route_sequence;
      var sequence = [];
      var cursor = -1;
      var selectSound = 1;
      $scope.readWordShow = false;
      $scope.iconType = "ion-android-bulb";
      $scope.saveData = false;
      $scope.iconTypePlay = false;
      $scope.goBack = function() {
        $ionicHistory.goBack();
      };
      //get data
      $scope.$watchCollection('section', function(section) {
        if (section && section.uuid) {
          $scope.unit = $scope.section.units[0];
          console.log($scope.unit);
          route_sequence = make_up_route_sequence(section);
          $scope.continue();
        }
      });
      $scope.section = sectionService.section;
      sectionService.retrieve('speak3');

      //get clock
      $scope.$on('toefl-clock', function(event, clock) {
        speakClock = clock;
        $scope.clockSignal = 1;
      });

      var make_up_route_sequence = function() {
        //console.log($scope.id);

        //题型一
        if (2 == 1) {
          sequence.push('ready-recording');
          return sequence;
        }
        //题型二
        if (2 == 2) {
          sequence.push('read-material');
          sequence.push('speaking-listen');
          sequence.push('ready-recording');
          return sequence;
        }
        //题型三
        if (2 == 1) {
          sequence.push('speaking-listen');
          sequence.push('ready-recording');
          return sequence;
        }

      };//make sequence

      $scope.continue = function() {
        if (route_sequence.length > ++cursor) {
          route_according_to_sequence(route_sequence[cursor]);
        }
        else {
          cursor--;
        }
      };//next route
      $scope.speakReadSoundEnd = function() {
        $scope.readWordShow = true;
        speakClock.start();
        speakClock.timeout = function() {
          $scope.navTime = false;
          $scope.continue();
        }
      };
      $scope.changeSoundAndIcon = function() {
        recordingViewSoundEnd();
      };//recording complate
      var route_according_to_sequence = function(obj) {
        if (cursor == 0) {
          $scope.$watch('clockSignal', function(newVal) {
            if (newVal == 1) {

              if (obj == 'read-material') {
                speakClock.timeLimit = $scope.unit.readingTime;
                $scope.navTime = true;
              } else if (obj == 'ready-recording') {
                recordingView();
              }
            }


            //if(newVal==1){
            //  recordingView();
            //}
          });
        } else if (cursor == 1) {
          $scope.$watch('clockSignal', function(newVal) {
            if (newVal == 1) {
              if (obj == 'ready-recording') {
                recordingView();
              }
            }

          })
        } else if (cursor == 2) {
          $scope.$watch('clockSignal', function(newVal) {
            if (newVal == 1) {
              if (obj == 'ready-recording') {
                recordingView();
              }
            }
          });
        }

        $state.go('tabs.speak-page.son', {template: obj});
      }//recording
      var recordingView = function() {
        //$scope.selectSoundFile="resource/speak/beep_begin_preparation.mp3";
        $scope.selectSoundFile = $scope.unit.questionSound;
        speakClock.timeLimit = $scope.unit.preparingTime;
        $scope.clockSignal = 0;
        //speakClock.start();
        speakClock.timeout = function() {
          //alert("倒计时完成");
          if (selectSound == 3) {
            $scope.selectSoundFile = 'resource/speak/beep_begin_response.mp3';
            speakClock.timeLimit = $scope.unit.responseTime;
          } else if (selectSound == 4) {
            $scope.selectSoundFile = 'resource/speak/beep_end_response.mp3';
          }
        }
      };

      var recordingViewSoundEnd = function() {
        if (selectSound == 1) {
          $scope.selectSoundFile = 'resource/speak/beep_begin_preparation.mp3';
          //speakClock.start();
          selectSound++;
        } else if (selectSound == 2) {
          speakClock.start();
          selectSound++;
        } else if (selectSound == 3) {
          $scope.iconType = "ion-android-microphone";
          speakClock.start();
          selectSound++;
        } else if (selectSound == 4) {
          $scope.iconType = false;
          $scope.iconTypePlay = "ion-play";
          var toggleButton = 0;
          $scope.togglePlay = function() {
            if (toggleButton == 0) {
              $scope.iconTypePlay = "ion-pause";
              toggleButton = 1;
            } else if (toggleButton = 1) {
              $scope.iconTypePlay = "ion-play";
              toggleButton = 0;
            }
          };
          speakClock.hide();
          $scope.saveData = true;
        }
      }
    }
  ])
  .directive('speakClock', ['$interval', function($interval) {
    return {
      restrict: 'CE',
      templateUrl: 'templates/toefl-clock.html',
      scope: {},
      controller: ['$scope', function($scope) {
        $scope.timeLimit = 0;
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
            console.log($scope.startTicking);


            if ($scope.timeLimit > 0 && !$scope.startTicking) {
              console.log("zuo");
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
          },
          getRemainingTime: function() {
            return Math.max(($scope.timeLimit - Math.round(elapsed_time / 1000)), 0);
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
            $scope.startTicking = false;
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
        element.css({display: 'block'})
          .find('button')
          .attr('disabled', 'disabled')
          .on('click', function() {
            show_or_hide_time();
          });

        $scope.showClock = function(seconds) {
          element.css({display: 'inline'})
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
          hide_clock = !hide_clock;
          if (hide_clock) {
            element.find('label').css({display: 'none'});
            element.find('button').text('SHOW TIME');
          }
          else {
            element.find('label').css({display: 'inline'});
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
          var hours = '0' + Math.floor(num_seconds / 3600);
          return hours + ' : ' + minutes + ' : ' + seconds;
        }
      }
    };

  }]);
