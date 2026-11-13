"use strict";

// Лабораторная работа № 3. Асинхронный JavaScript и REST API.
// Для тестирования HTTP 404 временно замените POSTS_GET_URL на
// "https://jsonplaceholder.typicode.com/postz", а после проверки верните адрес.
const POSTS_GET_URL = "https://jsonplaceholder.typicode.com/posts?_limit=5";
const POSTS_POST_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("loadBtn");
const loadStatus = document.getElementById("loadStatus");
const postsList = document.getElementById("postsList");
const postForm = document.getElementById("postForm");
const postTitle = document.getElementById("postTitle");
const postBody = document.getElementById("postBody");
const submitButton = document.getElementById("submitBtn");
const postStatus = document.getElementById("postStatus");
const createdPost = document.getElementById("createdPost");

function showMessage(element, message, type = "neutral") {
  element.textContent = message;
  element.className = `message message-${type}`;
}

function showEmptyList(message) {
  postsList.replaceChildren();
  const empty = document.createElement("div");
  empty.className = "empty-state";
  const title = document.createElement("strong");
  title.textContent = message;
  empty.appendChild(title);
  postsList.appendChild(empty);
}

function renderPosts(posts) {
  postsList.replaceChildren();

  if (posts.length === 0) {
    showEmptyList("Публикаций пока нет.");
    return;
  }

  posts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "post";
    const header = document.createElement("div");
    header.className = "post-header";
    const heading = document.createElement("h3");
    heading.textContent = post.title;
    const number = document.createElement("span");
    number.className = "post-number";
    number.textContent = `ID ${post.id}`;
    const body = document.createElement("p");
    body.textContent = post.body;
    header.append(heading, number);
    article.append(header, body);
    postsList.appendChild(article);
  });
}

async function loadPosts() {
  loadButton.disabled = true;
  showMessage(loadStatus, "Загрузка публикаций…");

  try {
    const response = await fetch(POSTS_GET_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: не удалось получить публикации`);
    }
    const posts = await response.json();
    if (!Array.isArray(posts)) {
      throw new Error("Сервер вернул неожиданный формат данных");
    }
    renderPosts(posts);
    showMessage(loadStatus,
      posts.length === 0 ? "Запрос выполнен. Публикаций нет." : `Успешно загружено публикаций: ${posts.length} (HTTP ${response.status}).`,
      "success");
  } catch (error) {
    showEmptyList("Не удалось загрузить список. Повторите запрос.");
    showMessage(loadStatus, `Ошибка загрузки: ${error.message}. Проверьте соединение и попробуйте ещё раз.`, "error");
  } finally {
    loadButton.disabled = false;
  }
}

function renderCreatedPost(post) {
  createdPost.replaceChildren();
  const title = document.createElement("h3");
  title.textContent = post.title;
  const body = document.createElement("p");
  body.textContent = post.body;
  const id = document.createElement("small");
  id.textContent = `ID из ответа сервера: ${post.id}`;
  createdPost.append(title, body, id);
  createdPost.hidden = false;
}

async function createPost(event) {
  event.preventDefault();
  const title = postTitle.value.trim();
  const body = postBody.value.trim();

  if (!title || !body) {
    showMessage(postStatus, "Ошибка: заполните поля «Заголовок» и «Текст». Одни пробелы не допускаются.", "error");
    return;
  }

  submitButton.disabled = true;
  createdPost.hidden = true;
  showMessage(postStatus, "Отправка публикации…");

  try {
    const response = await fetch(POSTS_POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: не удалось создать публикацию`);
    }
    const result = await response.json();
    renderCreatedPost(result);
    showMessage(postStatus, `Успех! Сервер принял публикацию (HTTP ${response.status}, ID ${result.id}).`, "success");
    postForm.reset();
  } catch (error) {
    showMessage(postStatus, `Ошибка отправки: ${error.message}. Попробуйте ещё раз.`, "error");
  } finally {
    submitButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadPosts);
postForm.addEventListener("submit", createPost);
