const defaultOptions = {
  onClass: null,
  offClass: null,
  toggle: true,
  selected: 1,
  random: false,
  autoplay: true,
  interval: 2000,
  loop: true,
};

// Shared Variables
let classCycles = [];
let listening = false;
let wHeight = window.innerHeight;

class ClassCycleObj {
  constructor(targets, options) {
      this.options = {...defaultOptions, ...options};
      this.targets = targets;
      this.reset();
  }

  reset() {
      this.inactive = Array.from(this.targets);
      this.inactive.reverse();
      this.active = [];
      this.done = [];
      this.complete = false;
      this.update();
      if (this.options.autoplay) this.play();
  }

  play() {
      if (!this.running && !this.complete && this.isVisible()) this.cycle();
  }

  stop() {
      this.complete = true;
  }

  cycle() {
      this.running = true;
      setTimeout(() => {
          this.update();
          this.running = false;
          this.play();
      }, this.options.interval);
  }

  update() {
      if (this.options.random) shuffle(this.inactive);
      for(let i = 0; i < this.options.selected; i++) {
          if (this.inactive.length > 0) {
              this.active.push(this.inactive.pop());
          } else {
              if (!this.options.loop) {
                  this.complete = true;
              } else {
                  this.reset();
                  return;
              }
          }
      }
      this.updateClasses();
      this.active.map(target => this.done.unshift(this.active.pop()));
      // if (this.complete) this.updateClasses();
      // console.log(this.inactive.length, this.active.length, this.done.length);
  }

  updateClasses() {
      this.active.map(target => {
          if (this.options.onClass) target.classList.add(this.options.onClass);
          if (this.options.offClass) target.classList.remove(this.options.offClass);
      })

      this.inactive.map(target => {
          if (this.options.onClass) target.classList.remove(this.options.onClass);
          if (this.options.offClass) target.classList.add(this.options.offClass);
      })

      this.done.map(target => {
          if (this.options.onClass && this.options.toggle) target.classList.remove(this.options.onClass);
          if (this.options.offClass && this.options.toggle) target.classList.add(this.options.offClass);
      })
  }

  // Helpers
  isVisible() {
      let visible = false;
      Array.from(this.targets).forEach(target => {
          const rect = target.getBoundingClientRect();
          if (rect.top < wHeight && rect.bottom > 0) visible = true;
      })
      return visible;
  }
}

// Listeners
const initListeners = () => {
  window.addEventListener('resize', () => {
      wWidth = window.innerWidth;
      wHeight = window.innerHeight;
      checkVisiblility();
  })

  window.addEventListener('scroll', () => {
      checkVisiblility();
  })
}

// Helpers
const checkVisiblility = () => {
  classCycles.map(classCycle => {
      classCycle.play();
  })
}

// credit: https://github.com/Daplie/knuth-shuffle
const shuffle = (array) => {
  let currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
  }

  return array;
}

export default (target, options = {}) => {
  if (typeof(target) === 'string') {
      target = document.querySelectorAll(`${target}`);
  }

  if (target && target.length) {
      const classCycle = new ClassCycleObj(target, options);
      classCycles.push(classCycle);

      if (!listening) {
          initListeners();
          listening = true;
      }

      return classCycle;
  }
}
