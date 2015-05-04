//initialize the angular app

var app = angular.module("pillstrApp", ['ngRoute', 'ui.bootstrap', 'pillstrApp.services']);
var apiBaseURL = "http://129.21.62.9:8080/";

angular.module("pillstrApp.services", [])
    .service("$dataService", [
        "$http", function($http) {

            return {
                getRecord: function(url, onSuccess, onError) {
                    onSuccess = onSuccess === undefined ? function() {} : onSuccess;
                    onError = onError === undefined ? function() {} : onError;

                    console.log("GET: " + url);
                    return $http.get(url).success(onSuccess).error(onError)
                        .then(function(result) {
                            return result.data;
                        });
                },

                getAllRecords: function(datatype, onSuccess, onError) {
                    var url = apiBaseURL + datatype;
                    return this.getRecord(url, onSuccess, onError);
                },

                putRecord: function(url, data, onSuccess, onError) {
                    onSuccess = onSuccess === undefined ? function() {} : onSuccess;
                    onError = onError === undefined ? function() {} : onError;
                    console.log("PUT: " + url);

                    return $http({
                        method: 'PUT',
                        url: url,
                        data: data
                    }).success(onSuccess).error(onError);
                },

                getRecordByID: function(datatype, id, onSuccess, onError) {
                    var url = apiBaseURL + datatype + '/' + id;
                    return this.getRecord(url, onSuccess, onError);
                },

                getUserByName: function(username, onSuccess, onError) {
                    var url = apiBaseURL + 'users/-/by-name/'+ username;
                    return this.getRecord(url, onSuccess, onError);
                },

                getRemindersForWeek: function(userId, date, onSuccess, onError) {
                    var url = apiBaseURL + 'users/' + userId + '/all-reminders-for-entire-week/' + date.getFullYear() +
                        '/' + (date.getMonth() + 1) + '/' + date.getDate();
                    return this.getRecord(url, onSuccess, onError);
                },

                getPrescriptions: function(userId, onSuccess, onError) {
                    var url = apiBaseURL + 'prescriptions/-/by-userId/' + userId;
                    return this.getRecord(url, onSuccess, onError);
                },

                putEvent: function(event, onSuccess, onError) {
                    var url = apiBaseURL + 'reminders/' + event.id;
                    return this.putRecord(url, event, onSuccess, onError);
                }
            }
        }
    ]);

//configure app routes
app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/login', {
                templateUrl: 'templates/login.html',
                controller: 'loginController'
            }).
            when('/account', {
                templateUrl: 'templates/account.html',
                controller: 'accountController'
            }).
            when('/home', {
                templateUrl: 'templates/home.html',
                controller: 'homeController'
            }).
            when('/prescriptions', {
                templateUrl: 'templates/prescriptions.html',
                controller: 'prescriptionController'
            }).
            when('/settings', {
                templateUrl: 'templates/settings.html',
                controller: 'settingController'
            }).
            otherwise({
                redirectTo: '/login'
            });
    }]);


//Login controller
app.controller("loginController", function($scope, $location, $http){

    sessionStorage.setItem('auth', false);
    $scope.login = function(){

        var request={
            username : $scope.username,
            password : $scope.password
        };
        console.log(request);

        $http.get(apiBaseURL + 'users/-/check-password/'+request.username+'/'+request.password+'', request).
            success(function(data) {
                $scope.response = data;

                if($scope.response == true){
                    sessionStorage.setItem('currUser', request.username);
                    sessionStorage.setItem('userId', request.userId);
                    $location.path('/home');
                }
                else{
                    $scope.state = false;
                    $scope.username = "";
                    $scope.password = "";
                }
            }).
            error(function(data) {
                console.log("Error occurred in login.");

                $scope.state = false;
                $scope.username = "";
                $scope.password = "";
            });
    };

    $scope.createAcct = function(){
        $location.path('/account');
    }
});

//Create Account controller
app.controller("accountController", function($scope, $location, $http){
    sessionStorage.setItem('contrl', "accountController");
    sessionStorage.setItem('auth', false);
    $scope.createNewAcct = function(){
        var request={
            name : $scope.namE,
            email : $scope.email,
            password : $scope.password,
            username : $scope.username,
            phone : $scope.phone
        };
        var url = apiBaseURL + 'users?name='+request.name+'&email='+request.email+'&password='+request.password+'&username='+request.username+'&phone='+request.phone+'';
       // console.log("url is: " + url);
        $http.post(url).
            success(function(data) {
                $location.path('/home');
                sessionStorage.setItem('auth', true);
                sessionStorage.setItem('currUser', request.username);
            }).
            error(function(data) {
                console.log("Error occurred in creating new account.");
                console.log(data);
                $scope.state = false;
            });
    }
});

