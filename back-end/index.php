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

$studentController = new StudentController();
$authController = new AuthenticationController();

switch (true) {
    case $path === '/students' && $method === 'GET': {
        if (isset($query_params['id'])) {
            $studentController->getStudentById($query_params['id']);
        } else if(isset($query_params['page'])){
            $studentController->getStudents($query_params['page']);
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

    default:
        http_response_code(404);
        echo json_encode(["error" => "Not found"]);
        break;
}