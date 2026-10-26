
const SKILL_NAMES = ["strength", "magic", "agility", "wisdom"];

const TAKEN_NAMES = ["Aria", "Merlin", "Shadow", "Nova"];

const CLASS_MINIMUMS = {
    Warrior: { skill: "strength", minimum: 5 },
    Mage: { skill: "magic", minimum: 5 },
    Ranger: { skill: "agility", minimum: 5 }
};

const form = document.querySelector("#character-form");
const errorSummary = document.querySelector("#error-summary");
const pointsCounter = document.querySelector("#points-counter");
const resultArea = document.querySelector("#result-area");

const nameInput = document.querySelector("#character-name");
const classInput = document.querySelector("#character-class");
const colorInput = document.querySelector("#character-color");

const FIELD_NAMES = ["name", "class", ...SKILL_NAMES];

let submitted = false;
let preserveResultOnReset = false;

const touched = new Set();

function getField(fieldName) {
    if (fieldName === "name") {
        return nameInput;
    }

    if (fieldName === "class") {
        return classInput;
    }

    return document.getElementById(fieldName);
}

function getSkills() {
    const skills = {};

    for (const skillName of SKILL_NAMES) {
        skills[skillName] = Number(
            document.getElementById(skillName).value
        );
    }

    return skills;
}

function getTotal(skills) {
    let total = 0;

    for (const skillName of SKILL_NAMES) {
        total += skills[skillName];
    }

    return total;
}

function validateField(fieldName) {
    const field = getField(fieldName);
    const value = field.value.trim();
    let error = "";

    if (fieldName === "name") {
        if (value.length < 3 || value.length > 18) {
            error = "Enter a name with 3 to 18 characters.";
        } else if (!/^[a-zA-Z][a-zA-Z ]*$/.test(value)) {
            error = "Use English letters and spaces. Start with a letter.";
        } else if (
            TAKEN_NAMES.some(function (takenName) {
                return takenName.toLowerCase() === value.toLowerCase();
            })
        ) {
            error = "This name is already taken. Choose another name.";
        }
    }

    if (fieldName === "class" && value === "") {
        error = "Choose a character class.";
    }

    if (SKILL_NAMES.includes(fieldName)) {
        const number = Number(value);

        if (
            value === "" ||
            !Number.isInteger(number) ||
            number < 1 ||
            number > 10
        ) {
            error = "Enter a whole number from 1 to 10.";
        } else if (classInput.value !== "") {
            const requirement = CLASS_MINIMUMS[classInput.value];

            if (
                requirement &&
                requirement.skill === fieldName &&
                number < requirement.minimum
            ) {
                error =
                    `${classInput.value} requires ${fieldName} ` +
                    `to be at least ${requirement.minimum}.`;
            }
        }
    }

    const errorElement = document.getElementById(`${fieldName}-error`);

    if (errorElement) {
        errorElement.textContent = error;
    }

    if (error !== "") {
        field.setAttribute("aria-invalid", "true");
    } else {
        field.removeAttribute("aria-invalid");
    }

    return error;
}

function validateTotal() {
    const skills = getSkills();
    const total = getTotal(skills);

    if (total !== 20) {
        return `Skills must total exactly 20 points. Current total: ${total}.`;
    }

    return "";
}

function updatePreview() {
    const name = nameInput.value.trim();
    const chosenClass = classInput.value;
    const chosenColor = colorInput.value;
    const skills = getSkills();
    const total = getTotal(skills);

    document.querySelector("#preview-name").textContent =
        name || "Your character";

    document.querySelector("#preview-class").textContent =
        chosenClass || "Choose a class";

    const avatar = document.querySelector("#preview-avatar");

    avatar.classList.remove(
        "color-purple",
        "color-blue",
        "color-green",
        "color-red"
    );

    avatar.classList.add(`color-${chosenColor}`);

    for (const skillName of SKILL_NAMES) {
        const value = skills[skillName];

        document.getElementById(`${skillName}-value`).textContent =
            String(value);

        document.getElementById(`preview-${skillName}`).textContent =
            String(value);
    }

    document.querySelector("#preview-total").textContent =
        `Total: ${total} / 20`;

    const remaining = 20 - total;

    if (total === 20) {
        pointsCounter.textContent =
            "Points used: 20 / 20. Points left: 0.";

        pointsCounter.className = "status success";
    } else if (remaining > 0) {
        pointsCounter.textContent =
            `Points used: ${total} / 20. Points left: ${remaining}.`;

        pointsCounter.className = "status";
    } else {
        pointsCounter.textContent =
            `Points used: ${total} / 20. Points over: ${Math.abs(remaining)}.`;

        pointsCounter.className = "status error";
    }
}

