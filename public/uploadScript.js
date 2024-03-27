document.addEventListener('DOMContentLoaded', function() {
    let accumulatedFiles = {
        'pdfRxForm': [],
        'stlFile': []
    };

    function handleFileSelection(event, fileType) {
        let files = event.target.files;
        if (files) {
            accumulatedFiles[fileType] = accumulatedFiles[fileType].concat(Array.from(files));
            // Optionally update the UI to list the selected files
            updateFileListDisplay(fileType);
        }
    }

    function updateFileListDisplay(fileType) {
        const fileListContainerId = fileType === 'pdfRxForm' ? 'pdfRxList' : 'stlFileList';
        const fileListContainer = document.getElementById(fileListContainerId);
        fileListContainer.innerHTML = ''; // Clear current list
        accumulatedFiles[fileType].forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.textContent = file.name;
            fileListContainer.appendChild(fileElement);
        });
    }

    document.getElementById('pdfRxForm').addEventListener('change', function(event) {
        handleFileSelection(event, 'pdfRxForm');
    });

    document.getElementById('stlFile').addEventListener('change', function(event) {
        handleFileSelection(event, 'stlFile');
    });

    document.getElementById('uploadForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData();
        Object.keys(accumulatedFiles).forEach(key => {
            accumulatedFiles[key].forEach(file => {
                formData.append(file.type === 'application/pdf' ? 'pdfRxForm' : 'stlFile', file, file.name);
            });
        });
        formData.append('name', document.getElementById('name').value);
        formData.append('email', document.getElementById('email').value);
        // Manage UI elements for loading state
        const button = document.getElementById('uploadButton');
        const spinner = document.getElementById('loadingSpinner');
        button.disabled = true;
        button.innerText = 'Submitting...';
        spinner.style.display = 'block';

        // Perform the submission to the server
        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`${text} (Status: ${response.status})`); });
            }
            return response.json();
        })
        .then(data => {
            console.log('File uploaded successfully:', data);
            document.querySelector('.upload-form-container').style.display = 'none';
            const submissionMessage = document.getElementById('submissionMessage');
            submissionMessage.style.display = 'block'; // Make the message visible
            document.getElementById('submitNewCaseButton').style.display = 'block'; // Show the "Submit New Case" button
            submissionMessage.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Failed to send file:', error);
            alert('Failed to send file: ' + error.message);
        })
        .finally(() => {
            button.disabled = false;
            button.innerText = 'Submit';
            spinner.style.display = 'none';
        });
    });
    
    // Reset the form for a new submission
    document.getElementById('submitNewCaseButton').addEventListener('click', function() {
        document.getElementById('uploadForm').reset();
        document.getElementById('submissionMessage').style.display = 'none';
        document.querySelector('.upload-form-container').style.display = 'block';
        document.querySelector('.upload-form-container').scrollIntoView({ behavior: 'smooth' });
        // Also clear accumulated files
        accumulatedFiles = { 'pdfRxForm': [], 'stlFile': [] };
    });
});

document.getElementById('submitNewCaseButton').addEventListener('click', function() {
    // Refresh the page
    window.location.reload();
});
document.querySelectorAll('.nav-item').forEach(function(navItem) {
    let timeoutId;

    navItem.addEventListener('mouseover', function() {
        clearTimeout(timeoutId); // Clear any existing timeouts
        this.querySelector('.dropdown-content').style.display = 'block';
    });

    navItem.addEventListener('mouseout', function() {
        const dropdownContent = this.querySelector('.dropdown-content');
        // Set a timeout to hide the dropdown, allows moving to the dropdown content
        timeoutId = setTimeout(function() {
            dropdownContent.style.display = 'none';
        }, 500); // Time in ms (0.5 seconds)
    });

    // Prevent the dropdown from closing when the mouse is over the dropdown content
    navItem.querySelector('.dropdown-content').addEventListener('mouseover', function() {
        clearTimeout(timeoutId);
    });

    navItem.querySelector('.dropdown-content').addEventListener('mouseout', function() {
        timeoutId = setTimeout(function() {
            dropdownContent.style.display = 'none';
        }, 500);
    });
});