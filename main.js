"use strict";
//DomElement returns custom DOM element
function DomElement(options) {
  const el = document.createElement('div');
  const styles = el.style;

  el.className += 'drag';
  styles.left = options.x + 'px';
  styles.top = options.y + 'px';
  styles.width = options.width + 'px';
  styles.height = options.height + 'px';
  styles.backgroundColor = options.backgroundColor;

  document.body.appendChild(el);

  return el;
}

//Wrapper for DomElement for convinient element's position manipulation
function ManipulatableBoardElement(domElement) {
  this.element = domElement;
  this.x = this.element.getBoundingClientRect().left;
  this.y = this.element.getBoundingClientRect().top;
  this.width = this.element.clientWidth;
  this.height = this.element.clientHeight;
  this.dragPoint = {
    x: 0,
    y: 0
  };
  this.stationaryPosition = {
    x: this.element.getBoundingClientRect().left,
    y: this.element.getBoundingClientRect().top
  };
  this.selected = false;
}

//Board doesn't require an instance
//Store elements and updates them and event listeners
function Board() {}

Board.elements = [];

Board.elementOnMouseDown = function elementOnMouseDown(event, el) {
  el.selected = true;
  el.x = Board.mousePos.x;
  el.dragPoint.x = Board.mousePos.x;
  el.dragPoint.y = Board.mousePos.y;
}

Board.windowOnMouseUp = function windowOnMouseUp(event, el) {
  if(el.selected === true) {
    el.y = Board.mousePos.y - (el.dragPoint.y) + el.stationaryPosition.y;
    el.x = Board.mousePos.x - (el.dragPoint.x) + el.stationaryPosition.x;
  }
  el.selected = false;
  Board.mousedown = false;
  el.dragPoint.x = 0;
  el.dragPoint.y = 0;
  el.stationaryPosition.x = el.x;
  el.stationaryPosition.y = el.y;
}

Board.windowOnMouseDown = function elementOnMouseDown(event, el) {
  if(el.selected===true){
      Board.mousedown = true;
    }
}

Board.updateListeners = function updateListeners() {
  for(let item of Board.elements) {
    item.element.removeEventListener('mousedown', () => Board.elementOnMouseDown(event, item))
    window.removeEventListener('mouseup', () => Board.windowOnMouseUp(event, item));
    window.removeEventListener('mousedown', () => Board.windowOnMouseDown(event, item));

    item.element.addEventListener('mousedown', () => Board.elementOnMouseDown(event, item))
    window.addEventListener('mouseup', () => Board.windowOnMouseUp(event, item));
    window.addEventListener('mousedown', () => Board.windowOnMouseDown(event, item));
  }

}

Board.addElement = function addElement(element) {
  const boardElement = new ManipulatableBoardElement(element)
  Board.elements.push(boardElement);
  Board.updateListeners();
}

Board.mousePos = {
  x: 0,
  y: 0
}
Board.mousedown = false;

Board.update = function update() {
  for (let item of this.elements) {
    if(Board.mousedown === true && item.selected === true) {
      item.y = Board.mousePos.y - (item.dragPoint.y) + item.stationaryPosition.y;
      item.x = Board.mousePos.x - (item.dragPoint.x) + item.stationaryPosition.x;
    }
    item.element.style.left = item.x + 'px'; 
    item.element.style.top = item.y + 'px';
    item.element.style.width = item.width + 'px';
    item.element.style.height = item.height + 'px';
  }
}

const colorPicker = document.getElementById('color-picker');
const sizeInput = document.getElementById('size-input');
const createObjectButton = document.getElementById('create-element');

window.addEventListener('mousemove', function(event) {
  Board.mousePos.x = event.clientX;
  Board.mousePos.y = event.clientY;
})

createObjectButton.addEventListener('click', function(event) {
  const size = sizeInput.value;

  if (size < 50 || size > 200) {
    alert("Element's size must fall between 50 and 200");
    return;
  }
  const element = new DomElement({
    x: Math.random() * ((window.innerWidth - 100) - 20) + 20,
    y: Math.random() * ((window.innerHeight - 100) - 200) + 200,
    width: size,
    height: size,
    backgroundColor: colorPicker.options[colorPicker.selectedIndex].value
  });

  Board.addElement(element);
})

const loop = function loop() {
  Board.update();
  requestAnimationFrame(loop);
}

loop();
