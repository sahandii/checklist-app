/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {
	constructor() {
		this.todos = JSON.parse(localStorage.getItem("todos")) || [];
	}

	bindTodoListChanged(callback) {
		this.onTodoListChanged = callback;
	}

	_commit(todos) {
		this.onTodoListChanged(todos);
		localStorage.setItem("todos", JSON.stringify(todos));
	}

	addTodo(todoText) {
		const todo = {
			id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
			text: todoText,
			complete: false,
		};

		this.todos.push(todo);

		this._commit(this.todos);
	}

	editTodo(id, updatedText) {
		this.todos = this.todos.map((todo) =>
			todo.id === id
				? { id: todo.id, text: updatedText, complete: todo.complete }
				: todo,
		);

		this._commit(this.todos);
	}

	deleteTodo(id) {
		this.todos = this.todos.filter((todo) => todo.id !== id);

		this._commit(this.todos);
	}

	toggleTodo(id) {
		this.todos = this.todos.map((todo) =>
			todo.id === id
				? { id: todo.id, text: todo.text, complete: !todo.complete }
				: todo,
		);
		this._commit(this.todos);
	}
}

class View {
	constructor() {
		this.todoList = document.querySelector(".todo-item--container");
		this.form = document.querySelector("form");
		this.input = document.querySelector("input");

		this._temporaryTodoText = "";
		this._initLocalListeners();
	}

	bindAddTodo(handler) {
		this.form.addEventListener("submit", (event) => {
			event.preventDefault();

			if (this._todoText) {
				handler(this._todoText);
				this._resetInput();
			} else {
				console.log("Write something!");
			}
		});
	}
	displayTodos(todos) {
		while (this.todoList.firstChild) {
			this.todoList.removeChild(this.todoList.firstChild);
		}
		if (todos.length === 0) {
			const emptyTodo = `
				<div class="empty-message px-3 text-center">
					<h4>Let's get some work done! &#10548;</h4>
				</div>
			`;
			this.todoList.innerHTML += emptyTodo;
		} else {
			todos.forEach((todo) => {
				const todoItem = `
				<div id="${todo.id}" class="${
					todo.complete ? "checked " : ""
				}todo-item d-flex justify-content-between align-items-center flex-row mx-3 my-2">
					<button class="circle-small checkbox mx-3"></button>
					<div class="todo-item--title text-left w-100">
						<h4 contenteditable="true" tabindex="${todo.id}" class="editable">${
					todo.text
				}</h4>
					</div>
					<i style="color:#E02020" class="delete fas fa-trash p-3"></i>
				</div>`;
				if (todo.complete) {
					console.log(todo);
				}
				this.todoList.innerHTML += todoItem;
			});
		}
		// Debugging
		console.log(todos);
	}
	_initLocalListeners() {
		this.todoList.addEventListener("input", (event) => {
			if (event.target.className === "editable") {
				this._temporaryTodoText = event.target.innerText;
			}
		});
	}

	bindAddTodo(handler) {
		this.form.addEventListener("submit", (event) => {
			event.preventDefault();

			if (this._todoText) {
				handler(this._todoText);
				this._resetInput();
			}
		});
	}
	bindDeleteTodo(handler) {
		this.todoList.addEventListener("click", (event) => {
			if (event.target.className.includes("delete")) {
				const id = parseInt(event.target.parentElement.id);

				handler(id);
			}
		});
	}
	bindEditTodo(handler) {
		this.todoList.addEventListener("focusout", (event) => {
			if (this._temporaryTodoText) {
				const id = parseInt(event.target.parentElement.parentElement.id);

				handler(id, this._temporaryTodoText);
				this._temporaryTodoText = "";
			}
		});
	}
	bindToggleTodo(handler) {
		this.todoList.addEventListener("click", (event) => {
			if (event.target.className.includes("checkbox")) {
				const id = parseInt(event.target.parentElement.id);
				handler(id);
			}
		});
	}
	createElement(tag, name) {
		const element = document.createElement(tag);
		if (name) element.classList.add(name);

		return element;
	}
	get _todoText() {
		return this.input.value;
	}

	_resetInput() {
		this.input.value = "";
	}
}

class Controller {
	constructor(model, view) {
		this.model = model;
		this.view = view;

		// this binding
		this.model.bindTodoListChanged(this.onTodoListChanged);
		this.view.bindAddTodo(this.handleAddTodo);
		this.view.bindEditTodo(this.handleEditTodo);
		this.view.bindDeleteTodo(this.handleDeleteTodo);
		this.view.bindToggleTodo(this.handleToggleTodo);

		// Display initial todos
		this.onTodoListChanged(this.model.todos);
	}
	onTodoListChanged = (todos) => {
		this.view.displayTodos(todos);
	};
	handleAddTodo = (todoText) => {
		this.model.addTodo(todoText);
	};

	handleEditTodo = (id, todoText) => {
		this.model.editTodo(id, todoText);
	};

	handleDeleteTodo = (id) => {
		this.model.deleteTodo(id);
	};

	handleToggleTodo = (id) => {
		this.model.toggleTodo(id);
	};
}

const app = new Controller(new Model(), new View());
