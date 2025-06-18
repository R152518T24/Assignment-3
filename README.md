# 📝 Todo App API + UI Documentation

This is a simple multi-user Todo application built with Node.js, Express, MongoDB, and EJS for UI rendering. It includes user authentication, task management, and a clean user interface.

---

##  Authentication Endpoints

## UI Routes
GET /register → Register page

POST /register → Submit registration

GET /login → Login page

POST /login → Submit login

## Task Views
GET /tasks → Show user's task dashboard

POST /tasks → Create new task from UI

POST /tasks/:id?_method=PUT → Update task status via UI form

Other endpoints are included in the postman collection
