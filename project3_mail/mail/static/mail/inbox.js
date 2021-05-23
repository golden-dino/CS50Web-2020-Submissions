document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', () => compose_email());

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email(emailData) {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-view').style.display = 'none';

    // Empty form fields to remove stale content.
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';


    // If data is given in the function's argument, preload the form values with appropriate data.
    // Argument is passed when this function is called for replying a message.
    if(emailData !== undefined) {

        // Enumerate form fields with given data.
        document.querySelector('#compose-recipients').value = emailData.sender;
        
        // Modified subject field
        // Append "Re: " string to subject line.
        var pos = emailData.subject.search("Re:");
        if(pos < 0) {
            var subjectText = "Re:".concat(" ", emailData.subject);
        }
        else {
            var subjectText = emailData.subject;
        }
        document.querySelector('#compose-subject').value = subjectText;
        
        // Modified Body field.
        document.querySelector('#compose-body').value = `On ${emailData.timestamp} ${emailData.sender} wrote: \n ${emailData.body} \n ---------------------------------------- \n\n`;
        
        // Use following line for checking the properties of the input object.
        // `Type: ${typeof emailData} Length: ${Object.keys(emailData).length} Constructor: ${emailData.constructor}`       
    }


    // Following code will execute when the form is submitted.
    // Get the form data and send it using API when user submits the form.
    document.querySelector('form').onsubmit = function() {

        //Get email parameters.
        const recipients_email_list = document.querySelector('#compose-recipients').value;
        const subject_text = document.querySelector('#compose-subject').value;
        const mail_body = document.querySelector('#compose-body').value;

        // Send the data using the given API
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients_email_list,
                subject: subject_text,
                body: mail_body
            })
        })
        // Converting the response to JSON
        .then(response => response.json())
        // Printing the JSON response 
        .then(result => {
            // Print result
            console.log(result);
            // Approach-4 Checking if the mail is properly sent (Working)
            if(result['message'] == "Email sent successfully."){
                // Load the sent page if message is delivered successfully.
                load_mailbox('sent');
            }
        })
        // Logging the Errors if any. 
        .catch(error => {
            console.log('Error', error);
        });

        //Prevent default submission (Important!! Otherwise the message won't log on your chrome.)
        return false;

    }

}

function load_mailbox(mailbox) {
  
    // Show the mailbox and hide other views.
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';

    // Clear the mailbox area of stale content.
    document.querySelector('#emails-view').innerHTML = "";

    // Show the mailbox name.
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


    // Add your mailbox viewing code here:

    // Making API call to gather the emails by sending a GET Query '/emails/inbox'
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        //Print emails
        console.log(emails);

        // Write code for displaying your mails in mailbox.

        // Each divison shoud display: sender's name, subject line and timestamp.
        // Unread = white background , Read = gray background.
        
        // Approach-2 Iterating through each mail object using forEach method.
        emails.forEach(function(item, mail_index, email_obj) {

            // Extracting the required properties from each mail object
            
            var email_sender = email_obj[mail_index].sender;
            var email_subject = email_obj[mail_index].subject;
            var email_timestamp = email_obj[mail_index].timestamp;
            var email_isRead = email_obj[mail_index].read;
            var email_id = email_obj[mail_index].id;

            // Creating a divison for each mail object.
            const mail_tab = document.createElement('div');

            // Setting a class name for this division for further styling using CSS.
            mail_tab.className += "mail-div";

            // Adding the HTML content in the division.
            mail_tab.innerHTML = `

                <div class="mail-id">${email_sender}</div>
                <div class="mail-sub">${email_subject}</div>
                <div class="date-time">${email_timestamp}</div>
            `;

            // Setting the background color of the division using the read property of mail object.
            if(email_isRead){
                // https://www.w3schools.com/JSREF/prop_style_backgroundcolor.asp
                // mail_tab.style.background = "color image repeat attachment position size origin clip|initial|inherit";
                mail_tab.style.background = "#ededed";
            }
            else {
                mail_tab.style.background = "#ffffff";
            }

            

            // Setting an eventListener to this element, when clicked.
            // This function works well with forEach method.
            mail_tab.addEventListener('click', function() {
                // When this element it clicked following code is executed.
                console.log(`Mail with id ${email_id} is clicked.`)
                // Call the load_mail function to view the mail in separate section.
                load_mail(email_id, mailbox);
            })

            // Appending the divison in the element with ID emails-view.
            document.querySelector('#emails-view').append(mail_tab);
            
        })

    });
}


