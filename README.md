# can-observable-decorators

[![Build Status](https://travis-ci.org/phillipskevin/can-observable-decorators.svg?branch=master)](https://travis-ci.org/phillipskevin/can-observable-decorators)

Make class properties observable using decorators

## Usage

```js
import observable from 'can-observable-decorators';

class Person {
  constructor(override) {
    Object.assign(this, override);
  }

  @observable
  first = 'Kevin';

  @observable
  last = 'Phillips';

  @observable
  get fullName() {
    return this.first.combineLatest(this.last, (first, last) => {
      return first + ' ' + last;
    });
  }
}

const person = new Person({
  first: 'Kevin'
});

person.fullName.subscribe((fullName) => {
  // 'Kevin Phillips',
  // 'Kevin McCallister'
});

person.last = 'McCallister';
```
