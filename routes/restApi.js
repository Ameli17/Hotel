/**
 * Created by ameliat on 03.04.17.
 */
var express = require('express');
var randomstring = require("randomstring");
var loginUser = express.Router();
var createUser = express.Router();
var newTaskType = express.Router();
var addSubTaskType = express.Router();
var getAllWorkType = express.Router();
var addTasktypeForUser = express.Router();
var createNewTask = express.Router();
var getTaskForUser = express.Router();
var changeTaskType = express.Router();


var mongoose = require('mongoose');

var Model = require('./../models/model');

errorMessage = function (c, m, b) {
    return {
        error: {code: c, message: m, body: b}
    };
};

ok = {status: 'ok'};

MISSING_FIELD = 1;
RECORD_NOT_FOUND = 2;
WRONG_DATA = 3;

TASK_STATUS_CREATED = "TASK_STATUS_CREATED";
TASK_STATUS_CREATED = "TASK_STATUS_IN_PROGRESS";
TASK_STATUS_CREATED = "TASK_STATUS_DONE";

loginUser.post('/', function (req, res, next) {
    if (
        (typeof req.body.login === 'undefined' || req.body.login === null) ||
        (typeof req.body.pass === 'undefined' || req.body.pass === null)
    ) {

        var error = errorMessage(MISSING_FIELD, 'Missing field', {});
        res.json(error);
        return;
    }


    Model.userModel.find({login: req.body.login}, function (err, data) {
        if (err) {
            var error = errorMessage(RECORD_NOT_FOUND, 'error getting user by login' + err);
            res.json(error);
        } else {
            if (data.length == 0) {
                res.send(errorMessage(RECORD_NOT_FOUND), 'error getting user by login', {});
                return;
            }
            tooken = randomstring.generate();
            data[0].tokens.push(tooken);
            data[0].save()
            var response = {
                _id: data[0]._id,
                fullName: data[0].fullName,
                login: data[0].login,
                password: data[0].password,
                isWorker: data[0].isWorker,
                room: data[0].room,
                tooken: tooken
            };
            res.json(response)

        }

    })
});

createUser.post('/', function (req, res, next) {

    if (
        (typeof req.body.fullName === 'undefined' || req.body.fullName === null) ||
        (typeof req.body.login === 'undefined' || req.body.login === null) ||
        (typeof req.body.password === 'undefined' || req.body.password === null) ||
        (typeof req.body.isWorker === 'undefined' || req.body.isWorker === null) ||
        (typeof req.body.room === 'undefined' || req.body.room === null)
    ) {

        var error = errorMessage(MISSING_FIELD, 'Missing field', {});
        res.json(error);
        return;
    }

    if (req.body.login.length < 3) {
        var error = errorMessage(WRONG_DATA, 'login is to short', {});
    }
    if (req.body.password.length < 3) {
        var error = errorMessage(WRONG_DATA, 'password is to short', {});
    }

    saveUserHandler = function (err, data) {

        if (err) {
            var error = Model.errorMessage(Const.ERROR_SAVING, 'Error saving user: ' + err, {});
            res.json(error);
        } else {
            tooken = randomstring.generate();
            data.tokens.push(tooken);
            data.save()
            var response = {
                _id: data._id,
                fullName: data.fullName,
                login: data.login,
                password: data.password,
                isWorker: data.isWorker,
                room: data.room,
                tooken: tooken
            };
            res.json(response)
        }
    };

    saveUser = function () {
        var newUser = new Model.userModel({
            fullName: req.body.fullName,
            login: req.body.login,
            password: req.body.password,
            isWorker: req.body.isWorker,
            room: req.body.room,
        });
        newUser.save(saveUserHandler)
    };

    Model.userModel.find({login: req.body.login}, function (err, userDocs) {
        if (err) {
            var error = errorMessage(RECORD_NOT_FOUND, 'error getting user by login' + err);
            res.json(error);
        } else {
            if (userDocs.length > 0) {
                res.send(errorMessage(WRONG_DATA), 'user alredy exust', {});
                return;
            }
            saveUser();

        }

    });
});

