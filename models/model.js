/**
 * Created by yura on 10.02.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    fullName:String,
    login: String,
    password: String,
    isWorker: Boolean,
    supportedTasks: [],
    room:String,
    task: [{type: Schema.Types.ObjectId, ref: 'task'}],
    tokens:[String]
});

var taskTypesSchema = new Schema({
    name: String,
    subtask: [{type: Schema.Types.ObjectId, ref: 'taskTypes'}]
});

var taskSchema = new Schema({
    taskType: {type: Schema.Types.ObjectId, ref: 'taskTypes'},
    creator: {type: Schema.Types.ObjectId, ref: 'user'},
    worker: {type: Schema.Types.ObjectId, ref: 'user'},
    status: String
});

module.exports.userModel = mongoose.model('user', userSchema);
module.exports.userSchema = userSchema;

module.exports.taskTypesModel = mongoose.model('taskTypes', taskTypesSchema);
module.exports.taskTypesSchema = taskTypesSchema;

module.exports.taskModel = mongoose.model('task', taskSchema);
module.exports.taskSchema = taskSchema;

