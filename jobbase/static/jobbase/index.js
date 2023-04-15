document.addEventListener('DOMContentLoaded', function() {
 
    // Send a request to the server to determine if the user is logged in
    fetch('checklogin')
    .then(response => response.json())
    .then(info => {
     
        if (info[0]) {
            // Send an additional request to determine if the user has created a profile 
            fetch('firstlogin')
            .then(response => response.json())
            .then(hasProfile => {
                
                // Verify if the user has created a profile (hasProfile[0]) and if the user is signed up as an employer or job seeker (hasProfile[1])
                if (!hasProfile[0]) {
                    createProfile(hasProfile[1])
                } else {
                    // The Google Places API does not let us use multiple search bars in a document, therefore we have to move the search bar to needed locations, in this
                    // case we need a search bars that uses Google Places API in the create profile modal
                    searchBarSwap()
                }
            })
        } else {
            searchBarSwap()
        }
    })

    // Add an eventListener to the job search function
    if (document.querySelector('#findJobsBtn') != null) {
        document.querySelector('#findJobsBtn').addEventListener('click', () => {
            allPosts('search')
        })
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter'){
                allPosts('search')
            }})
    }
    
    // Make sure that we always arrived at the desired location when using a local enviroment
    if (this.location.href === 'http://127.0.0.1:8000/' || this.location.href === 'http://localhost:8000/') {
        allPosts('allposts')
    }
    if (this.location.href === 'http://127.0.0.1:8000/mypage' || this.location.href === 'http://localhost:8000/mypage') {
        myJobListings()
    }

    // Prefill profile form if on profile page and add eventlistener to profile Form
    prefillProfile()
    if (document.querySelector('#profileForm') != null) {

        document.querySelector('#profileForm').addEventListener('submit', (event) => {
            event.preventDefault()
            editProfile()
            document.querySelector('#uploadCVForm').submit()
        })
    }

    // Pass name into message function
    if (this.location.href === 'http://127.0.0.1:8000/messageview' || this.location.href === 'http://localhost:8000/messageview') {
        fetch('checklogin')
        .then(response => response.json())
        .then(info => {

            messageView(info[1])
        })
    }
    
    // Make sure the route is changed back to main page if refreshing page on main page (because of Bootstraps ScrollSpy feature)
    const str = this.location.href
    const substrA = 'list-item'
    const substrB = '#'
    if (str.includes(substrA) || str.includes(substrB)) {
        this.location.href = 'http://127.0.0.1:8000/'
    }

    // Make Continue Buttons on register and login page sensitive to enter key
    if (document.querySelector('#continueBtn') != undefined) {
        document.querySelector('#continueBtn').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                document.querySelector('#continueBtn').click()
            }
        })
    }

    // If we are on login Page
    if (this.location.href === 'http://127.0.0.1:8000/login' || this.location.href === 'http://localhost:8000/login') {
        document.querySelector('#continueBtn').addEventListener('click', () => {
            if (document.querySelector('#usernameInput').value != '' && document.querySelector('#passwordInput').value === '') {
                document.querySelector('#usernameInput').classList.add('d-none')
                document.querySelector('#passwordInput').classList.remove('d-none')
                document.querySelector('#passwordInput').focus()
            } 
            else if (document.querySelector('#usernameInput').value != '' && document.querySelector('#passwordInput').value != '') {
                document.querySelector('#loginForm').submit();
            }
        })
        // Add Eventlistener to Login elements
        document.querySelector('#usernameInput').addEventListener('keydown', (event) => {
            if (event.key === 'Enter'){
                document.querySelector('#continueBtn').click()
            }
        })
        
        document.querySelector('#passwordInput').addEventListener('keydown', (event) => {
            if (event.key === 'Enter'){
                document.querySelector('#continueBtn').click()
            }
        })
        document.querySelector('#navBar').classList.add('d-none')
    }

    // If we are on register page
    if (this.location.href === 'http://127.0.0.1:8000/register' || this.location.href === 'http://localhost:8000/register') {

        document.querySelector('#navBar').classList.add('d-none')
        document.querySelector('#continueBtn').addEventListener('click', () => {
            // Validate if email provided fits email paradigm
            if (document.querySelector('#email').checkValidity()) {
                
                // Remove red inputs if successfull inserted data
                document.querySelector('#registerForm').classList.remove('was-validated')

                document.querySelector('#username').classList.add('d-none')
                document.querySelector('#email').classList.add('d-none')
                document.querySelector('#password0').classList.remove('d-none')
                document.querySelector('#password0').focus()
            }
            else {
                // Set Bootstraps input to become red
                document.querySelector('#registerForm').classList.add('was-validated')
            }

            if (document.querySelector('#password0').value != '') {
                if (document.querySelector('#password0').checkValidity()) {
                    document.querySelector('#registerForm').classList.remove('was-validated')
                    document.querySelector('#password0').classList.add('d-none')
                    document.querySelector('#password1').classList.remove('d-none')
                    document.querySelector('#password1').focus()
                }
                else {
                    document.querySelector('#registerForm').classList.add('was-validated')
                }
                
            }

            if (document.querySelector('#password1').value != '' && document.querySelector('#password0').value != '') {
                if (pwMatch(document.querySelector('#password0').value, document.querySelector('#password1').value)) {

                    document.querySelector('#registerForm').classList.remove('was-validated')
                    document.querySelector('#password1').classList.add('d-none')
                    document.querySelector('#status').classList.remove('d-none')

                    document.querySelector('#continueBtn').addEventListener('click', () => {
                        document.querySelector('#registerForm').submit()
                    })

                }
                else {
                    document.querySelector('#registerForm').classList.add('was-validated')
                }
            }
        })
    }
    navbarMobile()

    // Toastfunction
    const toastTrigger = document.getElementById('liveToastBtn')
    const toastLiveExample = document.getElementById('liveToast')
    if (toastTrigger) {
        toastTrigger.addEventListener('click', () => {
            const toast = new bootstrap.Toast(toastLiveExample)

            toast.show()
        })
    }

    // Initialize Tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
})

function createProfile(employer) {

    if (employer === false) {
        
        document.querySelector('#SmodelButton').click()
        document.querySelector('#createProfileForm').addEventListener('submit', () => {
    
            // Get Inputs
            const firstName = document.querySelector('#firstName').value
            const lastName = document.querySelector('#lastName').value
            const name = firstName.concat(" ", lastName)
            const location = document.querySelector('#autocomplete').value

            // Send data to server
            fetch('profile', {
                method: 'POST',
                headers: {
                    "X-CSRFToken": document.cookie.slice(10,)
                },
                body: JSON.stringify({
                    "name": name,
                    "location": location,
                    "employer": employer
                })
            })
            .then(response => {

                if (response.status === 200) {
                    document.querySelector('#dismissModal').click()

                    searchBarSwap()
                } else {
                    alert('Serverside error')
                }
            })
        })

    } else {

        document.querySelector('#autocompleteLabel').innerHTML = 'Headquaters location'

        additionalData = document.createElement('div')
        additionalData.innerHTML = `
                                    <div class="container mt-3">
                                        <label for="companyName" class="form-label">Company Name</label>
                                        <input type="text" id="companyName" class="form-control" required>
                                    </div>
                                    <div class="container mt-3">
                                        <label for="foundationYear" class="form-label">Foundation Year</label>
                                        <input type="number" id="foundationYear" class="form-control" min="578" max="2023" placeholder="Founded in..." required>
                                    </div>
                                    <div class="container mt-3">
                                        <label for="companySize" class="form-label">Company Size</label>
                                        <select class="form-select form-select" id="companySize">
                                            <option>0-10</option>
                                            <option>10-100</option>
                                            <option>100+</option>
                                        </select>
                                    </div>
                                    <div class="container mt-3">
                                        <label for="website" class="form-label">Company Website</label>
                                        <input type="text" id="website" class="form-control">
                                    </div>
                                    `

        document.querySelector('#createProfileForm').append(additionalData)

        document.querySelector('#SmodelButton').click()
        document.querySelector('#createProfileForm').addEventListener('submit', () => {
    
            // Get Inputs
            const firstName = document.querySelector('#firstName').value
            const lastName = document.querySelector('#lastName').value
            const personName = firstName.concat(" ", lastName)
            const companyName = document.querySelector('#companyName').value
            const headquatersLocation = document.querySelector('#autocomplete').value
            const foundationYear = document.querySelector('#foundationYear').value
            const companySize = document.querySelector('#companySize').value
            const website = document.querySelector('#website').value
            
            // Send data to server
            fetch('profile', {
                method: 'POST',
                headers: {
                    "X-CSRFToken": document.cookie.slice(10,)
                },
                body: JSON.stringify({
                    "personName": personName,
                    "companyName": companyName,
                    "headquatersLocation": headquatersLocation,
                    "foundationYear": foundationYear,
                    "companySize": companySize,
                    "website": website,
                    "employer": employer
                })
            })
            .then(response => {

                if (response.status === 200) {
                    document.querySelector('#dismissModal').click()

                    searchBarSwap()
                } else {
                    alert('Serverside error')
                }
            })
        })
    }
}

