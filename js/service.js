'use strict';

angular.module('toefl.service', ['ngResource'])

  .service('sectionService', ['$resource', '$window', function($resource, $window) {
    var section = {};
    return {
      section: section,

      retrieve: function(uuid) {
        angular.copy({}, section);
        return retrieve_by_uuid(uuid);
      },

      submitAnswer: function(uuid, answers) {
        // @todo
      }
    };

    function retrieve_by_uuid(uuid) {
      // @todo
      return $resource('resource/listen.json', {uuid: uuid})
       //return $resource('resource/listening.json', null)
        .get(null, function(value) {
          if (value && value.uuid) {
            if (value.type === 'Reading') {
              value = new ToeflReadingSection(value);
            }
            else if (value.type === 'Listening') {
              value = new ToeflListeningSection(value);
            }
            else if(value.type === 'Speaking'){
              value = new ToeflSpeakingSection(value);
            }
            else if (value.type === 'Writing') {
              value = new ToeflWritingSection(value);
            }

            angular.copy(value, section);
            if (value.hasOwnProperty('title')) {
              $window.document.title = value.title;
            }
          }
        })
    }
  }]);

function ToeflReadingSection(objSection) {
  this.uuid = objSection.uuid;
  this.title = objSection.title;
  this.directions = objSection.directions ? new GeneralIntroduction(objSection.directions) : null;
  this.timeLimit = objSection.timeLimit;

  var passages = [];
  var questions = [null];
  var answers = {};
  var number = 1;
  angular.forEach(objSection.units, function(objUnit) {
    var passage = new ToeflReaddingPassage(objUnit);
    passage.questions.sort(function(a, b) {
      return (a.number - b.number);
    });
    angular.forEach(passage.questions, function(question) {
      question.number = number++;
      question.passage = passage;
      questions.push(question);
      answers[question.uuid] = question.answer;
    });
    passages.push(passage);
  });
  this.units = passages;
  this.answers = answers;
  this.numQuestions = (number - 1);

  this.getQuestion = function(number) {
    return (number > 0 && number < questions.length) ? questions[number] : null;
  };
}

function ToeflListeningSection(objSection) {
  this.uuid = objSection.uuid;
  this.title = objSection.title;
  this.directions = objSection.directions ? new GeneralIntroduction(objSection.directions) : null;
  this.readyToAnswerNotice = objSection.readyToAnswerNotice;
  this.putOnHeadsetNotice = objSection.putOnHeadsetNotice ? new GeneralIntroduction(objSection.putOnHeadsetNotice) : null;
  this.timeLimit = objSection.timeLimit;

  var tasks = [];
  var questions = [null];
  var answers = {};
  var number = 1;
  angular.forEach(objSection.units, function(objUnit) {
    var listening = new ToeflListeningTask(objUnit);
    listening.questions.sort(function(a, b) {
      return (a.number - b.number);
    });
    angular.forEach(listening.questions, function(question) {
      question.number = number++;
      questions.push(question);
      answers[question.uuid] = question.answer;
    });
    tasks.push(listening);
  });
  this.units = tasks;
  this.answers = answers;
  this.numQuestions = (number - 1);

  this.getQuestion = function(number) {
    return (number > 0 && number < questions.length) ? questions[number] : null;
  };
}

/**
 * A reading passage with its questions.
 */
function ToeflReaddingPassage(objPassage) {
  this.uuid = objPassage.uuid;
  this.title = objPassage.title;
  this.body = objPassage.body;
  this.questions = [];

  for (var i = 0; i < objPassage.questions.length; i++) {
    this.questions.push(new ToeflQuestion(objPassage.questions[i]));
  }
}

/**
 * A listening task with its questions.
 */
function ToeflListeningTask(objTask) {
  this.uuid = objTask.uuid;
  this.title = objTask.title;
  this.listeningSound = objTask.listeningSound;
  this.listeningScene = objTask.listeningScene[0];
  this.questions = [];

  for (var i = 0; i < objTask.questions.length; i++) {
    this.questions.push(new ToeflQuestion(objTask.questions[i]));
  }
}

