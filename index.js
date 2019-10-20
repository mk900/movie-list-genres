(function () {
  // Genres category
  const genres = {
    "1": "Action",
    "2": "Adventure",
    "3": "Animation",
    "4": "Comedy",
    "5": "Crime",
    "6": "Documentary",
    "7": "Drama",
    "8": "Family",
    "9": "Fantasy",
    "10": "History",
    "11": "Horror",
    "12": "Music",
    "13": "Mystery",
    "14": "Romance",
    "15": "Science Fiction",
    "16": "TV Movie",
    "17": "Thriller",
    "18": "War",
    "19": "Western"
  }

  // get elements
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []
  const dataPanel = document.getElementById("data-panel")
  const searchBtn = document.getElementById("submit-search")
  const searchInput = document.getElementById("search")
  const pagination = document.getElementById("pagination")
  const ITEM_PER_PAGE = 12
  let paginationData = []
  const genresList = document.getElementById("genreslist")

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    getTotalPages(data)
    //displayDataList(data) 
    getPageData(1, data)  // 改分頁顯示
  }).catch((err) => console.log(err))

  displayGenresList(genres)

  // pagination
  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  function getPageData(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)
  }

  // pagination 分頁 active
  function paginationView(event) {
    //console.log(event.target.dataset.page)
    currentPage = event.target.dataset.page  //更新currentPage值
    $('body').on('click', 'li', function () { //當前頁面增加active樣式讓使用者區分目前的頁面
      $('li.active').removeClass('active')
      $(this).addClass('active')
    });
    if (event.target.tagName === 'A') {
      getPageData(currentPage, paginationData)
    }
  }

  // display GenresList
  function displayGenresList(genres) {
    for (let i = 0; i < Object.keys(genres).length; i++) {
      genresList.innerHTML += `
        <li class="nav-item genres-item">
          <a class="nav-link" href="#" data-toggle="pill" data-key="${i + 1}">${genres[i + 1]}</a>
        </li>
      `
    }
  }

  // data panel
  function displayDataList(data) {
    let htmlContent = ''
    data.forEach(function (item, index) {
      htmlContent += `
        <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h6 class="card-title">${item.title}</h6>
              <div class="row ml-1">
      `
      for (let i = 0; i < item.genres.length; i++) { //add genres tag below title
        htmlContent += `
          <span class="badge badge-light mr-1 mt-2" > ${genres[item.genres[i]]}</span>
        `
      }
      htmlContent += `
              </div>
            </div>
    
            <!-- "More" button -->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <!-- favorite button --> 
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = htmlContent
  }

  // Modal
  function showMovie(id) {
    const modalTitle = document.getElementById("show-movie-title") // get elements
    const modalImage = document.getElementById("show-movie-image")
    const modalDate = document.getElementById("show-movie-date")
    const modalDescription = document.getElementById("show-movie-description")
    const url = INDEX_URL + id  // set request url
    console.log(url)
    axios.get(url).then(response => {   // send request to show api
      const data = response.data.results
      console.log(data)
      modalTitle.textContent = data.title  // insert data into modal ui
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  // Favorite
  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  // set listener
  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches(".btn-show-movie")) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches(".btn-add-favorite")) {
      console.log(event.target.dataset.id)
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to search btn click event
  searchBtn.addEventListener('click', event => {  // search
    event.preventDefault()
    let results = []
    const regex = new RegExp(searchInput.value, 'i')
    results = data.filter(movie => movie.title.match(regex))
    console.log(results)
    //displayDataList(results)
    getTotalPages(results)
    getPageData(1, results)
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    console.log(event.target.dataset.page)
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page)
    }
  })

  // listen to genres
  genresList.addEventListener('click', event => {
    const genresKey = event.target.dataset.key
    //console.log(genresKey)
    const genresItmes = []
    data.forEach(function (movie) {
      for (let i = 0; i < movie.genres.length; i++) {
        if (movie.genres[i] === +genresKey) {
          genresItmes.push(movie)
          console.log(genresItmes)
        }
      }
    })
    //displayDataList(genresItmes)
    getTotalPages(genresItmes)
    getPageData(1, genresItmes)
    if (genresItmes === undefined || genresItmes.length == 0) {
      alert(`${genres[genresKey]} has no data`)
    }
  })

  // listen to pagination active
  pagination.addEventListener("click", paginationView)

})()