function editProfile() {

    fetch('profile')
    .then(response => response.json())
    .then(employer => {

        if (employer) {

            // Get Inputs
            const firstName = document.querySelector('#firstName1').value
            const lastName = document.querySelector('#lastName1').value
            const personName = firstName.concat(" ", lastName)
            const companyName = document.querySelector('#companyName1').value
            const headquatersLocation = document.querySelector('#autocomplete').value
            const foundationYear = document.querySelector('#foundationYear1').value
            const companySize = document.querySelector('#companySize1').value
            const website = document.querySelector('#website1').value
    
            // Send data to server
            fetch('profile', {
                method: 'PUT',
                headers: {
                    "X-CSRFToken": document.cookie.slice(10,)
                },
                body: JSON.stringify({
                    "personName": personName,
                    "companyName": companyName,
                    "headquatersLocation": headquatersLocation,
                    "foundationYear": foundationYear,
                    "companySize": companySize,
                    "website": website,
                    "employer": employer
                })
            })
            .then(response => {

                if (response.status === 200) {

                    document.querySelector('#openModal3').click()
                } else {
                    alert('Serverside error')
                }
            })
            
        } else {
            // Get Inputs
            const firstName = document.querySelector('#firstName1').value
            const lastName = document.querySelector('#lastName1').value
            const name = firstName.concat(" ", lastName)
            const location = document.querySelector('#autocomplete').value

            // Send data to server
            fetch('profile', {
                method: 'PUT',
                headers: {
                    "X-CSRFToken": document.cookie.slice(10,)
                },
                body: JSON.stringify({
                    "name": name,
                    "location": location,
                    "employer": employer
                })
            })
            .then(response => {
                if (response.status != 200) {
                    alert('Serverside error')
                } 
            })
        }
    })
}

