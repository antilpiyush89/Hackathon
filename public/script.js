document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const imageUpload = document.getElementById('imageUpload');

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    imageUpload.addEventListener('change', uploadImage);

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message, 'user-message');
            messageInput.value = '';
            addLoader(); // Show loader

            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            })
            .then(response => response.json())
            .then(data => {
                removeLoader(); // Remove loader
                const aiResponse = data.data?.answer || 'Sorry, I couldn\'t process that.';
                addMessage(aiResponse, 'ai-message');
            })
            .catch(error => {
                removeLoader(); // Remove loader
                console.error('Error:', error);
                addMessage('An error occurred. Please try again.', 'ai-message');
            });
        }
    }

    function uploadImage() {
        const file = imageUpload.files[0];
        if (file) {
            addMessage('Uploading and analyzing image...', 'ai-message');
            addLoader(); // Show loader

            const formData = new FormData();
            formData.append('image', file);

            fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                removeLoader(); // Remove loader
                console.log('API Response:', data); // Log the entire response for debugging
                if (data.error) {
                    addMessage(`Error: ${data.error}`, 'ai-message');
                } else {
                    const analysis = data.data?.response || data.data?.analysis || 'Image analysis completed, but no detailed information available.';
                    addMessage(`Image analysis: ${analysis}`, 'ai-message');
                }
            })
            .catch(error => {
                removeLoader(); // Remove loader
                console.error('Error:', error);
                addMessage('An error occurred while uploading and analyzing the image.', 'ai-message');
            });
        }
    }

    function addLoader() {
        const loaderElement = document.createElement('div');
        loaderElement.classList.add('loader', 'skeleton-loader');
        loaderElement.innerHTML = '<div class="skeleton"></div>'; // Skeleton structure
        chatMessages.appendChild(loaderElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeLoader() {
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.remove();
        }
    }

    function addMessage(text, className) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', className);
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