newTaskType.post('/', function (req, res, next) {
    if (
        (typeof req.body.name === 'undefined' || req.body.name === null)
    ) {

        var error = errorMessage(MISSING_FIELD, 'Missing field', {});
        res.json(error);
        return;
    }

    saveTaskHandler = function (err, data) {
        if (err) {
            var error = Model.errorMessage(Const.ERROR_SAVING, 'Error saving net task type: ' + err, {});
            res.json(error);
        } else {
            res.json(ok)
        }
    };

    var taskType = new Model.taskTypesModel({
        name: req.body.name
    });
    taskType.save(saveTaskHandler)

});

addSubTaskType.post('/', function (req, res, next) {

    if (
        (typeof req.body.parentID === 'undefined' || req.body.parentID === null) ||
        (typeof req.body.targetID === 'undefined' || req.body.targetID === null)
    ) {

        var error = errorMessage(MISSING_FIELD, 'Missing field', {});
        res.json(error);
        return;
    }
    console.log(req.body);
    Model.taskTypesModel.find({$or: [{_id: req.body.parentID}, {_id: req.body.targetID}]}, function (err, workTypes) {
        if (err) {
            var error = errorMessage(RECORD_NOT_FOUND, 'error getting parent type' + err);
            res.json(error);
        } else {
            if (workTypes.length != 2) {
                res.send(errorMessage(RECORD_NOT_FOUND, 'error getting parent type' + err));
                return;
            }
            if (workTypes[0]._id != req.body.parentID) {
                var b = list[1];
                list[1] = list[0];
                list[0] = b;
            }
            for (i = 0; i < workTypes[0].subtask.length; i++) {
                if (workTypes[0].subtask[i].id.equals(workTypes[1]._id.id)) {
                    res.json(ok);
                    return
                }
            }

            workTypes[0].subtask.push(workTypes[1]);
            workTypes[0].save();
            res.json(ok);
        }

    });
});

getAllWorkType.get('/', function (req, res, next) {

    Model.taskTypesModel.find({$where: 'this.subtask.length > 1'})
        .select('-__v')
        .populate('subtask', '-__v -subtask')
        .exec(function (err, tasks) {
            if (err) {
                var error = errorMessage(RECORD_NOT_FOUND, 'request error' + err);
                res.json(error);
            } else {
                if (tasks.length == 0) {
                    res.send(errorMessage(RECORD_NOT_FOUND), 'request error', {});
                    return;
                }
                res.json(tasks)

            }

        })
});


addTasktypeForUser.post('/', function (req, res, next) {
    if (
        (typeof req.body.tooken === 'undefined' || req.body.tooken === null) ||
        (typeof req.body.id === 'undefined' || req.body.id === null) ||
        (typeof req.body.types === 'undefined' || req.body.types === null)
    ) {

        var error = errorMessage(MISSING_FIELD, 'Missing field', {});
        res.json(error);
        return;
    }
    Model.userModel.find({_id: req.body.id}, function (err, data) {
        if (err) {
            var error = errorMessage(RECORD_NOT_FOUND, 'error getting user by id' + err);
            res.json(error);
        } else {
            if (data.length == 0) {
                res.send(errorMessage(RECORD_NOT_FOUND), 'error getting user by id', {});
                return;
            }
            var typesID = req.body.types.split(",").map(function (id) {
                return mongoose.Types.ObjectId(id);
            });
            data[0].supportedTasks = typesID;
            data[0].save();
            res.json(ok);
        }

    })
});