function myJobListings() {

    fetch('profile')
    .then(response => response.json())
    .then(employer => {

        // If user is employer show employer interface else show Job Seeker interface
        if (employer) {

            let body = document.querySelector('#main1') 
            body.innerHTML = ''

            let pageHeader = document.createElement('div')
            pageHeader.classList.add('hstack', 'gap-2', 'ms-4', 'mb-3')
            pageHeader.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#00649A" class="bi bi-fire mb-2" viewBox="0 0 16 16">
            <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
            </svg><h3 class="fw-bold">My Job Posts</h3>`

            let newJobBtn = document.createElement('div')
            newJobBtn.classList.add('container')
            newJobBtn.innerHTML = `
            <button class="btn btn-primary btn-lg col-8 offset-2 my-5" id="newPostBtn">
                <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-postcard-fill" viewBox="0 0 16 16">
                    <path d="M11 8h2V6h-2v2Z"/>
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm8.5.5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7ZM2 5.5a.5.5 0 0 0 .5.5H6a.5.5 0 0 0 0-1H2.5a.5.5 0 0 0-.5.5ZM2.5 7a.5.5 0 0 0 0 1H6a.5.5 0 0 0 0-1H2.5ZM2 9.5a.5.5 0 0 0 .5.5H6a.5.5 0 0 0 0-1H2.5a.5.5 0 0 0-.5.5Zm8-4v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Z"/>
                </svg>
                <span class="fs-6">New Post</span>
            </button>`

            body.append(pageHeader)
            body.append(newJobBtn)

            fetch('mylistings')
            .then(response => response.json())
            .then(jobPosts => {

                for (let i = 0; i < jobPosts.length; i++) {

                    newPost = document.createElement('div')
                    newPost.classList.add('container', 'my-5', 'p-5', 'border', 'rounded', 'shadow', 'job-post', 'text-center')
                    newPost.id = jobPosts[i].id

                    let active = '<span class="text-danger fw-bold">Not active</span>'
                    let managebtn = 'Activate'
                    let btncolor = 'success'
                    if (jobPosts[i].active) {
                        active = '<span class="text-success fw-bold">Active</span>'
                        managebtn = 'Deactivate'
                        btncolor = 'danger'
                    }

                    let salary;
                    if (jobPosts[i].hourly != 0 && jobPosts[i].annualy != 0) {
                        salary = `${jobPosts[i].annualy}£ per annum,<br>${jobPosts[i].hourly}£ per hour`
                    } else if (jobPosts[i].hourly != 0) {
                        salary = `${jobPosts[i].hourly}£ per hour`
                    } else {
                        salary = `${jobPosts[i].annualy}£ per annum`
                    }
                    
                    let formatDescription = jobPosts[i].jobDescription
                    if (jobPosts[i].jobDescription.length > 135) {
                        formatDescription = `${jobPosts[i].jobDescription.slice(0, 120)}...`
                    }
                    
                    newPost.innerHTML = `
                    <div class="btn-group mt-4 offset-lg-7 mb-lg-0 mb-3">
                        <button class="btn btn-outline-${btncolor} btn-sm ms-1 rounded-pill" id="btn-${jobPosts[i].id}">
                            ${managebtn}
                        </button>
                        <button data-id=${jobPosts[i].id} class="btn btn-outline-primary btn-sm ms-1 rounded-pill editBtn">
                            Edit Post
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                            </svg>
                        </button>
                        <button class="btn btn-success btn-sm viewApplicantsBtn rounded-pill ms-1" data-id="${jobPosts[i].id}">
                            View Applicants
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-files mb-1" viewBox="0 0 16 16">
                                <path d="M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z"/>
                            </svg>
                        </button>
                    </div>
                    <h4>${jobPosts[i].title}</h4>
                    <h5>${jobPosts[i].location}</h5>
                    ${active}
                    <br>
                    <span>${jobPosts[i].positionType}, <br>${jobPosts[i].employmentType}</span>
                    <br>
                    <span>${salary}</span>
                    <p class="mt-4" data-id="${i}" id="p-${jobPosts[i].id}">${formatDescription}</p>
                    `

                    body.append(newPost)
                
                    document.querySelector(`#btn-${jobPosts[i].id}`).addEventListener('click', () => {
                        if (!jobPosts[i].active) {
                            this.location.href = `http://127.0.0.1:8000/create-checkout-session/${jobPosts[i].id}`
                        } else {

                            fetch('deactivate', {
                                headers: {
                                    "X-CSRFToken": document.cookie.slice(10,)
                                },
                                method: 'PUT',
                                body: JSON.stringify({
                                    "id": jobPosts[i].id
                                })
                            })
                            .then(response => {
                                if (response.status != 200) {
                                    alert('Error: Post was not taken down')
                                } else {
                                    location.reload()
                                }
                            })
                        }
                    })
                }
                document.querySelectorAll('.job-post').forEach(post => post.addEventListener('click', () => {
                
                    const pElement = document.querySelector(`#p-${post.id}`)
                    const postReferenced = jobPosts[pElement.dataset.id]  
                    if (pElement.innerHTML != postReferenced.jobDescription) {
                        pElement.innerHTML = postReferenced.jobDescription

                    } else if (postReferenced.jobDescription.length > 135) {
                        pElement.innerHTML = `${postReferenced.jobDescription.slice(0, 120)}...`
                    }
                }))

                document.querySelectorAll('.editBtn').forEach(button => button.addEventListener('click', () => {
                    // Either create a new route OR do it dynamically
                    editPost(button.dataset.id)
                }))

                document.querySelectorAll('.viewApplicantsBtn').forEach(button => button.addEventListener('click', () => {
                    // Show list of applicants, if there are none display it accordingly
                    viewApplicants(button.dataset.id)
                }))
            })
            
            document.querySelector('#newPostBtn').addEventListener('click', () => {

                document.querySelector('#main1').innerHTML = `
                    <div class="hstack gap-2 ms-4 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#00649A" class="bi bi-fire mb-2" viewBox="0 0 16 16">
                            <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
                        </svg><h3 class="fw-bold">Create new Job Post</h3>
                    </div>
                    <form class="mt-4" id="postJobForm">
                        <div class="accordion" id="accordionPanelsStayOpenExample">
                            <div class="accordion-item shadow">
                                <h2 class="accordion-header" id="panelsStayOpen-headingOne">
                                <button class="accordion-button fs-5 fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                                Header
                                </button>
                                </h2>
                                <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOne">
                                <div class="accordion-body">
                                    <p class="px-4 pt-4">
                                        Please provide the following information to create a job post.
                                        <strong>Please include a brief description of the responsibilities and qualifications</strong> required for the role to 
                                        help attract the most qualified candidates.
                                    </p>
                                    <div class="col-12 px-4 py-2">
                                        <label for="title" class="form-label">Title:</label>
                                        <input type="text" id="title" class="form-control" required>
                                    </div>
                                    <div class="col-12 px-4 py-2">
                                        <label for="positionType" class="form-label">Position Type</label>
                                        <select class="form-select" id="positionType">
                                            <option>Local</option>
                                            <option>Hybrid</option>
                                            <option>Remote</option>
                                        </select>
                                    </div>
                                    <div class="col-12 px-4 py-2" id="autocompleteDiv">
                                        <label for="locationJob" class="form-label">Location:</label>
                                    </div>
                                </div>
                                </div>
                            </div>
                            <div class="accordion-item shadow">
                                <h2 class="accordion-header" id="panelsStayOpen-headingTwo">
                                <button class="accordion-button collapsed fs-5 fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                                Job details
                                </button>
                                </h2>
                                <div id="panelsStayOpen-collapseTwo" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingTwo">
                                <div class="accordion-body">
                                    <div class="col-12 px-4 py-2" id="salaryDiv0">
                                        <label for="annualy" class="form-label" id="salaryLabel">Salary:</label><br>
                                        <input type="checkbox" id="annualy" class="form-check-input salaryInput">
                                        <label for="annual" class="form-check-label">Annualy</label>
                                    </div>
                                    <div class="col-12 px-4 py-2" id="salaryDiv1">
                                        <input type="checkbox" id="hourly" class="form-check-input salaryInput">
                                        <label for="hourly" class="form-check-label">Per hour</label>
                                    </div>
                                    <div class="col-6 px-4 py-2" id="jobTypeDiv">
                                        <label for="jobType" class="form-label">Job Type</label>
                                        <select class="form-select" id="jobType">
                                            <option>Part-time</option>
                                            <option>Full-time</option>
                                        </select>
                                    </div>
                                </div>
                                </div>
                            </div>
                            <div class="accordion-item shadow">
                            <h2 class="accordion-header" id="panelsStayOpen-headingThree">
                                <button class="accordion-button collapsed fs-5 fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
                                Full Job Description
                                </button>
                            </h2>
                            <div id="panelsStayOpen-collapseThree" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingThree">
                                <div class="accordion-body p-5">
                                    <label for="jobDescription" class="form-label">Job Description:</label>
                                    <textarea id="jobDescription" class="form-control" placeholder="Provide Job description..." rows=8 required></textarea>
                                </div>
                            </div>
                            </div>
                            <h5 class="mt-4 px-4">Nearly Done</h5>
                            <p class="px-4 mt-1 mb-2 lh-lg">
                            <strong>Thank you for considering posting a job on our platform.</strong> Please note that we charge a fee of 45£ for 60 days of job posting. This fee helps us maintain and improve our website and services for our users.

                            <strong>Our payments are processed securely through Stripe, a trusted and widely used payment processing company.</strong> 
                            This ensures the safety and security of your payment information, as well as the safety and security of our website.
                            </p>
                            <div class="mt-5 mb-1">
                                <button type="submit" class="btn btn-success btn-lg col-12" id="continueBtn">
                                    Checkout via Stripe
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-stripe" viewBox="0 0 16 16">
                                        <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2Zm6.226 5.385c-.584 0-.937.164-.937.593 0 .468.607.674 1.36.93 1.228.415 2.844.963 2.851 2.993C11.5 11.868 9.924 13 7.63 13a7.662 7.662 0 0 1-3.009-.626V9.758c.926.506 2.095.88 3.01.88.617 0 1.058-.165 1.058-.671 0-.518-.658-.755-1.453-1.041C6.026 8.49 4.5 7.94 4.5 6.11 4.5 4.165 5.988 3 8.226 3a7.29 7.29 0 0 1 2.734.505v2.583c-.838-.45-1.896-.703-2.734-.703Z"/>
                                    </svg>
                                </button>
                            </div>
                            <a href="http://127.0.0.1:8000/mypage" class="btn btn-outline-secondary btn ms-2 mt-5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-bar-left" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5ZM10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5Z"/>
                                </svg>
                            </a>
                    </form>
                `

                let autocompleteInput = document.querySelector('#autocomplete')
                autocompleteInput.classList.remove('d-none')
                document.querySelector('#autocompleteDiv').append(autocompleteInput)

                document.querySelectorAll('.salaryInput').forEach(checkbox => checkbox.addEventListener('click', () => {

                    if (checkbox.id === 'annualy' && checkbox.checked == true) {

                        let newI = document.createElement('div')
                        newI.innerHTML = `
                        <div class="input-group mt-4" id="annualTmpA">
                            <div class="input-group-text">£</div>
                            <input type="number" id="annualSalary" min="1200" class="form-control" required>
                        </div>`
                        document.querySelector('#salaryDiv0').append(newI)
                    } else if (checkbox.id === 'annualy' && checkbox.checked == false) {
                        document.querySelector('#annualTmpA').remove()
                    } 

                    if (checkbox.id === 'hourly' && checkbox.checked == true) {

                        let newIn = document.createElement('div')
                        newIn.innerHTML = `
                        <div class="input-group mt-4" id="annualTmpH">
                            <div class="input-group-text">£</div>
                            <input type="number" id="hourlySalary" min="7" class="form-control" required>
                        </div>`
                        document.querySelector('#salaryDiv1').append(newIn)
                    } else if (checkbox.id === 'hourly' && checkbox.checked == false) {
                        document.querySelector('#annualTmpH').remove()
                    } 
                }))

                document.querySelector('#continueBtn').addEventListener('click', () => {
                    if (document.querySelector('#annualSalary') === null && document.querySelector('#hourlySalary') === null) {
                        document.querySelector('#annualy').setCustomValidity('Please choose a Salary')
                    } else {
                        document.querySelector('#annualy').setCustomValidity('')
                    }
                })

                if (document.querySelector('#postJobForm') != null) {
                    document.querySelector('#postJobForm').addEventListener('submit', (event) => {
                        event.preventDefault()

                        if (document.querySelector('#annualSalary') === null && document.querySelector('#hourlySalary') === null) {
                
                        } else {
                
                            // Get user Input
                            const title = document.querySelector('#title').value
                            const positionType = document.querySelector('#positionType').value
                            const location = document.querySelector('#autocomplete').value
                            let annualy = 0
                            let hourly = 0
                            const jobType = document.querySelector('#jobType').value
                            const jobDescription = document.querySelector('#jobDescription').value
                    
                            if (document.querySelector('#annualSalary') != null) {
                                annualy = document.querySelector('#annualSalary').value
                            }
                            if (document.querySelector('#hourlySalary') != null) {
                                hourly = document.querySelector('#hourlySalary').value
                            }
                
                            fetch('postjob', {
                                method: 'POST',
                                headers: {
                                    "X-CSRFToken": document.cookie.slice(10,)
                                },
                                body: JSON.stringify({
                                    "title": title,
                                    "positionType": positionType,
                                    "location": location,
                                    "annualy": annualy,
                                    "hourly": hourly,
                                    "jobType": jobType,
                                    "jobDescription": jobDescription,
                                })
                            })
                            .then(response => response.json())
                            .then(id => {
            
                                this.location.href = `http://127.0.0.1:8000/create-checkout-session/${id}`
                            })
                        }
                    })
                }
            })

        } else {

            fetch('myjobs')
            .then(response => response.json())
            .then(jobPosts => {

                let pageHeader = document.createElement('div')
                pageHeader.classList.add('hstack', 'gap-2', 'ms-4', 'mb-3')
                pageHeader.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#00649A" class="bi bi-fire mb-1" viewBox="0 0 16 16">
                <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
                </svg><h3 class="fw-bold"><span style="color: #00649A;">Job</span> Applications</h3>` 
                document.querySelector('#main1').append(pageHeader)

                // SVG declaration
                let greenActive = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="green" class="bi bi-check-square-fill" viewBox="0 0 16 16">
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z"/>
                </svg>`

                let redActive = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="grey" class="bi bi-x-square-fill" viewBox="0 0 16 16">
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z"/>
                </svg>`
                

                let body = document.querySelector('#main1')

                // Declare Placeholder if no Job Applications
                if (jobPosts.length === 0) {
                    let declaration = document.createElement('h4')
                    declaration.classList.add('ms-4', 'mt-3')
                    declaration.innerHTML = `You haven't applied for jobs.`
                    body.append(declaration)
                }

                // Reverse jobPosts (So we have new applications at the top)
                let tmp = [];
                for (y = (jobPosts.length - 1); y > -1; y--) {
                    console.log(jobPosts[y])
                    tmp.push(jobPosts[y])
                }
                jobPosts = tmp

                for (i = 0; i < jobPosts.length; i++) {
                    
                    let active = document.createElement('div')
                    active.classList.add('col-1', 'mb-1', 'offset-lg-5', 'offset-0')
                    active.innerHTML = `${redActive}`
                    if (jobPosts[i].active) {
                        active.innerHTML = `${greenActive}`
                    }

                    let row = document.createElement('div')
                    row.classList.add('row', 'myApplications', 'border', 'p-4', 'm-lg-0', 'mb-2')
                    row.dataset.index = i
                    
                    let postName = document.createElement('div')
                    postName.classList.add('col-lg-6', 'col-10')
                    postName.innerHTML = `
                    <h6 class="ms-lg-3 ms-0 text-lg-start text-center">${jobPosts[i].title} - ${jobPosts[i].companyName}</h6>
                    `

                    //post.append(active)
                    row.append(postName)
                    row.append(active)
                    body.append(row)
                }

                document.querySelectorAll('.myApplications').forEach(selecPost => selecPost.addEventListener('click', () => {
                    // Create Post Variable that references the Post the user clicked on (via the index stored in dataset)
                    let post = jobPosts[selecPost.dataset.index]
          
                    // Append "Expired" Icon if Job Post is expired
                    if (!post.active && document.querySelector('#activeSign') == undefined) {
                        let activeSign = document.createElement('div')
                        activeSign.classList.add('me-3')
                        activeSign.id = "activeSign"
                        activeSign.innerHTML = `${redActive}<span class="ms-2 fs-5">Expired</span>`
                        document.querySelector('#modal-header').append(activeSign)
                        
                    } else if (post.active && document.querySelector('#activeSign') != undefined) {
                        document.querySelector('#activeSign').remove()
                    }

                    // Concatenate hourly and annual salary into one variable or just fetch one either
                    let salary;
                    if (post.hourly != 0 && post.annualy != 0) {
                        salary = `${post.annualy}£ per annum,<br>${post.hourly}£ per hour`
                    } else if (post.hourly != 0) {
                        salary = `${post.hourly}£ per hour`
                    } else {
                        salary = `${post.annualy}£ per annum`
                    }

                    // Insert data into HTML Tags
                    document.querySelector('#companyName').innerHTML = post.companyName
                    document.querySelector('#jobCompany').innerHTML = post.companyName
                    document.querySelector('#positionName').innerHTML = post.title
                    document.querySelector('#jobLocation').innerHTML = post.location
                    document.querySelector('#jobType').innerHTML = post.positionType
                    document.querySelector('#jobTime').innerHTML = post.employmentType
                    document.querySelector('#jobSalary').innerHTML = salary
                    document.querySelector('#jobDescription').innerHTML = post.jobDescription

                    // Append or remove website link and label if any website is saved on Company Profile
                    if (post.website.length != 0) {
                        let ankerTag = document.createElement('a')
                        ankerTag.href = post.website
                        ankerTag.id = "websiteLink"
                        ankerTag.innerHTML = post.website

                        if (document.querySelector('#websiteLink') != undefined) {
                            document.querySelector('#websiteLink').remove()
                        }

                        document.querySelector('#websiteLabel').classList.remove('d-none')
                        document.querySelector('#jobDescriptionContainer').append(ankerTag)

                    } else if (post.website.length === 0 && document.querySelector('#websiteLink') != undefined) {
                        document.querySelector('#websiteLink').remove()
                        document.querySelector('#websiteLabel').classList.add('d-none')
                    }

                    document.querySelector('#openJobPostModal').click()
                }))
            })
        }
    })
}

