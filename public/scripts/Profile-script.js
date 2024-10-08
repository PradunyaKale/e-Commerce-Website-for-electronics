function selectImage() {
    document.getElementById('imageInput').click();
  }
  
  function previewImage(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
  
      reader.onload = function(e) {
        const previewImage = document.getElementById('previewImage');
        previewImage.src = e.target.result;
        document.getElementById('uploadButton').removeAttribute('disabled');
      }
  
      reader.readAsDataURL(input.files[0]);
    }
  }
  
  function uploadImage() {
    const formData = new FormData();
    const imageFile = document.getElementById('imageInput').files[0];
    formData.append('imageFile', imageFile);
  
    // Send the FormData to a server-side script using fetch API
    fetch('upload.php', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error('Failed to upload image');
      }
    })
    .then(result => {
      alert(result); // Display the server response
      resetPreview(); // Reset the image preview and upload button
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to upload image');
      resetPreview(); // Reset the image preview and upload button
    });
  }
  
  function resetPreview() {
    const previewImage = document.getElementById('previewImage');
    previewImage.src = 'placeholder.png'; // Reset to placeholder image
    document.getElementById('uploadButton').setAttribute('disabled', true);
    document.getElementById('imageInput').value = ''; // Clear selected file in input
  }
  
  // Attach event listener to the file input element
  document.getElementById('imageInput').addEventListener('change', previewImage);