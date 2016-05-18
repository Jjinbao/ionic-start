'use strict';

angular.module('toefl.utils', ['ngAudio'])

  .directive('toeflSound', ['ngAudio', '$interval', function(ngAudio,$interval) {
    return {
      restrict: 'E',
      scope: {
        resource: '<',      // An expression containing the url to the sound file.
        autoPlay: '@',      // string: 'true' or 'false'
        completeEvent: '@', // string: event name.
        complete: '&'       // A function expression.
      },

      link: function($scope, element, attrs) {
        var sound;
        $scope.$watch('resource', function(value) {
          if (value) {
            sound = ngAudio.load(value);

            $scope.autoPlay = attrs.autoPlay ? angular.fromJson(attrs.autoPlay) : true;
            if ($scope.autoPlay) {
              sound.play();
              if(attrs.replayAgain>0){
                var intervalId=$interval(function(){
                  $interval.cancel(intervalId);
                  $scope.$emit('listen.again.notic','listen again complete');
                },attrs.replayAgain)
              }
            }

            sound.complete(function() {
              sound.unbind();
              if (attrs.completeEvent) {
                $scope.$emit(attrs.completeEvent);
              }
              if ($scope.complete) {
                $scope.complete();
              }
            });
          }
        });

        $scope.$on('$destroy', function() {
          if (sound) {
            sound.pause();
            delete sound.audio;
          }
        });
      }
    };
  }])

  .directive('toeflListeningMaterial', ['ngAudio', '$interval', function(ngAudio, $interval) {
    return {
      restrict: 'CE',
      scope: {
        scene: '<',
        sound: '<',
        completeEvent: '@',
        complete: '&'
      },
      templateUrl: 'templates/toefl-listening-material.html',

      link: function($scope, element) {
        $scope.progress = 0.0;

        var sound;
        var intervalId;
        $scope.$watch('sound', function(value) {
          if (value) {
            sound = ngAudio.load(value);
          }
        });

        $scope.$watch('scene', function(value) {
          if (value) {
            element.find('img').on('load', function() {
              if (sound) {
                sound.play();
                intervalId = $interval(function() {
                  $scope.progress = sound.progress;
                }, 500);

                sound.complete(function() {
                  $scope.progress = 1.0;
                  $interval.cancel(intervalId);
                  intervalId = null;

                  sound.unbind();
                  if ($scope.completeEvent) {
                    $scope.$emit($scope.completeEvent);
                  }
                  if ($scope.complete) {
                    $scope.complete();
                  }
                });
              }
            });
          }
        });

        $scope.$on('$destroy', function() {
          if (sound) {
            sound.pause();
            delete sound.audio;
          }
          if (intervalId) {
            $interval.cancel(intervalId);
          }
        });
      }
    };
  }])

  /*.directive('toeflToolbar', [function() {
    return {
      restrict: 'C',
      scope: false,
      templateUrl: 'templates/toefl-toolbar.html',

      compile: function(element) {
        var buttons = angular.element(element).find('button');
        angular.forEach(buttons, function(btn) {
          btn = angular.element(btn);
          var btn_name = btn.attr('name');
          btn.attr('ng-show', "toolbar.hasOwnProperty('" + btn_name + "')")
            .attr('ng-disabled', 'toolbar.' + btn_name + '===false');
        })
      }
    };
  }])*/

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
            //$scope.enableButton();
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
            $scope.$emit('section.timeout');
          }
          $scope.showClock(remaining_seconds);

          if (remaining_seconds === 0) {
            if ($scope.timeoutEvent) {
              console.log($scope.timeoutEvent);

            }
            if ($scope.timeout) {
              console.log('time out');
              $scope.timeout();
            }
          }
        }
      }],

      link: function($scope, element) {
        //var hide_clock = false;
        /*element.css({display: 'none'})
          .find('button')
          .attr('disabled', 'disabled')
          .on('click', function() {
            show_or_hide_time();
          });*/

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

        /*function show_or_hide_time() {
          hide_clock = ! hide_clock;
          if (hide_clock) {
            element.find('label').css({display: 'none'});
            element.find('button').text('SHOW TIME');
          }
          else {
            element.find('label').css({display: null});
            element.find('button').text('HIDE TIME');
          }
        }*/

        function format_remaining_seconds(num_seconds) {
          var seconds = num_seconds % 60;
          if (seconds < 10) {
            seconds = '0' + seconds;
          }
          var minutes = Math.floor(num_seconds / 60) % 60;
          if (minutes < 10) {
            minutes = '0' + minutes;
          }
          return minutes + ' : ' + seconds;
        }
      }
    };
  }])
  .directive('audioPlayer', function() {
    return {
      restrict: 'EA',
      replace: true,
      controller: ['$scope', '$interval', function($scope, $interval) {
        $scope.currentTime = "00 : 00 : 00";
        $scope.audio = document.createElement("audio");
        $scope.shift = 0;
        $scope.iconSwitch = "ion-play";
        $scope.totalTime = "00 : 00 : 00";
        angular.element($scope.audio).attr("src", "http://tingge.yymp3.com/new27/panfan4/1.mp3");
        //audio.play();
        $scope.audio.addEventListener('canplay', function() {
          $scope.totalTime = $scope.format_remaining_seconds($scope.audio.duration);
        }, false);
        var centValue = "1%";
        $scope.progressCent = {"width": centValue};

        $scope.format_remaining_seconds=function(num_seconds) {
          num_seconds=Math.floor(num_seconds)
          var seconds = num_seconds % 60;
          if (seconds < 10) {
            seconds = '0' + seconds;
          }
          var minutes = Math.floor(num_seconds / 60) % 60;
          if (minutes < 10) {
            minutes = '0' + minutes;
          }
          var hours = Math.floor(num_seconds / 3600);
          if (hours < 10) {
            hours = '0' + hours;
          }
          return hours + ' : ' + minutes + ' : ' + seconds;
        };
        $scope.progress=function() {
          console.log("正在播放");
          $scope.currentTime = $scope.format_remaining_seconds($scope.audio.currentTime);
          var centValue = ($scope.audio.currentTime / $scope.audio.duration) * 100 + "%";
          $scope.progressCent = {"width": centValue};
        };
        $interval.cancel($scope.progressTime);
        $scope.switch = function() {

          if ($scope.shift == 0) {
            $scope.shift = 1;
            $scope.iconSwitch = "ion-pause";
            $scope.audio.play();
            $scope.progressTime=$interval($scope.progress, 500);
          } else {
            $scope.shift = 0;
            $scope.iconSwitch = "ion-play";
            $scope.audio.pause();
            $interval.cancel($scope.progressTime);
          }
        };

      }],
      template: '<div class="player-module"><div class="module-circle-switch" on-tap="switch()">' +
      '<div class="module-circle-inner"><div class="circle-inner-black" ><i ng-class="iconSwitch" ' +
      'style="font-size:30px;color: #f0ad4e" ></i></div></div></div><div class="progress-position">' +
      '<div ng-bind="currentTime"></div><swipe></swipe>' +
      '<div ng-bind="totalTime"></div></div></div>',
      link: function(scope, element, attrs) {

      }
    }
  })
  .directive('swipe', function($interval) {
    return {
      restrict: 'EA',
      replace: true,
      controller: ['$scope', '$interval', function($scope, $interval) {

      }],
      template:'<div class="progress progress-style" on-touch="touchdown($event)" ' +
      'on-release="reStartAudio()" on-drag="swipe($event)" > ' +
      '<span class="blue" ng-style="progressCent"></span></div>',
      link: function($scope, element, attrs) {
        $scope.touchdown=function($event){
          $scope.audio.pause();
          var progressWidth=$event.gesture.center.pageX - element[0].offsetLeft;
          var progressAllWidth=element[0].scrollWidth;
          var centValue=(progressWidth/progressAllWidth)*100+"%";
          $scope.progressCent={"width": centValue};
          $scope.audio.currentTime=(progressWidth/progressAllWidth)*$scope.audio.duration;
          $scope.currentTime = $scope.format_remaining_seconds((progressWidth/progressAllWidth)*$scope.audio.duration)
        };
        $scope.reStartAudio=function(){
          if($scope.shift==1){
            $scope.audio.play();
          }
        };
        $scope.swipe=function($event){
          var progressWidth=$event.gesture.center.pageX - element[0].offsetLeft;
          var progressAllWidth=element[0].scrollWidth;
          var centValue=(progressWidth/progressAllWidth)*100+"%";
          $scope.progressCent={"width": centValue};
          $scope.audio.currentTime=(progressWidth/progressAllWidth)*$scope.audio.duration;
          $scope.currentTime = $scope.format_remaining_seconds((progressWidth/progressAllWidth)*$scope.audio.duration)
        };

      }
    }
  })
