
let totalConversations = 0;

document.addEventListener('DOMContentLoaded', loadConversations('conversations.json'));

document.getElementById('searchInput').addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        searchConversations();
    }
});

document.getElementById('searchInput').addEventListener('input', function () {
    if (!this.value) {
        updateCounter(totalConversations);
    }
});

document.getElementById('loadFileButton').addEventListener('click', function () {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const conversations = JSON.parse(e.target.result);
                loadConversationStream(conversations);
            } catch (error) {
                console.error('Error reading or parsing file:', error);
            }
        };
        reader.readAsText(file);
    } else {
        loadConversations('conversations.json');
    }
});


function loadConversations(fileName) {
    let counter = 0;
    const countEl = document.getElementById('conversation-count');
    const listEl = document.getElementById('conversations-list');
    listEl.innerHTML = '';

    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
        })
        .then(conversationsArray => {
            const listEl = document.getElementById('conversations-list')
            conversationsArray.forEach(conversation => {
                const titleEl = document.createElement('div')
                titleEl.classList.add('conversation-title')
                titleEl.textContent = conversation.title || `Conversation ${index + 1}`
                titleEl.onclick = () => displayConversation(conversation);
                listEl.appendChild(titleEl);
                countEl.textContent = counter++
            });
        })
        .catch(error => {
            console.error('Error loading conversations:', error)
        })
    updateCounter(totalConversations);
}

function loadConversationStream(conversationsData) {
    let counter = 0;
    const countEl = document.getElementById('conversation-count');
    const listEl = document.getElementById('conversations-list');
    listEl.innerHTML = ''; // Clear previous conversations

    conversationsData.forEach(conversation => {
        const titleEl = document.createElement('div');
        titleEl.classList.add('conversation-title');
        titleEl.textContent = conversation.title || `Conversation ${counter + 1}`;
        titleEl.onclick = () => displayConversation(conversation);
        listEl.appendChild(titleEl);
        counter++;
    });
    updateCounter(counter);
}

function displayConversation(conversation) {
    const conversationEl = document.getElementById('conversation');
    conversationEl.innerHTML = '';

    if (conversation.mapping) {
        Object.entries(conversation.mapping).forEach(([key, obj]) => {
            if (obj.message
                && obj.message.author.role !== 'system' && obj.message.author.role !== 'tool'
                && obj.message.content.content_type === 'text'
                && obj.message.content.parts.length > 0) {
                displayMessage(obj.message);
            }

        });
    } else {
        console.error('No mapping found in conversation:', conversation);
    }
}

function displayMessage(message) {
    const conversationEl = document.getElementById('conversation');
    const messageEl = document.createElement('div');
    messageEl.classList.add('message', message.author.role);
    messageEl.setAttribute('data-author', message.author.role === 'user' ? 'You' : 'GPT');

    const timeString = message.create_time ? new Date(message.create_time * 1000).toLocaleString() : 'Unknown time';
    const metadataEl = document.createElement('div');
    metadataEl.classList.add('message-metadata');
    metadataEl.textContent = `${timeString} - ${message.id.substring(0, 8)}`

    const formattedMessageContent = formatMessageText(message.content.parts);

    const copyButton = document.createElement('span');
    copyButton.classList.add('copy-button');
    copyButton.textContent = 'Copy';
    copyButton.onclick = function () {
        navigator.clipboard.writeText(message.content.parts.join(' '))
            .then(() => {
                copyButton.style.backgroundColor = 'green';
                setTimeout(() => {
                    copyButton.style.backgroundColor = '';
                }, 2000);
            })
            .catch(err => console.error('Could not copy message because: ', err))
    }

    const contentEl = document.createElement('div');
    contentEl.innerHTML = formattedMessageContent;
    contentEl.classList.add('message-content');
    messageEl.insertBefore(copyButton, messageEl.firstChild);
    messageEl.appendChild(metadataEl);
    messageEl.appendChild(contentEl);
    conversationEl.appendChild(messageEl);
}


function searchConversations() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    ul = document.getElementById("conversations-list");
    li = ul.getElementsByClassName("conversation-title");

    for (i = 0; i < li.length; i++) {
        txtValue = li[i].textContent || li[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
    let visibleConversations = 0;
    for (i = 0; i < li.length; i++) {
        if (li[i].style.display !== "none") {
            visibleConversations++;
        }
    }
    updateCounter(visibleConversations);
}

function formatMessageText(parts) {
    let formattedText = parts.join(' ');
    formattedText = formattedText.replace(/^[###]{3,4} (.*?)($)/gm, '<span class="subtitle">$1</span>');
    formattedText = formattedText.replace(/\\\\/g, '\\');
    formattedText = formattedText.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    return formattedText;
}

function updateCounter(count) {
    const countEl = document.getElementById('conversation-count');
    countEl.textContent = count;
}
