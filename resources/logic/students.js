// For adding a new student
function add_students_modal() {
    const createStudentForm = $(".create-student-form");

    $(".modal-exit-btn").off("click").on("click", (e) => {
        e.preventDefault();
        createStudentForm[0].reset();
        cleanValidation();
        $(".add-student-modal-container").removeClass("show");
    });
    $(".modal-close-btn").off("click").on("click", e => {
        e.preventDefault();

        const isEmpty = createStudentForm.find("input").toArray().slice(1).some(input => !input.value.trim());

        if (!isEmpty) {
            create_student(e);
            return;
        }

        createStudentForm[0].reset();
        cleanValidation();
        $(".add-student-modal-container").removeClass("show");
    });

    createStudentForm.off("submit").on("submit", create_student);
}

function create_student(e) {
    e.preventDefault();

    const createStudentForm = $(".create-student-form");
    const formData = new FormData(createStudentForm[0]);


    const studentDataValidation = {
        group: formData.get('group'),
        firstName: formData.get('first-name').trim(),
        lastName: formData.get('last-name').trim(),
        birthday: formData.get('birthday'),
        gender: formData.get('gender')
    };

    if (!validateForm(studentDataValidation)) return;

    const newStudentData = {
        id: state.students.length,
        group: studentDataValidation.group,
        firstName: studentDataValidation.firstName,
        lastName: studentDataValidation.lastName,
        birthday: studentDataValidation.birthday,
        gender: studentDataValidation.gender,
        status: "Offline",
    };

    state.students.push(newStudentData);
    console.log(JSON.stringify(newStudentData));
    create_new_row(newStudentData);

    createStudentForm[0].reset();

    $(".add-student-modal-container").removeClass("show");
}

function create_new_row(student_data) {
    const studentsTableBody = document.querySelector(".students-table-body");

    const isChecked = document.querySelector(".main-checkbox").checked;
    if (isChecked) numberOfChecked++;

    const tr = document.createElement("tr");
    tr.id = student_data.id;

    tr.innerHTML = `
    <td>
        <input type="checkbox" class="student-checkbox" aria-label="Select student ${student_data.name}" ${isChecked ? "checked" : ""}>
    </td>
    <td>${student_data.group}</td>
    <td>${student_data.firstName + " " + student_data.lastName}</td>
    <td>${student_data.gender}</td>
    <td>${student_data.birthday}</td>
    <td class="status-cell">
        <div class="student-status-container">
            <div class="student-status ${student_data.status.toLowerCase() === "online" ? "online" : ""}"></div>
        </div>
    </td>
    <td class="options-td">
        <button class="edit_btn" ${!isChecked ? "disabled" : ""} aria-label="Edit student ${student_data.name}">
            <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="trash_btn" ${!isChecked ? "disabled" : ""} aria-label="Delete student ${student_data.name}">
            <i class="fa-solid fa-trash"></i>
        </button>
    </td>
`;

    const inputCheckbox = tr.querySelector(".student-checkbox");
    inputCheckbox.addEventListener("change", (e) => {
        checkBoxChanged(e.target.closest("tr"), e.target.checked);
    });

    const buttonEdit = tr.querySelector(".edit_btn");
    buttonEdit.addEventListener("click", edit_student_modal);

    const buttonTrash = tr.querySelector(".trash_btn");
    buttonTrash.addEventListener("click", (e) => {
        should_delete_student(e, `${student_data.firstName} ${student_data.lastName}`, student_data.id);
    });

    studentsTableBody.appendChild(tr);
}

// Deleting a student
function should_delete_student(outer_e, name, id) {
    const shouldDeleteModal = $(".should-delete-student-modal");
    const modalExitDeleteBtn = $(".modal-exit-delete-btn");
    shouldDeleteModal.addClass('show');
    $("#delete-student-id").val(id);
    $(".should-delete-text").focus().text(`Do you really want to delete ${name} student?`);

    const yesClickHandler = () => {
        delete_student(shouldDeleteModal[0], outer_e, id);
        cleanup();
    };

    const noClickHandler = () => {
        shouldDeleteModal.removeClass('show');
        cleanup();
    };

    const shouldDelete = $(".should-delete-yes");
    const shouldNotDelete = $(".should-delete-no");

    shouldDelete.on("click", yesClickHandler);
    shouldNotDelete.on("click", noClickHandler);
    modalExitDeleteBtn.on("click", noClickHandler);

    function cleanup() {
        shouldDelete.off("click", yesClickHandler);
        shouldNotDelete.off("click", noClickHandler);
        modalExitDeleteBtn.off("click", noClickHandler);
    }
}

function delete_student(shouldDeleteModal, e, id) {
    const td_element = e.target.closest("tr");
    td_element.remove();
    state.students = state.students.filter(student => student.id !== id);
    shouldDeleteModal.classList.remove('show');
    numberOfChecked--;
    numberOfCheckedChanged();
}

// For editing a student
function edit_student_modal(event) {
    const td_element = event.target.closest("tr");
    const student = state.students.find(item => item.id === Number(td_element.id));
    const addEditModalHeader = $(".add-edit-modal-header")

    addEditModalHeader.text("Edit student " + student.name);

    $("#student-id").val(student.id);
    $("#group").val(student.group);
    $("#first-name").val(student.firstName);
    $("#last-name").val(student.lastName);
    $("#gender").val(student.gender);
    $("#birthday").val(student.birthday);

    $(".submit-modal-form-btn").text("Submit");
    $(".add-student-modal-container").addClass("show");
    addEditModalHeader.focus();

    const createStudentForm = $(".create-student-form");
    createStudentForm.off("submit");

    createStudentForm.on("submit", (e) => {
        edit_student_submit(student, e);
    });

    // Modal close button handler
    $(".modal-close-btn").off("click").on("click", e => {
        const isEmpty = createStudentForm.find("input").toArray().slice(1).some(input => !input.value.trim());
        createStudentForm.off("submit").on("submit", create_student);

        if (!isEmpty) {
            edit_student_submit(student, e);
            return;
        }

        createStudentForm[0].reset();
        cleanValidation();
        $(".add-student-modal-container").removeClass("show");
    });

    // Modal exit button handler
    $(".modal-exit-btn").off("click").on("click", (e) => {
        e.preventDefault();
        createStudentForm[0].reset();
        cleanValidation();
        $(".add-student-modal-container").removeClass("show");
    });
}

