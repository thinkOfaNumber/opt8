import { autoinject, BindingEngine, bindable, bindingMode } from "aurelia-framework";
import { Subscription } from "aurelia-event-aggregator";

export interface IMeta {
  selected?: boolean;
  matching?: boolean;
  option: any;
}

@autoinject()
export class Opt8 {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) selected = ["option b"];
  @bindable({ defaultBindingMode: bindingMode.oneWay }) options =
    ["a", "option b", "iii", "mystery meat", "...", "PROFIT!!11!1!"];
  input: string;
  showOptions = false;
  subscriptions: Subscription[] = [];
  showPlaceholder: boolean = false;
  focusSearch: boolean = false;
  meta: IMeta[] = [];
  search: string;
  visibleOptions: Element[] = [];
  searchElement: Element;
  private eventHandler: (e: KeyboardEvent) => void;

  constructor(private bindingEngine: BindingEngine, private element: Element) {
  }

  attached() {
    var s = this.bindingEngine.collectionObserver(this.selected)
      .subscribe(() => this.selectionChanged());
    this.subscriptions.push(s);
    
    s = this.bindingEngine.propertyObserver(this, "options").subscribe(() => this.optionsChanged());
    this.subscriptions.push(s);

    $(document).click(this.clickHandler);
    this.selectionChanged();
    this.optionsChanged();
    this.eventHandler = (e: KeyboardEvent) => {
      this.keypressInput(e);
    }
    this.searchElement.addEventListener('keyup', this.eventHandler, false);
  }

  detached() {
    while (this.subscriptions.length)
      this.subscriptions.pop().dispose();
    $(document).off("click", this.clickHandler);
    this.searchElement.removeEventListener('keyup', this.eventHandler);
  }

  // This function is called by the aliased method
  private keypressInput(e: KeyboardEvent) {
    // console.log(e);
    if (e.keyCode == 13) {
      // enter
      this.enterPressed();
    }
    else if (e.keyCode == 38 || e.keyCode == 40) {
      // 38 arrow up
      // 40 arrow down
      this.upOrDownPressed(e);
    }
    else if (e.keyCode == 27) {
      // escape
      this.closeOptions();
    }
    else {
      this.showOptions = true;
    }
  }

  private clickHandler = (event) => {
    // console.log("document click");
    if(!$(event.target).closest(this.element).length) {
      // console.log("document click hide options");
      this.closeOptions();
    }
  }

  private optionsChanged() {
    this.meta.length = 0;
    // first make it work, then make it fast
    // http://stackoverflow.com/a/1885660/1089267
    for(var i = 0; i < this.options.length; i++) {
      // this is the slow but working way
      var selected = this.selected.find(s => s == this.options[i])
      this.meta.push({
        selected: (selected != undefined),
        option: this.options[i],
        matching: true
      });
    }
  }

  private selectionChanged() {
    this.showPlaceholder = (this.selected.length == 0);
  }

  toggle() {
    this.showOptions = !this.showOptions;
    if (this.showOptions) {
      this.showPlaceholder = false;
      this.focusSearch = true;
    }
    else {
      this.selectionChanged();
      this.search = null;
    }
  }

  select(o: IMeta) {
    console.log('selected', o);
    if (o.selected) {
      var found = this.selected.indexOf(o.option);
      if (found >= 0) {
        this.selected.splice(found, 1);
      }
    }
    else {
      this.selected.push(o.option);
    }
    o.selected = !o.selected;
    this.closeOptions();
  }

  remove(index: number) {
    var found = this.selected.indexOf(this.options[index]);
    if (found >= 0) {
      this.selected.splice(found, 1);
      this.meta[index].selected = false;
    }
  }

  private addSelected(el : Element) {
    el.className += " selected";
  }

  private removeSelected(el : Element) {
    el.className = el.className.replace("selected", "");
  }

  private closeOptions() {
      this.showOptions = false;
      this.selectionChanged();
      this.search = null;
      this.visibleOptions.forEach(li => li != null && this.removeSelected(li));
  }

  private enterPressed() {
    if (!this.showOptions) {
        this.showOptions = true;
      }
      else {
        var toAdd: any = this.visibleOptions.find(li => li != null && li.className.indexOf("selected") >= 0);
        if (toAdd) {
          this.select(toAdd.model);
        }
      }
  }

  private upOrDownPressed(e: KeyboardEvent) {
    this.showOptions = true;
      var up = e.keyCode == 38;
      var selectedIdx = this.visibleOptions.findIndex(li => li != null && li.className.indexOf("selected") >= 0);
      
      // start searching, and wrap around the end, but if we get to the starting point, end.
      var startIdx = up ? this.visibleOptions.length - 1: 0;
      var toSelectIdx = startIdx;
      if (selectedIdx >= 0) {
        this.removeSelected(this.visibleOptions[selectedIdx])
        startIdx = toSelectIdx = selectedIdx;
        do {
          up ? toSelectIdx -- : toSelectIdx ++;
          if (toSelectIdx >= this.visibleOptions.length) { toSelectIdx = 0 }
          if (toSelectIdx < 0) { toSelectIdx = this.visibleOptions.length - 1}
        }
        while (toSelectIdx != startIdx && this.visibleOptions[toSelectIdx] == null);
      }
      this.addSelected(this.visibleOptions[toSelectIdx]);
  }
}
