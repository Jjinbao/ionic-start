/**
 * Created by lenovo on 2016/5/16.
 */
angular.module('app.speak-controllers', [])
  .controller('tpoSpeakList', ['$scope', '$ionicHistory', '$state', '$stateParams',
    function($scope, $ionicHistory, $state, $stateParams) {
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
        $state.go('tabs.speak-page.son', {template: 'preload-data', sid: id, tpoid: $stateParams.tid});
      }
    }])

  .controller('speakQuestionPage', ['$scope', '$ionicHistory', 'sectionService', '$location', '$state', '$interval','$stateParams',
    function($scope, $ionicHistory, sectionService, $location, $state, $interval,$stateParams) {
      var speakClock;
      var route_sequence;
      var cursor = -1;
      var selectSound = 0;
      var recording_sequence = ['resource/speak/beep_begin_preparation.mp3', 'resource/speak/beep_begin_response.mp3', 'resource/speak/beep_end_response.mp3'];
      $scope.readWordShow = false;
      $scope.recordTime = '';
      $scope.questionLimit = 0;
      $scope.iconType = "ion-android-bulb";
      $scope.saveDataShow = true;
      $scope.iconTypePlay = false;
      $scope.questionSound = '';
      $scope.goBack = function() {
        if ($scope.timerId) {
          $interval.cancel($scope.timerId);
        }
        $ionicHistory.goBack();
      };
      $scope.section = sectionService.section;
      $scope.$watchCollection('section', function(section) {
        if (section && section.uuid) {
          $scope.unit = $scope.section.units[0];
          route_sequence = make_up_route_sequence($scope.unit);
        }
      });

      sectionService.retrieve('speak3');

      //get clock
      $scope.$on('toefl-clock', function(event, clock) {
        speakClock = clock;
        speakClock.timeout = end_section;
      });

      function end_section() {
        speakClock.hide();
        $scope.continue();
      }

      function showClock() {
        if ($scope.section.uuid) {
          speakClock.timeLimit = $scope.unit.readingTime;
        }
      }

      $scope.readSoundComplete = function() {
        $scope.readWordShow = true;
        speakClock.start();
      }

      $scope.$on('$destory', function(evt) {
        if ($scope.timerId) {
          $interval.cancel($scope.timerId);
        }
      })

      $scope.questionSoundComplete = function() {
        if (selectSound <= (recording_sequence.length - 1) && selectSound != 2) {
          if ($scope.questionSound != recording_sequence[selectSound]) {
            $scope.questionSound = recording_sequence[selectSound];
          } else {
            if (selectSound == 1) {
              $scope.iconType = 'ion-mic-a';
            }
            $scope.recordTime = format_remaining_seconds($scope.questionLimit);
            $scope.timerId = $interval(function() {
              $scope.questionLimit--;
              if ($scope.questionLimit < 0) {
                $interval.cancel($scope.timerId);
                $scope.questionLimit = $scope.unit.responseTime;
                $scope.questionSound = recording_sequence[++selectSound];
              } else {
                $scope.recordTime = format_remaining_seconds($scope.questionLimit);
              }
            }, 1000);
          }
        } else {
          $scope.saveDataShow = false;
        }
      };

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

      function make_up_route_sequence(obj) {
        var sequence = [];
        sequence.push('type-intro');
        if (obj.number == 3 || obj.number == 4) {
          sequence.push('read-material');
          sequence.push('speaking-listen');
        } else if (obj.number == 5 || obj.number == 6) {
          sequence.push('speaking-listen');
        }
        sequence.push('ready-recording');
        return sequence;
      };

      $scope.continue = function() {
        if (route_sequence.length > ++cursor) {
          route_according_to_sequence(route_sequence[cursor]);
        }
        else {
          cursor--;
        }
      };

      function route_according_to_sequence(obj) {
        if (obj == 'read-material') {
          showClock();
        }
        if (obj == 'ready-recording') {
          $scope.questionLimit = $scope.unit.preparingTime;
          $scope.recordTime = format_remaining_seconds($scope.questionLimit);
          $scope.questionSound = $scope.unit.questionSound;
        }
        $state.go('tabs.speak-page.son', {template: obj});
      };
    }
  ])