// Adding a new function to show the email.
function load_mail(mail_id, mailbox) {

    // Show the selected email and hide other views.
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';

    // Clearing the previous stale content.
    document.querySelector('#email-view').innerHTML = "";

    // Fetch the requested mail data by querying the API
    fetch(`/emails/${mail_id}`)
    .then(response => response.json())
    .then(email => {
        // Print email at console.
        console.log(email);

        // Acquiring data from email object.
        // Required parameters: sender, recipients, subject, timestamp, and body.
        var email_sender = email.sender;
        var email_recipients = email.recipients;
        var email_subject = email.subject;
        var email_timestamp = email.timestamp;
        var email_body = email.body;
        var email_isRead = email.read;

        // If email is not read, mark it read.
        if(!email_isRead){
            // Marking the clicked email as read. PUT request through API.
            fetch(`/emails/${mail_id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
            })
        }
        
        // Creating a divison for placing content of requested mail.
        const mail_view_div = document.createElement('div');

        // Setting a class name for this division for further styling using CSS.
        mail_view_div.className = "mail-view-internal-div";

        // Adding the HTML content in the division.
        mail_view_div.innerHTML = `

            <div class="mail-view-from"><b>From:</b> ${email_sender}</div>

            <div class="mail-view-to"><b>To:</b> ${email_recipients}</div>

            <div class="mail-view-sub"><b>Subject:</b> ${email_subject}</div>

            <div class="mail-view-date-time"><b>Timestamp:</b> ${email_timestamp}</div>

            <hr class="mail-view-details-endline">

            <div class="mail-view-body">${email_body}</div>

        `;

        // Appending the created division to email-view division. (Look inbox.html for more.)
        document.querySelector('#email-view').append(mail_view_div);

        // Special features for inbox mails.
        if(mailbox === "inbox") {
            // Feature I - Creating a button for archive.
            const archiveButton = document.createElement('BUTTON');
            archiveButton.className = "btn btn-sm btn-outline-primary archive-button";
            archiveButton.innerHTML = "Archive";
            archiveButton.addEventListener('click', function() {

                // Debug log for button press event.
                console.log(`Archive button is pressed for mail-id: ${mail_id}`);

                // Marking email as archived. PUT request through API.
                fetch(`/emails/${mail_id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: true
                    })
                })

                // Load indox after waiting 500 ms to update the database.
                // M1
                // setTimeout(load_mailbox, 500, 'inbox');
                // M2
                setTimeout(() => load_mailbox('inbox'), 500);

            });

            

            // Appending the archive button to email-view division.
            document.querySelector('#email-view').append(archiveButton);


            // Feature II - Creating a button for reply.
            const replyButton = document.createElement('BUTTON');
            replyButton.className = "btn btn-sm btn-outline-primary reply-button";
            replyButton.innerHTML = "Reply";


            // M1
            // Using .onclick
            replyButton.onclick = function() {

                // Debug log for button press event.
                console.log(`Reply button is pressed for mail-id: ${mail_id}`);

                // Calling the compose-email function for reply.
                compose_email(email);

            };

            // M2
            // Using eventListener('click')
            // replyButton.addEventListener('click', function() {

            //     // Debug log for button press event.
            //     console.log(`Reply button is pressed for mail-id: ${mail_id}`);

            //     // Calling the compose-email function for reply.
            //     compose_email(email);
            // });


            // Appending the reply button to email-view division.
            document.querySelector('#email-view').append(replyButton);

        }


        // Special features for archived mails.
        if(mailbox === "archive") {
            // Feature I - Creating a button to unarchive.
            const unarchiveButton = document.createElement('BUTTON');
            unarchiveButton.className = "btn btn-sm btn-outline-primary unarchive-button";
            unarchiveButton.innerHTML = "Unarchive";
            unarchiveButton.addEventListener('click', function() {

                // Debug log for button press event.
                console.log(`Archive button is pressed for mail-id: ${mail_id}`);

                // Marking email as unarchived. PUT request through API.
                fetch(`/emails/${mail_id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: false
                    })
                })

                // Load indox after waiting 500 ms to update the database.
                // M1
                // setTimeout(load_mailbox, 500, 'inbox');
                // M2
                setTimeout(() => load_mailbox('inbox'), 500);

            });

            // Appending the unarchive button to email-view division.
            document.querySelector('#email-view').append(unarchiveButton);
        }

    })

}

