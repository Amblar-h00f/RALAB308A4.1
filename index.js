import * as Carousel from "./Carousel.js";
import axios from 'axios';

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
// SET API config
const API_KEY = "API_KEY";
axios.defaults.baseURL = 'https://api.thecatapi.com/v1';
axios.defaults.headers.common['x-api-key'] = API_KEY;

//Axios interceptors
axios.interceptors.request.use(config => {
  progressBar.style.width = '0%';
  document.body.style.cursor = 'progress';
  config.metadata = { startTime: new Date() };
  return config;
});

axios.interceptors.response.use(response => {
  const duration = new Date() -
    response.config.metadata.startTime;
  progressBar.style.width = '100%';
  setTimeout(() => progressBar.style.width = '0%', 500);
  document.body.style.cursor = 'default';
  console.log(`Request completed in ${duration}ms`);
  return response;
}, error => {
  document.body.style.cursor = 'default';
  return Promise.reject(error);
});
// progress handler
function updateProgress(e) {
  if (e.lengthComputable) {
    const percent = (e.loaded / e.total) * 100;
    progressBar.style.width = `${percent}%`;
  }
}
// Initial load
async function initialLoad() {
  try {
    const { data: breeds } = await axios.get('/breeds',) {
      onDownloadProgress: updateProgress
    });

    breedSelect.innerHTML = breeds.map(breed =>
      `<option value="${breed.id}">${breed.name}</option>`).join('');

    breedSelect.addEventListener('change',
      handleBreedSelection);
    breedSelect.dispatchEvent(new Event('change'));
  } catch (error) {
    console.error('Failed to load breeds:', error);
  }
}
// Breed selection handler
async function handleBreedSelection() {
  try {
    const breedId = this.value;
    const carouselInner =
      document.getElementById('carouselInner');
    carouselInner.innerHTML = '';
    infoDump.innerHTML = '<h3>Loading breed information</h3>';

    //Fetch images
    const { data: images } = await axios.get('/images/search',
      {
        params: { breed_ids: breedId, limit: 5 },
        onDownloadProgress: updateProgress
      });

    //Create carousel items
    const template =
      document.getElementById('carouselItemTemplate');
    images.forEach((image, index) => {
      const clone = template.contentEditable.cloneNode(true);
      const item = clone.querySelector('.carousel-item');
      const img = clone.querySelector('img');
      const favButton = clone.querySelector('.favourite-button');

      item.classList.toggle('active', index === 0);
      img.src = image.url;
      img.alt = `Cat image ${index + 1}`;
      favButton.dateset.imgId = image.id;
      favButton.onclick = () => favourite(image.id);

      if (image.favourite) {
        favButton.classList.add('favourited');
      }

      carouselInner.appendChild(clone);

    });

    //Fetch breed info
    const { data: breedData } = await
      axios.get(`/breeds/${breedId}`);
    infoDump.innerHTML = `
<div class="breed-info">
<h2>${breedData.name}</h2>
<p><strong>Origin:</strong> ${breedData.orgin || 'N/A'}</p>
<p><strong>Life Span:</strong> ${breedData.life_span || 'N/A'} years</p>
        <p>${breedData.description || ''}</p>
      </div>
`;

  } catch (error) {
    infoDump.innerHTML = `<p class="error">Error:${error.message}</p>`;
  }
}
//Favourite functonality
export async function favourite(imgId) {
  try {
    const { data: existing } = await axios.get('/favourites');
    const existingFav = existing.find(fav => fav.image_id === imgId);

    if (existingFav) {
      await axios.delete(`/favourites/${existingFav.id}`);
    } else {
      await axios.post('/favourites', { image_id: imgId });
    }
    getFavouritesBtn();
  } catch (error) {
    console.error('Favourite error:', error);
  }
}

//Get favourites handler
async function getFavourites() {
  try {
    const { data: favourites } = await
      axios.get('/favourites');
    const carouselInner =
      document.getElementById('carouselInner');

    carouselInner.innerHTML = '';
    infoDump.innerHTML = '<h3>Your Favourites</h3>';

    favourites.forEach((fav, index) => {
      const clone = document.importNode(

        document.getElementById('carouselItemTemplate').content,
        true
      );
    });
  } catch (error) {
    console.error('Favourites error:', error);
  }
}

// toggle functionality

export async function favourite(imgId) {
  try {

    const { data: existingFavourites } = await
      axios.get('/favourites');
    const existinFavourite = existingFavourites.find(fav =>
      fav.image_id
      === imgId);

    if (existingFavourite) {

      await
        axios.delete(`/favourites/${existingFavourite.id}`);
      console.log(`Removed favourite: ${imgId}`);
    } else {
      await axios.post('/favourites', {
        image_id: imgId,
        sub_id: "user-123"
      });
      console.log(`Added favourite: ${imgId}`);
    }
    getFavourites();
  } catch (error) {
    console.error('Favourite toggle failed:', error);
    throw error;
  }
}
//Initialize
getFavouritesBtn.addEventListener('click', getFavourites);
document.addEventListener('DOMContentLoaded', initialLoad);




 


 



 






 