let autocomplete

function initAutocomplete() {

    autocomplete = new google.maps.places.Autocomplete(
        document.querySelector('#autocomplete'),
        {
            types: ['locality'],
            componentRestrictions: {'country': ['UK']},
            fields: ['address_components', 'geometry', 'name'],
            strictBounds: false,
        }
    )
}

function prefillProfile() {

    fetch('getprofile')
    .then(response => response.json())
    .then(profile => {

        let firstName;
        let lastName;
        
        if (profile.companyName != undefined) {

            // Split person name in two parts (first and last name)
            for (let i = (profile.personName.length - 1); i > 0; i--) {

                if (profile.personName[i] === ' ') {

                    firstName = profile.personName.substr(0, i)
                    lastName = profile.personName.substr(i + 1, profile.personName.length - 1)
                    
                    // Terminate Loop
                    i = 0
                }
            }

            document.querySelector('#firstName1').value = firstName
            document.querySelector('#lastName1').value = lastName
            document.querySelector('#companyName1').value = profile.companyName
            document.querySelector('#autocomplete').value = profile.headquatersLocation
            document.querySelector('#foundationYear1').value = profile.foundationYear
            document.querySelector('#companySize1').value = profile.companySize
            document.querySelector('#website1').value = profile.website
        } else {

            // Split name in two parts (first and last name)
            for (let i = (profile.name.length - 1); i > 0; i--) {

                if (profile.name[i] === ' ') {

                    firstName = profile.name.substr(0, i)
                    lastName = profile.name.substr(i + 1, profile.name.length - 1)
                    
                    // Terminate Loop
                    i = 0
                }
            }

            document.querySelector('#firstName1').value = firstName
            document.querySelector('#lastName1').value = lastName
            document.querySelector('#autocomplete').value = profile.location
        }
    })
}

