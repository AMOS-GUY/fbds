/*import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import { blogPosts } from "../data/blog-container.js";
import { renderBlogs } from "../public/scripts/utils/general-fx.js";

let today = dayjs();
let monthBefore = today.subtract(30, 'day');

console.log(today.add(30, 'day').format('MMMM D YYYY'));  // Fixed
console.log(monthBefore.format('MMMM D YYYY'));

const idElement = document.querySelector('.id-element-js');
const titleElement = document.querySelector('.title-element-js');
const exceptElement = document.querySelector('.except-element-js');
const date = document.querySelector('.date-element-js');
const categoryElement = document.querySelector('.category-element-js');
const imagebgElement = document.querySelector('.imagebg-element-js');
const fullContent = document.querySelector('.full-content-element-js');
const pictureElement = document.querySelector('.picture-element-js');
const addButton = document.querySelector('.add-blog-js');

addButton.addEventListener('click', () => {
  blogPosts.push({
    id : idElement.value,
    title : titleElement.value,
    excerpt : exceptElement.value,
    date : today.format('MMMM D, YYYY'),
    category : categoryElement.value,
    imageBg : imagebgElement.value,
    fullContent : fullContent.value,
    picture : pictureElement.value,
  });
  renderBlogs();
  console.log(blogPosts);
  console.log('Add Button:', addButton);
  console.log('Initial blogPosts:', blogPosts);
  console.log('ID Element:', idElement);
});*/

import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import { blogPosts } from "../data/blog-container.js";
import { renderBlogs } from "../public/scripts/blog.js";

let today = dayjs();
let monthBefore = today.subtract(30, 'day');

const idElement = document.querySelector('.id-element-js');
const titleElement = document.querySelector('.title-element-js');
const exceptElement = document.querySelector('.except-element-js');
const date = document.querySelector('.date-element-js');
const categoryElement = document.querySelector('.category-element-js');
const imagebgElement = document.querySelector('.imagebg-element-js');
const fullContent = document.querySelector('.full-content-element-js');
const pictureInput = document.querySelector('.picture-element-js');
const addButton = document.querySelector('.add-blog-js');

// Store the uploaded image as a temporary URL
let uploadedImageUrl = null;

// Listen for file selection
pictureInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  
  if (file) {
    // Clean up old URL if it exists
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    
    // Create a temporary URL for the uploaded image
    uploadedImageUrl = URL.createObjectURL(file);
    console.log('Image uploaded, temporary URL:', uploadedImageUrl);
    console.log('Original filename:', file.name);
  }
});

addButton.addEventListener('click', () => {
  // Check if an image was uploaded
  let picturePath = '';
  
  if (uploadedImageUrl) {
    // Store the temporary URL (works while page is open)
    picturePath = uploadedImageUrl;
    
    // OR store just the filename if you have a backend
    // const file = pictureInput.files[0];
    // picturePath = file ? file.name : '';
  }
  
  const newBlog = {
    id: idElement.value,
    title: titleElement.value,
    excerpt: exceptElement.value,
    date: today.format('MMMM D, YYYY'),
    category: categoryElement.value,
    imageBg: imagebgElement.value || "linear-gradient(125deg, #$87a, #aa7e54)", // Default if empty
    fullContent: fullContent.value,
    picture: picturePath, // This will be the temporary URL
  };
  
  blogPosts.push(newBlog);
  renderBlogs();
  console.log('New blog added:', newBlog);
  console.log('All blogs:', blogPosts);
  
  // Clear form
  idElement.value = '';
  titleElement.value = '';
  exceptElement.value = '';
  fullContent.value = '';
  pictureInput.value = ''; // Clear file input
  uploadedImageUrl = null; // Reset
});
