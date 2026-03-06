// MongoDB initialization script
// Creates initial admin user for the application

db = db.getSiblingDB('taskmanager');

db.createCollection('users');
db.createCollection('tasks');

print('Database initialized successfully');
