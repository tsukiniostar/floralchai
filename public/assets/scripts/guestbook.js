(function () {
  var form = document.getElementById("guestbooks___guestbook-form");
  var messagesContainer = document.getElementById("guestbooks___guestbook-messages-container");

  // paging state
  const pageSize = 3;
  var currentPage = 1;
  var totalPages = 1;
  var isLoading = false;

  // Create pagination container
  var paginationContainer = document.createElement("div");
  paginationContainer.id = "guestbooks___pagination";
  paginationContainer.style.textAlign = "center";
  paginationContainer.style.margin = "20px 0";

  var prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  prevBtn.disabled = true;

  var pageInfo = document.createElement("span");
  pageInfo.style.margin = "0 15px";
  pageInfo.textContent = "Page 1 of 1";

  var nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";

  paginationContainer.appendChild(prevBtn);
  paginationContainer.appendChild(pageInfo);
  paginationContainer.appendChild(nextBtn);

  messagesContainer.insertAdjacentElement("afterend", paginationContainer);

  // Handle form submit
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    var formData = new FormData(form);
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
    });

    let errorContainer = document.querySelector("#guestbooks___error-message");
    if (!errorContainer) {
      errorContainer = document.createElement("div");
      errorContainer.id = "guestbooks___error-message";
      const submitButton = document.querySelector("#guestbooks___guestbook-form input[type='submit']");
      submitButton.insertAdjacentElement('afterend', errorContainer);
    }

    if (response.ok) {
      form.reset();
      guestbooks___loadMessages(1); // reset to first page
      errorContainer.innerHTML = "";
    } else {
      const err = await response.text();
      console.error("Error:", err);
      if (response.status === 401) {
        errorContainer.innerHTML = "";
      } else {
        errorContainer.innerHTML = err;
      }
    }
  });

  function guestbooks___loadMessages(page) {
    if (isLoading) return;
    isLoading = true;

    var apiUrl =
      "https://guestbooks.meadow.cafe/api/v2/get-guestbook-messages/885?page=" +
      page +
      "&limit=" +
      pageSize;

    fetch(apiUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        var messages = data.messages || [];
        var pagination = data.pagination || {};

        currentPage = pagination.page || page;
        totalPages = pagination.totalPages || 1;

        if (messages.length === 0 && currentPage === 1) {
          messagesContainer.innerHTML = "<p>There are no messages on this guestbook.</p>";
        } else {
          messagesContainer.innerHTML = "";

          messages.forEach(function (message) {
            var messageContainer = document.createElement("div");
            messageContainer.className = "guestbook-message";

            var messageHeader = document.createElement("p");
            var boldElement = document.createElement("b");

            if (message.Website) {
              var link = document.createElement("a");
              link.href = message.Website ? message.Website : "#";
              link.textContent = message.Name;
              link.target = "_blank";
              link.rel = "ugc nofollow noopener";
              boldElement.appendChild(link);
            } else {
              var textNode = document.createTextNode(message.Name);
              boldElement.appendChild(textNode);
            }
            messageHeader.appendChild(boldElement);

            var createdAt = new Date(message.CreatedAt);
            var formattedDate = createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            var dateElement = document.createElement("small");
            dateElement.textContent = " - " + formattedDate;
            messageHeader.appendChild(dateElement);

            var messageBody = document.createElement("blockquote");
            messageBody.textContent = message.Text;

            messageContainer.appendChild(messageHeader);
            messageContainer.appendChild(messageBody);

            messagesContainer.appendChild(messageContainer);
          });
        }

        // Update pagination UI
        pageInfo.textContent = "Page " + currentPage + " of " + totalPages;
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;

        isLoading = false;
      })
      .catch(function (error) {
        console.error("Error fetching messages:", error);
        isLoading = false;
      });
  }

  // Button event listeners
  prevBtn.addEventListener("click", function () {
    if (currentPage > 1) {
      guestbooks___loadMessages(currentPage - 1);
    }
  });

  nextBtn.addEventListener("click", function () {
    if (currentPage < totalPages) {
      guestbooks___loadMessages(currentPage + 1);
    }
  });

  // Initial load
  guestbooks___loadMessages(1);
})();
