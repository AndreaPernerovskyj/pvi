<?php

require_once __DIR__ . '/../model/StudentModel.php';
require_once __DIR__ . '/../config.php';

class StudentController
{
    private $studentsModel;

    function __construct() {
        global $conn;
        $this->studentsModel = new StudentModel($conn);
    }

    public function getStudents($page)
    {
        $students = $this->studentsModel->getStudents($page);
        header('Content-Type: application/json');
        echo json_encode($students);
    }

    public function getStudentsInitials($offset) {
        $students = $this->studentsModel->getStudentsInitials($offset);
        header('Content-Type: application/json');
        echo json_encode($students);
    }

    public function searchStudentsInitials($fullName) {
        $students = $this->studentsModel->searchStudentsInitials($fullName);
        header('Content-Type: application/json');
        echo json_encode($students);
    }

    public function getStudentById($id)
    {
        $student = $this->studentsModel->getStudentById($id);
        header('Content-Type: application/json');
        echo json_encode($student);
    }

    // ===== ADDING A NEW STUDENT TO THE DATABASE =====
    public function addStudent($data) {
        $validatedData = $this->validateUserInput($data);
        if(!$validatedData) {
            return;
        }

        $newStudent = $this->studentsModel->insertStudent($validatedData);

        if ($newStudent) {
            http_response_code(201);
            echo json_encode([
                "student" => $newStudent
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Something went wrong"]);
        }
    }

    // ===== UPDATING A STUDENT ======
    public function updateStudent($id, $data) {
        if(!$this->validateUserInput($data, true, $id)) {
            return;
        }

        $updatedStudent = $this->studentsModel->updateStudent($id, $data);

        if ($updatedStudent) {
            http_response_code(201);
            echo json_encode([
                "student" => $updatedStudent
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Student not found"]);
        }
    }

    // ===== VALIDATING USER INPUT ======
    private function validateUserInput($data, $onUpdate = false, $id = null) {
        $errors = [];

        $required = ['firstName', 'lastName', 'birthday', 'groupname', 'gender'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $errors[$field] = "Missing field: $field";
            }
        }

        if (!empty($data['firstName']) && (strlen($data['firstName']) < 2 || strlen($data['firstName']) > 50)) {
            $errors['firstName'] = "First name must be between 2 and 50 characters";
        }
        if (!empty($data['lastName']) && (strlen($data['lastName']) < 2 || strlen($data['lastName']) > 50)) {
            $errors['lastName'] = "Last name must be between 2 and 50 characters";
        }

        if (!empty($data['gender'])) {
            $gender = strtolower(trim($data['gender']));
            if ($gender === 'male') {
                $data['gender'] = 'Male';
            } elseif ($gender === 'female') {
                $data['gender'] = 'Female';
            } else {
                $errors['gender'] = "Invalid gender. Use 'male' or 'female'.";
            }
        }

        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(["errors" => $errors]);
            return false;
        }

        $existingStudent = $this->studentsModel->findStudentByNameAndBirthday(
            $data['firstName'],
            $data['lastName'],
            $data['birthday']
        );

        if($onUpdate) {
            if($existingStudent && $existingStudent != $id) {
                http_response_code(409);
                echo json_encode(["errors" => [
                    "duplicate" => "Student with this name and birthday already exists"
                ]]);
                return false;
            }
        }
        else {
            if ($existingStudent) {
                http_response_code(409);
                echo json_encode(["errors" => [
                    "duplicate" => "Student with this name and birthday already exists"
                ]]);
                return false;
            }
        }

        return $data;
    }

    // ===== DELETING STUDENT ======
    public function deleteStudent($id) {
        $result = $this->studentsModel->deleteStudent($id);
        header('Content-Type: application/json');

        if ($result) {
            echo json_encode(["message" => "Student deleted successfully"]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Student not found"]);
        }
    }

    // ===== GETTING PAGINATION INFO =====
    public function getPaginationInfo() {
        $result = $this->studentsModel->getPaginationInfo();
        header('Content-Type: application/json');
        echo json_encode($result);
    }
}