function allPosts(action) {
    // Fetch all the posts from server and create Divs for display
    document.querySelector('#main').innerHTML = ''

        fetch('statuscheck')
        .then(response => response.json())
        .then (responseDic => {
    
            if (action === 'allposts') {

                // Fetch all Posts
                fetch('allposts/all/all')
                .then(response => response.json())
                .then(allposts => {
                    createPosts(responseDic, allposts)
                })
            }   

            if (action === 'search') {

                let what = document.querySelector('#whatInput').value
                let where = document.querySelector('#autocomplete').value

                if (what.length === 0) {
                    what = 'all'
                }
                if (where.length === 0) {
                    where = 'all'
                }

                fetch(`allposts/${what}/${where}`)
                .then(response => response.json())
                .then(allposts => {
                    createPosts(responseDic, allposts)
                })
            }
        })

    function createPosts(responseDic, allposts) {
        
        let body = document.querySelector('#main')
        let row = document.createElement('div')
        let postsCol = document.createElement('div')
        row.classList.add('row')
        postsCol.classList.add('col-lg-6', 'col-sm-12')
        
        for (let i = 0; i < allposts.length; i++) {
            
            newPost = document.createElement('div')
            newPost.classList.add('container', 'm-lg-5', 'my-3', 'p-5', 'border', 'job-post', 'rounded', 'shadow-sm')
            newPost.id = allposts[i].id
            
            newPost.innerHTML = `
            <h6 class="offset-9">${allposts[i].date}</h6>
            <h4>${allposts[i].title}</h4>
            <h5>${allposts[i].location}</h5>
            <h5>${allposts[i].employmentType}</h5>
            <br>
            <span>${allposts[i].positionType}</span>
            <span class="mt-4">${allposts[i].jobDescription.slice(0, 120)}...</span>
            `
            postsCol.append(newPost)
        }
        row.append(postsCol)
        
        if (allposts.length != 0) {

            let postFocus = document.createElement('div')
            postFocus.classList.add('col-lg-6', 'col-sm-d-none', 'pb-5', 'px-5' )
            postFocus.innerHTML = `
            <div class="row border shadow rounded p-5 m-4 col-4" id="postBox">
                <div class="d-none" id="itemLinks">
                    <div id="list-example" class="list-group">
                        <a class="list-group-item list-group-item-action" href="#list-item-1" id="firstNavElement">Position</a>
                        <a class="list-group-item list-group-item-action" href="#list-item-2">Job Details</a>
                        <a class="list-group-item list-group-item-action" href="#list-item-3">Description</a>
                    </div>
                </div>
                <div class="col-12" id="postContentBox">
                    <div data-bs-spy="scroll" data-bs-target="#list-example" data-bs-smooth-scroll="true" class="scrollspy-example" tabindex="0" id="postFocusDiv">
                        <h4 id="list-item-1">Position</h4>
                        <div id="positionDiv">
                            <p>This is some placeholder content for the scrollspy page. Note that as you scroll down the page, the appropriate navigation link is highlighted. It's repeated throughout the component example. We keep adding some more example copy here to emphasize the scrolling and highlighting.</p>
                        </div>
                        <h4 id="list-item-2" class="mt-5">Job Details</h4>
                        <div id="jobDetailsDiv">
                            <p>This is some placeholder content for the scrollspy page. Note that as you scroll down the page, the appropriate navigation link is highlighted. It's repeated throughout the component example. We keep adding some more example copy here to emphasize the scrolling and highlighting.</p>
                        </div>
                        <h4 id="list-item-3" class="mt-5">Job Description</h4>
                        <div id="jobDescriptionDiv">
                            <p>This is some placeholder content for the scrollspy page. Note that as you scroll down the page, the appropriate navigation link is highlighted. It's repeated throughout the component example. We keep adding some more example copy here to emphasize the scrolling and highlighting.</p>
                        </div>
                    </div>
                </div>
            </div>
            `
            row.append(postFocus)
            body.append(row)
                
            let H = window.innerHeight
            let a = H * 0.00334 // 3.12
            let b = H * 0.00154 // 1.44
            let c = H * (-0.002) // (-1.87)
            let d = H * 0.00435 // 4.07

            document.querySelector('#postFocusDiv').setAttribute('style', `height: ${H / d}px;`)
            postFocus.setAttribute('style', '')

            window.onscroll = () => {
                
                let H = window.innerHeight
                if (window.scrollY > (H / a)) {
                    document.querySelector('#postFocusDiv').setAttribute('style', `height: ${H / b}px;`)
                    postFocus.setAttribute('style', `margin-top: ${H / c}px; margin-bottom: 6cm;`)

                } else {
                    document.querySelector('#postFocusDiv').setAttribute('style', `height: ${H / d}px;`)
                    postFocus.setAttribute('style', '')
                }
            }

            document.querySelectorAll('.job-post').forEach(box => box.addEventListener('click', () => {

                document.querySelector('#firstNavElement').click()

                let selectedPost;
                for (let y = 0; y < allposts.length; y++) {
                    if (allposts[y].id == box.id) {
                        selectedPost = allposts[y]
                    }
                }
                
                let salary;
                if (selectedPost.hourly != 0 && selectedPost.annualy != 0) {
                    salary = `${selectedPost.annualy}£ per annum,<br>${selectedPost.hourly}£ per hour`
                } else if (selectedPost.hourly != 0) {
                    salary = `${selectedPost.hourly}£ per hour`
                } else {
                    salary = `${selectedPost.annualy}£ per annum`
                }

                let website = false
                if (selectedPost.website != 'None' && selectedPost.website != '') {
                    website = true
                }

                // Declare apply button (for job Seekers) and hide for employers, disable for NOT logged in users
                let applyBtnTag = `<button class="btn btn-primary btn-sm applyBtn" data-id="${selectedPost.id}">Apply Now</button>`

                if (responseDic.employer === true) {
                    applyBtnTag = `<button class="btn btn-primary btn-sm applyBtn d-none">Apply Now</button>`
                } else if (responseDic.employer === 'None') {
                    applyBtnTag = `<button class="btn btn-primary btn-sm applyBtn" disabled>Apply Now</button>`
                }
                
                // Create elements for large screen and small screen devices (mobile elements are fitted into a modal instead of scrollspy)

                // Large Screens
                let position = document.querySelector('#positionDiv')
                position.innerHTML = `
                <h6>${selectedPost.companyName}</h6>
                <h6>${selectedPost.title}</h6>
                `
                // Small Screens
                let positionMobile = document.querySelector('#positionDivMobile')
                positionMobile.innerHTML = `
                <h6>${selectedPost.companyName}</h6>
                <h6>${selectedPost.title}</h6>
                `

                // Large Screens
                let details = document.querySelector('#jobDetailsDiv')
                details.innerHTML = `
                <h6>${selectedPost.location}</h6>
                <br>
                <span>${selectedPost.positionType},<br> ${selectedPost.employmentType}</span>
                <br>
                <span>${salary}</span>
                `
                // Small Screens
                let detailsMobile = document.querySelector('#jobDetailsDivMobile')
                detailsMobile.innerHTML = `
                <h6>${selectedPost.location}</h6>
                <br>
                <span>${selectedPost.positionType},<br> ${selectedPost.employmentType}</span>
                <br>
                <span>${salary}</span>
                `
                
                // Large Screens
                let description = document.querySelector('#jobDescriptionDiv')
                description.innerHTML = `
                <p>${selectedPost.jobDescription}</p>
                <br>
                <div id="websiteDescDiv">
                    <label for="websiteLink" class="form-label">Company Website:</label>
                    <br>
                    <a href="https://${selectedPost.website}" id="websiteLink">${selectedPost.website}</a>
                </div>
                <div class="my-5 px-4">
                    ${applyBtnTag}
                </div>
                `
                    
                if (!website) {
                    document.querySelector('#websiteDescDiv').remove()
                }
                // Small Screens
                let descriptionMobile = document.querySelector('#jobDescriptionDivMobile')
                descriptionMobile.innerHTML = `
                <p>${selectedPost.jobDescription}</p>
                <br>
                <div id="websiteDescDivMobile">
                    <label for="websiteLinkMobile" class="form-label">Company Website:</label>
                    <br>
                    <a href="https://${selectedPost.website}" id="websiteLinkMobile">${selectedPost.website}</a>
                </div>
                <div class="my-5 px-4">
                    ${applyBtnTag}
                </div>
                `
                    
                if (!website) {
                    document.querySelector('#websiteDescDivMobile').remove()
                }

                applyFunction()
                
                if (window.innerWidth < 992) {
                    document.querySelector('#openModal10').click();
                }
            }))

            if (window.innerWidth >= 992) {
                document.querySelector('.job-post').click()
            }
        }
    }
}

function searchBarSwap() {

    // Append autocomplete Places API Input to search bar
    searchInput = document.querySelector('#autocomplete')
    document.querySelector('#autocompletePlaceholder').remove()
    document.querySelector('#searchInputDiv').append(searchInput)
}

