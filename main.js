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
  if (options.shape === 'circle') {
    styles.borderRadius = '50%';
  }
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
  this.stationaryWidth = this.width;
  this.stationaryHeight = this.height;
  this.selected = false;
  this.mousedown = false;
  this.draggable = true;
  this.resizableX = false;
  this.resizableY = false;
  this.draggingEdge = null;
  this.isBeingResized = false;
}

//Board doesn't require an instance
//Store elements and updates them and event listeners
function Board() {}

Board.elements = [];

Board.moveElement = function moveElement(event, el) {
  if (el.draggable) {
    el.selected = true;
    el.x = Board.mousePos.x;
    el.dragPoint.x = Board.mousePos.x;
    el.dragPoint.y = Board.mousePos.y;
    el.element.style.cursor = '-webkit-grabbing';
    el.element.style.cursor = 'grabbing';
  }
}

Board.checkIfResizable = function checkIfResizable(event, el) {
  const isCursorOnTheLeftEdge = (Board.mousePos.x >= el.x - 5) && (Board.mousePos.x <= el.x + 5);
  const isCursorOnTheRightEdge = (Board.mousePos.x <= el.x + el.width + 5) && (Board.mousePos.x >= el.x + el.width - 5);
  const isCursorOnTheTopEdge = (Board.mousePos.y >= el.y - 5) && (Board.mousePos.y <= el.y + 5);
  const isCursorOnTheBottomEdge = (Board.mousePos.y <= el.y + el.height + 5) && (Board.mousePos.y >= el.y + el.height - 5);

  Board.isCursorMoving = true;

  if (isCursorOnTheLeftEdge && !el.isBeingResized){
    el.element.style.cursor = 'ew-resize';
    el.draggingEdge = 'left';
    el.resizableX = true;
    el.resizableY = false;
    el.draggable = false;
  } else if (isCursorOnTheRightEdge && !el.isBeingResized) {
    el.element.style.cursor = 'ew-resize';
    el.draggingEdge = 'right';
    el.resizableX = true;
    el.resizableY = false
    el.draggable = false;
  } else if (isCursorOnTheTopEdge && !el.isBeingResized) {
    el.element.style.cursor = 'ns-resize';
    el.draggingEdge = 'top';
    el.resizableY = true;
    el.resizableX = false;
    el.draggable = false;
  } else if(isCursorOnTheBottomEdge && !el.isBeingResized) {
    el.element.style.cursor = 'ns-resize';
    el.draggingEdge = 'bottom';
    el.resizableY = true;
    el.resizableX = false;
    el.draggable = false;
  } else {
    el.element.style.cursor = '-webkit-grab';
    el.element.style.cursor = 'grab';
    el.draggable = true;
  }
}

Board.elementResize = function elementResize(event, el) {
  if (el.resizableX || el.resizableY === true) {
    el.dragPoint.x = Board.mousePos.x;
    el.dragPoint.y = Board.mousePos.y;
    el.mousedown = true;
  }
}

Board.dropElement = function dropElement(event, el) {
  if(el.selected === true) {
    el.y = Board.mousePos.y - (el.dragPoint.y) + el.stationaryPosition.y;
    el.x = Board.mousePos.x - (el.dragPoint.x) + el.stationaryPosition.x;
    el.element.style.cursor = '-webkit-grab';
  }
  el.selected = false;
  el.mousedown = false;
  el.dragPoint.x = 0;
  el.dragPoint.y = 0;
  el.stationaryPosition.x = el.x;
  el.stationaryPosition.y = el.y;

  el.stationaryWidth = el.width;
  el.stationaryHeight = el.height;
  el.isBeingResized = false;
}

Board.elementOnMouseDown = function elementOnMouseDown(event, el) {
  if(el.selected===true){
      el.mousedown = true;
    }
}

