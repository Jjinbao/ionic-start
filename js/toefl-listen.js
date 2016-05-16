angular.module('app.listen-controllers', ['checklist-model'])

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
        $state.go('tabs.listen-page.son',{template:'preload-data',sid:id});
      }
    }])

  .controller('listenQuestionPage',['$scope','$ionicHistory','$compile','sectionService','$state','isTestService',
    function($scope,$ionicHistory,$compile,sectionService,$state,isTestService){
      $scope.section=sectionService.section;
      $scope.testType=isTestService;
      $scope.showButton=false;
      $scope.showQuestionBody = false;
      $scope.$watchCollection('section',function(newVal){
        if(newVal.uuid){
          $scope.sences=make_up_route_sequence($scope.section);
          console.log($scope.sences);
        }
      });
      sectionService.retrieve('listensection');

      /*显示题干，开始做题*/
      $scope.$on('question.sound-complete', function() {
        $scope.showQuestionBody = true;
      });

      $scope.$on('listen.again.notic',function(evt,data){
        if ($scope.question.questionStartPoint > 0 && $scope.question.listenAgainNotice) {
          delete $scope.question.listenAgainNotice;
        }
      })

      $scope.back=function(){
        //@todo
      }

      $scope.next=function(){
        //@todo
      }

      //listen queues number
      $scope.queueNum=-1;
      $scope.continue=function(){
        if($scope.sences.length>++$scope.queueNum){
          route_according_to_sequence($scope.sences[$scope.queueNum]);
        }
        $scope.showQuestionBody = false;
      }


      //now question number
      $scope.qNumber=0;
      function route_according_to_sequence(obj) {
        if (obj instanceof ToeflListeningTask) {
          $scope.unit = obj;
          $scope.qNumber=0;
          $state.go('tabs.listen-page.son',{template:'listen-to-material'});
        }else{
          $scope.showButton=true;
          $scope.question=$scope.unit.questions[$scope.qNumber++];
          $state.go('tabs.listen-page.son',{template:obj});
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
          sequence.push(unit);
          angular.forEach(unit.questions, function(question) {
            sequence.push('question');
          })
        });
        sequence.push('end-test');
        return sequence;
      }

      //就特么是返回
      $scope.goBack=function(){
        console.log($ionicHistory.viewHistory());
        $ionicHistory.goBack();
      }
  }])

  .controller('listenMaterialCtrl',['$scope','$ionicHistory',function($scope,$ionicHistory){

  }])
  .controller('answerQuestionctrl',['$scope','$ionicHistory',function($scope,$ionicHistory){


  }])



