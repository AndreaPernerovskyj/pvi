<?php

class TaskModel
{
    private $conn;
    public function __construct($conn){
        $this->conn = $conn;
    }

    public function getTasks($status, $student_id) {
        $allowedStatuses = ['todo', 'in_progress', 'done', 'archived'];

        if (!in_array($status, $allowedStatuses)) {
            http_response_code(400);
            return ["error" => ["Invalid status"]];
        }

        if (!is_numeric($student_id)) {
            http_response_code(400);
            return ["error" => ["Invalid student ID"]];
        }

        $query = "SELECT * FROM tasks WHERE status = ? AND student_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $status, $student_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $tasks = [];
        while ($row = $result->fetch_assoc()) {
            $tasks[] = $row;
        }

        return ["tasks" => $tasks];
    }

    public function createTask($data, $studentId) {
        $sql = "INSERT INTO tasks (title, description, priority, due_date, student_id) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $success = $stmt->execute([
            $data['title'],
            $data['description'],
            $data['priority'],
            $data['due_date'],
            $studentId
        ]);

        if ($success) {
            $studentId = $this->conn->insert_id;
            return $this->getTaskById($studentId);
        }

        return false;
    }

    public function getTaskById($studentId) {
        $sql = "SELECT * FROM tasks WHERE id = $studentId";
        return $this->conn->query($sql)->fetch_assoc();
    }

    public function updateTask($data, $studentId, $taskId) {
        $sql = "UPDATE tasks 
            SET title = ?, description = ?, status = ?, priority = ?, due_date = ?
            WHERE id = ? and student_id = ?";

        $stmt = $this->conn->prepare($sql);
        $success = $stmt->execute([
            $data['title'],
            $data['description'],
            $data['status'],
            $data['priority'],
            $data['due_date'],
            $taskId,
            $studentId
        ]);

        if ($success) {
            return $this->getTaskById($taskId);
        }

        return false;
    }

    public function deleteTask($taskId, $studentId) {
        $stmt = $this->conn->prepare("DELETE FROM tasks WHERE id = ? and student_id = ?");
        $stmt->bind_param("ii", $taskId, $studentId);
        $stmt->execute();
        return $stmt->affected_rows > 0;
    }
}