function ToeflQuestion(objQuestion) {
  angular.copy(objQuestion, this);

  var all_answers = []; // array of arrays. Used by is_answered().
  var numAnswers = 0;
  if (this.type === 'CategoryChart' || this.type === 'CategoryTable') {
    var type = this.type;
    angular.forEach(this.answer, function(item) {
      all_answers.push(item.answer);
      numAnswers += item.answer.length;
      if (type === 'CategoryTable') {
        item.answer.length = 0; //@todo
      }
    });
  }
  else {
    all_answers.push(this.answer);
    numAnswers = this.answer.length;
  }

  this.numAnswers = numAnswers;   // Never change this!
  if (this.type == 'MultipleChoice' && this.numAnswers > 1) {
    this.answer.length = 0; // @todo
  }
  this.isAnswered = is_answered;

  function is_answered() {
    var answered = true;
    for (var i = 0; i < all_answers.length; i++) {
      var answer = all_answers[i];
      // For MultipleChoice with multiple answers. @see checklist-model.
      if (answer.length !== numAnswers && all_answers.length === 1) {
        answered = false;
        break;
      }
      // For CategoryTable questions. // @todo
      if (answer.length === 0) {
        answered = false;
        break;
      }
      else if (answer.some(function(value) {
          return !value;
        })) {
        answered = false;
        break;
      }
    }
    return answered;
  }
}

function GeneralIntroduction(objIntro) {
  this.text = objIntro.text;
  this.sound = objIntro.sound;
}

function ToeflSpeakingSection(objSection){
  this.uuid = objSection.uuid;
  this.title = objSection.title;
  this.directions = objSection.directions ? new GeneralIntroduction(objSection.directions) : null;
  var units=[];
  angular.forEach(objSection.units, function(objUnit) {
    var listening = new ToeflSpeakingTask(objUnit);
    units.push(listening);
  });
  this.units = units;
}

function ToeflSpeakingTask(speakingUnit) {
  this.uuid = speakingUnit.uuid;
  this.number=speakingUnit.number;
  this.type=speakingUnit.type;
  this.title = speakingUnit.title;
  this.questionIntro=speakingUnit.questionIntro.text;
  this.questionIntroSound=speakingUnit.questionIntro.sound;
  if(speakingUnit.listeningScene && speakingUnit.listeningScene.length!=0) {
    this.listenScene=speakingUnit.listeningScene[0];
  }
  this.listeningSound=speakingUnit.listeningSound;
  this.preparingTime=speakingUnit.preparingTime;
  this.responseTime=speakingUnit.responseTime;
  this.questionSound=speakingUnit.questionSound;
  this.description=speakingUnit.description;
  if(speakingUnit.readingIntro&&speakingUnit.readingIntro.sound) {
    this.readingIntro=speakingUnit.readingIntro.sound;
  }
  this.readingText=speakingUnit.readingPassage;
  this.readingTime=speakingUnit.readingTime;
}

function ToeflWritingSection(objSection) {

  this.uuid = objSection.uuid;
  this.title = objSection.title;
  this.type = objSection.type;
  this.sequence = [];
  this.unit = objSection.units;
  this.number = objSection.units[0].number;
  this.units = objSection.units;

  if (objSection.units[0]&&objSection.units[1]) {
    this.directions = new GeneralIntroduction(objSection.directions);
    this.Integrated = new GeneralIntroduction(objSection.units[0].questionIntro);
    this.read = new writing_read(objSection.units[0]);
    this.listen = new writing_listen(objSection.units[0]);
    this.writing =new wrting_article(objSection.units[0]);
    this.unit2Directions=new GeneralIntroduction(objSection.units[1].questionIntro);
    this.units2Writing=new wrting_article(objSection.units[1]);
  }
  else {
    if(objSection.units[0].number==1) {
      this.directions = new GeneralIntroduction(objSection.directions);
      this.Integrated = new GeneralIntroduction(objSection.units[0].questionIntro);
      this.read = new writing_read(objSection.units[0]);
      this.listen = new writing_listen(objSection.units[0]);
      this.writing =new wrting_article(objSection.units[0]);
    }
    else {

      this.unit2Directions=new GeneralIntroduction(objSection.units[0].questionIntro);
      this.units2Writing=new wrting_article(objSection.units[0]);
    }
  }


  function writing_read(objIntro) {
    this.readingTime = objIntro.readingTime || "";
    this.readingPassage = objIntro.readingPassage || "";
  }

  function writing_listen(objIntro) {
    this.audio = objIntro.listeningSound || "";
    this.img = objIntro.listeningScene[0] || "";
  }

  function wrting_article(objIntro) {
    this.readingPassage = objIntro.readingPassage || "";
    this.responseTime = objIntro.responseTime||"";
    this.questionSound =objIntro.questionSound||"";
    this.description = objIntro.description||"";
  }

}
