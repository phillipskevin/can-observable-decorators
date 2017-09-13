import observable from 'can-observable-decorators';
import stache from 'can-stache';
import 'can-stache-bindings';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/combineLatest'

class Person {
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

const person = new Person();

var view = stache(`
    <label>
      first: <input type="text" value:bind="first">
    </label>
    <label>
      last: <input type="text" value:bind="last">
    </label>
    <div>
      full: {{fullName}}
    </div>
`);

document.body.appendChild(
    view( person )
);
