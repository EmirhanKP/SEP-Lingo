import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Vocabulary {
  id: number;
  wordDE: string;
  wordEN: string;
  wordType: string;
  theme: string;
}

@Component({
  selector: 'app-snake-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './snake-game.component.html',
  styleUrl: './snake-game.component.css'
})
export class SnakeGameComponent implements OnInit {
  gridSize = 20;
  snake = [{ x: 10, y: 10 }];
  food = this.generateFood();
  highScore = 0;
  direction = 'right';
  gameInterval: any;
  gameSpeedDelay = 200;
  gameStarted = false;
  score = 0;

  isRevivePending = false;
  reviveWords: Vocabulary[] = [];
  currentReviveWordIndex = 0;
  reviveCorrectCount = 0;
  userReviveAnswer = '';

  private apiUrl = 'http://localhost:8080/api/exercises/random';

  @ViewChild('gameBoard') gameBoard!: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.updateScore();
  }

  draw() {
    if (!this.gameBoard) return;
    const board = this.gameBoard.nativeElement;
    board.innerHTML = '';
    this.drawSnake(board);
    this.drawFood(board);
  }

  drawSnake(board: HTMLElement) {
    this.snake.forEach((segment) => {
      const snakeElement = this.createGameElement('div', 'snake');
      this.setPosition(snakeElement, segment);
      board.appendChild(snakeElement);
    });
  }

  createGameElement(tag: string, className: string) {
    const element = document.createElement(tag);
    element.className = className;
    return element;
  }

  setPosition(element: HTMLElement, position: { x: number; y: number }) {
    element.style.gridColumn = position.x.toString();
    element.style.gridRow = position.y.toString();
  }

  drawFood(board: HTMLElement) {
    if (this.gameStarted) {
      const foodElement = this.createGameElement('div', 'food');
      this.setPosition(foodElement, this.food);
      board.appendChild(foodElement);
    }
  }

  generateFood() {
    const x = Math.floor(Math.random() * this.gridSize) + 1;
    const y = Math.floor(Math.random() * this.gridSize) + 1;
    return { x, y };
  }

  move() {
    const head = { ...this.snake[0] };
    switch (this.direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.food = this.generateFood();
      this.increaseSpeed();
      clearInterval(this.gameInterval);
      this.gameInterval = setInterval(() => {
        this.move();
        this.checkCollision();
        this.draw();
      }, this.gameSpeedDelay);
    } else {
      this.snake.pop();
    }
    this.updateScore();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    if (this.isRevivePending) {
      if (event.key === 'Enter') {
        this.handleReviveAnswer();
      }
      return;
    }

    if ((!this.gameStarted && event.code === 'Space') || (!this.gameStarted && event.key === ' ')) {
      this.startGame();
    } else {
      switch (event.key) {
        case 'ArrowUp': if (this.direction !== 'down') this.direction = 'up'; break;
        case 'ArrowDown': if (this.direction !== 'up') this.direction = 'down'; break;
        case 'ArrowLeft': if (this.direction !== 'right') this.direction = 'left'; break;
        case 'ArrowRight': if (this.direction !== 'left') this.direction = 'right'; break;
      }
    }
  }

  startGame() {
    this.gameStarted = true;
    this.gameInterval = setInterval(() => {
      this.move();
      this.checkCollision();
      this.draw();
    }, this.gameSpeedDelay);
  }

  stopGame() {
    clearInterval(this.gameInterval);
    this.gameStarted = false;
  }

  checkCollision() {
    const head = this.snake[0];

    if (head.x < 1 || head.x > this.gridSize || head.y < 1 || head.y > this.gridSize) {
      this.initiateReviveSequence();
    }

    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.initiateReviveSequence();
      }
    }
  }

  initiateReviveSequence() {
    this.stopGame();
    this.isRevivePending = true;
    this.reviveWords = [];
    this.currentReviveWordIndex = 0;
    this.reviveCorrectCount = 0;
    this.userReviveAnswer = '';

    this.fetchReviveWord();
    this.fetchReviveWord();
    this.fetchReviveWord();
  }

  fetchReviveWord() {
    this.http.get<Vocabulary>(this.apiUrl).subscribe(
      (vocab) => {
        this.reviveWords.push(vocab);
      },
      (error) => {
        console.error('Fehler beim Abrufen der Vokabel:', error);
        this.triggerFullReset();
      }
    );
  }

  handleReviveAnswer() {
    if (!this.userReviveAnswer || this.reviveWords.length < 3 || this.currentReviveWordIndex >= 3) return;

    const currentWord = this.reviveWords[this.currentReviveWordIndex];

    if (this.userReviveAnswer.trim().toLowerCase() === currentWord.wordDE.toLowerCase()) {
      this.reviveCorrectCount++;
    }

    this.currentReviveWordIndex++;
    this.userReviveAnswer = '';

    if (this.currentReviveWordIndex >= 3) {
      this.isRevivePending = false;
      if (this.reviveCorrectCount === 3) {
        this.resumeGame();
      } else {
        this.triggerFullReset();
      }
    }
  }

  resumeGame() {
    this.startGame();
  }

  triggerFullReset() {
    this.updateHighScore();
    this.snake = [{ x: 10, y: 10 }];
    this.food = this.generateFood();
    this.direction = 'right';
    this.gameSpeedDelay = 200;
    this.updateScore();
  }

  updateScore() {
    this.score = this.snake.length - 1;
  }

  updateHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  increaseSpeed() {
    if (this.gameSpeedDelay > 150) {
      this.gameSpeedDelay -= 5;
    } else if (this.gameSpeedDelay > 100) {
      this.gameSpeedDelay -= 3;
    } else if (this.gameSpeedDelay > 50) {
      this.gameSpeedDelay -= 2;
    } else if (this.gameSpeedDelay > 25) {
      this.gameSpeedDelay -= 1;
    }
  }
}
