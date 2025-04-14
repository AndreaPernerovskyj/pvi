<?php

require_once __DIR__ . '/../model/AuthenticationModel.php';
require_once __DIR__ . '/../config.php';

class AuthenticationController
{
    private $authModel;

    public function __construct(){
        global $conn;
        $this->authModel = new  AuthenticationModel($conn);
    }

    public function login($data)
    {
        $errors = [];

        $identifier = $data['identifier'];
        $password = $data['password'];

        if(empty(trim($identifier))) {
            $errors['identifier'] =  'Identifier is required';
        }

        if(empty(trim($password))) {
            $errors['password'] = "Password is required";
        }

        if(!empty($errors)) {
            http_response_code(400);
            echo json_encode($errors);
            return;
        }

        $parts = explode(' ', $identifier);
        if(count($parts) !== 2) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid username or password"]);
            return;
        }

        $firstname = $parts[0];
        $lastname = $parts[1];

        $student = $this->authModel->getStudentByCredentials($firstname, $lastname, $password);

        if(!$student) {
            http_response_code(401);
            echo json_encode(["error" => "Invalid username or password"]);
            return;
        }

        echo json_encode([
            "success" => true,
            "student" => [
                "id" => $student['id'],
                "firstName" => $student['firstName'],
                "lastName" => $student['lastName']
            ]
        ]);
    }
}