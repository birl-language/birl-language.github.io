var app = angular.module("workSite", ["flexcalendar", "ng-slide-down"]);

//CONFIG

app.config(function ($translateProvider) {
  $translateProvider.translations('pt', {
      JANUARY: 'Janeiro',
      FEBRUARY: 'Fevereiro',
      MARCH: 'Março',
      APRIL: 'Abril',
      MAI: 'Maio',
      JUNE: 'Junho',
      JULY: 'Julho',
      AUGUST: 'Agosto',
      SEPTEMBER: 'Setembro',
      OCTOBER: 'Outubro',
      NOVEMBER: 'Novembro',
      DECEMBER: 'Dezembro',

      SUNDAY: 'Domingo',
      MONDAY: 'Segunda',
      TUESDAY: 'Terça',
      WEDNESDAY: 'Quarta',
      THURSDAY: 'Quinta',
      FRIDAY: 'Sexta',
      SATURDAY: 'Sábado'
  });
  $translateProvider.preferredLanguage('pt');
});

//CONTROLLERS

app.controller("proxCtrl", function($scope, fetchEventos, partnerService, formService) {

    moment.locale("pt-br");
    $scope.getIcon = partnerService.getIcon;
    $scope.getColor = partnerService.getColor;
    $scope.getBorderColor = partnerService.getBorderColor;
    $scope.listevents = [];
    $scope.showingNext = true;
    $scope.curdate = null;

    //opções do flex-calendar
    $scope.options = {
        minDate: "2016-01-01",
        maxDate: "2019-12-31",
        dateClick: function(date) { // called every time a day is clicked
          $scope.showingNext = false;
          $scope.listevents = date.event;
          $scope.curdate = moment(date.date).format("LL");
        }
    };

    $scope.showNext = function() {
        $scope.showingNext = true;
        $scope.listevents = $scope.nextevents;
    }

    //Carregar eventos
    fetchEventos.fetchTudo().then(function(data) {
        var events = [];
        // o flex-calendar exige preparação: um atributo chamado date, padrão YYYY-MM-DD
        // e ainda por cima tem um bug que as datas aparecem um dia antes do correto
        for (var x in data) {
            var evento = data[x];
            evento.date = moment(evento.data, "DD/MM/YYYY").add(1, "days").format("YYYY-MM-DD");
            evento.eventClass = partnerService.getEventColor(evento.classe);
            events.push(evento);
        }
        $scope.events = events;
    });

    fetchEventos.fetchFuturos().then(function(data) {
        //vamos adicionar o atributo dates aqui tambem,
        //é usado na ordenação.
        var events = [];
        for (var x in data) {
            var evento = data[x];
            evento.date = moment(evento.data, "DD/MM/YYYY").add(1, "days").format("YYYY-MM-DD");
            evento.eventClass = partnerService.getEventColor(evento.classe);
            events.push(evento);
        }
        $scope.nextevents = events;
        $scope.listevents = events;
        console.log($scope.listevents);
    });

    //Opções do modal
    $scope.sAlert = false;
    $scope.sSuccess = false;

    //chamado ao abrir um modal novo
    $scope.makeModal = function(evento) {
        $scope.curvento = evento;
        $scope.sAlert = false;
        $scope.sSuccess = false;
        $scope.feedback = "";
    }

    $scope.sendFeed = function() {
        if(!$scope.feedback) {
            $scope.sSuccess = false;
            $scope.sAlert = true;
        }
        else {
            $scope.sAlert = false;
            $scope.sSuccess = true;
            data = {};
            data.feedback = $scope.feedback;
            data.palestra = $scope.curvento.nome;
            formService.sendForm(data, "Feedback de Palestra");
            $scope.feedback = "";
        }

    }

    //verifica se o evento do modal já passou pra poder exibir o feedback
    $scope.isPast = function() {
        if($scope.curvento) {
            var date = moment($scope.curvento.data, "DD/MM/YYYY");
            //seta a hora para 19 para que o form de feedback só fique disponivel a noite
            date.hours(19);
            return date.isBefore(moment(), "hour");
        }
        return false;
    }
});

app.controller("candiCtrl", function($scope, formService) {
    $scope.form = {};
    $scope.sButton = true;
    $scope.sFormInit = false; //para que não apareça antes da hora
    $scope.sForm = false;
    $scope.sError = false;
    $scope.sOk = false;

    $scope.showForm = function() {
        $scope.sForm = true;
        $scope.sFormInit = true;
        $scope.sButton = false;
    }

    $scope.submitForm = function() {
        if(!$scope.form.nome && !$scope.form.email && !$scope.form.assunto && !$scope.form.detalhes)
            $scope.sError = true;
        else {
            $scope.sError = false;
            var data =  { nome: $scope.form.nome, 
                          mail: $scope.form.mail,
                          assunto: $scope.form.assunto,
                          detalhes: $scope.form.detalhes
                        };
            formService.sendForm(data, "Inscrição de Palestrante").then(function(){
                $scope.sForm = false;
                $scope.sOk = true;
                $scope.form = {};
            });
        }
    }
});

