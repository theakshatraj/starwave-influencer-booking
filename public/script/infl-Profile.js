document.getElementById('picUpload').addEventListener('change', function(e) {
    const preview = document.getElementById('preview');
    const previewDiv = document.getElementById('imagePreview');
    
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            previewDiv.style.display = 'block';
        }
        
        reader.readAsDataURL(e.target.files[0]);
    }
});
function validateForm() {
    const fileInput = document.getElementById('picUpload');
    const file = fileInput.files[0];
    
    if (file) {
        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return false;
        }
        
        // Check file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            return false;
        }
    }
    
    return true;
}