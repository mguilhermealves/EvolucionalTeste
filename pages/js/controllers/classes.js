angular.module('meuApp', ["LocalStorageModule"])
    .controller('AlunosController', ['$scope', function($scope, localStorageService) {

        $scope.listar = false;
        $scope.mostrarOpcaoEditar = false;

        var listar = function() {
            var listaAlunos = localStorage.getItem('alunos');
            $scope.listar = true;

            $scope.Alunos = [
                {
                    id: 1,
                    ra: 12346,
                    name:"Nome do aluno 1",
                    degreedId: 1,
                    classId: 1
                },
                {
                    id: 2,
                    ra: 456798,
                    name:"Nome do aluno 2",
                    degreedId: 2,
                    classId: 1
                },
                {
                    id: 3,
                    ra: 752156,
                    name:"Nome do aluno 3",
                    degreedId: 3,
                    classId: 2
                },
                {
                    id: 4,
                    ra: 852348,
                    name:"Nome do aluno 4",
                    degreedId: 4,
                    classId: 2
                },
                {
                    id: 5,
                    ra: 454643,
                    name:"Nome do aluno 5",
                    degreedId: 6,
                    classId: 2
                }
            ];

            if (listaAlunos === null) {
                localStorage.setItem('alunos', JSON.stringify($scope.Alunos));
            } else {
                listaAlunos;
            }
        }

        listar();

        $scope.editarAluno = function(id) {
            console.log(id);
            $scope.idAluno = id;
            $scope.mostrarOpcaoEditar = true;
        }

        $scope.salvarAluno = function(id) {

            var alunos = {
                nNome: $scope.aluno.name,
                nClasse: $scope.aluno.classe,
                nSerie: $scope.aluno.serie,
            }

            var listaAlunos = JSON.parse(localStorage.getItem('alunos'));

            listaAlunos.forEach(item => {
                if (item.id == id) {
                    item.name = alunos.nNome,
                    item.classId = alunos.nClasse,
                    item.degreedId = alunos.nSerie
                }
            });

            localStorage.setItem('alunos', JSON.stringify(listaAlunos));
            $scope.Alunos = listaAlunos;
            console.log(listaAlunos);
        }

        var save = function() {
            localStorage.setItem('todo', JSON.stringify($scope.tasks));
        }

        $scope.add = function() {
            $scope.tasks.push($scope.title);
            save();
        }
        $scope.delete = function() {
            $scope.tasks.splice(this.$index, 1);
            save();
        }

        // load();
        
    }]);