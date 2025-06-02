<?php

require_once __DIR__ . '/../model/TaskModel.php';
require_once __DIR__ . '/../model/StudentModel.php';
require_once __DIR__ . '/../config.php';

class TaskController
{
    private $taskModel;
    private $studentModel;

    public function __construct() {
        global $conn;
        $this->taskModel = new TaskModel($conn);
        $this->studentModel = new StudentModel($conn);
    }

    public function getTask($status, $student_id) {
        $tasks = $this->taskModel->getTasks($status, $student_id);
        header('Content-Type: application/json');
        echo json_encode($tasks);
    }

    public function createTask($data, $studentId) {
        if (!$this->doesStudentExist($studentId)) {
            http_response_code(404);
            echo json_encode(["error" => "Student with ID $studentId not found"]);
            return;
        }

        $validatedData = $this->validateTaskInput($data, false);
        if(!$validatedData) {
            return;
        }

        $newTask = $this->taskModel->createTask($validatedData, $studentId);

        if ($newTask) {
            http_response_code(201);
            echo json_encode([
                "task" => $newTask
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Something went wrong"]);
        }
    }

    public function validateTaskInput($data, $onUpdate) {
        $errors = [];

        if (!isset($data['title']) || strlen(trim($data['title'])) === 0) {
            $errors[] = "Title is required.";
        } elseif (strlen($data['title']) > 100) {
            $errors[] = "Title must not exceed 100 characters.";
        }

        if (isset($data['description']) && !is_string($data['description'])) {
            $errors[] = "Description must be a string.";
        }

        $validPriorities = ['low', 'medium', 'high'];
        if (!isset($data['priority']) || !in_array($data['priority'], $validPriorities)) {
            $errors[] = "Priority must be one of: low, medium, high.";
        }

        if (!isset($data['due_date']) || !strtotime($data['due_date'])) {
            $errors[] = "Due date must be a valid datetime.";
        } else {
            $dueDateTimestamp = strtotime($data['due_date']);
            $now = time();

            if ($dueDateTimestamp <= $now) {
                $errors[] = "Due date must be in the future.";
            }
        }

        if($onUpdate) {
            $validPriorities = ['todo', 'in_progress', 'done', 'archived'];
            if (!isset($data['status']) || !in_array($data['status'], $validPriorities)) {
                $errors[] = "Status must be one of: todo, in_progress, done, archived.";
            }
        }

        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(["errors" => $errors]);
            return false;
        }

        return [
            "title" => trim($data['title']),
            "description" => isset($data['description']) ? trim($data['description']) : "",
            "priority" => $data['priority'],
            "due_date" => date('Y-m-d H:i:s', $dueDateTimestamp)
        ];
    }

    public function doesStudentExist($studentId) {
        $student = $this->studentModel->getStudentById($studentId);
        return $student;
    }

    public function updateTask($data, $studentId, $taskId) {
        if (!$this->doesStudentExist($studentId)) {
            http_response_code(404);
            echo json_encode(["error" => "Student with ID $studentId not found"]);
            return;
        }

        $validatedData = $this->validateTaskInput($data, true);
        if(!$validatedData) {
            return;
        }

        $updatedTask = $this->taskModel->updateTask($data, $studentId, $taskId);

        if ($updatedTask) {
            http_response_code(201);
            echo json_encode([
                "task" => $updatedTask
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Task not found"]);
        }
    }

    public function deleteTask($taskId, $studentId) {
        $result = $this->taskModel->deleteTask($taskId, $studentId);
        header('Content-Type: application/json');

        if ($result) {
            echo json_encode(["message" => "Task deleted successfully"]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Task not found"]);
        }
    }
}