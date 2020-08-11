import {ObjectId} from 'bson';

class Task {
  constructor({
    partition,
    id = new ObjectId(),
    name,
    status = Task.STATUS_OPEN,
    assignee,
    department,
    version = 0,
    updatedAt = new Date(),
  }) {
    this._partition = partition;
    this._id = id;
    this.name = name;
    this.status = status;
    this.assignee = assignee;
    this.department = department;
    this.version = version;
    this.updatedAt = updatedAt;
  }

  static STATUS_OPEN = 'Open';
  static STATUS_IN_PROGRESS = 'InProgress';
  static STATUS_COMPLETE = 'Complete';

  static schema = {
    name: 'Task',
    properties: {
      _id: 'objectId',
      _partition: 'string',
      assignee: 'objectId?',
      department: 'Department?',
      name: 'string',
      status: 'string',
      version: 'int?',
      updatedAt: 'date?',
    },
    primaryKey: '_id',
  };
}
//   static schema = {
//     name: 'Task',
//     properties: {
//       _id: 'objectId',
//       _partition: 'string',
//       name: 'string',
//       status: 'string',
//       user: {
//         name: 'Task_user',
//         properties: {
//           _id: 'objectId?',
//           _partition: 'string?',
//           name: 'string?',
//           user_id: 'string?',
//         },
//         primaryKey: '_id',
//       },
//     },
//     primaryKey: '_id',
//   };
// }

class User {
  constructor({
    id = new ObjectId(),
    partition,
    image = 'u1',
    name,
    user_id = 'u1',
  }) {
    this._id = id;
    this._partition = partition;
    this.image = image;
    this.name = name;
    this.user_id = user_id;
  }

  static schema = {
    name: 'User',
    properties: {
      _id: 'objectId',
      _partition: 'string',
      image: 'string?',
      name: 'string',
      user_id: 'string',
    },
    primaryKey: '_id',
  };
}
class Department {
  constructor({id = new ObjectId(), partition, name}) {
    this._id = id;
    this._partition = partition;
    this.name = name;
  }

  static schema = {
    name: 'Department',
    properties: {
      _id: 'objectId',
      _partition: 'string',
      name: 'string',
    },
    primaryKey: '_id',
  };
}

class TaskTemp extends Task {
  static schema = {
    name: 'Task_Temp',
    properties: {
      _id: 'objectId',
      _partition: 'string',
      assignee: 'objectId?',
      department: 'Department?',
      name: 'string',
      status: 'string',
    },
    primaryKey: '_id',
  };
}

export {Task, User, Department, TaskTemp};