function editPost(id) {
    // Create edit post form 

    fetch(`edit/${id}`)
    .then(response => response.json())
    .then(post => {

        document.querySelector('#main1').innerHTML = `

            <div class="hstack gap-2 ms-4 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#00649A" class="bi bi-fire mb-2" viewBox="0 0 16 16">
                    <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
                </svg>
                <h3 class="fw-bold">Edit your post</h3>
            </div>
            <form id="postJobForm">
                <div class="accordion" id="accordionPanelsStayOpenExample">
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="panelsStayOpen-headingOne">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                        Header
                        </button>
                        </h2>
                        <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOne">
                        <div class="accordion-body">
                            <p class="px-4 pt-4">
                                Please provide the following information to create a job post.
                                <strong>Please include a brief description of the responsibilities and qualifications</strong> required for the role to 
                                help attract the most qualified candidates.
                            </p>
                            <div class="col-12 px-4 py-2">
                                <label for="title" class="form-label">Title:</label>
                                <input type="text" id="title" class="form-control" required>
                            </div>
                            <div class="col-12 px-4 py-2">
                                <label for="positionType" class="form-label">Position Type</label>
                                <select class="form-select" id="positionType">
                                    <option>Local</option>
                                    <option>Hybrid</option>
                                    <option>Remote</option>
                                </select>
                            </div>
                            <div class="col-12 px-4 py-2" id="autocompleteDiv">
                                <label for="locationJob" class="form-label">Location:</label>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="panelsStayOpen-headingTwo">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                        Job details
                        </button>
                        </h2>
                        <div id="panelsStayOpen-collapseTwo" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingTwo">
                        <div class="accordion-body">
                            <div class="col-12 px-4 py-2" id="salaryDiv0">
                                <label for="annualy" class="form-label" id="salaryLabel">Salary:</label><br>
                                <input type="checkbox" id="annualy" class="form-check-input salaryInput">
                                <label for="annual" class="form-check-label">Annualy</label>
                            </div>
                            <div class="col-12 px-4 py-2" id="salaryDiv1">
                                <input type="checkbox" id="hourly" class="form-check-input salaryInput">
                                <label for="hourly" class="form-check-label">Per hour</label>
                            </div>
                            <div class="col-6 px-4 py-2" id="jobTypeDiv">
                                <label for="jobType" class="form-label">Job Type</label>
                                <select class="form-select" id="jobType">
                                    <option>Part-time</option>
                                    <option>Full-time</option>
                                </select>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                    <h2 class="accordion-header" id="panelsStayOpen-headingThree">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
                        Full Job Description
                        </button>
                    </h2>
                    <div id="panelsStayOpen-collapseThree" class="accordion-collapse collapse" aria-labelledby="panelsStayOpen-headingThree">
                        <div class="accordion-body p-5">
                            <label for="jobDescription" class="form-label">Job Description:</label>
                            <textarea id="jobDescription" class="form-control" placeholder="Provide Job description..." rows=8 required></textarea>
                        </div>
                    </div>
                    </div>
                    <h5 class="mt-4 px-4">Nearly Done</h5>
                    <p class="px-4 mt-1 lh-lg">
                    <strong>Thank you for considering posting a job on our platform.</strong>
                    <div class="offset-11 mt-5">
                        <button type="submit" class="btn btn-outline-primary btn-lg" id="continueBtn">Save</button>
                    </div>
                    <a href="http://127.0.0.1:8000/mypage" class="btn btn-outline-secondary btn ms-2 mt-5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-bar-left" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5ZM10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5Z"/>
                        </svg>
                    </a>
            </form>
        `

        let autocompleteInput = document.querySelector('#autocomplete')
        autocompleteInput.classList.remove('d-none')
        document.querySelector('#autocompleteDiv').append(autocompleteInput)

        document.querySelectorAll('.salaryInput').forEach(checkbox => checkbox.addEventListener('click', () => {

            if (checkbox.id === 'annualy' && checkbox.checked == true) {

                let newI = document.createElement('div')
                newI.innerHTML = `
                <div class="input-group mt-4" id="annualTmpA">
                    <div class="input-group-text">£</div>
                    <input type="number" id="annualSalary" min="1200" class="form-control" required>
                </div>`
                document.querySelector('#salaryDiv0').append(newI)
            } else if (checkbox.id === 'annualy' && checkbox.checked == false) {
                document.querySelector('#annualTmpA').remove()
            } 

            if (checkbox.id === 'hourly' && checkbox.checked == true) {

                let newIn = document.createElement('div')
                newIn.innerHTML = `
                <div class="input-group mt-4" id="annualTmpH">
                    <div class="input-group-text">£</div>
                    <input type="number" id="hourlySalary" min="7" class="form-control" required>
                </div>`
                document.querySelector('#salaryDiv1').append(newIn)
            } else if (checkbox.id === 'hourly' && checkbox.checked == false) {
                document.querySelector('#annualTmpH').remove()
            } 
        }))

        // Prefill with old values
        document.querySelector('#title').value = post.title
        document.querySelector('#positionType').value = post.positionType
        document.querySelector('#autocomplete').value = post.location
        document.querySelector('#jobType').value = post.employmentType
        document.querySelector('#jobDescription').value = post.jobDescription

        if (post.annualy != 0) {
            document.querySelector('#annualy').click()
            document.querySelector('#annualSalary').value = post.annualy
        }
        if (post.hourly != 0) {
            document.querySelector('#hourly').click()
            document.querySelector('#hourlySalary').value = post.hourly
        }

        document.querySelector('#continueBtn').addEventListener('click', () => {
            if (document.querySelector('#annualSalary') === null && document.querySelector('#hourlySalary') === null) {
                document.querySelector('#annualy').setCustomValidity('Please choose a Salary')
            } else {
                document.querySelector('#annualy').setCustomValidity('')
            }
        })

        if (document.querySelector('#postJobForm') != null) {
            document.querySelector('#postJobForm').addEventListener('submit', (event) => {
                event.preventDefault()

                if (document.querySelector('#annualSalary') === null && document.querySelector('#hourlySalary') === null) {
           
                } else {
          
                    // Get user Input
                    const title = document.querySelector('#title').value
                    const positionType = document.querySelector('#positionType').value
                    const location = document.querySelector('#autocomplete').value
                    let annualy = 0
                    let hourly = 0
                    const jobType = document.querySelector('#jobType').value
                    const jobDescription = document.querySelector('#jobDescription').value
            
                    if (document.querySelector('#annualSalary') != null) {
                        annualy = document.querySelector('#annualSalary').value
                    }
                    if (document.querySelector('#hourlySalary') != null) {
                        hourly = document.querySelector('#hourlySalary').value
                    }
        
                    fetch(`edit/${id}`, {
                        method: 'PUT',
                        headers: {
                            "X-CSRFToken": document.cookie.slice(10,)
                        },
                        body: JSON.stringify({
                            "title": title,
                            "positionType": positionType,
                            "location": location,
                            "annualy": annualy,
                            "hourly": hourly,
                            "jobType": jobType,
                            "jobDescription": jobDescription,
                        })
                    })
                    .then(response => {
                        if (response.status != 200) {
                            alert('Sorry we have a Server issue, changes might not be saved.')
                        } else {
                       
                            window.location.reload();
                        }
                    })
                }
            })
        }
    })
}