createNewTask.post('/', function (req, res, next) {
    if (
        (typeof req.body.tooken === 'undefined' || req.body.tooken === null) ||
        (typeof req.body.id === 'undefined' || req.body.id === null) ||
        (typeof req.body.work === 'undefined' || req.body.work === null)
    ) {
        var error = errorMessage(MISSING_FIELD, 'Missing field', {});
        res.json(error);
        return;
    }
    var newTask = new Model.taskModel({
        taskType: mongoose.Types.ObjectId(req.body.work),
        creator: mongoose.Types.ObjectId(req.body.id),
        status: TASK_STATUS_CREATED
    });
    newTask.save(function (err, data) {
        if (err) {
            var error = Model.errorMessage(Const.ERROR_SAVING, 'Error saving new type: ' + err, {});
            res.json(error);
        } else {
            res.json(ok);
        }
    });
});


getTaskForUser.post('/', function (req, res, next) {
    if (
        (typeof req.body.id === 'undefined' || req.body.id === null)
    ) {
        var error = errorMessage(MISSING_FIELD, 'Missing field', {});
        res.json(error);
        return;
    }

    searchTask = function (request) {
        Model.taskModel.find({$or: request})
            .select('-__v')
            .populate('taskType', '-__v -subtask')
            .populate('creator', '-__v -password -tokens')
            .populate('worker', '-__v -password -tokens')
            .exec(function (err, data) {
                if (err) {
                    var error = errorMessage(RECORD_NOT_FOUND, 'error getting user by login' + err);
                    res.json(error);
                    return;
                }

                result = [];
                for (i = 0; i < data.length; i++) {
                    result.push({
                        id: data[i]._id,
                        taskType: data[i].taskType.name,
                        taskTypeID: data[i].taskType._id,
                        creatorName: data[i].creator.fullName,
                        creatorID: data[i].creator._id,
                        status: data[i].status
                    });
                    if (data[i].worker != undefined || data[i].worker != null) {
                        result[result.length - 1].workerName = data[i].worker.fullName;
                        result[result.length - 1].workerID = data[i].worker._id;
                    }
                }
                res.json(result)
            })
    };

    Model.userModel.find({_id: req.body.id}, function (err, data) {
        if (err) {
            var error = errorMessage(RECORD_NOT_FOUND, 'error getting user by login' + err);
            res.json(error);
        } else {
            if (data.length == 0) {
                res.send(errorMessage(RECORD_NOT_FOUND), 'error getting user by login', {});
                return;
            }
            request = [];
            for (i = 0; i < data[0].supportedTasks.length; i++) {
                request.push({taskType: data[0].supportedTasks[i]})
            }
            searchTask(request);
        }

    })
});


changeTaskType.post('/', function (req, res, next) {
    if (
        (typeof req.body.tooken === 'undefined' || req.body.tooken === null) ||
        (typeof req.body.id === 'undefined' || req.body.id === null) ||
        (typeof req.body.worker === 'undefined' || req.body.worker === null) ||
        (typeof req.body.status === 'undefined' || req.body.status === null)
    ) {
        var error = errorMessage(MISSING_FIELD, 'Missing field', {});
        res.json(error);
        return;
    }

    Model.taskModel.find({_id: req.body.id}, function (err, tasks) {
        if (err) {
            var error = errorMessage(RECORD_NOT_FOUND, 'error getting user by login' + err);
            res.json(error);
        } else {
            if (tasks.length == 0) {
                res.send(errorMessage(WRONG_DATA), 'can not found task', {});
                return;
            }
            tasks[0].worker = req.body.worker;
            tasks[0].status = req.body.status;
            tasks[0].save();
            res.json(ok);
        }

    });
});


module.exports.loginUser = loginUser;
module.exports.createUser = createUser;
module.exports.newTaskType = newTaskType;
module.exports.addSubTaskType = addSubTaskType;
module.exports.getAllWorkType = getAllWorkType;
module.exports.addTasktypeForUser = addTasktypeForUser;
module.exports.createNewTask = createNewTask;
module.exports.getTaskForUser = getTaskForUser;
module.exports.changeTaskType = changeTaskType;