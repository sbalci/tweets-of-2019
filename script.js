const showElement = ({show = true, id = 'search-results'}) => {
  console.log('got message: ${show} at ${ts}')
  document.getElementById(id).classList.toggle('hidden', !show)
}

Shiny.addCustomMessageHandler('show', showElement)


let showWaitingMessageTimeout = null

const showWaiting = ({screen_name, show = false} = {}) => {
  const st = document.getElementById("searching-for-tweets")
  st.classList.toggle('hidden', !show)

  if (screen_name && show) {
    const sn = document.getElementById('searching_screen_name')
    sn.innerHTML = `<a href="https://twitter.com/${screen_name}">&commat;${screen_name}</a>`
  }
  if (showWaitingMessageTimeout) {
    clearTimeout(showWaitingMessageTimeout)
    showWaitingMessageTimeout = null
  }
}

const showWaitingDelay = (msg) => {
  let show = typeof msg.show === 'undefined' ? false : msg.show
  if (!show) {
    // hide immediately
    showWaiting({show: false})
  } else {
    showWaitingMessageTimeout = setTimeout(() => showWaiting(msg), 500)
  }
}

Shiny.addCustomMessageHandler('showWaiting', showWaitingDelay)

let shinyChangedLocationHistory = true

const updateSearchByLocationHash = (hash) => {
  hash = hash.replace('#', '')
  snInput.value = hash
  if (typeof Shiny === 'undefined' || typeof Shiny.setInputValue === "undefined") {
    setTimeout(() => updateSearchByLocationHash(hash), 100)
  } else {
    shinyChangedLocationHistory = false
    Shiny.setInputValue('screen_name', hash, {priority: 'event'})
    Shiny.setInputValue('__key_search', Date.now())
    window.scrollTo(0, 0)
  }
}

const snInput = document.getElementById('screen_name')
snInput.focus()

if (/#/.test(window.location.hash)) {
  updateSearchByLocationHash(window.location.hash)
}

snInput.addEventListener('keydown', ev => {
  if (ev.key === 'Enter') {
    // Shiny.inputBindings.bindingNames['shiny.textInput'].binding.setValue($('#screen_name'), snInput.value)
    setTimeout(() => Shiny.setInputValue('__key_search', Date.now(), {priority: 'event'}), 150)
  }
})

window.addEventListener('hashchange', () => {
  updateSearchByLocationHash(window.location.hash)
})

const pushScreenNameHistory = (sn) => {
  if (!shinyChangedLocationHistory) {
    shinyChangedLocationHistory = true
    return;
  }
  if(history.pushState) {
    history.pushState(null, null, '#' + sn);
  }
  else {
    location.hash = '#' + sn;
  }
}

Shiny.addCustomMessageHandler("newScreenName", pushScreenNameHistory)

const joinLikedRetweeted = (join) => {
  const tweetsMost = document.querySelector('.tweets-most')
  const tweets = tweetsMost.children
  const isJoined = tweets[1].classList.contains('hidden')
  if (isJoined && join) return;
  if (!isJoined && !join) return;
  if (join) {
    // join
    tweets[0].querySelector('h2').innerHTML = 'Most Liked & Retweeted'
    tweets[0].classList.add('col-sm-offset-3')
    tweets[1].classList.add('hidden')
  } else {
    // unjoin
    tweets[0].querySelector('h2').innerHTML = 'Most Liked'
    tweets[0].classList.remove('col-sm-offset-3')
    tweets[1].classList.remove('hidden')
  }
}

Shiny.addCustomMessageHandler('joinLikedRetweeted', joinLikedRetweeted)