app.controller("pedirCtrl", function($scope, formService) {
    $scope.form = {};
    $scope.sButton = true;
    $scope.sFormInit = false; //para que não apareça antes da hora
    $scope.sForm = false;
    $scope.sError = false;
    $scope.sOk = false;

    $scope.showForm = function() {
        $scope.sForm = true;
        $scope.sFormInit = true;
        $scope.sButton = false;
    }

    $scope.submitForm = function() {
        if(!$scope.form.nome && !$scope.form.tema && !$scope.form.detalhes)
            $scope.sError = true;
        else {
            $scope.sError = false;
            var data =  { nome: $scope.form.nome, 
                          tema: $scope.form.tema,
                          detalhes: $scope.form.detalhes
                        };
            formService.sendForm(data, "Pedido de Palestra").then(function(){
                $scope.sForm = false;
                $scope.sOk = true;
                $scope.form = {};
            });
        }
    }
});

app.controller("listaCtrl", function($scope, fetchEventos, partnerService, formService){
    fetchEventos.fetchLista().then(function(data) {
        $scope.events = data;
    });

    $scope.sAlert = false;
    $scope.sSuccess = false;
    $scope.getColor = partnerService.getColor;
    $scope.getBackColor = partnerService.getBackColor;
    $scope.getBorderColor = partnerService.getBorderColor;

    //chamado ao abrir um modal novo
    $scope.makeModal = function(evento) {
        $scope.curvento = evento;
        $scope.sAlert = false;
        $scope.sSuccess = false;
        $scope.feedback = "";
    }

    $scope.sendFeed = function() {
        if(!$scope.feedback) {
            $scope.sSuccess = false;
            $scope.sAlert = true;
        }
        else {
            $scope.sAlert = false;
            $scope.sSuccess = true;
            data = {};
            data.feedback = $scope.feedback;
            data.palestra = $scope.curvento.nome;
            formService.sendForm(data, "Feedback de Palestra");
            $scope.feedback = "";
        }

    }

    //verifica se o evento do modal já passou pra poder exibir o feedback
    $scope.isPast = function() {
        if($scope.curvento) {
            var date = moment($scope.curvento.data, "DD/MM/YYYY");
            //seta a hora para 19 para que o form de feedback só fique disponivel a noite
            date.hours(19);
            return date.isBefore(moment(), "hour");
        }
        return false;
    }
});

//SERVICES

app.service("fetchEventos", function($http, $q) {
    this.fetchLista = function() {
        var deferred = $q.defer();
        $http.get("events.json").then(function(data) {
            var lista = [];
            for (var x in data.data) {
                var evento = data.data[x];
                if(moment(evento.data, "DD/MM/YYYY").isBefore(moment(), "day")) {
                    evento.date = moment(evento.data, "DD/MM/YYYY").format("YYYY-MM-DD");
                    lista.push(evento);
                }
            }
            deferred.resolve(lista);
        });
        return deferred.promise;
    }

    this.fetchFuturos = function() {
        var deferred = $q.defer();
        $http.get("events.json").then(function(data) {
            var lista = [];
            for (var x in data.data) {
                var evento = data.data[x];
                if(moment(evento.data, "DD/MM/YYYY").isSameOrAfter(moment(), "day")) {
                    lista.push(evento);
                }
            }
            deferred.resolve(lista);
        });
        return deferred.promise;
    }

    this.fetchTudo = function() {
        var deferred = $q.defer();
        $http.get("events.json").then(function(data) {
            deferred.resolve(data.data);
        });
        return deferred.promise;
    }
});

app.service("partnerService", function() {
    this.getColor = function(classe) {
        switch(classe) {
            case "nubank":
                return "purple";
            case "hardware":
                return "teal";
            case "gamedev":
                return "orange";
            default:
                return "gray";
        }
    }

    this.getBackColor = function(classe) {
        return this.getColor(classe)+"-back";
    }

    this.getEventColor = function(classe) {
        return this.getColor(classe)+"-event";
    }

    this.getBorderColor = function(classe) {
        return this.getColor(classe)+"-border";
    }

    this.getIcon = function(classe) {
        switch(classe) {
            case "nubank":
                return "fa-credit-card";
            case "hardware":
                return "fa-gears";
            case "gamedev":
                return "fa-gamepad";
            default:
                return "fa-lightbulb-o"; //classe falsa, não existe
        }
    }
});

app.service("formService", function($http, $q) {
    this.sendForm = function(data, subject) {
        var deferred = $q.defer();
        data._subject = subject;
        $http({
            url: "http://formspree.io/workshop@ime.usp.br",
            data: data,
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        }).then(function(){
            deferred.resolve();
        });
        return deferred.promise;
    }
});