Board.updateListeners = function updateListeners() {
  for(let item of Board.elements) {
    item.element.removeEventListener('mousemove', (event) => Board.checkIfResizable(event, item));
    item.element.removeEventListener('mousedown', (event) => Board.moveElement(event, item));
    window.removeEventListener('mouseup', (event) => Board.dropElement(event, item));
    item.element.removeEventListener('mousedown', (event) => Board.elementOnMouseDown(event, item));
    item.element.removeEventListener('mousedown', (event) => Board.elementResize(event, item));

    item.element.addEventListener('mousemove', (event) => Board.checkIfResizable(event, item));
    item.element.addEventListener('mousedown', (event) => Board.moveElement(event, item));
    window.addEventListener('mouseup', (event) => Board.dropElement(event, item));
    item.element.addEventListener('mousedown', (event) => Board.elementOnMouseDown(event, item));
    item.element.addEventListener('mousedown', (event) => Board.elementResize(event, item));
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

Board.isCursorMoving = false;

Board.checkIfCursorIsMoving = null;

Board.update = function update() {
  for (let item of this.elements) {
    if (item.mousedown === true && item.selected === true) {
      item.y = Board.mousePos.y - (item.dragPoint.y) + item.stationaryPosition.y;
      item.x = Board.mousePos.x - (item.dragPoint.x) + item.stationaryPosition.x;
    }

    else if ((item.resizableX || item.resizableY) && item.mousedown && Board.isCursorMoving) {
      item.isBeingResized = true;
      if (item.resizableX) {
        switch (item.draggingEdge) {
          case 'right':
            item.width =  Board.mousePos.x - item.dragPoint.x + item.stationaryWidth;
            break;
          case 'left':
            item.width = item.dragPoint.x - Board.mousePos.x + item.stationaryWidth;
            if (item.width > 5) item.x = Board.mousePos.x
            break;
        }
      }
      
      if (item.resizableY) {
        switch (item.draggingEdge) {
          case 'bottom':
            item.height =  Board.mousePos.y - item.dragPoint.y + item.stationaryHeight;
            break;
          case 'top':
            item.height = item.dragPoint.y - Board.mousePos.y + item.stationaryHeight;
            if (item.height > 5) item.y = Board.mousePos.y;
            break;
        }
      }
    }
 
    if (item.width <= 0) item.width = 5;
    if (item.height <= 0) item.height = 5;

    item.element.style.left = item.x + 'px'; 
    item.element.style.top = item.y + 'px';
    item.element.style.width = item.width + 'px';
    item.element.style.height = item.height + 'px';
  }
}

const colorPicker = document.getElementById('color-picker');
const sizeInput = document.getElementById('size-input');
const createObjectButton = document.getElementById('create-element');
const shapeInput = document.getElementById('shape-input');

window.addEventListener('mousemove', function(event) {
  clearTimeout(Board.checkIfCursorIsMoving);
  Board.isCursorMoving = true;
  Board.checkIfCursorIsMoving = setTimeout(function() {
    Board.isCursorMoving = false;
  }, 100)
  Board.mousePos.x = event.clientX;
  Board.mousePos.y = event.clientY;
})

createObjectButton.addEventListener('click', function(event) {
  const size = sizeInput.value;
  let shape = 'square';
  if (shapeInput.checked) shape = shapeInput.value;
  if (size < 20 || size > 300) {
    alert("Element's size must fall between 20 and 300");
    return;
  } else if (isNaN(parseFloat(size)) || !isFinite(size)) {
    alert('Size should be a number!');
    return;
  }
  const element = new DomElement({
    x: Math.random() * ((window.innerWidth - 100) - 20) + 20,
    y: Math.random() * ((window.innerHeight - 100) - 200) + 200,
    width: size,
    height: size,
    backgroundColor: colorPicker.options[colorPicker.selectedIndex].value,
    shape: shape
  });

  Board.addElement(element);
})

const loop = function loop() {
  Board.update();
  requestAnimationFrame(loop);
}

loop();
