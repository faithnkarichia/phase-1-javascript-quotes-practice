document.addEventListener('DOMContentLoaded', () => {
    const quoteList = document.getElementById('quote-list');
    const newQuoteForm = document.getElementById('new-quote-form');
  
    // Fetch and display quotes on page load
    fetchQuotes();
  
    // Event listener for adding a new quote
    newQuoteForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const newQuote = document.getElementById('new-quote').value.trim();
      const author = document.getElementById('author').value.trim();
  
      if (newQuote && author) {
        addNewQuote(newQuote, author);
        // Clear form fields
        document.getElementById('new-quote').value = '';
        document.getElementById('author').value = '';
      }
    });
  
    // Event listener for sorting quotes by author
    const sortButton = document.createElement('button');
    sortButton.textContent = 'Sort by Author';
    sortButton.classList.add('btn', 'btn-secondary', 'mb-3');
    newQuoteForm.insertAdjacentElement('beforebegin', sortButton);
  
    sortButton.addEventListener('click', function() {
      fetchQuotes(true);
    });
  
    // Function to fetch quotes from the server
    function fetchQuotes(sorted = false) {
      fetch('http://localhost:3000/quotes?_embed=likes')
        .then(response => response.json())
        .then(quotes => {
          if (sorted) {
            quotes.sort((a, b) => a.author.localeCompare(b.author));
          }
          renderQuotes(quotes);
        })
        .catch(error => console.error('Error fetching quotes:', error));
    }
  
    // Function to render quotes in the DOM
    function renderQuotes(quotes) {
      quoteList.innerHTML = '';
      quotes.forEach(quote => {
        const quoteItem = document.createElement('li');
        quoteItem.classList.add('quote-card');
        quoteItem.innerHTML = `
          <blockquote class="blockquote">
            <p class="mb-0">${quote.quote}</p>
            <footer class="blockquote-footer">${quote.author}</footer>
            <br>
            <button class='btn-success'>Likes: <span>${quote.likes ? quote.likes.length : 0}</span></button>
            <button class='btn-danger'>Delete</button>
          </blockquote>
        `;
  
        // Like button functionality
        const likeButton = quoteItem.querySelector('.btn-success');
        likeButton.addEventListener('click', function() {
          addLike(quote, likeButton);
        });
  
        // Delete button functionality
        const deleteButton = quoteItem.querySelector('.btn-danger');
        deleteButton.addEventListener('click', function() {
          deleteQuote(quote.id, quoteItem);
        });
  
        quoteList.appendChild(quoteItem);
      });
    }
  
    // Function to add a new quote
    function addNewQuote(quote, author) {
      fetch('http://localhost:3000/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quote, author })
      })
      .then(response => response.json())
      .then(newQuote => {
        newQuote.likes = [];
        renderQuotes([...document.querySelectorAll('.quote-card')].map(q => ({
          id: q.dataset.id,
          quote: q.querySelector('.mb-0').textContent,
          author: q.querySelector('.blockquote-footer').textContent,
          likes: []
        })), newQuote);
      })
      .catch(error => console.error('Error adding new quote:', error));
    }
  
    // Function to add a like to a quote
    function addLike(quote, likeButton) {
      fetch('http://localhost:3000/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quoteId: quote.id })
      })
      .then(response => response.json())
      .then(() => {
        const likeCount = parseInt(likeButton.querySelector('span').textContent);
        likeButton.querySelector('span').textContent = likeCount + 1;
      })
      .catch(error => console.error('Error adding like:', error));
    }
  
    // Function to delete a quote
    function deleteQuote(id, quoteItem) {
      fetch(`http://localhost:3000/quotes/${id}`, {
        method: 'DELETE'
      })
      .then(() => {
        quoteItem.remove();
      })
      .catch(error => console.error('Error deleting quote:', error));
    }
  });
  