function edit_student_submit(student, e) {
    e.preventDefault();
    const createStudentForm = $(".create-student-form");
    const formData = new FormData(createStudentForm[0]);

    // Get values
    const studentData = {
        group: formData.get('group'),
        firstName: formData.get('first-name').trim(),
        lastName: formData.get('last-name').trim(),
        birthday: formData.get('birthday'),
        gender: formData.get('gender')
    };

    if (!validateForm(studentData)) return;

    // Reset modal header
    $(".add-edit-modal-header").text("Add Students");

    e.preventDefault();
    $(".add-student-modal-container").removeClass("show");

    // Update student in state
    student.firstName = studentData.firstName;
    student.lastName = studentData.lastName;
    student.group = studentData.group;
    student.gender = studentData.gender;
    student.birthday = studentData.birthday;

    console.log(JSON.stringify(student));
    // Reset form
    createStudentForm[0].reset();

    // Update table row
    const studentRow = $(`tr[id="${student.id}"]`);
    studentRow.find("td:nth-child(2)").text(student.group);
    studentRow.find("td:nth-child(3)").text(student.name);
    studentRow.find("td:nth-child(4)").text(student.gender);
    studentRow.find("td:nth-child(5)").text(student.birthday);

    // Restore default submit handler
    createStudentForm.off("submit").on("submit", create_student);
}

// Helper functions

let numberOfChecked = 0
function checkBoxChanged(tr, shouldCheck) {
    const options_td = tr.querySelector(".options-td");
    const button_trash = options_td.querySelector(".trash_btn")
    const button_edit = options_td.querySelector(".edit_btn")
    const checkbox = tr.querySelector(".student-checkbox");

    const mainCheckBox = document.querySelector(".main-checkbox");
    if (shouldCheck) {
        button_trash.disabled = false;
        button_edit.disabled = false;
        checkbox.checked = true;

        numberOfChecked++;
        if (numberOfChecked === state.students.length) {
            mainCheckBox.checked = true;
        }
    } else {
        button_trash.disabled = true;
        button_edit.disabled = true;
        checkbox.checked = false;
        mainCheckBox.checked = false;

        numberOfChecked--;
    }

    numberOfCheckedChanged();
}

function numberOfCheckedChanged() {
    if (numberOfChecked >= 2) {
        document.querySelector(".delete-selected-btn").style.display = "block";
    } else {
        document.querySelector(".delete-selected-btn").style.display = "none";
    }
}

// Validations

function validateForm({ group, firstName, lastName, birthday, gender }) {
    $(".error-message").text(""); // Clear previous errors

    let isValid = true;

    function addValidationListener(inputId, errorId, validator) {
        const input = $(inputId);
        input.off("input").on("input", function () {
            if (validator($(this).val().trim())) {
                $(errorId).text("");
                input.css("border-color", "");
            }
        });
    }

    // Validate first name
    let regex = /^[A-Za-zА-Яа-яЇїІіЄєҐґ\s]+$/;
    if (!firstName) {
        $("#first-name-error").text("First name is required.");
        $("#first-name").css("border-color", "red");
        isValid = false;
    } else if (!regex.test(firstName)) {
        $("#first-name-error").text("Only letters and spaces allowed.");
        $("#first-name").css("border-color", "red");
        isValid = false;
    }
    addValidationListener("#first-name", "#first-name-error", val => regex.test(val) && val !== "");

    // Validate last name
    if (!lastName) {
        $("#last-name-error").text("Last name is required.");
        $("#last-name").css("border-color", "red");
        isValid = false;
    } else if (!regex.test(lastName)) {
        $("#last-name-error").text("Only letters and spaces allowed.");
        $("#last-name").css("border-color", "red");
        isValid = false;
    }
    addValidationListener("#last-name", "#last-name-error", val => regex.test(val) && val !== "");

    // Validate birthday
    if (!birthday) {
        $("#birthday-error").text("Birthday is required.");
        $("#birthday").css("border-color", "red");
        isValid = false;
    } else {
        const birthDate = new Date(birthday);
        const today = new Date();
        if (birthDate >= today) {
            $("#birthday-error").text("Birthday must be in the past.");
            $("#birthday").css("border-color", "red");
            isValid = false;
        }
    }
    addValidationListener("#birthday", "#birthday-error", val => {
        const birthDate = new Date(val);
        const today = new Date();
        return birthDate < today;
    });

    return isValid;
}

function cleanValidation() {
    const firstNameError = $("#first-name-error");
    const firstName = $("#first-name");
    const lastNameError = $("#last-name-error");
    const lastName = $("#last-name");
    const birthdayError = $("#birthday-error");
    const birthday = $("#birthday");

    firstNameError.text("");
    firstName.css("border-color", "#cccccc");
    firstNameError.text("");
    firstName.css("border-color", "#cccccc");
    lastNameError.text("");
    lastName.css("border-color", "#cccccc");
    lastNameError.text("");
    lastName.css("border-color", "#cccccc");
    birthdayError.text("");
    birthday.css("border-color", "#cccccc");
    birthdayError.text("");
    birthday.css("border-color", "#cccccc");
}