function applyFunction() {

    // Let user apply for a Job and generate error Toast popup if user has applied already
    document.querySelectorAll('.applyBtn').forEach(button => button.addEventListener('click', () => {
                
        document.querySelector('#applyModalHeader').innerHTML = document.querySelector('#positionDiv').lastElementChild.innerHTML
        document.querySelector('#applyModalCompany').innerHTML = document.querySelector('#positionDiv').firstElementChild.innerHTML
        document.querySelector('#applyModalDetails').innerHTML = document.querySelector('#jobDetailsDiv').innerHTML
        document.querySelector('#applyModalJDescription').innerHTML = document.querySelector('#jobDescriptionDiv').firstElementChild.innerHTML

        fetch('applicationcvprocess')
        .then(response => response.json())
        .then(cvData => {

            if (cvData) {
                document.querySelector('#myCV').href = cvData.url
                document.querySelector('#fileName').innerHTML = cvData.name

                document.querySelector('#anotherCVBtn').addEventListener('click', () => {

                    document.querySelector('#id_cv').click() 

                    document.querySelector('#id_cv').addEventListener('input', () => {
                        document.querySelector('#fileName').innerHTML = document.querySelector('#id_cv').value.slice(12,)
                        document.querySelector('#myCV').classList.add('disabled')
                        cvData = false
                    })
                })

                document.querySelector('#applyJobBtn').addEventListener('click', () => {

                    if (document.querySelector('#id_cv').value === '') {
                       
                        const coverLetter = document.querySelector('#coverLetter').value
    
                        fetch('apply', {
                            method: 'POST',
                            headers: {
                                "X-CSRFToken": document.cookie.slice(10,)
                            },
                            body : JSON.stringify({
                                "coverLetter": coverLetter,
                                "postID": button.dataset.id,
                                "cvID": cvData.id
                            })
                        })
                        .then(response => {
                            if (response.status === 400) {
                                toastGenerator('You have already applied for this job')
                            } else {
                                window.location.reload()
                            }
                        })

                    } else {
           
                        const coverLetter = document.querySelector('#coverLetter').value
      
                        fetch('apply', {
                            method: 'POST',
                            headers: {
                                "X-CSRFToken": document.cookie.slice(10,)
                            },
                            body : JSON.stringify({
                                "coverLetter": coverLetter,
                                "postID": button.dataset.id,
                                "cvID": 'None'
                            })
                        })
                        .then(response => response.json())
                        .then(applicationID => {
                            
                            document.querySelector('#applicationID').value = applicationID
                            document.querySelector('#uploadCVForm').submit()
                        })
                    }
                })

            } else {

                document.querySelector('#cvBtnGroup').innerHTML = `
                <button class="btn btn-outline-primary col-12 offset-lg-0" id="uploadBtn">
                    Upload
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-upload mb-1" viewBox="0 0 16 16">
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                    </svg>
                </button>
                `

                document.querySelector('#uploadBtn').addEventListener('click', () => {
                    
                    document.querySelector('#id_cv').click()  

                    document.querySelector('#id_cv').addEventListener('input', () => {
                        document.querySelector('#fileName').innerHTML = document.querySelector('#id_cv').value.slice(12,)
                    })
                })

                document.querySelector('#applyJobBtn').addEventListener('click', () => {
                    
                    if (document.querySelector('#id_cv').value != '') {
                
                        const coverLetter = document.querySelector('#coverLetter').value
    
                        fetch('apply', {
                            method: 'POST',
                            headers: {
                                "X-CSRFToken": document.cookie.slice(10,)
                            },
                            body : JSON.stringify({
                                "coverLetter": coverLetter,
                                "postID": button.dataset.id,
                                "cvID": 'None'
                            })
                        })
                        .then(response => response.json())
                        .then(applicationID => {
                            
                            document.querySelector('#applicationID').value = applicationID
                            document.querySelector('#uploadCVForm').submit()
                        })
                    } else {
                        alert('Please provide a CV')
                    }
    
                })
            }

            fetch('apply')
            .then(response => response.json())
            .then(profile => {

                document.querySelector('#namefieldDisabled').value = profile.name
                document.querySelector('#locationDisabled').value = profile.location
                document.querySelector('#emailFieldDisabled').value = profile.email
            })

            document.querySelector('#applyModaBtn').click()

        })

    }))
}