//Home controller
app.controller("homeController", function($scope, $http, $dataService){
    sessionStorage.setItem('contrl', "homeController");
    sessionStorage.setItem('auth', true);

    var today = new Date();var today = new Date();
    console.log(today.getDay());
    $scope.days = [
        {
            name: 'Sunday',
            display: 'Su',
            val: 0,
            checked: today.getDay() == 0
        },
        {
            name: 'Monday',
            display: 'Mo',
            val: 1,
            checked: today.getDay() == 1
        },
        {
            name: 'Tuesday',
            display: 'Tu',
            val: 2,
            checked: today.getDay() == 2
        },
        {
            name: 'Wednesday',
            display: 'We',
            val: 3,
            checked: today.getDay() == 3
        },
        {
            name: 'Thursday',
            display: 'Th',
            val: 4,
            checked: today.getDay() == 4
        },
        {
            name: 'Friday',
            display: 'Fr',
            val: 5,
            checked: today.getDay() == 5
        },
        {
            name: 'Saturday',
            display: 'Sa',
            val: 6,
            checked: today.getDay() == 6
        }
    ];

    $scope.takePrescription = function(reminder) {
        //TODO: Need an endpoint for this to work
        //$dataService.putEvent(reminder);
    };

    var username = sessionStorage.getItem('currUser');
    var userPromise = $dataService.getUserByName(username);

    //var userId = 1//sessionStorage.getItem('userId');
    userPromise.then(function(results) {
        var userId = results.id;

        $scope.prescriptions = [];
        $scope.prescriptionsById = {};
        $scope.reminders = [];

        var prescriptionsPromise = $dataService.getPrescriptions(userId,
            function(data) {
                $scope.prescriptions = data;
                for(var i = 0; i < data.length; i++) {
                    $scope.prescriptionsById[data[i].id] = data[i];
                }
            });

        //var reminderUrl = apiBaseURL + 'users/' + userId + '/all-reminders-for-entire-week/' + today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
        prescriptionsPromise.then(function() {
            $dataService.getRemindersForWeek(userId, new Date(),
                function (data) {
                    console.log(data);

                    for (var i = 0; i < data.length; i++) {
                        var date = new Date(data[i].time);
                        data[i].day = date.getDay();
                        data[i].prescription = $scope.prescriptionsById[data[i].prescriptionId];
                    }

                    $scope.reminders = data;
                });
        });
    });
});

