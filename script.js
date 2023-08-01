fetch('data.json')
  .then(response => response.json())
  .then(commentData => {
    const commentSection = document.getElementById('comment-section');

    function displayComments(comments, parentElement) {
      comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        parentElement.appendChild(commentElement);
    
        if (comment.replies && comment.replies.length > 0) {
          const replySection = document.createElement('div');
          replySection.classList.add('reply-section');
          parentElement.appendChild(replySection);

          const replyLine = document.createElement('div');
          replyLine.classList.add('reply-line');
          replySection.appendChild(replyLine);
  
    
          displayComments(comment.replies, replySection);
        }
      });
    }


    function createEditButton(comment, commentElement) {
      if (comment.user.username === commentData.currentUser.username) {
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');
        editButton.dataset.commentID = comment.id;
        commentElement.appendChild(editButton);
      }
    }

    
    

    function createCommentElement(comment, isReply) {
      const commentElement = document.createElement('div');
      commentElement.classList.add('comment',);

      comment.vote = 0;

      createEditButton(comment, commentElement);
      

      const userImage = document.createElement('img');
      userImage.src = comment.user.image.png; // Assuming PNG format
      userImage.alt = comment.user.username;
      userImage.classList.add('user-profile-picture'); // Add a class to style the image if needed
      commentElement.appendChild(userImage);

      const userContainer = document.createElement('div');
      userContainer.classList.add('comment-user');
      commentElement.appendChild(userContainer);     

      const username = document.createElement('span');
      username.classList.add('user-username');
      username.textContent = comment.user.username;
      userContainer.appendChild(username);

      const commentTimestamp = document.createElement('span');
      commentTimestamp.classList.add('comment-timestamp');
      commentTimestamp.textContent = comment.createdAt;
      commentElement.appendChild(commentTimestamp); 


      //comment dates
      const createdAt = document.createElement('span');
      // createdAt.classList.add('comment-timestamp');
      // createdAt.textContent = new Date(comment.createdAt).toLocaleString();
      commentElement.appendChild(createdAt);
      
      //mentions
      if (comment.replyingTo) {
        const replyMention = document.createElement('span');
        replyMention.classList.add('reply-mention');
        replyMention.textContent = `@${comment.replyingTo}`;
        commentElement.appendChild(replyMention);
        
      }


      const commentText = document.createElement('p');
      commentText.textContent = comment.content;
      commentElement.appendChild(commentText);
      

      const scoreContainer = document.createElement('div');
      scoreContainer.classList.add('score-container');
      commentElement.appendChild(scoreContainer);
      
      const upvoteButton = document.createElement('button');
      upvoteButton.classList.add('upvote-button');
      upvoteButton.textContent = '+';
      scoreContainer.appendChild(upvoteButton);

      const scoreText = document.createElement('span');
      scoreText.classList.add('score-text');
      scoreText.textContent = `${comment.score}`;
      scoreContainer.appendChild(scoreText);

      const downvoteButton = document.createElement('button');
      downvoteButton.classList.add('downvote-button');
      downvoteButton.textContent = '-';
      scoreContainer.appendChild(downvoteButton);

      upvoteButton.addEventListener('click', () => {
        if (comment.vote === 0) {
          comment.score++;
          comment.vote = 1;
          scoreText.textContent = `${comment.score}`;
        } else if (comment.vote === -1) {
          comment.score += 1;
          comment.vote = 1;
          scoreText.textContent = `${comment.score}`;
        }
      });
    
      downvoteButton.addEventListener('click', () => {
        if (comment.vote === 0) {
          comment.score--;
          comment.vote = -1;
          scoreText.textContent = `${comment.score}`;
        } else if (comment.vote === 1) {
          comment.score -= 1;
          comment.vote = -1;
          scoreText.textContent = `${comment.score}`;
        }
      });
      

      const currentUser = commentData.currentUser;

      if (currentUser && comment.user.username === currentUser.username) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-comment');
        deleteButton.dataset.commentID = comment.id;
        commentElement.appendChild(deleteButton);
      } else {
        const replyButton = document.createElement('button');
        replyButton.textContent = 'Reply';
        replyButton.classList.add('reply-comment');
        replyButton.dataset.commentID = comment.id;
        commentElement.appendChild(replyButton);

        const replyForm = document.createElement('form');
        replyForm.id = `reply-form-${comment.id}`;
        replyForm.classList.add('replyFormInput');
        replyForm.style.display = 'none';

        const replyInput = document.createElement('input');
        replyInput.type = 'text';
        replyInput.placeholder = '';
        replyInput.classList.add('replyInput');
        replyForm.appendChild(replyInput);

        const submitReplyButton = document.createElement('button');
        submitReplyButton.textContent = 'REPLY';
        submitReplyButton.classList.add('replyBTN');
        replyForm.appendChild(submitReplyButton);

        commentElement.appendChild(replyForm);

        replyButton.addEventListener('click', () => {
          addReplyForm(comment.id);
        });

        submitReplyButton.addEventListener('click', e => {
          e.preventDefault();
          const replyText = replyInput.value;

          if (replyText.trim() === '') {
            console.log('Please enter a reply!');
            return;
          }

          replyInput.value = '';

          const currentUser = commentData.currentUser;

          const parentComment = findCommentByID(commentData.comments, comment.id);
          if (parentComment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }

            const newReply = {
              id: generateUniqueId(),
              content: replyText,
              createdAt: 'Just now',
              score: 0,
              user: currentUser,
              replies: [],
            };

            parentComment.replies.push(newReply);
            saveDataToLocalStorage(commentData);
            const replySection = document.createElement('div');
            replySection.classList.add('reply-section');
            replySection.appendChild(createCommentElement(newReply));
            commentElement.appendChild(replySection);
          }

          replyForm.style.display = 'none';
        });
      }

      //mentions function
      const replyMention = document.createElement('span');
      replyMention.classList.add('reply-mention');
      const replyingTo = comment.replyingTo;
      if (replyingTo) {
        const mentionedUser = commentData.comments.find(c => c.id === replyingTo);
        if (mentionedUser) {
          replyMention.textContent = `Replying to: @${mentionedUser.user.username}`;
          commentElement.appendChild(replyMention);
        }
      }

      return commentElement;
    }

    

    function addReplyForm(commentID) {
      const replyForm = document.getElementById(`reply-form-${commentID}`);
      if (replyForm) {
        const replySection = replyForm.parentElement;
        replySection.style.borderLeft = '2px solid #ccc';
        replyForm.style.display = 'flex';
      }
    }
    

    function findCommentByID(comments, commentID) {
      for (const comment of comments) {
        if (comment.id === commentID) {
          return comment;
        }

        if (comment.replies && comment.replies.length > 0) {
          const foundComment = findCommentByID(comment.replies, commentID);
          if (foundComment) {
            return foundComment;
          }
        }
      }

      return null;
    }

    function generateUniqueId() {
      return '_' + Math.random().toString(36).substr(2, 9);
    }

    function saveDataToLocalStorage(data) {
      localStorage.setItem('commentData', JSON.stringify(data));
      console.log('Data saved to local storage:', data);
    }

    function deleteComment(commentID) {
      const comment = findCommentByID(commentData.comments, commentID);

      
  if (comment) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
      <div id="confirmation-dialog">
        <h1>Delete Comment</h1>
        <p>Are you sure you want to delete this comment? This will remove the comment and can’t be undone.</p>
        <div>
          <button id="confirm-delete">YES, DELETE</button>
          <button id="cancel-delete">NO,CANCEL</button>
        </div>
      </div>
    `;
    modalContainer.classList.add('active');

    const confirmButton = document.getElementById('confirm-delete');
    const cancelButton = document.getElementById('cancel-delete');

    confirmButton.addEventListener('click', () => {
      const parentComment = findParentComment(commentData.comments, commentID);
      if (parentComment) {
        parentComment.replies = parentComment.replies.filter(reply => reply.id !== commentID);
      } else {
        commentData.comments = commentData.comments.filter(c => c.id !== commentID);
      }

      saveDataToLocalStorage(commentData);
      commentSection.innerHTML = '';
      displayComments(commentData.comments, commentSection);
      console.log('Deleted comment', commentID);

      modalContainer.classList.remove('active');
    });

    cancelButton.addEventListener('click', () => {
      modalContainer.classList.remove('active');
    });
  }
}

    function findParentComment(comments, commentID) {
      for (const comment of comments) {
        if (comment.replies && comment.replies.length > 0) {
          const foundComment = comment.replies.find(reply => reply.id === commentID);
          if (foundComment) {
            return comment;
          } else {
            const parentComment = findParentComment(comment.replies, commentID);
            if (parentComment) {
              return parentComment;
            }
          }
        }
      }
      return null;
    }

    displayComments(commentData.comments, commentSection);

    commentSection.addEventListener('click', event => {
      if (event.target.classList.contains('reply-comment')) {
        const commentID = event.target.dataset.commentID;
        addReplyForm(commentID);
      } else if (event.target.classList.contains('delete-comment')) {
        const commentID = event.target.dataset.commentID;
        deleteComment(commentID);
      }
    });
    
    const commentForm = document.getElementById('comment-form');
    commentForm.addEventListener('submit', event => {
      event.preventDefault();
      const commentInput = document.getElementById('comment-input');
      const commentText = commentInput.value;
      
      if (commentText.trim() === '') {
        console.log('Please enter a comment!');
        return;
      }
      
      commentInput.value = '';
      
      const currentUser = commentData.currentUser;
      const newComment = {
        id: generateUniqueId(),
        content: commentText,
        createdAt: 'Just now',
        score: 0,
        user: currentUser,
        replies: [],
      };
      
      commentData.comments.push(newComment);
      saveDataToLocalStorage(commentData);
      commentSection.innerHTML = '';
      displayComments(commentData.comments, commentSection);
    });
  })
  .catch(error => console.error(error));