function viewApplicants(id) {

    // Fetch Applicants
    fetch(`applicants/${id}`)
    .then(response => response.json())
    .then(applications => {

        let backBtn = document.createElement('div')
        backBtn.classList.add('container', 'mx-1', 'my-5', 'p-3')
        backBtn.innerHTML = `
        <a href="http://127.0.0.1:8000/mypage" id="backBtn" class="btn btn-outline-secondary btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-bar-left" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5ZM10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5Z"/>
            </svg>
        </a>
        `
        let body = document.querySelector('#main1')
        body.innerHTML = ''

        if (applications) {
            let header = document.createElement('h4')
            header.classList.add('mx-4', 'my-5')
            header.innerHTML = 'Applications'
            body.append(header)
        
            for (let i = 0; i < applications.length; i++) {
                console.log(applications[i])
                // Change main div to deplay list of applications
                let newElement = document.createElement('div')
                newElement.classList.add('container-sm', 'mx-3', 'p-3', 'border', 'rounded', 'shadow-sm', 'hstack', 'gap-3', 'openApplicationBtn')
                newElement.dataset.index = i
                newElement.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#00649A" class="bi bi-fire mb-2" viewBox="0 0 16 16">
                <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
                </svg>
                <h5>${applications[i].name} living in ${applications[i].location}</h5>
                ` 

                body.append(newElement)

            }

            // Open Application Modal upon click
            document.querySelectorAll('.openApplicationBtn').forEach(div => div.addEventListener('click', () => {

                // Assign data to model elements
                let application = applications[div.dataset.index]

                // Check if applicant has a cover letter
                if (application.coverLetter.length === 0) {
                    application.coverLetter = 'No Cover letter'
                }
                
          
                document.querySelector('#applicationModalBody').innerHTML = `
                <div class="container border rounded shadow-sm pt-4 pb-5 applicationContainer">
                    <ul class="nav nav-pills mb-5 ms-3">
                        <li class="nav-item">
                            <button class="nav-link applicationNavbar active" id="profileNavLink">Profile</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link applicationNavbar" id="messageNavLink">Message</button>
                        </li>
                    </ul>
                    <div id="applicationAction">
                    </div>
                </div>
                `
        
                let profileBody = `
                    <div class="mx-5 mt-5">
                        <h5 class="ms-2">${application.name}</h5>
                        <h5 class="ms-2">${application.location}</h5>
                        <div class="mt-2 ms-2">
                            <span>${application.email}</span>
                        </div>
                        <div class="mt-4 ms-2">
                            <a class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer" href="${application.cvUrl}" id="myCV">
                                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" class="bi bi-file-earmark-text-fill" viewBox="0 0 16 16">
                                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1h-4z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div class="mt-5 mx-5 border border-5 border-start-0 border-end-0 pt-4 pb-3 px-4 rounded" id="coverLetterDiv">
                        <p>${application.coverLetter}</p>
                    <div>
                `

                let messageBody = `
                <div class="p5 mx-4">
                    <h5 class="ms-2 mb-4">Message to ${application.name}</h5>
                    <textarea id="messageField" class="form-control p-4" rows=15>Dear ${application.name},  
                    </textarea>
                </div>
                <div class=" mt-3 px-4">
                    <button class="btn btn-primary col-12 btn" id="sendBtn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
                            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
                        </svg>
                    </button>
                </div>
                `

                document.querySelector('#applicationAction').innerHTML =  profileBody  
                
                document.querySelector('#profileNavLink').addEventListener('click', () => {
                    document.querySelector('#profileNavLink').classList.add('active')
                    document.querySelector('#messageNavLink').classList.remove('active')

                    if (document.querySelector('#applicationAction').innerHTML !=  profileBody) {
                        document.querySelector('#applicationAction').innerHTML =  profileBody  
                    }
                
                })

                document.querySelector('#messageNavLink').addEventListener('click', () => {
                    document.querySelector('#messageNavLink').classList.add('active')
                    document.querySelector('#profileNavLink').classList.remove('active')

                    if (document.querySelector('#applicationAction').innerHTML != messageBody) {
                        document.querySelector('#applicationAction').innerHTML = messageBody

                        document.querySelector('#sendBtn').addEventListener('click', () => {

                            // Get message
                            const message = document.querySelector('#messageField').value
                            const candidateID = application.candidate

                            if (message.length != 0) {

                                fetch('message', {
                                    method: 'POST',
                                    headers: {
                                        "X-CSRFToken": document.cookie.slice(10,)
                                    },
                                    body: JSON.stringify({
                                        "candidateID": candidateID,
                                        "message": message
                                    })
                                })
                                .then(response => {
                                    if (response.status != 200) {
                                        alert('Message was NOT send - Error')

                                    } else {
                                        toastGenerator(`Message to ${application.name} was send.`)
                                        // Back to Profile
                                        document.querySelector('#profileNavLink').click()
                                    }
                                })

                            } else {
                                alert('Please provide a message')
                            }
                        })
                    }
                })

                document.querySelector('#openApplicationModal').click()
            }))

        } else {
            body.innerHTML = `
            <div class="container mx-3 p-3 border rounded shadow-sm">
                <h5>No applications.</h5>
            </div>
            `
        }
        body.append(backBtn)
    })
}

function messageView(username) {

    // Fetch messages
    fetch('message')
    .then(response => response.json())
    .then(messages => {

        let body = document.querySelector('#main') 

        let pageHeader = document.createElement('div')
        pageHeader.classList.add('hstack', 'gap-2', 'ms-4', 'mb-3')
        pageHeader.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#00649A" class="bi bi-mailbox" viewBox="0 0 16 16">
        <path d="M4 4a3 3 0 0 0-3 3v6h6V7a3 3 0 0 0-3-3zm0-1h8a4 4 0 0 1 4 4v6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a4 4 0 0 1 4-4zm2.646 1A3.99 3.99 0 0 1 8 7v6h7V7a3 3 0 0 0-3-3H6.646z"/>
        <path d="M11.793 8.5H9v-1h5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.354-.146l-.853-.854zM5 7c0 .552-.448 0-1 0s-1 .552-1 0a1 1 0 0 1 2 0z"/>
        </svg><h3 class="fw-bold">Inbox</h3>`
        body.append(pageHeader)

        // Set Placeholder has no messages
        if (messages.length === 0) {
            let declaration = document.createElement('h4')
            declaration.classList.add('ms-4', 'mt-3')
            declaration.innerHTML = 'You have no messages.'
            body.append(declaration)
        }

        // Iterate over messages and store each senders and recipients ID in "individuals" array
        let individuals = []

        for (let i = 0; i < messages.length; i++) {
            
            if (i === 0) {

                // Add first ID in array and create a <div> with sender name (Company or JobSeeker)
                individuals.push(messages[i].ID)

                if (messages[i].companyName != undefined && messages[i].ID != 'User') {
                    createHeader(messages[i].companyName, messages[i].ID, messages[i].senderID, messages[i].firstMessage)

                } else if (messages[i].name != undefined && messages[i].ID != 'User') {
                    createHeader(messages[i].name, messages[i].ID, messages[i].senderID, messages[i].firstMessage)

                } if (messages[i].firstMessage != undefined) {
                    console.log(messages[i])
                    createHeader(messages[i].recipientName, messages[i].ID, messages[i].recipientID, messages[i].firstMessage)
                } 
            } else {

                if (messages[i].firstMessage != undefined) {
                    createHeader(messages[i].recipientName, messages[i].ID, messages[i].recipientID, messages[i].firstMessage)
                }
                if (searchArray(individuals, messages[i].ID) === false) {
                    individuals.push(messages[i].ID)
                    if (messages[i].companyName != undefined && messages[i].ID != 'User') {
                        createHeader(messages[i].companyName, messages[i].ID, messages[i].senderID, messages[i].firstMessage)
    
                    } else if (messages[i].name != undefined && messages[i].ID != 'User') {
                        createHeader(messages[i].name, messages[i].ID, messages[i].senderID, messages[i].firstMessage)
                    }
                }
            }
        }

        function searchArray(array, ID) {
            
            // Search array for ID return false if not found and true if found
            let idFound = false

            for (let i = 0; i < array.length; i++) {
                if (ID === array[i]) {
                    idFound = true
                }
            }
            return idFound
        }

        function createHeader(name, ID, senderID, FM) {

            let messagesModalBody = document.querySelector('#messagesModalBody')

            let header = document.createElement('div')
            header.classList.add('rounded', 'border', 'p-4', 'mx-4', 'message')
            header.innerHTML = name
            header.dataset.ID = ID
            body.append(header)

            header.addEventListener('click', () => {
                
                document.querySelector('#messageModalHeader').innerHTML = `${name}`
                if (window.innerWidth < 992) {
                    document.querySelector('#modalClassDiv').classList.remove('modal-lg')
                    document.querySelector('#modalClassDiv').classList.add('modal-fullscreen')
                }
    
                messagesModalBody.innerHTML = ''
                let dateDivider;

                if (FM != undefined) { 
                    for (let y = 0; y < messages.length; y++) {
                        console.log(`loop y: ${y}, messages[${y}].ID: ${messages[y].ID}, senderID: ${senderID}, messages[y].recipientID: ${messages[y].recipientID}`)
                        if (messages[y].ID === 'User' && senderID == messages[y].recipientID) {

                            if (dateDivider != undefined && messages[y].date != dateDivider) {
                                dateDivider = messages[y].date
                                // Create new date divider
                                createDivider(dateDivider)

                            } else if (dateDivider === undefined) {
                                dateDivider = messages[y].date
                                createDivider(dateDivider)
                            }
                            // Create message the first message
                            let message = document.createElement('div')
                            message.classList.add('container', 'border', 'p-3', 'my-4', 'col-6', 'rounded')
                            if (messages[y].companyName != undefined && messages[y].ID === 'User') {
                                message.innerHTML = `${messages[y].time.slice(0,5)}<br>${messages[y].message}<br><strong>${messages[y].personName}</strong>`
                            }
    
                            if (messages[y].ID === 'User') {
                                message.classList.add('bg-success', 'bg-opacity-50', 'offset-6')
                            }
    
                            messagesModalBody.append(message)
                        } 
                    }
                } else {

                    for (let y = 0; y < messages.length; y++) {
                        if (messages[y].ID == ID || messages[y].ID === 'User' && messages[y].recipientID == senderID && messages[y].firstMessage == undefined) {

                            if (dateDivider != undefined && messages[y].date != dateDivider) {
                                dateDivider = messages[y].date
                                // Create new date divider
                                createDivider(dateDivider)

                            } else if (dateDivider === undefined) {
                                dateDivider = messages[y].date
                                createDivider(dateDivider)
                            }
                            // Create message
                            let message = document.createElement('div')
                            message.classList.add('container', 'border', 'p-3', 'my-4', 'col-6', 'rounded')
                            if (messages[y].companyName != undefined && messages[y].ID != 'User') {
                                message.innerHTML = `${messages[y].time.slice(0,5)}<br>${messages[y].message}<br><strong>${messages[y].personName}</strong>`
                            } else {
                                message.innerHTML = `${messages[y].time.slice(0,5)}<br>${messages[y].message}`
                            }

                            if (messages[y].ID === 'User') {
                                message.classList.add('bg-success', 'bg-opacity-50',  'offset-6')
                            } else {
                                message.classList.add('bg-light', 'bg-opacity-50', 'ms-3')
                            }

                            messagesModalBody.append(message)
                        }
                    }
                }

                function createDivider(date) {

                    let divider = document.createElement('div')
                    divider.classList.add('container', 'border', 'border-2', 'bg-light', 'rounded', 'shadow-sm', 'bg-opacity-75')
                    divider.innerHTML = `<p class="text-center fs-5 mt-2">${date}</p>`
                    messagesModalBody.append(divider)
                }

                // Add EventListener to Send Button
                document.querySelector('#msgSendBtn').addEventListener('click', () => {
                    
                    const content = document.querySelector('#messageContent').value
                    fetch('message', {
                        method: 'POST',
                        headers: {
                            "X-CSRFToken": document.cookie.slice(10,)
                        }, 
                        body: JSON.stringify({
                            "candidateID": senderID,
                            "message": content
                        })
                    })
                    .then(response => response.json())
                    .then(myResponse => {
                        if (myResponse.status === 200) {
                            // Create 'fake' message to render the illusion of active chat
                            let messagesModalBody = document.querySelector('#messagesModalBody')
                            let message = document.createElement('div')
                            message.classList.add('container', 'border', 'p-3', 'my-4', 'col-6', 'rounded', 'bg-success', 'bg-opacity-50', 'offset-6')
                            message.innerHTML = `${myResponse.time.slice(0,5)}<br>${content}`
                            messagesModalBody.append(message)
                            document.querySelector('#messageContent').value = ''
                            toastGenerator(`Message to ${name} was send.`)
                        } else {
                            toastGenerator(`Message to ${name} was send <p class="text-danger fw-bold">NOT</p> send - Error.`)
                        }
                    })
                    //window.location.reload();
                }, {once: true})

                document.querySelector('#modal7Btn').click()
            })
        }

        console.log(individuals)
    })
}

function pwMatch(a, b) {
    if (a != b) {
        return false
    } else {
        return true
    }
}

function navbarMobile() {
    // Change nav Links based on screen width
    if (window.innerWidth < 576) {
        document.querySelector('#messageView').innerHTML = 'Messages'
        document.querySelector('#messageView').classList.add('fw-bold')

        document.querySelector('#profileView').innerHTML = 'Profile'
        document.querySelector('#profileView').classList.add('fw-bold')
    } 
}

function toastGenerator(message) {
    // Generate toast based on input
    document.querySelector('#toastBody').innerHTML = message

    // Fire toast
    document.querySelector('#liveToastBtn').click()
}