//Prescription controller
app.controller("prescriptionController", function($scope, $http, $dataService){
    sessionStorage.setItem('auth', true);

    var username = sessionStorage.getItem('currUser');
    var userPromise = $dataService.getUserByName(username);

    userPromise.then(function(results) {
        var userId = results.id;

        $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
        //sessionStorage.getItem('userId');
        //var userId = $scope.uId;//sessionStorage.getItem('userId');
        console.log(userId);
        var prescriptionUrl = apiBaseURL + 'prescriptions/-/by-userId/' + userId;
        $scope.prescriptions = [];
        $http.get(prescriptionUrl)
            .success(function (data, status, headers, config) {
                console.log("GET: " + prescriptionUrl + " was successful");

                if (status === 204) {
                    console.log("empty result");
                }
                else if (Array.isArray(data)) {
                    $scope.prescriptions = data;
                }
                else {
                    $scope.prescriptions = [data];
                }

                for (var i = 0; i < $scope.prescriptions.length; i++) {
                    var reminderUrl = apiBaseURL + 'events/-/by-prescriptionId/' + $scope.prescriptions[i].id;
                    $scope.prescriptions[i].metaEvents = [];

                    (function (i) {
                        $http.get(reminderUrl)
                            .success(function (data2, status2, headers2, config2) {
                                console.log("GET: " + reminderUrl + " successful");

                                if (status === 204) {
                                    console.log("empty result");
                                    return;
                                }
                                else if (!Array.isArray(data2)) {
                                    data2 = [data2];
                                }

                                for (var y = 0; y < data2.length; y++) {
                                    var match = false;
                                    for (var z = 0; z < $scope.prescriptions[i].metaEvents.length; z++) {
                                        if ($scope.prescriptions[i].metaEvents[z].hour == data2[y].hour &&
                                            $scope.prescriptions[i].metaEvents[z].minutes == data2[y].minutes) {
                                            match = true;
                                            $scope.prescriptions[i].metaEvents[z].days.push(data2[y].day);
                                            $scope.prescriptions[i].metaEvents[z].ids.push(data2[y].id);
                                            break;
                                        }
                                    }
                                    if (!match) {
                                        data2[y].days = [data2[y].day];
                                        data2[y].ids = [data2[y].id];
                                        data2[y].time = new Date(1970, 0, 1, data2[y].hour, data2[y].minute, 0);
                                        $scope.prescriptions[i].metaEvents.push(data2[y]);
                                    }
                                }
                            })
                            .error(function (data, status, headers, config) {
                                console.log("GET: " + reminderUrl + " failed");
                            });
                    })(i);
                }
            })
            .error(function () {
                console.log("GET: " + prescriptionUrl + " error");
            });

        var reminderUrl = apiBaseURL + 'reminders/';
        $scope.reminders = [];

        $scope.isEditing = function (prescription) {
            if (!prescription.hasOwnProperty('editing')) {
                prescription.editing = false;
            }

            return prescription.editing;
        };

        $scope.days = [
            {
                name: 'Sunday',
                display: 'Su',
                val: 0
            },
            {
                name: 'Monday',
                display: 'Mo',
                val: 1
            },
            {
                name: 'Tuesday',
                display: 'Tu',
                val: 2
            },
            {
                name: 'Wednesday',
                display: 'We',
                val: 3
            },
            {
                name: 'Thursday',
                display: 'Th',
                val: 4
            },
            {
                name: 'Friday',
                display: 'Fr',
                val: 5
            },
            {
                name: 'Saturday',
                display: 'Sa',
                val: 6
            }
        ];

        $scope.padTime = function (val) {
            var str = '' + val;
            var pad = '00';
            return pad.substring(0, pad.length - str.length) + str;
        };

        $scope.getTime = function (event) {
            return $scope.padTime(event.hour) + ':' + $scope.padTime(event.minute);
        };

        $scope.toggleDay = function (event, day) {
            var index = event.days.indexOf(day.val);
            if (index >= 0) {
                event.days.splice(index, 1);
            }
            else {
                event.days.push(day.val);
            }
            console.log(event);
        };

        $scope.isDayChecked = function (event, day) {
            return event.days.indexOf(day.val) >= 0;
        };

        $scope.edit = function (prescription) {
            prescription.editing = true;
            prescription.original = JSON.parse(JSON.stringify(prescription));
        };

        $scope.cancelEdit = function (prescription) {
            prescription.confirmingDelete = false;
            if (prescription.isNew) {
                $scope.prescriptions.splice($scope.prescriptions.indexOf(prescription), 1);
            }

            else {
                for (var i = 0; i < prescription.original.metaEvents.length; i++) {
                    prescription.original.metaEvents[i].time = new Date(1970, 0, 1, prescription.original.metaEvents[i].hour, prescription.original.metaEvents[i].minute, 0);
                }

                prescription.editing = false;
                prescription.displayName = prescription.original.displayName;
                prescription.dosage = prescription.original.dosage;
                prescription.quantity = prescription.original.quantity;
                prescription.notes = prescription.original.notes;
                prescription.metaEvents = prescription.original.metaEvents;
                prescription.original = undefined;
            }
        };

        $scope.saveEdit = function (prescription) {
            prescription.confirmingDelete = false;
            var parameters = {
                name: prescription.name,
                userId: prescription.userId,
                displayName: prescription.displayName,
                quantity: prescription.quantity,
                notes: prescription.notes,
                dosage: prescription.dosage,
                remind: prescription.remind
            };

            console.log(parameters);
            prescription.editing = false;

            if (prescription.isNew) {
                var data = JSON.stringify(parameters);
                prescription.isNew = false;

                //$http.post(apiBaseURL + 'prescriptions/', data)
                //    .success(function(){
                //        console.log("POST of new prescription successful");
                //    })
                //    .error(function() {
                //        console.log("POST of new prescription unsuccessful");
                //        console.log("POST of new prescription unsuccessful");
                //    });
                $http({
                    url: apiBaseURL + 'prescriptions',
                    method: 'POST',
                    params: parameters,
                    data: parameters
                }).success(function(data) {
                    console.log(data);
                    prescription.id = data;
                });

            }

            else {
                $http({
                    url: apiBaseURL + 'prescriptions/' + prescription.id,
                    method: 'PUT',
                    params: parameters
                })
                    .success(function () {
                        console.log("PUT of prescription successful");
                    })
                    .error(function () {
                        console.log("PUT of prescription unsuccessful");
                    });
            }

            $http({
                url: apiBaseURL + 'events/-/by-prescriptionId/' + prescription.id,
                method: 'DELETE'
            }).success(function () {

                for (var i = 0; i < prescription.metaEvents.length; i++) {
                    for (var y = 0; y < prescription.metaEvents[i].days.length; y++) {
                        var eventData = {
                            prescriptionId: prescription.id,
                            day: prescription.metaEvents[i].days[y],
                            hour: prescription.metaEvents[i].time.getHours(),
                            minute: prescription.metaEvents[i].time.getMinutes()
                        };
                        console.log(data);

                        $http({
                            url: apiBaseURL + 'events',
                            method: 'POST',
                            data: eventData,
                            params: eventData
                        }).success(function () {
                            console.log('POST of events successful');
                        }).error(function () {
                            console.log('POST of events unsuccessful');
                        })
                    }
                }
            });
        };

        $scope.addPrescription = function () {
            var newPrescription = {
                isNew: true,
                editing: true,
                name: '',
                userId: userId,
                displayName: '',
                quantity: 0,
                notes: '',
                dosage: 0,
                remind: true,
                metaEvents: []
            };
            $scope.prescriptions.push(newPrescription);
        };

        $scope.addEvent = function (prescription) {
            prescription.metaEvents.push({
                prescriptionId: prescription.id,
                days: []
            });
        };

        $scope.removeEvent = function (prescription, event) {
            prescription.metaEvents.splice(prescription.metaEvents.indexOf(event), 1);
        };

        $scope.toggleRemind = function (prescription) {
            $http({
                url: apiBaseURL + 'prescriptions/' + prescription.id,
                method: 'PUT',
                params: {remind: prescription.remind}
            })
        };

        $scope.confirmingDelete = function (prescription) {
            if (prescription.confirmingDelete === undefined) {
                prescription.confirmingDelete = false;
            }

            return prescription.confirmingDelete;
        };

        $scope.deletePrescription = function (prescription) {
            if (prescription.isNew) {
                $scope.prescriptions.splice($scope.prescriptions.indexOf(prescription), 1);
            }
            else {
                $http({
                    url: apiBaseURL + 'prescriptions/' + prescription.id,
                    method: 'DELETE'
                })
                    .success(function () {
                        console.log('DELETE of prescription successful');
                        $scope.prescriptions.splice($scope.prescriptions.indexOf(prescription), 1);
                    })
                    .error(function () {
                        console.log('DELETE of prescription unsuccessful');
                    })

            }
        };
    });
});

