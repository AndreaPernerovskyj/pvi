// For adding a new student

function add_students_modal() {
    $(".modal-close-btn").off("click").on("click", e => {
        e.preventDefault();

        const createStudentForm = $(".create-student-form");
        const isEmpty = createStudentForm.find("input").toArray().some(input => !input.value.trim());

        if (!isEmpty) {
            create_student(e);
        }

        createStudentForm[0].reset();
        $(".add-student-modal-container").removeClass("show");
    })

    $(".create-student-form").off("submit").on("submit", create_student);
}

function create_student(e) {
    e.preventDefault();

    const createStudentForm = $(".create-student-form")
    const formData = new FormData(createStudentForm[0]);
    const studentData = {
        id: state.students.length,
        group: formData.get('group'),
        name: formData.get('first-name') + ' ' + formData.get('last-name'),
        birthday: formData.get('birthday'),
        gender: formData.get('gender'),
        status: "Offline",
    };
    state.students.push(studentData);
    create_new_row(studentData);

    createStudentForm[0].reset();

    $(".add-student-modal-container").removeClass("show");
}

function create_new_row(student_data) {
    const studentsTableBody = $(".students-table-body");

    const tr = $("<tr></tr>");
    tr.attr("id", student_data.id);
    const td_checkbox = $("<td></td>");
    const input = $("<input />", {type: "checkbox"})

    td_checkbox.append(input);
    tr.append(td_checkbox);

    ['group', 'name', 'gender', 'birthday', 'status'].forEach(property => {
        const td = $("<td></td>").text(student_data[property])
        tr.append(td);
    })

    const td_options = $("<td></td>").addClass("options-td");

    const button_edit = $("<button></button>").addClass("edit_btn").click(e => {
        edit_student_modal(e);
    })

    const i_pencil = $("<i></i>").addClass('fa-solid fa-pencil')
    button_edit
        .append(i_pencil)
        .attr("aria-label", "Edit student" + student_data.name);

    const button_trash = $("<button></button>").addClass("trash_btn").click((e) => {
        should_delete_student(e, student_data.name);
    })

    const i_trash = $("<i></i>").addClass('fa-solid fa-trash');
    button_trash
        .append(i_trash)
        .attr("aria-label", "Delete student " + student_data.name);

    td_options.append(button_edit, button_trash);

    tr.append(td_options);

    studentsTableBody.append(tr);
}

function should_delete_student(outer_e, name) {
    const shouldDeleteModal = $(".should-delete-student-modal");
    shouldDeleteModal.addClass('show');
    $(".should-delete-text").focus().text(`Do you really want to delete ${name} student?`);


    const yesClickHandler = () => {
        delete_student(shouldDeleteModal[0], outer_e);
        cleanup();
    };

    const noClickHandler = () => {
        shouldDeleteModal.removeClass('show');
        cleanup();
    };

    const shouldDelete = $(".should-delete-yes");
    const shouldNotDelete = $(".should-delete-no");nan

    shouldDelete.on("click", yesClickHandler)
    shouldNotDelete.click("click", noClickHandler)

    function cleanup() {
        shouldDelete.off("click", yesClickHandler)
        shouldNotDelete.off("click", noClickHandler)
    }
}

function delete_student(shouldDeleteModal, e) {
    const td_element = e.target.closest("tr");
    td_element.remove();
    state.students = state.students.filter(student => student.id !== Number(td_element.id));
    shouldDeleteModal.classList.remove('show');
}

// For editing a student

function edit_student_modal(event) {
    const td_element = event.target.closest("tr");

    const student = state.students.find(item => item.id === Number(td_element.id));

    const add_edit_modal_header = $(".add-edit-modal-header");
    add_edit_modal_header.text("Edit student " + student.name)
    $("#group").val(student.group);

    const nameParts = student.name.split(" ");
    const firstName = nameParts.shift();
    const secondName = nameParts.join(" ");

    $("#first-name").val(firstName);
    $("#last-name").val(secondName);
    $("#gender").val(student.gender);
    $("#birthday").val(student.birthday);

    $(".submit-modal-form-btn").text("Submit")

    $(".add-student-modal-container").addClass("show");
    add_edit_modal_header.focus();

    const createStudentForm = $(".create-student-form");
    createStudentForm.off("submit");

    createStudentForm.on("submit", (e) => {
        edit_student_submit(student, e)
    });

    $(".modal-close-btn").off("click").on("click", e => {
        const isEmpty = createStudentForm.find("input").toArray().some(input => !input.value.trim());
        createStudentForm.off("submit").on("submit", create_student);

        if (!isEmpty) {
            edit_student_submit(student, e);
            return;
        }

        createStudentForm[0].reset();
        $(".add-edit-modal-header").text("Add Students");
        $(".add-student-modal-container").removeClass("show");
    })
}

function edit_student_submit(student, e) {
    $(".add-edit-modal-header").text("Add Students");

    e.preventDefault()
    $(".add-student-modal-container").removeClass("show");

    const createStudentForm = $(".create-student-form");

    const formData = new FormData(createStudentForm[0]);
    const studentData = {
        group: formData.get('group'),
        name: formData.get('first-name') + ' ' + formData.get('last-name'),
        birthday: formData.get('birthday'),
        gender: formData.get('gender'),
    };


    student.name = studentData.name;
    student.group = studentData.group;
    student.gender = studentData.gender;
    student.birthday = studentData.birthday;

    console.log(student);
    createStudentForm[0].reset();

    const studentRow = $(`tr[id="${student.id}"]`);

    studentRow.find("td:nth-child(2)").text(studentData.group);
    studentRow.find("td:nth-child(3)").text(studentData.name);
    studentRow.find("td:nth-child(4)").text(studentData.gender);
    studentRow.find("td:nth-child(5)").text(studentData.birthday);

    createStudentForm.off("submit").on("submit", create_student);
}