function validateAll() {
    const errors = [];

    for (const fieldName of FIELD_NAMES) {
        const error = validateField(fieldName);

        if (error !== "") {
            errors.push({
                fieldName: fieldName,
                error: error
            });
        }
    }

    const totalError = validateTotal();

    if (totalError !== "") {
        errors.push({
            fieldName: "strength",
            error: totalError
        });
    }

    return errors;
}

function showErrors(errors) {
    errorSummary.replaceChildren();

    if (errors.length === 0) {
        return;
    }

    const heading = document.createElement("strong");

    heading.textContent =
        `${errors.length} error(s) found. Please correct the form.`;

    const list = document.createElement("ul");

    for (const item of errors) {
        const listItem = document.createElement("li");
        const link = document.createElement("a");

        link.href = `#${getField(item.fieldName).id}`;
        link.textContent = item.error;

        link.addEventListener("click", function (event) {
            event.preventDefault();
            getField(item.fieldName).focus();
        });

        listItem.append(link);
        list.append(listItem);
    }

    errorSummary.append(heading, list);
}

function makeResultCard() {
    const skills = getSkills();

    const card = document.createElement("article");
    card.className = `result-card color-${colorInput.value}`;

    const heading = document.createElement("h3");
    heading.textContent = "Character created successfully!";

    const name = document.createElement("p");
    name.textContent = `Name: ${nameInput.value.trim()}`;

    const characterClass = document.createElement("p");
    characterClass.textContent = `Class: ${classInput.value}`;

    const characterColor = document.createElement("p");
    characterColor.textContent =
        `Color: ${colorInput.value}`;

    const total = document.createElement("p");
    total.textContent = `Total skill points: ${getTotal(skills)} / 20`;

    const skillList = document.createElement("ul");

    for (const skillName of SKILL_NAMES) {
        const item = document.createElement("li");

        const displayName =
            skillName.charAt(0).toUpperCase() + skillName.slice(1);

        item.textContent = `${displayName}: ${skills[skillName]}`;

        skillList.append(item);
    }

    card.append(
        heading,
        name,
        characterClass,
        characterColor,
        total,
        skillList
    );

    return card;
}

function clearFieldErrors() {
    for (const fieldName of FIELD_NAMES) {
        const errorElement =
            document.getElementById(`${fieldName}-error`);

        if (errorElement) {
            errorElement.textContent = "";
        }

        getField(fieldName).removeAttribute("aria-invalid");
    }
}

form.addEventListener("blur", function (event) {
    const fieldName = event.target.name;

    if (!FIELD_NAMES.includes(fieldName)) {
        return;
    }

    touched.add(fieldName);
    validateField(fieldName);
    updatePreview();
}, true);

form.addEventListener("input", function (event) {
    const fieldName = event.target.name;

    if (FIELD_NAMES.includes(fieldName)) {
        if (touched.has(fieldName) || submitted) {
            validateField(fieldName);
        }

        if (fieldName === "class") {
            for (const skillName of SKILL_NAMES) {
                if (touched.has(skillName) || submitted) {
                    validateField(skillName);
                }
            }
        }
    }

    updatePreview();
    resultArea.replaceChildren();
});

form.addEventListener("change", function () {
    updatePreview();
});

form.addEventListener("submit", function (event) {
    event.preventDefault();

    submitted = true;

    const errors = validateAll();

    showErrors(errors);

    if (errors.length > 0) {
        resultArea.replaceChildren();

        getField(errors[0].fieldName).focus();
        return;
    }

    const resultCard = makeResultCard();

    preserveResultOnReset = true;
    form.reset();

    resultArea.replaceChildren(resultCard);

    touched.clear();
    submitted = false;

    errorSummary.replaceChildren();
    clearFieldErrors();
    updatePreview();

    resultArea.focus();
});

form.addEventListener("reset", function () {
    window.setTimeout(function () {
        touched.clear();
        submitted = false;

        errorSummary.replaceChildren();
        clearFieldErrors();

        if (preserveResultOnReset) {
            preserveResultOnReset = false;
        } else {
            resultArea.replaceChildren();
        }

        updatePreview();
    }, 0);
});

form.noValidate = true;

updatePreview();
