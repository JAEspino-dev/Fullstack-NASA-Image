let upvote = document.getElementsByClassName("upvote");
let deleteButton = document.getElementsByClassName("deleteButton");
let downVote = document.getElementsByClassName("downVote");

Array.from(deleteButton).forEach(function (element) {
  element.addEventListener('click', function () {
    const dataSetID = this.dataset.msgId
    console.log(dataSetID)
    fetch('deleteItem', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'collectionDocumentID': dataSetID
      })
    }).then(function (response) {
      window.location.reload()
    })
  });
});


Array.from(upvote).forEach(function (element) {
  element.addEventListener('click', function () {
    const dataSetID = this.dataset.msgId
    
    console.log(dataSetID)
    fetch('upvote', {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'collectionDocumentID': dataSetID
      })
    })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        console.log(data)
        // Reload page
        window.location.reload(true)
      })
  });
});

Array.from(downVote).forEach(function (element) {
  element.addEventListener('click', function () {
    const dataSetID = this.dataset.msgId
    
    console.log(dataSetID)
    fetch('downVote', {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'collectionDocumentID': dataSetID
      })
    })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        console.log(data)
        // Reload page
        window.location.reload(true)
      })
  });
});


//The user will enter a date. Use that date to get the NASA picture of the day from that date! https://api.nasa.gov/

const inputtedValue = document.querySelector('.inputValue');
document.querySelector('button').addEventListener('click', imageOfTheDateInputted);

let stuffReturned = {};
let toBeUsedForCrud = {}

function imageOfTheDateInputted() {
    let media = inputtedValue.value
    console.log(media)
    fetch(
        `https://api.nasa.gov/planetary/apod?api_key=N1Yzg6YR0VucbbyKj6bkR2Q0bGo2sZxTXbx6puSR&date=${media}`
    )
        .then((res) => res.json())
        .then((data) => {
            stuffReturned = data
            console.log('Data from Nasa', data)
            display(stuffReturned)
            console.log(toBeUsedForCrud)
            toBeUsedForCrud = { 
              url: data.url,
              date: data.date
            }
            console.log(toBeUsedForCrud)
        })
}

function display(dataWeGotFromAPI) {
    // document.querySelector('#title').innerText = dataWeGotFromAPI.title
    document.querySelector('h3').innerText = dataWeGotFromAPI.explanation
    document.querySelector('#date').innerText = dataWeGotFromAPI.date
    
    document.querySelector('#imageUrl').value = dataWeGotFromAPI.url
    document.querySelector('#imageDate').value = dataWeGotFromAPI.date
    if (dataWeGotFromAPI.media_type === 'video') {
        document.querySelector('video').style.display = 'block'
        document.querySelector('img').style.display = 'none'
        document.querySelector('#video').src = dataWeGotFromAPI.url
    } else if (dataWeGotFromAPI.media_type === 'image') {
        document.querySelector('video').style.display = 'none'
        document.querySelector('img').style.display = 'block'
        document.querySelector('#image').src = dataWeGotFromAPI.hdurl
        console.log('Testing for images')
    }
}
