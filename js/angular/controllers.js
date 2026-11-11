var app = angular.module('birlWeb', ['ui.ace']);
app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|blob):/);
}]);
app.controller('birlCtrl', function ($scope, $window, birlService) {
    var examples = {
        hello: {code: 'HORA DO SHOW\n    CE QUER VER ESSA PORRA? ("Hello, World! Porra!\\n");\n    BORA CUMPADE 0;\nBIRL', stdin: ''},
        sum: {code: 'HORA DO SHOW\n    MONSTRO A, B;\n    QUE QUE CE QUER MONSTRAO? ("%d %d", &A, &B);\n    CE QUER VER ESSA PORRA? ("Resultado: %d\\n", A + B);\n    BORA CUMPADE 0;\nBIRL', stdin: '13 24'},
        loop: {code: 'HORA DO SHOW\n    MONSTRO M;\n    MAIS QUERO MAIS (M = 0; M < 5; M++)\n        CE QUER VER ESSA PORRA? ("%d\\n", M);\n    BIRL\n    BORA CUMPADE 0;\nBIRL', stdin: ''}
    };
    $scope.selectedExample = 'hello';
    $scope.disabled = false;
    $scope.btText = 'Bora! Executar';
    $scope.hasRun = false;
    $scope.temErro = false;
    $scope.editorOptions = {
        useWrapMode: true, showGutter: true, theme: 'tomorrow_night', mode: 'birl',
        onLoad: function (editor) {
            function syncEditorTheme() {
                editor.setTheme(document.documentElement.getAttribute('data-theme') === 'light'
                    ? 'ace/theme/tomorrow' : 'ace/theme/tomorrow_night');
            }
            syncEditorTheme();
            document.addEventListener('birl-theme-change', syncEditorTheme);
            $scope.$on('$destroy', function () {
                document.removeEventListener('birl-theme-change', syncEditorTheme);
            });
            editor.setOptions({fontSize: '13px', showPrintMargin: false, tabSize: 4, useSoftTabs: true});
            editor.renderer.setPadding(18);
            editor.renderer.setScrollMargin(16, 16);
            editor.commands.addCommand({name: 'runBirl', bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter|Ctrl-Enter'}, exec: function () {
                $scope.$evalAsync($scope.sendBirl);
            }});
            editor.container.setAttribute('aria-label', 'Editor de codigo BIRL');
        }
    };
    $scope.loadExample = function () {
        var example = examples[$scope.selectedExample];
        $scope.code = example.code;
        $scope.stdin = example.stdin;
        $scope.stdout = '';
        $scope.hasRun = false;
        $scope.temErro = false;
    };
    $scope.resetCode = function () {
        if ($scope.code !== examples[$scope.selectedExample].code && !$window.confirm('Restaurar o exemplo? Suas alteracoes no editor serao substituidas.')) return;
        $scope.loadExample();
    };
    $scope.loadExample();
    $scope.sendBirl = function () {
        if ($scope.disabled) return;
        $scope.disabled = true;
        $scope.hasRun = false;
        $scope.btText = 'Executando...';
        $scope.temErro = false;
        $scope.stdout = '';
        birlService.runBirl($scope.code, $scope.stdin).then(function (data) {
            $scope.stdout = data;
        }, function (error) {
            $scope.stdout = error === 'server-error'
                ? 'Nao foi possivel conectar ao servidor BIRL. Tente novamente em instantes ou baixe seu codigo para continuar depois.'
                : 'Erro de compilacao, cumpade. Revise a sintaxe do seu codigo e tente novamente.';
            $scope.temErro = true;
        }).finally(function () {
            $scope.disabled = false;
            $scope.hasRun = true;
            $scope.btText = 'Bora! Executar';
        });
    };
    var url = $window.URL || $window.webkitURL;
    $scope.$watch('code', function (code) {
        if ($scope.fileUrl) url.revokeObjectURL($scope.fileUrl);
        $scope.fileUrl = url.createObjectURL(new Blob([code || ''], {type: 'text/plain;charset=utf-8'}));
    });
    $scope.$on('$destroy', function () {
        if ($scope.fileUrl) url.revokeObjectURL($scope.fileUrl);
    });
});
app.service('birlService', function ($http, $q) {
    this.runBirl = function (code, stdin) {
        return $http.post('https://birl.herokuapp.com/compile', {code: code, stdin: stdin}, {timeout: 20000}).then(function (response) {
            if (response.data.error) return $q.reject('compile-error');
            return response.data.stdout;
        }, function () { return $q.reject('server-error'); });
    };
});

// Keep the enhanced select synchronized with Angular's existing ngModel/change flow.
app.directive('birlSelect2', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            var pending = $timeout(function () {
                element.select2({
                    theme: 'birl',
                    width: '170px',
                    minimumResultsForSearch: Infinity,
                    dropdownAutoWidth: true
                });
                element.on('change.birlSelect2', function () {
                    scope.$evalAsync(function () {
                        if (ngModel.$viewValue !== element.val()) {
                            ngModel.$setViewValue(element.val());
                        }
                    });
                });
            }, 0);
            var unwatch = scope.$watch(attrs.ngModel, function () {
                if (element.data('select2')) {
                    element.val(ngModel.$viewValue).trigger('change.select2');
                }
            });
            scope.$on('$destroy', function () {
                $timeout.cancel(pending);
                unwatch();
                element.off('.birlSelect2');
                if (element.data('select2')) element.select2('destroy');
            });
        }
    };
}]);
