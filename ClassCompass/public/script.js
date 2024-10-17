document.addEventListener('DOMContentLoaded', () => {
    const toScheduleButton = document.getElementById('to-schedule');
    const addClassNavButton = document.getElementById('add-class-nav');
    const navHomeButton = document.getElementById('nav-home');
    const navScheduleButton = document.getElementById('nav-schedule');
    const navAddClassButton = document.getElementById('nav-add-class');
    const scheduleForm = document.getElementById('schedule-form');
    const classScheduleTable = document.getElementById('class-schedule');
    const noClassesMessage = document.getElementById('no-classes-message');
    const homeSection = document.getElementById('home');
    const viewScheduleSection = document.getElementById('view-schedule');
    const addClassSection = document.getElementById('add-class');
    const formMessage = document.getElementById('form-message');

    // Temporary storage for classes
    let classes = [];

    // Function to calculate travel time between classes
    const calculateTravelTime = async (origin, destination, mode) => {
        try {
            const response = await fetch(`/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}`);
            if (!response.ok) throw new Error('Network response was not ok.');

            const data = await response.json();

            if (data.rows && data.rows.length > 0 && data.rows[0].elements.length > 0) {
                const travelTime = data.rows[0].elements[0].duration ? data.rows[0].elements[0].duration.text : "--";
                return travelTime;
            }
        } catch (error) {
            console.error('Error calculating travel time:', error);
        }
        return "No travel time available";
    };

    // Function to update the schedule table
    const updateScheduleTable = async () => {
        classScheduleTable.innerHTML = ''; // Clear previous entries
        if (classes.length === 0) {
            noClassesMessage.classList.remove('hidden');
        } else {
            noClassesMessage.classList.add('hidden');
            for (let i = 0; i < classes.length; i++) {
                const classItem = classes[i];
                let travelTime = "No travel time available";

                // Only calculate travel time if it's not the first class
                if (i > 0) {
                    const previousClass = classes[i - 1];
                    const currentClass = classItem;
                    
                    // Use the transport mode of the target class (current class)
                    travelTime = await calculateTravelTime(previousClass.location, currentClass.location, currentClass.transportMode);
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${classItem.name}</td>
                    <td>${classItem.startTime}</td>
                    <td>${classItem.endTime}</td>
                    <td>${classItem.location}</td>
                    <td>${classItem.professor}</td>
                    <td>${classItem.transportMode}</td>
                    <td>${travelTime}</td>
                    <td><button class="delete-button" data-index="${i}">Delete</button></td> <!-- Always show delete button -->
                `;
                classScheduleTable.appendChild(row);
            }

            // Attach delete button event listeners
            const deleteButtons = document.querySelectorAll('.delete-button');
            deleteButtons.forEach(button => {
                button.addEventListener('click', handleDelete);
            });
        }
    };

    const handleDelete = (event) => {
        const indexToDelete = event.target.dataset.index; // Get index from data attribute
        classes.splice(indexToDelete, 1); // Remove class from the array
        updateScheduleTable(); // Refresh the table
    };

    // Navigation Functions
    const navigateToHome = () => {
        homeSection.classList.add('active');
        viewScheduleSection.classList.remove('active');
        addClassSection.classList.remove('active');
    };

    const navigateToSchedule = () => {
        homeSection.classList.remove('active');
        viewScheduleSection.classList.add('active');
        addClassSection.classList.remove('active');
        updateScheduleTable(); // Update the table whenever we view it
    };

    const navigateToAddClass = () => {
        homeSection.classList.remove('active');
        viewScheduleSection.classList.remove('active');
        addClassSection.classList.add('active');
        formMessage.classList.add('hidden'); // Hide any previous messages
    };

    // Attach navigation events to buttons
    navHomeButton.addEventListener('click', navigateToHome);
    navScheduleButton.addEventListener('click', navigateToSchedule);
    navAddClassButton.addEventListener('click', navigateToAddClass);
    toScheduleButton.addEventListener('click', navigateToSchedule);
    addClassNavButton.addEventListener('click', navigateToAddClass);

    // Handle the form submission
    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const className = document.getElementById('class-name').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const location = document.getElementById('location').value;
        const professorName = document.getElementById('professor-name').value;
        const transportMode = document.getElementById('transport-mode').value;

        // Validate start and end times
        if (startTime >= endTime) {
            formMessage.textContent = "Error: End time must be after start time.";
            formMessage.classList.remove('hidden');
            return; // Stop the form submission
        }

        // Create a class object and push it to classes array
        const classItem = {
            name: className,
            startTime,
            endTime,
            location,
            professor: professorName,
            transportMode
        };

        // Check for duplicate classes
        const isDuplicate = classes.some(c => c.name === classItem.name && c.startTime === classItem.startTime && c.location === classItem.location);
        if (isDuplicate) {
            formMessage.textContent = "Error: This class is already added to your schedule.";
            formMessage.classList.remove('hidden');
            return; // Stop the form submission
        }

        // Add the new class only if not a duplicate
        classes.push(classItem);

        // Sort the classes by start time
        classes.sort((a, b) => {
            return new Date(`1970-01-01T${a.startTime}`) - new Date(`1970-01-01T${b.startTime}`);
        });

        // Update the table
        await updateScheduleTable(); 

        // Reset the form
        scheduleForm.reset();
        navigateToSchedule(); // Go back to the schedule view after adding the class
    });
});