//Settings controller
app.controller("settingController", function($scope, $http, $location){
    sessionStorage.setItem('auth', true);
    var username = sessionStorage.getItem('currUser');
    $http.get(apiBaseURL+'users/-/by-name/'+username+'').
        success(function(data) {
            $scope.response = data;
            $scope.uId = $scope.response.id;

            $scope.namE = $scope.response.name;
            $scope.email = $scope.response.email;
            $scope.username = $scope.response.username;
            $scope.password = $scope.response.password;
            $scope.phone = $scope.response.phone;
        }).
        error(function(data) {
            console.log("Error occurred in getting user id.");
        });

    $scope.cancelSettings = function(){
        $location.path('/home');
    };

    $scope.saved = false;
    $scope.saveAcct = function(){
        var request={
            name : $scope.namE,
            email : $scope.email,
            password : $scope.password,
            username : $scope.username,
            phone : $scope.phone
        };
        var url = apiBaseUrl+'users/'+$scope.uId+'?name='+request.name+'&email='+request.email+'&password='+request.password+'&username='+request.username+'&phone='+request.phone+'';
        console.log("url is: " + url);

        $http.put(url).
            success(function(data) {
                $scope.saved = true;
               // $scope.deleteAcct();
            }).
            error(function(data) {
                console.log("Error occurred in saving settings.");
                console.log(data);
            });
        $scope.saved = true;
    };

    $scope.deleteAcct = function(){
        $http.delete(apiBaseUrl+'users/'+$scope.uId+'').
            success(function(data) {
                if($scope.saved == false){
                    $location.path('/login');
                }
                $scope.saved = false;
            }).
            error(function(data) {
                console.log("Error occurred in deleting user.");
            });
    }
});


