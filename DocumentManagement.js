document.addEventListener("DOMContentLoaded", function() {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBF-nMMW5lG44JfHxx4HxCbf5N81geOiRs",
        authDomain: "bauet-hms-63f5b.firebaseapp.com",
        databaseURL: "https://bauet-hms-63f5b-default-rtdb.firebaseio.com",
        projectId: "bauet-hms-63f5b",
        storageBucket: "bauet-hms-63f5b.appspot.com",
        messagingSenderId: "200038506273",
        appId: "1:200038506273:web:2e141fc9ec36de049ae860"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const storage = firebase.storage();

    // DOM Elements
    const menuBtn = document.getElementById('menu_bar');
    const sidebar = document.querySelector('.aside');
    const closeBtn = document.querySelector('.close span');
    const uploadForm = document.getElementById('uploadForm');
    const docFile = document.getElementById('docFile');
    const fileNameDisplay = document.querySelector('.file-name');
    const docVisibility = document.getElementById('docVisibility');
    const specificStudentsGroup = document.getElementById('specificStudentsGroup');
    const documentsList = document.getElementById('documentsList');
    const filterCategory = document.getElementById('filterCategory');
    const uploadNotification = document.getElementById('uploadNotification');
    const notificationIcon = document.querySelector('.notification-icon');
    const notificationMessage = document.querySelector('.notification-message');

    // Authentication check
    if (!sessionStorage.getItem("userId")) {
        window.location.replace("LoginRegister.html");
        return;
    }

    // Logout functionality
    const logoutButtons = document.querySelectorAll(".logout-btn");
    logoutButtons.forEach(button => {
        button.addEventListener("click", () => {
            sessionStorage.clear();
            localStorage.clear();
            window.location.replace("LoginRegister.html");
        });
    });

    // Sidebar toggle functionality for mobile
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('show');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('show');
        });
    }

    // Show file name when selected
    docFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.textContent = e.target.files[0].name;
        } else {
            fileNameDisplay.textContent = 'No file chosen';
        }
    });

    // Toggle specific students input visibility
    docVisibility.addEventListener('change', () => {
        if (docVisibility.value === 'specific') {
            specificStudentsGroup.style.display = 'block';
        } else {
            specificStudentsGroup.style.display = 'none';
        }
    });

    // Handle document upload
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('docTitle').value;
        const category = document.getElementById('docCategory').value;
        const description = document.getElementById('docDescription').value;
        const visibility = docVisibility.value;
        const specificStudents = visibility === 'specific' ? 
                                document.getElementById('specificStudents').value.split(',').map(id => id.trim()) : 
                                [];
        const file = docFile.files[0];
        
        if (!file) {
            showNotification('Please select a file to upload', true);
            return;
        }
        
        try {
            // Show loading state
            const uploadBtn = document.querySelector('.upload-btn');
            const originalText = uploadBtn.textContent;
            uploadBtn.textContent = 'Uploading...';
            uploadBtn.disabled = true;
            
            // Step 1: Upload file to Firebase Storage
            const fileExtension = file.name.split('.').pop();
            const fileName = `${Date.now()}_${title.replace(/\s+/g, '_')}.${fileExtension}`;
            const storageRef = storage.ref(`documents/${fileName}`);
            const uploadTask = storageRef.put(file);
            
            // Wait for upload to complete
            await uploadTask;
            
            // Step 2: Get download URL
            const downloadURL = await storageRef.getDownloadURL();
            
            // Step 3: Store document metadata in Firestore
            const docData = {
                title,
                category,
                description,
                visibility,
                specificStudents: visibility === 'specific' ? specificStudents : [],
                fileUrl: downloadURL,
                fileName: file.name,
                uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
                uploadedBy: sessionStorage.getItem("userId") || 'admin'
            };
            
            await db.collection('documents').add(docData);
            
            // Reset form and show success message
            uploadForm.reset();
            fileNameDisplay.textContent = 'No file chosen';
            specificStudentsGroup.style.display = 'none';
            
            // Show success notification
            showNotification('Document uploaded successfully!');
            
            // Refresh document list
            loadDocuments();
            
            // Reset button state
            uploadBtn.textContent = originalText;
            uploadBtn.disabled = false;
            
        } catch (error) {
            console.error("Error uploading document:", error);
            showNotification(`Error uploading document: ${error.message}`, true);
            
            // Reset button state
            const uploadBtn = document.querySelector('.upload-btn');
            uploadBtn.textContent = 'Upload Document';
            uploadBtn.disabled = false;
        }
    });

    // Show notification
    function showNotification(message, isError = false) {
        notificationMessage.textContent = message;
        
        if (isError) {
            notificationIcon.textContent = 'error';
            notificationIcon.classList.add('error');
        } else {
            notificationIcon.textContent = 'check_circle';
            notificationIcon.classList.remove('error');
        }
        
        uploadNotification.classList.add('show');
        
        setTimeout(() => {
            uploadNotification.classList.remove('show');
        }, 5000);
    }

    // Load documents
    async function loadDocuments(category = 'all') {
        documentsList.innerHTML = '<div class="document-loading">Loading documents...</div>';
        
        try {
            let query = db.collection('documents').orderBy('uploadDate', 'desc');
            
            if (category !== 'all') {
                query = query.where('category', '==', category);
            }
            
            const snapshot = await query.get();
            
            if (snapshot.empty) {
                documentsList.innerHTML = `
                    <div class="no-documents">
                        <span class="material-icons">description</span>
                        <h3>No documents found</h3>
                        <p>Upload a document to get started</p>
                    </div>
                `;
                return;
            }
            
            let documentsHTML = '';
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.uploadDate ? new Date(data.uploadDate.seconds * 1000) : new Date();
                const formattedDate = date.toLocaleDateString();
                
                // Choose icon based on file extension
                let fileIcon = 'description';
                const fileName = data.fileName || '';
                const extension = fileName.split('.').pop().toLowerCase();
                
                if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(extension)) {
                    if (extension === 'pdf') fileIcon = 'picture_as_pdf';
                    else if (['doc', 'docx'].includes(extension)) fileIcon = 'article';
                    else if (['xls', 'xlsx'].includes(extension)) fileIcon = 'table_chart';
                    else if (['ppt', 'pptx'].includes(extension)) fileIcon = 'slideshow';
                    else if (extension === 'txt') fileIcon = 'text_snippet';
                }
                
                documentsHTML += `
                    <div class="document-item" data-id="${doc.id}">
                        <span class="material-icons document-icon">${fileIcon}</span>
                        <div class="document-info">
                            <h3 class="document-title">${data.title}</h3>
                            <div class="document-meta">
                                <span class="document-category">${data.category}</span>
                                <span class="document-date">Uploaded on: ${formattedDate}</span>
                                <span class="document-visibility">Visibility: ${data.visibility === 'all' ? 'All Students' : 'Specific Students'}</span>
                            </div>
                            ${data.description ? `<p class="document-description">${data.description}</p>` : ''}
                        </div>
                        <div class="document-actions">
                            <button class="document-btn view-btn" title="View Document" onclick="window.open('${data.fileUrl}', '_blank')">
                                <span class="material-icons">visibility</span>
                            </button>
                            <button class="document-btn delete-btn" title="Delete Document" data-id="${doc.id}" data-filename="${fileName}">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            documentsList.innerHTML = documentsHTML;
            
            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    if (confirm('Are you sure you want to delete this document?')) {
                        const docId = button.getAttribute('data-id');
                        deleteDocument(docId);
                    }
                });
            });
            
        } catch (error) {
            console.error("Error loading documents:", error);
            documentsList.innerHTML = `
                <div class="no-documents">
                    <span class="material-icons">error</span>
                    <h3>Error loading documents</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    // Delete document
    async function deleteDocument(docId) {
        try {
            // Get document data
            const docRef = db.collection('documents').doc(docId);
            const doc = await docRef.get();
            
            if (!doc.exists) {
                showNotification('Document not found', true);
                return;
            }
            
            const data = doc.data();
            
            // Delete file from storage if URL exists
            if (data.fileUrl) {
                // Extract the path from the URL
                const fileRef = storage.refFromURL(data.fileUrl);
                await fileRef.delete();
            }
            
            // Delete document from Firestore
            await docRef.delete();
            
            // Show success notification
            showNotification('Document deleted successfully!');
            
            // Refresh document list
            loadDocuments(filterCategory.value);
            
        } catch (error) {
            console.error("Error deleting document:", error);
            showNotification(`Error deleting document: ${error.message}`, true);
        }
    }

    // Filter documents by category
    filterCategory.addEventListener('change', () => {
        loadDocuments(filterCategory.value);
    });

    // Initial load
    loadDocuments();
});