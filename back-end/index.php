<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$request = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

$request = str_replace('/project/back-end', '', $request);

$url_parts = parse_url($request);
$path = $url_parts['path'];
$query_params = [];
if (isset($url_parts['query'])) {
    parse_str($url_parts['query'], $query_params);
}

require_once 'controller/StudentController.php';
require_once 'controller/AuthenticationController.php';
require_once 'controller/TaskController.php';

$studentController = new StudentController();
$authController = new AuthenticationController();
$taskController = new TaskController();

switch (true) {
    case $path === '/students' && $method === 'GET': {
        if (isset($query_params['id'])) {
            $studentController->getStudentById($query_params['id']);
        } else if(isset($query_params['page'])){
            $studentController->getStudents($query_params['page']);
        }
        break;
    }
    case $path === "/students/initials"  && $method === 'GET': {
        if(isset($query_params['offset'])) {
            $studentController->getStudentsInitials($query_params['offset']);
        }
        else if(isset($query_params['fullName'])){
            $studentController->searchStudentsInitials($query_params['fullName']);
        }
        else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON"]);
        }
        break;
    }
    case $path === '/students' && $method === 'POST':{
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data) {
            $studentController->addStudent($data);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON"]);
        }
        break;
    }
    case $path === '/students' && $method === 'DELETE':{
        if (isset($query_params['id'])) {
            $studentController->deleteStudent($query_params['id']);
        }
        else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid request"]);
        }
        break;
    }
    case $path === '/students' && $method === 'PUT':{
        $data = json_decode(file_get_contents('php://input'), true);
        if(isset($query_params['id']) && $data) {
            $studentController->updateStudent($query_params['id'], $data);
        }
        else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid request"]);
        }
        break;
    }
    case $path === "/students/pagination" && $method === 'GET': {
        $result = $studentController->getPaginationInfo();
        break;
    }

    case $path === "/login" && $method === 'POST': {
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data) {
            $authController->login($data);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON"]);
        }
        break;
    }

    // TASKS
    case $path === "/tasks" && $method === 'GET': {
        if (isset($query_params['studentId']) && isset($query_params['status'])) {
            $taskController->getTask($query_params['status'], $query_params['studentId']);
        } else{
            http_response_code(400);
            echo json_encode(["error" => "Missing required query parameter: student_id"]);
        }
        break;
    }
    case $path === "/tasks" && $method === 'POST': {
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data && isset($query_params['studentId'])) {
            $taskController->createTask($data, $query_params['studentId']);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON or missing parameter: student_id"]);
        }
        break;
    }
    case $path === "/tasks" && $method === 'PUT': {
        $data = json_decode(file_get_contents('php://input'), true);
        if ($data && isset($query_params['studentId']) && isset($query_params['taskId'])) {
            $taskController->updateTask($data, $query_params['studentId'],  $query_params['taskId']);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON or missing parameter: student_id or taskId"]);
        }
        break;
    }
    case $path === "/tasks" && $method === 'DELETE': {
        if (isset($query_params['taskId']) && isset($query_params['studentId'])) {
            $taskController->deleteTask($query_params['taskId'], $query_params['studentId']);
        }
        else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid request"]);
        }
        break;
    }

    default:
        http_response_code(404);
        echo json_encode(["error" => "Not found"]);
        break;
}