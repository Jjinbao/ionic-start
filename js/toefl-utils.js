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
                  $scope.progress = {'width':Math.floor(sound.progress*100)+'%'};
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

  .directive('audioPlayer', function($location) {
    return {
      restrict: 'EA',
      replace: true,
      scope:{
        audioUrl:'<'
      },
      controller: ['$scope', '$interval', function($scope, $interval) {
        $scope.currentTime = "00 : 00";
        $scope.audio = document.createElement("audio");
        $scope.canPlayButtonUsed=true;

        $scope.shift = 0;
        $scope.iconSwitch = "ion-play";
        $scope.totalTime = "00 : 00";

        $scope.$watch('audioUrl', function(value) {
          if(value){
            $scope.audioUrl=value;
            angular.element($scope.audio).attr("src",$scope.audioUrl);
          }
        })
          var firstCanPlay=true;
          //when the sound can play
          $scope.audio.addEventListener('canplay', function() {
            if(firstCanPlay) {
              firstCanPlay=false;
              $scope.totalTime = $scope.format_remaining_seconds($scope.audio.duration);
              $scope.switch();
            }
          }, false);

          //play end
          $scope.audio.addEventListener('ended',function(){
            $scope.shift=0;
            $scope.iconSwitch = "ion-play";
            $interval.cancel($scope.progressTime);
            $scope.audio.currentTime=0;
          });

          var centValue = "0%";
          $scope.progressCent = {"width": centValue};

          $scope.format_remaining_seconds=function(num_seconds) {
            num_seconds=Math.floor(num_seconds);
            var seconds = num_seconds % 60;
            if (seconds < 10) {
              seconds = '0' + seconds;
            }
            var minutes = Math.floor(num_seconds / 60) % 60;
            if (minutes < 10) {
              minutes = '0' + minutes;
            }
            return minutes + ' : ' + seconds;
          };

          $scope.progress=function() {
            $scope.currentTime = $scope.format_remaining_seconds($scope.audio.currentTime);
            var centValue = ($scope.audio.currentTime / $scope.audio.duration) * 100 + "%";
            $scope.progressCent = {"width": centValue};
          };

          $scope.switch = function() {
            if($scope.canPlayButtonUsed){
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
            }
          };

        //stop and can't play sound
        $scope.$on('stop.and.disabled',function(evt,data){
          if($scope.shift==1){
            $scope.switch();
          }
          $scope.canPlayButtonUsed=false;
        });

        //user can play sound
        $scope.$on('can.againplay.sound',function(evt,data){
          $scope.canPlayButtonUsed=true;
        })


        $scope.$on('$destroy', function() {
          if ($scope.audio) {
            $scope.audio.pause();
          }

          if($scope.progressTime){
            $interval.cancel($scope.progressTime);
          }
        });


      }],
      templateUrl: 'templates/listen/audio-player.html',
      link: function(scope, element, attrs) {
      }
    }
  })
  .directive('swipe', function($location,$interval) {
    return {
      restrict: 'EA',
      replace: true,
      template:'<div class="progress" on-touch="touchdown($event)" ' +
      'on-release="reStartAudio()" on-drag="swipe($event)" > ' +
      '<span class="orange" ng-style="progressCent"></span></div>',
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
